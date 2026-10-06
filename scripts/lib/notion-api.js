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
 * Extracts the date (YYYY-MM-DD) from a Notion page
 * @param {Object} page - Notion page
 * @returns {string|null} Date or null
 */
function getPageDate(page) {
  const dateProperty = page.properties.Date?.date?.start || page.properties.date?.date?.start
  return dateProperty ? dateProperty.split('T')[0] : null
}

/**
 * Extracts the title from a Notion page
 * @param {Object} page - Notion page
 * @returns {string} Title
 */
function getPageTitle(page) {
  const titleProperty = page.properties.Title?.title || page.properties.title?.title
  return titleProperty ? titleProperty.map(text => text.plain_text).join('') : ''
}

/**
 * Queries a database, following pagination until all results are fetched
 * @param {string} databaseId - Notion database ID
 * @param {Object} body - Query body (filter, sorts)
 * @returns {Promise<Array>} All matching pages
 */
async function queryDatabaseAll(databaseId, body = {}) {
  let allResults = []
  let hasMore = true
  let startCursor = undefined

  while (hasMore) {
    const requestBody = { page_size: 100, ...body }
    if (startCursor) {
      requestBody.start_cursor = startCursor
    }

    const response = await notionRequest(`/databases/${databaseId}/query`, { body: requestBody })
    allResults = allResults.concat(response.results)
    hasMore = response.has_more
    startCursor = response.next_cursor
  }

  return allResults
}

/**
 * Fetches episode data from Notion by date (from the database of the date's year)
 * @param {string} date - Episode date (YYYY-MM-DD)
 * @param {boolean} includeEpisodeNumber - Whether to calculate episode number
 * @returns {Promise<Object|null>} Episode data or null if not found
 */
export async function getEpisodeFromNotion(date, includeEpisodeNumber = false) {
  try {
    const databaseId = notionConfig.requireDatabaseIdForYear(date.slice(0, 4))

    const response = await notionRequest(`/databases/${databaseId}/query`, {
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

    const result = {
      pageId: page.id,
      title: getPageTitle(page),
    }

    // Calculate episode number if requested
    if (includeEpisodeNumber) {
      result.episodeNumber = await getEpisodeNumber(date)
      result.seasonNumber = getSeasonNumber(date)
    }

    return result
  } catch (error) {
    console.error(`❌ Error fetching episode from Notion for date ${date}:`, error.message)
    return null
  }
}

/**
 * First year of the podcast; it is iTunes season 1 and every later year is the next season
 */
const FIRST_SEASON_YEAR = 2026

/**
 * Returns the iTunes season of an episode: one season per year (2026 = 1, 2027 = 2, ...)
 * @param {string} date - Episode date (YYYY-MM-DD)
 * @returns {number} Season number (1-based)
 */
export function getSeasonNumber(date) {
  return Number(date.slice(0, 4)) - FIRST_SEASON_YEAR + 1
}

/**
 * Calculates the episode number based on date ordering in Notion.
 * Numbering restarts every year: the first episode of a year (1 January) is #1.
 * @param {string} targetDate - Episode date (YYYY-MM-DD)
 * @returns {Promise<number|null>} Episode number (1-based), or null if it cannot be determined
 */
async function getEpisodeNumber(targetDate) {
  try {
    const sorts = [
      {
        property: 'Date',
        direction: 'ascending',
      },
    ]

    // Fetch the episode dates of the target year (a legacy database may hold several years)
    const year = targetDate.slice(0, 4)
    const databaseId = notionConfig.requireDatabaseIdForYear(year)
    const pages = await queryDatabaseAll(databaseId, { sorts })
    const yearDates = pages
      .map(getPageDate)
      .filter(date => date?.startsWith(year))
      .sort()

    // Episode number is index + 1 (1-based)
    const episodeIndex = yearDates.indexOf(targetDate)
    if (episodeIndex < 0) {
      console.error(`❌ Could not find ${targetDate} when calculating episode number`)
      return null
    }
    return episodeIndex + 1
  } catch (error) {
    console.error('❌ Error calculating episode number:', error.message)
    return null // Unknown number: never guess, it is used to match existing episodes
  }
}

/**
 * Fetches episode data from Notion by title.
 * Searches the database for `dateHint`'s year first (when given), then the
 * remaining databases from the newest year to the oldest.
 * @param {string} title - Episode title
 * @param {string|null} [dateHint] - Expected episode date (YYYY-MM-DD), if known
 * @returns {Promise<Object|null>} Episode data or null if not found
 */
export async function getEpisodeFromNotionByTitle(title, dateHint = null) {
  try {
    const preferredId = dateHint ? notionConfig.getDatabaseIdForDate(dateHint) : null
    const databaseIds = [
      ...new Set([preferredId, ...notionConfig.databases.map(db => db.id).reverse()]),
    ].filter(Boolean)

    for (const databaseId of databaseIds) {
      const response = await notionRequest(`/databases/${databaseId}/query`, {
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
        continue
      }

      const page = response.results[0]

      // Also get the date for display purposes
      const dateProperty = page.properties.Date?.date
      const date = dateProperty ? dateProperty.start : null

      return {
        pageId: page.id,
        title: getPageTitle(page),
        date: date,
      }
    }

    return null
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

