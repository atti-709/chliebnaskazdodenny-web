/**
 * Notion API utilities for serverless functions
 * Provides helper functions to extract and transform Notion data
 */

/**
 * Converts Notion rich text array to plain text string
 * @param {Array} richText - Notion rich text array
 * @returns {string} Plain text string
 */
export const richTextToPlainText = richText =>
  richText?.map(text => text.plain_text).join('') ?? ''

/**
 * Extracts and formats date from Notion page properties (YYYY-MM-DD)
 * @param {Object} properties - Notion page properties
 * @returns {string} Formatted date string
 */
export const extractDate = properties =>
  (properties.Date?.date?.start || properties.date?.date?.start)?.split('T')[0] ?? ''

/**
 * Extracts title from Notion page properties
 * @param {Object} properties - Notion page properties
 * @returns {string} Title string
 */
export const extractTitle = properties =>
  richTextToPlainText(properties.Title?.title || properties.title?.title)

/**
 * Extracts quote from Notion page properties
 * @param {Object} properties - Notion page properties
 * @returns {string} Quote string
 */
export const extractQuote = properties =>
  richTextToPlainText(properties.Quote?.rich_text || properties.quote?.rich_text)

/**
 * Extracts Spotify embed URI from Notion page properties
 * @param {Object} properties - Notion page properties
 * @returns {string} Spotify URI or empty string
 */
export const extractSpotifyUri = properties =>
  properties['Spotify Embed URI']?.url || properties.spotifyEmbedUri?.url || ''

/**
 * Extracts reflection questions from Notion page properties
 * @param {Object} properties - Notion page properties
 * @returns {string} Questions string
 */
export const extractQuestions = properties =>
  richTextToPlainText(properties.Questions?.rich_text || properties.questions?.rich_text)

/**
 * Extracts morning/day verse from Notion page properties
 * @param {Object} properties - Notion page properties
 * @returns {string} Day verse string
 */
export const extractVerseDay = properties =>
  richTextToPlainText(properties.VerseDay?.rich_text || properties.verseDay?.rich_text)

/**
 * Extracts prayer from Notion page properties
 * @param {Object} properties - Notion page properties
 * @returns {string} Prayer string
 */
export const extractPrayer = properties =>
  richTextToPlainText(properties.Prayer?.rich_text || properties.prayer?.rich_text)

/**
 * Extracts evening verse from Notion page properties
 * @param {Object} properties - Notion page properties
 * @returns {string} Evening verse string
 */
export const extractVerseEvening = properties =>
  richTextToPlainText(properties.VerseEvening?.rich_text || properties.verseEvening?.rich_text)

/**
 * Converts a Notion page and its blocks into a Devotional object
 * @param {Object} page - Notion page object
 * @param {Array} blocks - Array of Notion block objects
 * @returns {Object} Structured devotional object
 */
export const convertNotionPageToDevotional = (page, blocks) => ({
  id: page.id,
  title: extractTitle(page.properties),
  date: extractDate(page.properties),
  quote: extractQuote(page.properties),
  text: blocks,
  spotifyEmbedUri: extractSpotifyUri(page.properties),
  questions: extractQuestions(page.properties),
  verseDay: extractVerseDay(page.properties),
  prayer: extractPrayer(page.properties),
  verseEvening: extractVerseEvening(page.properties),
  createdAt: page.created_time,
  updatedAt: page.last_edited_time,
  url: page.url,
})

/* -------------------------------------------------------------------------- */
/*                   Notion databases (one database per year)                 */
/* -------------------------------------------------------------------------- */

export const NOTION_VERSION = '2022-06-28'

const DATABASE_ENTRY_PATTERN = /^(\d{4})\s*:\s*([0-9a-f-]{32,36})$/i

/**
 * Reads the configured Notion databases from environment variables.
 *
 * - `NOTION_DATABASE_IDS` (preferred): comma-separated `YEAR:DATABASE_ID` pairs,
 *   e.g. `2026:288fb148...,2027:abc123...` - one database per year.
 * - `NOTION_DATABASE_ID` (legacy): a single database used for every year.
 *   Ignored when `NOTION_DATABASE_IDS` is set.
 *
 * @param {Object} [env=process.env] - Environment variables
 * @returns {Array<{year: number|null, id: string}>} Databases sorted by year
 *   (ascending). `year: null` marks the legacy database that covers all years.
 * @throws {Error} When `NOTION_DATABASE_IDS` is malformed
 */
export function getNotionDatabases(env = process.env) {
  const multi = env.NOTION_DATABASE_IDS?.trim()

  if (multi) {
    const years = new Set()

    return multi
      .split(',')
      .map(entry => entry.trim())
      .filter(Boolean)
      .map(entry => {
        const match = entry.match(DATABASE_ENTRY_PATTERN)
        if (!match) {
          throw new Error(
            `Invalid NOTION_DATABASE_IDS entry "${entry}" (expected YEAR:DATABASE_ID)`
          )
        }

        const year = Number(match[1])
        if (years.has(year)) {
          throw new Error(`Duplicate year ${year} in NOTION_DATABASE_IDS`)
        }
        years.add(year)

        return { year, id: match[2] }
      })
      .sort((a, b) => a.year - b.year)
  }

  const single = env.NOTION_DATABASE_ID?.trim()
  return single ? [{ year: null, id: single }] : []
}

/**
 * Returns the database ID that holds devotionals for a given year
 * @param {Array<{year: number|null, id: string}>} databases - From getNotionDatabases()
 * @param {number|string} year - Four-digit year
 * @returns {string|null} Database ID, or null when no database covers that year
 */
export const getDatabaseIdForYear = (databases, year) =>
  databases.find(db => db.year === null || db.year === Number(year))?.id ?? null

/**
 * Returns the database ID that holds the devotional for a given date
 * @param {Array<{year: number|null, id: string}>} databases - From getNotionDatabases()
 * @param {string} date - Date string starting with YYYY (e.g. YYYY-MM-DD)
 * @returns {string|null} Database ID, or null when no database covers that year
 */
export const getDatabaseIdForDate = (databases, date) =>
  getDatabaseIdForYear(databases, String(date).slice(0, 4))

/* -------------------------------------------------------------------------- */
/*                                Notion queries                              */
/* -------------------------------------------------------------------------- */

/**
 * Makes a request to the Notion API
 * @param {string} endpoint - API endpoint (e.g. `/databases/:id/query`)
 * @param {string} apiKey - Notion integration token
 * @param {Object} [options] - Request options (method, body, headers)
 * @returns {Promise<Object>} Parsed JSON response
 */
export async function notionRequest(endpoint, apiKey, options = {}) {
  const response = await fetch(`https://api.notion.com/v1${endpoint}`, {
    method: options.method || 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    throw new Error(`Notion API error: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Queries one database and follows pagination until all results are fetched
 * @param {string} databaseId - Notion database ID
 * @param {string} apiKey - Notion integration token
 * @param {Object} [body] - Query body (filter, sorts, page_size)
 * @returns {Promise<Array>} All matching pages
 */
export async function queryDatabaseAll(databaseId, apiKey, body = {}) {
  let results = []
  let startCursor = undefined

  do {
    const response = await notionRequest(`/databases/${databaseId}/query`, apiKey, {
      body: { ...body, start_cursor: startCursor },
    })
    results = results.concat(response.results)
    startCursor = response.has_more ? response.next_cursor : undefined
  } while (startCursor)

  return results
}

/**
 * Runs a query against every configured database and merges the results.
 * A database that fails (e.g. a new year's database not yet shared with the
 * integration) is logged and skipped so the other years keep working; if every
 * database fails, the first error is thrown.
 * @param {Array<{year: number|null, id: string}>} databases - From getNotionDatabases()
 * @param {(databaseId: string) => Promise<Array>} queryFn - Returns pages for one database
 * @returns {Promise<Array>} Pages from all databases
 */
async function queryEachDatabase(databases, queryFn) {
  const settled = await Promise.allSettled(databases.map(db => queryFn(db.id)))
  const failed = settled.filter(result => result.status === 'rejected')

  if (failed.length > 0 && failed.length === settled.length) {
    throw failed[0].reason
  }

  settled.forEach((result, index) => {
    if (result.status === 'rejected') {
      const { year } = databases[index]
      console.error(`Notion database for year ${year ?? 'all'} failed:`, result.reason)
    }
  })

  return settled.filter(result => result.status === 'fulfilled').flatMap(result => result.value)
}

/**
 * Sorts pages by their Date property, newest first (pages without a date last)
 * @param {Array} pages - Notion pages
 * @returns {Array} New sorted array
 */
const sortPagesByDateDescending = pages =>
  [...pages].sort((a, b) => {
    const dateA = extractDate(a.properties)
    const dateB = extractDate(b.properties)
    if (!dateA || !dateB) return dateA ? -1 : dateB ? 1 : 0
    return dateB.localeCompare(dateA)
  })

/**
 * Finds the devotional page for a date in the database of that date's year
 * @param {Array<{year: number|null, id: string}>} databases - From getNotionDatabases()
 * @param {string} apiKey - Notion integration token
 * @param {string} date - Date (YYYY-MM-DD)
 * @returns {Promise<Object|null>} Notion page, or null when not found or when no
 *   database is configured for that year
 */
export async function findPageByDate(databases, apiKey, date) {
  const databaseId = getDatabaseIdForDate(databases, date)
  if (!databaseId) {
    return null
  }

  const response = await notionRequest(`/databases/${databaseId}/query`, apiKey, {
    body: {
      filter: {
        property: 'Date',
        date: {
          equals: date,
        },
      },
    },
  })

  return response.results[0] ?? null
}

/**
 * Fetches the most recent devotional pages across all databases
 * @param {Array<{year: number|null, id: string}>} databases - From getNotionDatabases()
 * @param {string} apiKey - Notion integration token
 * @param {number} limit - Maximum number of pages (1-100)
 * @returns {Promise<Array>} Pages sorted by date, newest first
 */
export async function fetchLatestPages(databases, apiKey, limit) {
  const pages = await queryEachDatabase(databases, async databaseId => {
    const response = await notionRequest(`/databases/${databaseId}/query`, apiKey, {
      body: {
        sorts: [
          {
            property: 'Date',
            direction: 'descending',
          },
        ],
        page_size: limit,
      },
    })
    return response.results
  })

  return sortPagesByDateDescending(pages).slice(0, limit)
}

/**
 * Fetches all devotional dates across all databases
 * @param {Array<{year: number|null, id: string}>} databases - From getNotionDatabases()
 * @param {string} apiKey - Notion integration token
 * @returns {Promise<string[]>} Dates (YYYY-MM-DD), newest first
 */
export async function fetchAllDates(databases, apiKey) {
  const pages = await queryEachDatabase(databases, databaseId =>
    queryDatabaseAll(databaseId, apiKey, {
      sorts: [
        {
          property: 'Date',
          direction: 'descending',
        },
      ],
    })
  )

  return sortPagesByDateDescending(pages)
    .map(page => extractDate(page.properties))
    .filter(Boolean)
}

/**
 * Fetches the content blocks of a page
 * @param {string} pageId - Notion page ID
 * @param {string} apiKey - Notion integration token
 * @returns {Promise<Array>} Notion block objects
 */
export async function fetchPageBlocks(pageId, apiKey) {
  const response = await notionRequest(`/blocks/${pageId}/children`, apiKey, { method: 'GET' })
  return response.results
}
