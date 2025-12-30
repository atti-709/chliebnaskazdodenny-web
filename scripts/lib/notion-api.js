/**
 * Notion API Client
 * 
 * Handles all interactions with the Notion API
 */

import { notionConfig } from './config.js'

/**
 * Makes a request to Notion API
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Response data
 */
async function notionRequest(endpoint, options = {}) {
  const response = await fetch(`https://api.notion.com/v1${endpoint}`, {
    method: options.method || 'POST',
    headers: {
      Authorization: `Bearer ${notionConfig.apiKey}`,
      'Notion-Version': notionConfig.version,
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
 * @param {string} date - Episode date (YYYY-MM-DD)
 * @returns {Promise<Object|null>} Episode data or null if not found
 */
export async function getEpisodeFromNotion(date) {
  try {
    const response = await notionRequest(`/databases/${notionConfig.databaseId}/query`, {
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
 * @param {string} pageId - Notion page ID
 * @param {string} embedUri - Spotify embed URI
 * @returns {Promise<boolean>} True if update successful
 */
export async function updateNotionEmbedUri(pageId, embedUri) {
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

