#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * RSS.com Episode Uploader CLI
 * 
 * This script automates the process of uploading podcast episodes to RSS.com.
 * It scans a local directory for episodes with FINAL folders, fetches episode
 * titles from Notion, and uploads them to RSS.com with the correct release date.
 * 
 * Usage:
 *   node scripts/upload-to-rss.mjs [options]
 * 
 * Options:
 *   --dry-run          Show what would be uploaded without actually uploading
 *   --start-date       Start date (YYYY-MM-DD) for episodes to upload
 *   --end-date         End date (YYYY-MM-DD) for episodes to upload
 *   --force            Upload even if episode already exists (deletes and re-uploads)
 * 
 * Environment Variables (add to .env.local):
 *   RSS_API_KEY             - RSS.com API key
 *   RSS_PODCAST_ID          - RSS.com podcast/channel ID
 *   NOTION_API_KEY          - Notion integration token
 *   NOTION_DATABASE_ID      - Notion database ID for episodes
 */

import { validateAllConfig } from './lib/config.js'
import { testCredentials, getExistingEpisodes } from './lib/rss-api.js'
import { checkFFmpeg } from './lib/audio-converter.js'
import { scanEpisodesDirectory } from './lib/episode-scanner.js'
import { uploadEpisode } from './lib/episode-uploader.js'

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
    force: args.includes('--force'),
  }
}

/**
 * Prints upload summary
 */
function printSummary(successCount, skipCount, failCount, totalCount) {
  console.log(`\n${'='.repeat(60)}`)
  console.log('📊 Upload Summary:')
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
    console.log('🚀 RSS.com Episode Uploader\n')
    
    // Validate configuration
    validateAllConfig()
    console.log('')
    
    // Parse command line arguments
    const options = parseArgs()
    
    if (options.dryRun) {
      console.log('🏃 DRY RUN MODE - No episodes will be uploaded\n')
    }
    
    // Test API credentials first
    const credentialsValid = await testCredentials()
    if (!credentialsValid) {
      process.exit(1)
    }
    console.log('')
    
    // Check for ffmpeg if WAV files might need conversion
    const hasFFmpeg = await checkFFmpeg()
    if (!hasFFmpeg) {
      console.log('⚠️  Warning: ffmpeg not found - WAV files cannot be auto-converted')
      console.log('   Install ffmpeg: brew install ffmpeg (macOS) or apt-get install ffmpeg (Linux)')
      console.log('   Continuing with MP3/M4A files only...\n')
    }
    
    // Scan episodes directory
    const episodes = await scanEpisodesDirectory(options)
    
    if (episodes.length === 0) {
      console.log('ℹ️  No episodes found to upload')
      return
    }
    
    // Get existing episodes from RSS.com (always check to prevent duplicates)
    console.log('\n🔍 Checking for existing episodes on RSS.com...')
    const existingEpisodes = await getExistingEpisodes()
    console.log(`📊 Found ${existingEpisodes.length} existing episodes on RSS.com\n`)
    
    // Pass existing episodes to upload options
    options.existingEpisodes = existingEpisodes
    
    // Upload episodes
    let successCount = 0
    let skipCount = 0
    let failCount = 0
    
    for (let i = 0; i < episodes.length; i++) {
      const episode = episodes[i]
      
      const result = await uploadEpisode(episode, options)
      
      if (result.success) {
        if (result.skipped) {
          skipCount++
        } else {
          successCount++
        }
      } else {
        failCount++
      }
      
      // Rate limiting: wait 2 seconds between uploads
      if (i < episodes.length - 1 && !options.dryRun) {
        console.log('⏳ Waiting 2 seconds before next upload...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    
    // Print summary
    printSummary(successCount, skipCount, failCount, episodes.length)
    
  } catch (error) {
    console.error('\n💥 Upload failed:', error.message)
    process.exit(1)
  }
}

// Run the script
main()
  .then(() => {
    console.log('\n✨ Upload complete!')
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error)
    process.exit(1)
  })

