/* eslint-disable no-console */
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
 * @param {boolean} includeEpisodeNumber - Whether to calculate episode number
 * @returns {Promise<Object|null>} Episode data or null if not found
 */
export async function getEpisodeFromNotion(date, includeEpisodeNumber = false) {
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
    
    const result = {
      pageId: page.id,
      title: title,
    }
    
    // Calculate episode number if requested
    if (includeEpisodeNumber) {
      const episodeNumber = await getEpisodeNumber(date)
      result.episodeNumber = episodeNumber
    }
    
    return result
  } catch (error) {
    console.error(`❌ Error fetching episode from Notion for date ${date}:`, error.message)
    return null
  }
}

/**
 * Calculates the episode number based on date ordering in Notion
 * @param {string} targetDate - Episode date (YYYY-MM-DD)
 * @returns {Promise<number>} Episode number (1-based)
 */
async function getEpisodeNumber(targetDate) {
  try {
    // Fetch all episodes sorted by date ascending
    const response = await notionRequest(`/databases/${notionConfig.databaseId}/query`, {
      body: {
        sorts: [
          {
            property: 'Date',
            direction: 'ascending',
          },
        ],
        page_size: 100, // Adjust if you have more episodes
      },
    })
    
    // Find the position of the target date
    const episodeIndex = response.results.findIndex(page => {
      const dateProperty = page.properties.Date?.date?.start || page.properties.date?.date?.start
      return dateProperty && dateProperty.split('T')[0] === targetDate
    })
    
    // Episode number is index + 1 (1-based)
    return episodeIndex >= 0 ? episodeIndex + 1 : 1
  } catch (error) {
    console.error('❌ Error calculating episode number:', error.message)
    return 1 // Default to 1 if calculation fails
  }
}

/**
 * Fetches episode data from Notion by title
 * @param {string} title - Episode title
 * @returns {Promise<Object|null>} Episode data or null if not found
 */
export async function getEpisodeFromNotionByTitle(title) {
  try {
    const response = await notionRequest(`/databases/${notionConfig.databaseId}/query`, {
      body: {
        filter: {
          property: 'Title',
          title: {
            equals: title,
          },
        },
      },
    })

    if (response.results.length === 0) {
      return null
    }

    const page = response.results[0]
    const titleProperty = page.properties.Title?.title || page.properties.title?.title
    const pageTitle = titleProperty ? titleProperty.map(text => text.plain_text).join('') : ''
    
    // Also get the date for display purposes
    const dateProperty = page.properties.Date?.date
    const date = dateProperty ? dateProperty.start : null
    
    return {
      pageId: page.id,
      title: pageTitle,
      date: date,
    }
  } catch (error) {
    console.error(`❌ Error fetching episode from Notion by title "${title}":`, error.message)
    return null
  }
}

/**
 * Updates the Spotify Embed URI field in Notion page
 * @param {string} pageId - Notion page ID
 * @param {string} embedUri - Spotify embed URI (empty string to clear)
 * @returns {Promise<boolean>} True if update successful
 */
export async function updateNotionEmbedUri(pageId, embedUri) {
  try {
    const action = embedUri ? 'Updating' : 'Clearing'
    console.log(`📝 ${action} Notion embed URI...`)
    
    await notionRequest(`/pages/${pageId}`, {
      method: 'PATCH',
      body: {
        properties: {
          'Spotify Embed URI': embedUri ? {
            url: embedUri,
          } : {
            url: null, // Clear the URL field
          },
        },
      },
    })

    const result = embedUri ? 'updated' : 'cleared'
    console.log(`✅ Notion page ${result}`)
    return true
  } catch (error) {
    console.error('❌ Error updating Notion page:', error.message)
    return false
  }
}

