#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Podbean Episode Uploader
 * 
 * This script automates the process of uploading podcast episodes to Podbean.
 * It scans a local directory for episodes with FINAL folders, fetches episode
 * titles from Notion, and uploads them to Podbean with the correct release date.
 * 
 * Usage:
 *   node scripts/upload-to-podbean.mjs [options]
 * 
 * Options:
 *   --dry-run          Show what would be uploaded without actually uploading
 *   --start-date       Start date (YYYY-MM-DD) for episodes to upload
 *   --end-date         End date (YYYY-MM-DD) for episodes to upload
 *   --year             Only scan EPIZÓDY/<YYYY>/ (default: all year folders)
 *   --force            Upload even if episode already exists (creates duplicate)
 * 
 * Environment Variables (add to .env.local):
 *   PODBEAN_CLIENT_ID       - Podbean API client ID
 *   PODBEAN_CLIENT_SECRET   - Podbean API client secret
 *   NOTION_API_KEY          - Notion integration token
 *   NOTION_DATABASE_IDS     - Notion database per year, e.g. "2026:<id>,2027:<id>"
 */

import fs from 'fs/promises'
import path from 'path'
import { spawn } from 'child_process'
import { notionConfig } from './lib/config.js' // also loads .env.local
import { getEpisodeFromNotion, updateNotionEmbedUri } from './lib/notion-api.js'
import { scanEpisodesDirectory } from './lib/episode-scanner.js'
import { createPragueTime4AM } from './lib/timezone-utils.js'

// Environment variables
const PODBEAN_CLIENT_ID = process.env.PODBEAN_CLIENT_ID
const PODBEAN_CLIENT_SECRET = process.env.PODBEAN_CLIENT_SECRET

// Configuration
const PODBEAN_API_BASE = 'https://api.podbean.com/v1'

// Validate environment variables
if (!PODBEAN_CLIENT_ID || !PODBEAN_CLIENT_SECRET) {
  console.error('❌ Error: PODBEAN_CLIENT_ID and PODBEAN_CLIENT_SECRET must be set in .env.local')
  console.error('\nTo get these credentials:')
  console.error('1. Go to https://developers.podbean.com/')
  console.error('2. Create a new app or use existing one')
  console.error('3. Copy the Client ID and Client Secret')
  process.exit(1)
}

try {
  notionConfig.validate()
} catch (error) {
  console.error(`❌ Error: ${error.message}`)
  process.exit(1)
}

/**
 * OAuth 2.0 access token (cached during script execution)
 */
let accessToken = null

/**
 * Gets OAuth 2.0 access token from Podbean
 */
async function getAccessToken() {
  if (accessToken) {
    return accessToken
  }

  try {
    console.log('🔑 Authenticating with Podbean...')
    
    const response = await fetch(`${PODBEAN_API_BASE}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: PODBEAN_CLIENT_ID,
        client_secret: PODBEAN_CLIENT_SECRET,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Podbean auth error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    accessToken = data.access_token
    
    console.log('✅ Successfully authenticated with Podbean')
    return accessToken
  } catch (error) {
    console.error('❌ Failed to authenticate with Podbean:', error.message)
    throw error
  }
}

/**
 * Makes a request to Podbean API
 */
async function podbeanRequest(endpoint, options = {}) {
  const token = await getAccessToken()
  
  const response = await fetch(`${PODBEAN_API_BASE}${endpoint}`, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    body: options.body,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Podbean API error (${response.status}): ${errorText}`)
  }

  return response.json()
}

/**
 * Checks if ffmpeg is installed
 */
async function checkFFmpeg() {
  return new Promise((resolve) => {
    const ffmpeg = spawn('ffmpeg', ['-version'])
    
    ffmpeg.on('error', () => {
      resolve(false)
    })
    
    ffmpeg.on('close', (code) => {
      resolve(code === 0)
    })
  })
}

/**
 * Converts WAV file to MP3 using ffmpeg
 */
async function convertWAVtoMP3(wavPath, mp3Path) {
  return new Promise((resolve, reject) => {
    console.log('🔄 Converting WAV to MP3...')
    
    const ffmpeg = spawn('ffmpeg', [
      '-i', wavPath,           // Input file
      '-codec:a', 'libmp3lame', // MP3 encoder
      '-b:a', '128k',           // Constant bitrate 320 kbps
      '-y',                     // Overwrite if exists
      mp3Path                   // Output file
    ])
    
    ffmpeg.stderr.on('data', () => {
      // Suppress ffmpeg output
    })
    
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`ffmpeg conversion failed with code ${code}`))
      }
    })
    
    ffmpeg.on('error', (err) => {
      reject(err)
    })
  })
}

/**
 * Gets the upload authorization URL from Podbean
 */
async function getUploadAuthUrl(filename, filesize) {
  try {
    const params = new URLSearchParams({
      filename: filename,
      filesize: filesize.toString(),
      content_type: filename.endsWith('.mp3') ? 'audio/mpeg' : 
                    filename.endsWith('.m4a') ? 'audio/mp4' : 'audio/wav',
    })
    
    const data = await podbeanRequest(`/files/uploadAuthorize?${params.toString()}`, {
      method: 'GET',
    })
    
    return {
      uploadUrl: data.presigned_url,
      fileKey: data.file_key,
    }
  } catch (error) {
    console.error('❌ Error getting upload authorization:', error.message)
    throw error
  }
}

/**
 * Uploads audio file to Podbean
 */
async function uploadAudioFile(filePath, uploadUrl) {
  try {
    console.log('📤 Uploading audio file...')
    
    const fileBuffer = await fs.readFile(filePath)
    const fileName = path.basename(filePath)
    
    // Determine content type
    const contentType = fileName.endsWith('.mp3') ? 'audio/mpeg' : 
                       fileName.endsWith('.m4a') ? 'audio/mp4' : 
                       'audio/wav'

    console.log(`   File size: ${(fileBuffer.length / (1024 * 1024)).toFixed(2)} MB`)
    console.log(`   Content type: ${contentType}`)
    console.log(`   Upload URL: ${uploadUrl.substring(0, 50)}...`)

    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: fileBuffer,
      headers: {
        'Content-Type': contentType,
      },
    }).catch(err => {
      console.error('   Fetch error details:', err)
      throw new Error(`Network error during upload: ${err.message}`)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`   Response status: ${response.status}`)
      console.error(`   Response error: ${errorText}`)
      throw new Error(`Upload failed (${response.status}): ${errorText}`)
    }

    console.log('✅ Audio file uploaded successfully')
    return true
  } catch (error) {
    console.error('❌ Error uploading audio file:', error.message)
    throw error
  }
}

/**
 * Publishes or schedules episode on Podbean
 */
async function publishEpisode(title, fileKey, date) {
  try {
    // Convert date to timestamp (publish at 4:00 AM Prague time, DST-aware)
    const publishDate = createPragueTime4AM(date)
    const publishTimestamp = Math.floor(publishDate.getTime() / 1000)
    const now = Math.floor(Date.now() / 1000)
    
    // Determine if this is a future episode
    const isFuture = publishTimestamp > now
    
    if (isFuture) {
      console.log('📅 Scheduling future episode on Podbean...')
      console.log(`   Scheduled for: ${publishDate.toLocaleString()} (${date} 04:00 AM Prague time)`)
    } else {
      console.log('📝 Publishing episode on Podbean...')
      console.log(`   Publish date: ${publishDate.toLocaleString()} (${date} 04:00 AM Prague time)`)
    }
    
    // For Podbean API:
    // - status: 'draft' with publish_time creates a scheduled episode
    // - status: 'publish' publishes immediately (ignores publish_time)
    const status = isFuture ? 'draft' : 'publish'
    
    const formData = new URLSearchParams({
      title: title,
      content: '', // Add description if needed
      status: status,
      type: 'public',
      media_key: fileKey,
      publish_time: publishTimestamp.toString(),
    })

    const data = await podbeanRequest('/episodes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })

    if (isFuture) {
      console.log('✅ Episode scheduled successfully')
      console.log(`   Episode ID: ${data.episode?.id || 'unknown'}`)
      console.log(`   Will auto-publish on: ${publishDate.toLocaleString()}`)
    } else {
      console.log('✅ Episode published successfully')
      console.log(`   Episode ID: ${data.episode?.id || 'unknown'}`)
      console.log(`   Published on: ${publishDate.toLocaleString()}`)
    }
    
    return {
      episodeId: data.episode?.id,
      playerUrl: data.episode?.player_url,
      permalink: data.episode?.permalink,
      ...data
    }
  } catch (error) {
    console.error('❌ Error publishing episode:', error.message)
    throw error
  }
}

/**
 * Gets list of existing episodes from Podbean
 */
async function getExistingEpisodes() {
  try {
    const data = await podbeanRequest('/episodes?offset=0&limit=360')
    return data.episodes || []
  } catch (error) {
    console.error('❌ Error fetching existing episodes:', error.message)
    return []
  }
}

/**
 * Checks if episode already exists on Podbean by title and date
 */
function isEpisodeUploaded(existingEpisodes, title, date) {
  return existingEpisodes.some(episode => {
    const episodeDate = new Date(episode.publish_time * 1000)
    const episodeDateStr = episodeDate.toISOString().split('T')[0]
    return episode.title === title || episodeDateStr === date
  })
}

/**
 * Finds existing episode on Podbean by title and date
 */
function findExistingEpisode(existingEpisodes, title, date) {
  return existingEpisodes.find(episode => {
    const episodeDate = new Date(episode.publish_time * 1000)
    const episodeDateStr = episodeDate.toISOString().split('T')[0]
    return episode.title === title || episodeDateStr === date
  })
}

/**
 * Uploads a single episode to Podbean
 */
async function uploadEpisode(episode, options = {}) {
  try {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`📅 Processing episode for ${episode.date}`)
    console.log(`📁 Folder: ${episode.folderName}`)
    console.log(`📄 File: ${episode.audioFile} (${episode.fileSizeMB} MB)`)
    
    // Fetch episode data from Notion
    const notionEpisode = await getEpisodeFromNotion(episode.date)
    if (!notionEpisode || !notionEpisode.title) {
      throw new Error(`No episode found in Notion for date ${episode.date}`)
    }
    
    console.log(`📝 Title: ${notionEpisode.title}`)
    
    // Check if episode already exists on Podbean
    if (options.existingEpisodes) {
      const existingEpisode = findExistingEpisode(
        options.existingEpisodes,
        notionEpisode.title,
        episode.date
      )
      
      if (existingEpisode) {
        const existingDate = new Date(existingEpisode.publish_time * 1000)
        const existingDateStr = existingDate.toISOString().split('T')[0]
        
        console.log(`⚠️  Episode already exists on Podbean:`)
        console.log(`   Title: ${existingEpisode.title}`)
        console.log(`   Published: ${existingDateStr}`)
        console.log(`   URL: ${existingEpisode.permalink || 'N/A'}`)
        
        if (options.force) {
          console.log('⚡ --force flag detected - uploading anyway (will create duplicate)')
        } else {
          console.log('⏭️  Skipping (use --force to upload anyway)')
          return { success: true, skipped: true, reason: 'already_exists' }
        }
      }
    }
    
    if (options.dryRun) {
      if (episode.needsConversion) {
        console.log('🏃 DRY RUN - Would convert WAV to MP3 and upload')
      } else {
        console.log('🏃 DRY RUN - Would upload this episode')
      }
      return { success: true, dryRun: true }
    }
    
    // Handle WAV conversion if needed
    let uploadFilePath = episode.audioFilePath
    let uploadFileName = episode.audioFile
    let uploadFileSize = episode.fileSize
    
    if (episode.needsConversion) {
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
      uploadFilePath = mp3FilePath
      uploadFileName = mp3FileName
      uploadFileSize = mp3Stats.size
      
      console.log(`📄 Using MP3: ${mp3FileName} (${(uploadFileSize / (1024 * 1024)).toFixed(2)} MB)`)
    }
    
    // Get upload authorization
    const { uploadUrl, fileKey } = await getUploadAuthUrl(uploadFileName, uploadFileSize)
    
    // Upload audio file
    await uploadAudioFile(uploadFilePath, uploadUrl)
    
    // Publish episode
    const result = await publishEpisode(notionEpisode.title, fileKey, episode.date)
    
    // Update Notion with embed URL if available
    if (result.playerUrl) {
      await updateNotionEmbedUri(notionEpisode.pageId, result.playerUrl)
    } else {
      console.log('⚠️  No player URL available from Podbean API')
    }
    
    console.log(`✅ Successfully uploaded episode for ${episode.date}`)
    return { success: true, data: result }
  } catch (error) {
    console.error(`❌ Failed to upload episode for ${episode.date}:`, error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Main function
 */
async function main() {
  try {
    const args = process.argv.slice(2)
    
    const options = {
      dryRun: args.includes('--dry-run'),
      startDate: args.includes('--start-date') ? args[args.indexOf('--start-date') + 1] : null,
      endDate: args.includes('--end-date') ? args[args.indexOf('--end-date') + 1] : null,
      year: args.includes('--year') ? args[args.indexOf('--year') + 1] : null,
      force: args.includes('--force'),
    }
    
    console.log('🚀 Podbean Episode Uploader\n')
    
    if (options.dryRun) {
      console.log('🏃 DRY RUN MODE - No episodes will be uploaded\n')
    }
    
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
    
    // Get existing episodes from Podbean (always check to prevent duplicates)
    console.log('\n🔍 Checking for existing episodes on Podbean...')
    const existingEpisodes = await getExistingEpisodes()
    console.log(`📊 Found ${existingEpisodes.length} existing episodes on Podbean\n`)
    
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
    
    // Summary
    console.log(`\n${'='.repeat(60)}`)
    console.log('📊 Upload Summary:')
    console.log(`✅ Success: ${successCount}`)
    if (skipCount > 0) {
      console.log(`⏭️  Skipped: ${skipCount}`)
    }
    console.log(`❌ Failed: ${failCount}`)
    console.log(`📝 Total: ${episodes.length}`)
    
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

