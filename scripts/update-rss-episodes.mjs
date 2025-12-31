#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * RSS.com Episode Updater CLI
 * 
 * This script updates existing episodes on RSS.com with new descriptions
 * and/or audio files. It scans the local directory for episodes, matches them
 * with existing episodes on RSS.com, and updates them.
 * 
 * Usage:
 *   node scripts/update-rss-episodes.mjs [options]
 * 
 * Options:
 *   --dry-run          Show what would be updated without actually updating
 *   --start-date       Start date (YYYY-MM-DD) for episodes to update
 *   --end-date         End date (YYYY-MM-DD) for episodes to update
 *   --description-only Update only the description (no audio upload)
 *   --audio-only       Update only the audio file (no description change)
 * 
 * Environment Variables (add to .env.local):
 *   RSS_API_KEY             - RSS.com API key
 *   RSS_PODCAST_ID          - RSS.com podcast/channel ID
 *   NOTION_API_KEY          - Notion integration token
 *   NOTION_DATABASE_ID      - Notion database ID for episodes
 */

import fs from 'fs/promises'
import path from 'path'
import { validateAllConfig } from './lib/config.js'
import { testCredentials, getExistingEpisodes, findExistingEpisode, updateEpisode, getPresignedUploadUrl, uploadToPresignedUrl, DEFAULT_EPISODE_DESCRIPTION, getDefaultKeywordIds } from './lib/rss-api.js'
import { checkFFmpeg, convertWAVtoMP3 } from './lib/audio-converter.js'
import { scanEpisodesDirectory } from './lib/episode-scanner.js'

/**
 * Parses command line arguments
 * @returns {Object} Parsed options
 */
function parseArgs() {
  const args = process.argv.slice(2)
  
  return {
    dryRun: args.includes('--dry-run'),
    startDate: args.includes('--start-date') ? args[args.indexOf('--start-date') + 1] : null,
    endDate: args.includes('--end-date') ? args[args.indexOf('--end-date') + 1] : null,
    descriptionOnly: args.includes('--description-only'),
    audioOnly: args.includes('--audio-only'),
  }
}

/**
 * Handles WAV to MP3 conversion if needed
 * 
 * @param {Object} episode - Episode object from scanner
 * @returns {Promise<string>} Path to the file to upload (MP3)
 */
async function prepareAudioFile(episode) {
  if (!episode.needsConversion) {
    return episode.audioFilePath
  }

  console.log('⚠️  WAV format detected - converting to MP3...')
  
  // Generate MP3 path
  const mp3FileName = episode.audioFile.replace(/\.wav$/i, '.mp3')
  const mp3FilePath = path.join(path.dirname(episode.audioFilePath), mp3FileName)
  
  // Check if MP3 already exists
  try {
    await fs.access(mp3FilePath)
    console.log('✅ MP3 file already exists - using existing file')
  } catch {
    // Need to convert
    try {
      await convertWAVtoMP3(episode.audioFilePath, mp3FilePath)
      console.log('✅ Conversion complete')
    } catch (conversionError) {
      throw new Error(`Failed to convert WAV to MP3: ${conversionError.message}`)
    }
  }
  
  // Update file info for upload
  const mp3Stats = await fs.stat(mp3FilePath)
  console.log(`📄 Using MP3: ${mp3FileName} (${(mp3Stats.size / (1024 * 1024)).toFixed(2)} MB)`)
  
  return mp3FilePath
}

/**
 * Updates a single episode on RSS.com
 * 
 * @param {Object} localEpisode - Local episode object from scanner
 * @param {Object} rssEpisode - RSS.com episode object
 * @param {Object} options - Update options
 * @returns {Promise<Object>} Update result
 */
async function updateSingleEpisode(localEpisode, rssEpisode, options = {}) {
  try {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`📅 Processing episode for ${localEpisode.date}`)
    console.log(`📁 Folder: ${localEpisode.folderName}`)
    console.log(`📄 Local File: ${localEpisode.audioFile} (${localEpisode.fileSizeMB} MB)`)
    console.log(`🆔 RSS.com Episode ID: ${rssEpisode.id}`)
    console.log(`📝 Current Title: ${rssEpisode.title}`)
    
    if (options.dryRun) {
      console.log('🏃 DRY RUN MODE - Would update:')
      if (!options.audioOnly) {
        console.log('   - Description')
      }
      if (!options.descriptionOnly) {
        console.log(`   - Audio file (${localEpisode.needsConversion ? 'with WAV to MP3 conversion' : 'direct upload'})`)
      }
      return { success: true, dryRun: true }
    }

    const updates = {}

    // Update description (unless audio-only mode)
    if (!options.audioOnly) {
      updates.description = DEFAULT_EPISODE_DESCRIPTION
    }

    // Update audio file (unless description-only mode)
    if (!options.descriptionOnly) {
      // Prepare audio file (convert if needed)
      const uploadFilePath = await prepareAudioFile(localEpisode)
      
      // Upload new audio file
      console.log('📤 Uploading new audio file...')
      const fileName = path.basename(uploadFilePath)
      const stats = await fs.stat(uploadFilePath)
      
      // Get presigned upload URL
      const presigned = await getPresignedUploadUrl(fileName, stats.size)
      
      // Upload file to S3
      const fileBuffer = await fs.readFile(uploadFilePath)
      await uploadToPresignedUrl(fileBuffer, presigned.uploadUrl)
      
      updates.audioId = presigned.assetId
    }

    // Get keyword IDs (will create keywords if they don't exist)
    console.log('🏷️  Getting keyword IDs...')
    const keywordIds = await getDefaultKeywordIds()
    if (keywordIds.length > 0) {
      console.log(`   ✓ Got ${keywordIds.length} keyword IDs`)
      updates.keywordIds = keywordIds
    }

    // Perform the update
    const result = await updateEpisode(rssEpisode.id, updates)
    
    console.log(`✅ Successfully updated episode for ${localEpisode.date}`)
    return { success: true, data: result }
  } catch (error) {
    console.error(`❌ Failed to update episode for ${localEpisode.date}:`, error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Prints update summary
 */
function printSummary(successCount, skipCount, failCount, totalCount) {
  console.log(`\n${'='.repeat(60)}`)
  console.log('📊 Update Summary:')
  console.log(`✅ Success: ${successCount}`)
  if (skipCount > 0) {
    console.log(`⏭️  Skipped: ${skipCount}`)
  }
  console.log(`❌ Failed: ${failCount}`)
  console.log(`📝 Total: ${totalCount}`)
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🔄 RSS.com Episode Updater\n')
    
    // Validate configuration
    validateAllConfig()
    console.log('')
    
    // Parse command line arguments
    const options = parseArgs()
    
    if (options.dryRun) {
      console.log('🏃 DRY RUN MODE - No episodes will be updated\n')
    }
    
    if (options.descriptionOnly) {
      console.log('📝 DESCRIPTION ONLY MODE - Only descriptions will be updated\n')
    }
    
    if (options.audioOnly) {
      console.log('🎵 AUDIO ONLY MODE - Only audio files will be updated\n')
    }
    
    if (options.descriptionOnly && options.audioOnly) {
      console.error('❌ Error: Cannot specify both --description-only and --audio-only')
      process.exit(1)
    }
    
    // Test API credentials first
    const credentialsValid = await testCredentials()
    if (!credentialsValid) {
      process.exit(1)
    }
    console.log('')
    
    // Check for ffmpeg if WAV files might need conversion (unless description-only mode)
    if (!options.descriptionOnly) {
      const hasFFmpeg = await checkFFmpeg()
      if (!hasFFmpeg) {
        console.log('⚠️  Warning: ffmpeg not found - WAV files cannot be auto-converted')
        console.log('   Install ffmpeg: brew install ffmpeg (macOS) or apt-get install ffmpeg (Linux)')
        console.log('   Continuing with MP3/M4A files only...\n')
      }
    }
    
    // Scan local episodes directory
    const localEpisodes = await scanEpisodesDirectory(options)
    
    if (localEpisodes.length === 0) {
      console.log('ℹ️  No local episodes found')
      return
    }
    
    // Get existing episodes from RSS.com
    console.log('\n🔍 Fetching existing episodes from RSS.com...')
    const rssEpisodes = await getExistingEpisodes()
    console.log(`📊 Found ${rssEpisodes.length} episodes on RSS.com\n`)
    
    // Match local episodes with RSS.com episodes
    const matchedEpisodes = []
    const unmatchedEpisodes = []
    
    for (const localEpisode of localEpisodes) {
      const rssEpisode = findExistingEpisode(rssEpisodes, null, localEpisode.date)
      
      if (rssEpisode) {
        matchedEpisodes.push({
          local: localEpisode,
          rss: rssEpisode,
        })
      } else {
        unmatchedEpisodes.push(localEpisode)
      }
    }
    
    console.log(`✅ Matched ${matchedEpisodes.length} episodes`)
    if (unmatchedEpisodes.length > 0) {
      console.log(`⚠️  ${unmatchedEpisodes.length} local episodes not found on RSS.com:`)
      for (const episode of unmatchedEpisodes) {
        console.log(`   - ${episode.date}: ${episode.folderName}`)
      }
    }
    
    if (matchedEpisodes.length === 0) {
      console.log('\nℹ️  No episodes to update')
      return
    }
    
    // Update matched episodes
    let successCount = 0
    let skipCount = 0
    let failCount = 0
    
    for (let i = 0; i < matchedEpisodes.length; i++) {
      const { local, rss } = matchedEpisodes[i]
      
      const result = await updateSingleEpisode(local, rss, options)
      
      if (result.success) {
        if (result.skipped) {
          skipCount++
        } else {
          successCount++
        }
      } else {
        failCount++
      }
      
      // Rate limiting: wait 2 seconds between updates
      if (i < matchedEpisodes.length - 1 && !options.dryRun) {
        console.log('⏳ Waiting 2 seconds before next update...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    
    // Print summary
    printSummary(successCount, skipCount, failCount, matchedEpisodes.length)
    
  } catch (error) {
    console.error('\n💥 Update failed:', error.message)
    process.exit(1)
  }
}

// Run the script
main()
  .then(() => {
    console.log('\n✨ Update complete!')
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error)
    process.exit(1)
  })

