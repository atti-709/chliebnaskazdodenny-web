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
