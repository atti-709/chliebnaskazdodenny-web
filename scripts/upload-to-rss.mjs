#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * RSS.com Episode Uploader
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
 *   --force            Upload even if episode already exists (creates duplicate)
 * 
 * Environment Variables (add to .env.local):
 *   RSS_API_KEY             - RSS.com API key
 *   RSS_PODCAST_ID          - RSS.com podcast/channel ID
 *   NOTION_API_KEY          - Notion integration token
 *   NOTION_DATABASE_ID      - Notion database ID for episodes
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

// Environment variables
const RSS_API_KEY = process.env.RSS_API_KEY
const RSS_PODCAST_ID = process.env.RSS_PODCAST_ID
const NOTION_API_KEY = process.env.NOTION_API_KEY
const DATABASE_ID = process.env.NOTION_DATABASE_ID
const NOTION_VERSION = '2022-06-28'

// Configuration
const EPISODES_PATH = '/Users/atti/Library/CloudStorage/GoogleDrive-xzsiros@gmail.com/Shared drives/Chlieb náš každodenný/EPIZÓDY'
const RSS_API_BASE = 'https://api.rss.com/v1'

// Validate environment variables
if (!RSS_API_KEY || !RSS_PODCAST_ID) {
  console.error('❌ Error: RSS_API_KEY and RSS_PODCAST_ID must be set in .env.local')
  console.error('\nTo get these credentials:')
  console.error('1. Log in to your RSS.com account')
  console.error('2. Go to Settings → API Access')
  console.error('3. Generate an API key')
  console.error('4. Find your Podcast ID in your podcast settings')
  process.exit(1)
}

if (!NOTION_API_KEY || !DATABASE_ID) {
  console.error('❌ Error: NOTION_API_KEY and NOTION_DATABASE_ID must be set in .env.local')
  process.exit(1)
}

/**
 * Makes a request to RSS.com API
 */
async function rssRequest(endpoint, options = {}) {
  const response = await fetch(`${RSS_API_BASE}${endpoint}`, {
    method: options.method || 'GET',
    headers: {
      'Authorization': `Bearer ${RSS_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`RSS.com API error (${response.status}): ${errorText}`)
  }

  return response.json()
}

/**
 * Makes a request to Notion API
 */
async function notionRequest(endpoint, options = {}) {
  const response = await fetch(`https://api.notion.com/v1${endpoint}`, {
    method: options.method || 'POST',
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Notion API error (${response.status}): ${errorText}`)
  }

  return response.json()
}

/**
 * Fetches episode data from Notion by date
 */
async function getEpisodeFromNotion(date) {
  try {
    const response = await notionRequest(`/databases/${DATABASE_ID}/query`, {
      body: {
        filter: {
          property: 'Date',
          date: {
            equals: date,
          },
        },
      },
    })

    if (response.results.length === 0) {
      return null
    }

    const page = response.results[0]
    const titleProperty = page.properties.Title?.title || page.properties.title?.title
    const title = titleProperty ? titleProperty.map(text => text.plain_text).join('') : ''
    
    return {
      pageId: page.id,
      title: title,
    }
  } catch (error) {
    console.error(`❌ Error fetching episode from Notion for date ${date}:`, error.message)
    return null
  }
}

/**
 * Updates the Spotify Embed URI field in Notion page
 */
async function updateNotionEmbedUri(pageId, embedUri) {
  try {
    console.log('📝 Updating Notion with embed URI...')
    
    await notionRequest(`/pages/${pageId}`, {
      method: 'PATCH',
      body: {
        properties: {
          'Spotify Embed URI': {
            url: embedUri,
          },
        },
      },
    })

    console.log('✅ Notion page updated with embed URI')
    return true
  } catch (error) {
    console.error('❌ Error updating Notion page:', error.message)
    return false
  }
}

/**
 * Extracts date from folder name (format: YYYYMMDD_episode_name)
 */
function extractDateFromFolderName(folderName) {
  const match = folderName.match(/^(\d{4})(\d{2})(\d{2})_/)
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`
  }
  return null
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
      '-b:a', '128k',           // Constant bitrate 128 kbps
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
 * Scans the episodes directory for episodes ready to upload
 */
async function scanEpisodesDirectory(options = {}) {
  try {
    console.log('📂 Scanning episodes directory:', EPISODES_PATH)
    
    const entries = await fs.readdir(EPISODES_PATH, { withFileTypes: true })
    const episodes = []

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) {
        continue
      }

      const episodePath = path.join(EPISODES_PATH, entry.name)
      const finalPath = path.join(episodePath, 'FINAL')

      // Check if FINAL folder exists
      try {
        await fs.access(finalPath)
      } catch {
        // No FINAL folder, skip this episode
        continue
      }

      // Check for audio file in FINAL folder
      const finalFiles = await fs.readdir(finalPath)
      let audioFile = finalFiles.find(file => 
        file.endsWith('.mp3') || 
        file.endsWith('.m4a')
      )

      // If no MP3/M4A found, check for WAV and mark for conversion
      let needsConversion = false
      if (!audioFile) {
        const wavFile = finalFiles.find(file => file.endsWith('.wav'))
        if (wavFile) {
          audioFile = wavFile
          needsConversion = true
        } else {
          console.log(`⚠️  No audio file found in ${entry.name}/FINAL`)
          console.log(`   Supported formats: MP3, M4A, WAV (will auto-convert)`)
          continue
        }
      }

      // Extract date from folder name
      const date = extractDateFromFolderName(entry.name)
      if (!date) {
        console.log(`⚠️  Could not extract date from folder name: ${entry.name}`)
        continue
      }

      // Apply date filters
      if (options.startDate && date < options.startDate) {
        continue
      }
      if (options.endDate && date > options.endDate) {
        continue
      }

      const audioFilePath = path.join(finalPath, audioFile)
      const stats = await fs.stat(audioFilePath)

      episodes.push({
        date,
        folderName: entry.name,
        audioFile: audioFile,
        audioFilePath: audioFilePath,
        fileSize: stats.size,
        fileSizeMB: (stats.size / (1024 * 1024)).toFixed(2),
        needsConversion: needsConversion,
      })
    }

    // Sort by date
    episodes.sort((a, b) => a.date.localeCompare(b.date))

    console.log(`✅ Found ${episodes.length} episodes ready to upload`)
    return episodes
  } catch (error) {
    console.error('❌ Error scanning episodes directory:', error.message)
    throw error
  }
}

/**
 * Uploads audio file to RSS.com and creates episode
 */
async function uploadAndCreateEpisode(filePath, title, date) {
  try {
    console.log('📤 Uploading audio file to RSS.com...')
    
    const fileName = path.basename(filePath)
    const stats = await fs.stat(filePath)
    
    console.log(`   File: ${fileName}`)
    console.log(`   Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`)

    // Convert date to ISO format for RSS.com
    const publishDate = new Date(date + 'T06:00:00')
    const publishISO = publishDate.toISOString()
    const now = new Date()
    const isFuture = publishDate > now
    
    if (isFuture) {
      console.log(`   Scheduling for: ${publishDate.toLocaleString()}`)
    } else {
      console.log(`   Publishing on: ${publishDate.toLocaleString()}`)
    }

    // Create FormData for multipart upload
    const FormData = (await import('formdata-node')).FormData
    const { fileFromPath } = await import('formdata-node/file-from-path')
    
    const formData = new FormData()
    formData.append('title', title)
    formData.append('published_at', publishISO)
    formData.append('status', isFuture ? 'scheduled' : 'published')
    formData.append('media', await fileFromPath(filePath, fileName))

    // Upload to RSS.com
    const response = await fetch(`${RSS_API_BASE}/podcasts/${RSS_PODCAST_ID}/episodes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RSS_API_KEY}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`   Response status: ${response.status}`)
      console.error(`   Response error: ${errorText}`)
      throw new Error(`Upload failed (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    console.log('✅ Episode uploaded successfully')
    
    return {
      episodeId: data.id || data.episode?.id,
      playerUrl: data.player_url || data.episode?.player_url || data.url,
      permalink: data.permalink || data.episode?.permalink || data.url,
      ...data
    }
  } catch (error) {
    console.error('❌ Error uploading to RSS.com:', error.message)
    throw error
  }
}

// publishEpisode function is now combined with upload in uploadAndCreateEpisode

/**
 * Gets list of existing episodes from RSS.com
 */
async function getExistingEpisodes() {
  try {
    const data = await rssRequest(`/podcasts/${RSS_PODCAST_ID}/episodes?limit=360`)
    return data.episodes || data.items || data.data || []
  } catch (error) {
    console.error('❌ Error fetching existing episodes:', error.message)
    return []
  }
}


/**
 * Finds existing episode on RSS.com by title and date
 */
function findExistingEpisode(existingEpisodes, title, date) {
  return existingEpisodes.find(episode => {
    // RSS.com uses ISO date format or published_at field
    const episodeDate = episode.published_at || episode.publish_time || episode.date
    const episodeDateStr = episodeDate ? new Date(episodeDate).toISOString().split('T')[0] : null
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
    
    // Check if episode already exists on RSS.com
    if (options.existingEpisodes) {
      const existingEpisode = findExistingEpisode(
        options.existingEpisodes,
        notionEpisode.title,
        episode.date
      )
      
      if (existingEpisode) {
        const episodeDate = existingEpisode.published_at || existingEpisode.publish_time || existingEpisode.date
        const existingDateStr = episodeDate ? new Date(episodeDate).toISOString().split('T')[0] : 'unknown'
        
        console.log(`⚠️  Episode already exists on RSS.com:`)
        console.log(`   Title: ${existingEpisode.title}`)
        console.log(`   Published: ${existingDateStr}`)
        console.log(`   URL: ${existingEpisode.permalink || existingEpisode.url || 'N/A'}`)
        
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
      
      console.log(`📄 Using MP3: ${mp3FileName} (${(mp3Stats.size / (1024 * 1024)).toFixed(2)} MB)`)
    }
    
    // Upload and create episode on RSS.com (combined operation)
    const result = await uploadAndCreateEpisode(uploadFilePath, notionEpisode.title, episode.date)
    
    // Update Notion with embed URL if available
    if (result.playerUrl) {
      await updateNotionEmbedUri(notionEpisode.pageId, result.playerUrl)
    } else {
      console.log('⚠️  No player URL available from RSS.com API')
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
      force: args.includes('--force'),
    }
    
    console.log('🚀 RSS.com Episode Uploader\n')
    
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

