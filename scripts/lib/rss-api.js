/**
 * RSS.com API Client
 * 
 * Handles all interactions with the RSS.com API
 */

import { rssConfig } from './config.js'

/**
 * Makes a request to RSS.com API
 * @param {string} endpoint - API endpoint (e.g., '/podcasts/123')
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Response data
 */
async function rssRequest(endpoint, options = {}) {
  const response = await fetch(`${rssConfig.apiBase}${endpoint}`, {
    method: options.method || 'GET',
    headers: {
      'X-Api-Key': rssConfig.apiKey,
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
 * Tests API credentials by fetching podcast info
 * @returns {Promise<boolean>} True if credentials are valid
 */
export async function testCredentials() {
  try {
    console.log('🔍 Testing API credentials...')
    const data = await rssRequest(`/podcasts/${rssConfig.podcastId}`)
    console.log(`✅ Credentials valid - Connected to podcast: ${data.title || data.name || 'Unknown'}`)
    return true
  } catch (error) {
    console.error('❌ Credential test failed:', error.message)
    console.error('\n⚠️  Possible issues:')
    console.error('   1. API key is incorrect or expired')
    console.error('   2. Podcast ID is incorrect or doesn\'t belong to this API key')
    console.error('   3. API key doesn\'t have permissions for this podcast')
    console.error('\n📝 To fix:')
    console.error('   1. Log in to RSS.com')
    console.error('   2. Check your API key in Settings → API Access')
    console.error('   3. Verify your Podcast ID in your podcast settings')
    console.error('   4. Update .env.local with the correct values')
    return false
  }
}

/**
 * Gets list of existing episodes from RSS.com
 * @param {number} limit - Maximum number of episodes to fetch
 * @returns {Promise<Array>} Array of existing episodes
 */
export async function getExistingEpisodes(limit = 360) {
  try {
    const data = await rssRequest(`/podcasts/${rssConfig.podcastId}/episodes?limit=${limit}`)
    return data.items || data.data || data.episodes || []
  } catch (error) {
    console.error('⚠️  Could not fetch existing episodes:', error.message)
    console.error('   Continuing without duplicate detection...')
    return []
  }
}

/**
 * Finds existing episode by title and date
 * @param {Array} existingEpisodes - Array of existing episodes
 * @param {string} title - Episode title to search for
 * @param {string} date - Episode date (YYYY-MM-DD)
 * @returns {Object|undefined} Found episode or undefined
 */
export function findExistingEpisode(existingEpisodes, title, date) {
  return existingEpisodes.find(episode => {
    const episodeDate = episode.publishedAt || episode.published_at || episode.date
    const episodeDateStr = episodeDate ? new Date(episodeDate).toISOString().split('T')[0] : null
    return episode.title === title || episodeDateStr === date
  })
}

/**
 * Requests a presigned upload URL from RSS.com
 * @param {string} fileName - Name of the file to upload
 * @param {number} fileSize - Size of the file in bytes
 * @returns {Promise<Object>} Upload URL and asset ID
 */
export async function getPresignedUploadUrl(fileName, fileSize) {
  try {
    console.log('📝 Step 1: Requesting presigned upload URL...')
    console.log(`   File: ${fileName}`)
    console.log(`   Size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`)

    const response = await fetch(`${rssConfig.apiBase}/podcasts/${rssConfig.podcastId}/assets/presigned-uploads`, {
      method: 'POST',
      headers: {
        'X-Api-Key': rssConfig.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: fileName,
        asset_type: 'audio',
        expected_mime: 'audio/mpeg',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Presigned URL request failed (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    console.log(`✅ Presigned upload URL received`)
    console.log(`   Asset ID: ${data.id || data.asset_id || data.assetId}`)
    
    return {
      uploadUrl: data.upload_url || data.uploadUrl || data.url,
      assetId: data.id || data.asset_id || data.assetId,
      ...data
    }
  } catch (error) {
    console.error('❌ Error getting presigned URL:', error.message)
    throw error
  }
}

/**
 * Uploads audio file to presigned S3 URL
 * @param {Buffer} fileBuffer - File data buffer
 * @param {string} presignedUrl - S3 presigned URL
 */
export async function uploadToPresignedUrl(fileBuffer, presignedUrl) {
  try {
    console.log('📤 Step 2: Uploading file to S3...')
    
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'audio/mpeg',
      },
      body: fileBuffer,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`S3 upload failed (${response.status}): ${errorText}`)
    }

    console.log(`✅ File uploaded to S3 successfully`)
  } catch (error) {
    console.error('❌ Error uploading to S3:', error.message)
    throw error
  }
}

/**
 * Creates episode with uploaded audio asset
 * @param {string} audioId - Audio asset ID from presigned upload
 * @param {string} title - Episode title
 * @param {string} date - Episode date (YYYY-MM-DD)
 * @returns {Promise<Object>} Created episode data
 */
export async function createEpisodeWithAsset(audioId, title, date) {
  try {
    console.log('📝 Step 3: Creating episode with audio asset...')

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

    const episodeData = {
      title: title,
      description: title,
      audio_upload_id: audioId,
      schedule_datetime: publishISO,
    }

    console.log('   Episode data:')
    console.log(`     title: "${title}"`)
    console.log(`     description: "${title}"`)
    console.log(`     audio_upload_id: "${audioId}"`)
    console.log(`     schedule_datetime: "${publishISO}"`)

    const response = await fetch(`${rssConfig.apiBase}/podcasts/${rssConfig.podcastId}/episodes`, {
      method: 'POST',
      headers: {
        'X-Api-Key': rssConfig.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(episodeData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`   Response status: ${response.status}`)
      console.error(`   Response error: ${errorText}`)
      throw new Error(`Episode creation failed (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    console.log('✅ Episode created successfully')
    
    return {
      episodeId: data.id || data.episode?.id,
      playerUrl: data.player_url || data.episode?.player_url || data.url,
      permalink: data.permalink || data.episode?.permalink || data.url,
      ...data
    }
  } catch (error) {
    console.error('❌ Error creating episode:', error.message)
    throw error
  }
}

