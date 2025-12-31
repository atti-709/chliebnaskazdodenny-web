/* eslint-disable no-console */
/**
 * RSS.com API Client
 * 
 * Handles all interactions with the RSS.com API
 */

import { rssConfig } from './config.js'

/**
 * Default episode description used for all episodes
 */
export const DEFAULT_EPISODE_DESCRIPTION = `<p>Pomáhame ti zastaviť sa, načúvať a rásť. Každý deň.</p><p></p><p>📖 Toto zamyslenie nájdeš aj na našom webe <a href="https://www.chliebnaskazdodenny.sk">chliebnaskazdodenny.sk</a></p><p>#chliebnaskazdodenny #zamyslenie #kazdyden #Boh #stisenie</p>`

/**
 * Makes a request to RSS.com API
 * @param {string} endpoint - API endpoint (e.g., '/podcasts/123')
 * @param {Object} options - Request options
 * @returns {Promise<Object|null>} Response data (null for 204 No Content)
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

  // Handle 204 No Content (common for DELETE requests)
  if (response.status === 204) {
    return null
  }

  // Handle empty responses
  const text = await response.text()
  if (!text) {
    return null
  }

  return JSON.parse(text)
}

/**
 * Gets or creates keywords and returns their IDs
 * @param {string[]} keywords - Array of keyword strings
 * @returns {Promise<number[]>} Array of keyword IDs
 */
async function getOrCreateKeywordIds(keywords) {
  try {
    // Fetch existing keywords
    const existingKeywords = await rssRequest(`/podcasts/${rssConfig.podcastId}/keywords`)
    const keywordsList = existingKeywords.items || existingKeywords.data || existingKeywords || []
    
    const keywordIds = []
    
    for (const keyword of keywords) {
      // Check if keyword already exists (RSS.com uses 'label' field)
      const existing = keywordsList.find(k => k.label === keyword || k.name === keyword || k.keyword === keyword)
      
      if (existing) {
        keywordIds.push(existing.id)
      } else {
        // Create new keyword (RSS.com API uses 'label' field)
        try {
          const newKeyword = await rssRequest(`/podcasts/${rssConfig.podcastId}/keywords`, {
            method: 'POST',
            body: { label: keyword }, // Changed from 'name' to 'label'
          })
          keywordIds.push(newKeyword.id)
        } catch (error) {
          console.error(`⚠️  Could not create keyword "${keyword}":`, error.message)
        }
      }
    }
    
    return keywordIds
  } catch (error) {
    console.error('⚠️  Error managing keywords:', error.message)
    return []
  }
}

/**
 * Gets keyword IDs for default podcast keywords
 * @returns {Promise<number[]>} Array of keyword IDs
 */
export async function getDefaultKeywordIds() {
  const keywords = [
    'chliebnaskazdodenny',
    'zamyslenie',
    'kazdyden',
    'Boh',
    'stisenie',
  ]
  
  return await getOrCreateKeywordIds(keywords)
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
 * @param {number} limit - Maximum number of episodes to fetch (max 100 per request)
 * @returns {Promise<Array>} Array of existing episodes
 */
export async function getExistingEpisodes(limit = 100) {
  try {
    // RSS.com API has a maximum limit of 100 per request
    const actualLimit = Math.min(limit, 100)
    const data = await rssRequest(`/podcasts/${rssConfig.podcastId}/episodes?limit=${actualLimit}`)
    
    // RSS.com v4 API returns episodes as root array, not wrapped in object
    if (Array.isArray(data)) {
      return data
    }
    
    // Fallback: check for common wrapper keys
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
    // RSS.com v4 API uses publish_datetime for published episodes
    // and schedule_datetime for scheduled episodes
    const episodeDate = episode.publish_datetime || 
                       episode.schedule_datetime || 
                       episode.publishedAt || 
                       episode.published_at || 
                       episode.date
    const episodeDateStr = episodeDate ? new Date(episodeDate).toISOString().split('T')[0] : null
    return episode.title === title || episodeDateStr === date
  })
}

/**
 * Deletes an episode from RSS.com
 * @param {number|string} episodeId - Episode ID to delete
 * @returns {Promise<boolean>} True if deletion successful
 */
export async function deleteEpisode(episodeId) {
  try {
    console.log(`🗑️  Deleting existing episode (ID: ${episodeId})...`)
    
    await rssRequest(`/podcasts/${rssConfig.podcastId}/episodes/${episodeId}`, {
      method: 'DELETE',
    })
    
    console.log('✅ Episode deleted successfully')
    return true
  } catch (error) {
    console.error('❌ Error deleting episode:', error.message)
    return false
  }
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
 * @param {Object} options - Additional episode options
 * @param {number} options.episodeNumber - iTunes episode number
 * @param {number} options.seasonNumber - iTunes season number (default: 1)
 * @param {boolean} options.explicit - iTunes explicit flag (default: false)
 * @returns {Promise<Object>} Created episode data
 */
export async function createEpisodeWithAsset(audioId, title, date, options = {}) {
  try {
    console.log('📝 Step 3: Creating episode with audio asset...')

    // Convert date to ISO format for RSS.com (6 AM UTC+1)
    const publishDate = new Date(date + 'T06:00:00+01:00')
    const publishISO = publishDate.toISOString()
    const now = new Date()
    const isFuture = publishDate > now
    
    if (isFuture) {
      console.log(`   Scheduling for: ${publishDate.toLocaleString()}`)
    } else {
      console.log(`   Publishing on: ${publishDate.toLocaleString()}`)
    }

    // Use default episode description
    const description = DEFAULT_EPISODE_DESCRIPTION

    const episodeData = {
      title: title,
      description: description,
      audio_upload_id: audioId,
      schedule_datetime: publishISO,
      itunes_explicit: options.explicit ?? false,
      itunes_episode: options.episodeNumber || null,
      itunes_season: options.seasonNumber ?? 1,
    }
    
    // Add keyword IDs if provided
    if (options.keywordIds && options.keywordIds.length > 0) {
      episodeData.keyword_ids = options.keywordIds
    }

    console.log('   Episode data:')
    console.log(`     title: "${title}"`)
    console.log(`     description: "${description.substring(0, 50)}..."`)
    console.log(`     audio_upload_id: "${audioId}"`)
    console.log(`     schedule_datetime: "${publishISO}"`)
    console.log(`     itunes_explicit: ${episodeData.itunes_explicit}`)
    console.log(`     itunes_episode: ${episodeData.itunes_episode || 'not set'}`)
    console.log(`     itunes_season: ${episodeData.itunes_season}`)
    if (episodeData.keyword_ids) {
      console.log(`     keyword_ids: [${episodeData.keyword_ids.join(', ')}]`)
    }

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
    
    // Extract episode data - RSS.com v4 API returns episode object directly
    const episodeId = data.id || data.episode?.id
    
    // Extract podcast slug from website_url if available
    // Format: https://rss.com/podcasts/[slug]/[episode-id]
    let podcastSlug = null
    if (data.website_url) {
      const match = data.website_url.match(/rss\.com\/podcasts\/([^/]+)/)
      if (match) {
        podcastSlug = match[1]
      }
    }
    
    // Construct the RSS.com player embed URL
    // Format: https://player.rss.com/[podcast-slug]/[episode-id]
    let playerEmbedUrl = null
    if (episodeId && podcastSlug) {
      playerEmbedUrl = `https://player.rss.com/${podcastSlug}/${episodeId}`
      console.log(`   Episode ID: ${episodeId}`)
      console.log(`   Podcast Slug: ${podcastSlug}`)
      console.log(`   Player Embed URL: ${playerEmbedUrl}`)
    } else {
      console.log(`   Episode ID: ${episodeId || 'Not available'}`)
      console.log(`   Podcast Slug: ${podcastSlug || 'Not available'}`)
    }
    
    // Fallback to website_url if player embed can't be constructed
    const finalPlayerUrl = playerEmbedUrl || data.website_url || data.permalink
    
    return {
      episodeId,
      playerUrl: finalPlayerUrl,
      websiteUrl: data.website_url,
      podcastSlug,
      rawResponse: data // Keep full response for debugging
    }
  } catch (error) {
    console.error('❌ Error creating episode:', error.message)
    throw error
  }
}

/**
 * Updates an existing episode on RSS.com
 * @param {number|string} episodeId - Episode ID to update
 * @param {Object} updates - Fields to update
 * @param {string} [updates.title] - New episode title
 * @param {string} [updates.description] - New episode description
 * @param {string} [updates.audioId] - New audio asset ID
 * @param {string} [updates.scheduleDateTime] - New schedule datetime (ISO format)
 * @param {number[]} [updates.keywordIds] - New keyword IDs
 * @returns {Promise<Object>} Updated episode data
 */
export async function updateEpisode(episodeId, updates = {}) {
  try {
    console.log(`📝 Updating episode (ID: ${episodeId})...`)

    const updateData = {}

    if (updates.title) {
      updateData.title = updates.title
      console.log(`   Updating title: "${updates.title}"`)
    }

    if (updates.description) {
      updateData.description = updates.description
      console.log(`   Updating description`)
    }

    if (updates.audioId) {
      updateData.audio_upload_id = updates.audioId
      console.log(`   Updating audio (asset ID: ${updates.audioId})`)
    }

    if (updates.scheduleDateTime) {
      updateData.schedule_datetime = updates.scheduleDateTime
      console.log(`   Updating schedule: ${updates.scheduleDateTime}`)
    }

    if (updates.keywordIds && updates.keywordIds.length > 0) {
      updateData.keyword_ids = updates.keywordIds
      console.log(`   Updating keywords (${updates.keywordIds.length} keywords)`)
    }

    if (Object.keys(updateData).length === 0) {
      console.log('⚠️  No updates provided')
      return { updated: false }
    }

    const response = await fetch(`${rssConfig.apiBase}/podcasts/${rssConfig.podcastId}/episodes/${episodeId}`, {
      method: 'PATCH',
      headers: {
        'X-Api-Key': rssConfig.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`   Response status: ${response.status}`)
      console.error(`   Response error: ${errorText}`)
      throw new Error(`Episode update failed (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    console.log('✅ Episode updated successfully')

    return {
      updated: true,
      episodeId: data.id,
      rawResponse: data
    }
  } catch (error) {
    console.error('❌ Error updating episode:', error.message)
    throw error
  }
}

