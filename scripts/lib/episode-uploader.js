/* eslint-disable no-console */
/**
 * Episode Uploader
 * 
 * Handles the upload process for individual episodes
 */

import fs from 'fs/promises'
import path from 'path'
import { getPresignedUploadUrl, uploadToPresignedUrl, createEpisodeWithAsset, findExistingEpisode } from './rss-api.js'
import { getEpisodeFromNotion, updateNotionEmbedUri } from './notion-api.js'
import { convertWAVtoMP3 } from './audio-converter.js'

/**
 * Uploads audio file and creates episode on RSS.com
 * Uses the three-step presigned upload process
 * 
 * @param {string} filePath - Path to audio file
 * @param {string} title - Episode title
 * @param {string} date - Episode date (YYYY-MM-DD)
 * @returns {Promise<Object>} Created episode data
 */
export async function uploadAndCreateEpisode(filePath, title, date) {
  try {
    const fileName = path.basename(filePath)
    const stats = await fs.stat(filePath)
    
    console.log('📤 Uploading audio file to RSS.com...')
    console.log(`   File: ${fileName}`)
    console.log(`   Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`)
    
    // Step 1: Get presigned upload URL
    const presigned = await getPresignedUploadUrl(fileName, stats.size)
    
    // Step 2: Upload file to S3 using presigned URL
    const fileBuffer = await fs.readFile(filePath)
    await uploadToPresignedUrl(fileBuffer, presigned.uploadUrl)
    
    // Step 3: Create episode with asset ID
    const episode = await createEpisodeWithAsset(presigned.assetId, title, date)
    
    return episode
  } catch (error) {
    console.error('❌ Error in upload process:', error.message)
    throw error
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
 * Uploads a single episode to RSS.com
 * 
 * @param {Object} episode - Episode object from scanner
 * @param {Object} options - Upload options
 * @param {boolean} options.dryRun - If true, don't actually upload
 * @param {boolean} options.force - If true, upload even if already exists
 * @param {Array} options.existingEpisodes - Array of existing episodes for duplicate detection
 * @returns {Promise<Object>} Upload result
 */
export async function uploadEpisode(episode, options = {}) {
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
        const episodeDate = existingEpisode.publishedAt || existingEpisode.published_at || existingEpisode.date
        const existingDateStr = episodeDate ? new Date(episodeDate).toISOString().split('T')[0] : 'unknown'
        
        console.log(`⚠️  Episode already exists on RSS.com:`)
        console.log(`   Title: ${existingEpisode.title}`)
        console.log(`   Published: ${existingDateStr}`)
        console.log(`   URL: ${existingEpisode.link || existingEpisode.permalink || existingEpisode.url || 'N/A'}`)
        
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
    const uploadFilePath = await prepareAudioFile(episode)
    
    // Upload and create episode on RSS.com (combined operation)
    const result = await uploadAndCreateEpisode(uploadFilePath, notionEpisode.title, episode.date)
    
    // Update Notion with embed URL only if episode is published
    // (scheduled episodes show "not available" error in the player)
    if (result.playerUrl) {
      const isPublished = result.rawResponse?.status === 'published'
      
      if (isPublished) {
        await updateNotionEmbedUri(notionEpisode.pageId, result.playerUrl)
      } else {
        console.log(`⏰ Episode is scheduled (status: ${result.rawResponse?.status || 'unknown'})`)
        console.log('   Player URL will be synced after episode is published')
      }
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

