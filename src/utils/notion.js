/**
 * Notion API utilities
 * Shared conversion logic for transforming Notion data
 */

/**
 * Converts Notion rich text to plain text
 */
export const richTextToPlainText = richText => {
  return richText ? richText.map(text => text.plain_text).join('') : ''
}

/**
 * Extracts date from Notion page properties
 */
export const extractDate = properties => {
  const dateProperty = properties.Date?.date?.start || properties.date?.date?.start
  return dateProperty ? dateProperty.split('T')[0] : ''
}

/**
 * Extracts title from Notion page properties
 */
export const extractTitle = properties => {
  return richTextToPlainText(properties.Title?.title || properties.title?.title)
}

/**
 * Extracts quote from Notion page properties
 */
export const extractQuote = properties => {
  return richTextToPlainText(properties.Quote?.rich_text || properties.quote?.rich_text)
}

/**
 * Extracts Spotify embed URI from Notion page properties
 */
export const extractSpotifyUri = properties => {
  return properties['Spotify Embed URI']?.url || properties.spotifyEmbedUri?.url || ''
}

/**
 * Extracts questions from Notion page properties
 */
export const extractQuestions = properties => {
  return richTextToPlainText(properties.Questions?.rich_text || properties.questions?.rich_text)
}

/**
 * Extracts day verse from Notion page properties
 */
export const extractVerseDay = properties => {
  return richTextToPlainText(properties.VerseDay?.rich_text || properties.verseDay?.rich_text)
}

/**
 * Extracts prayer from Notion page properties
 */
export const extractPrayer = properties => {
  return richTextToPlainText(properties.Prayer?.rich_text || properties.prayer?.rich_text)
}

/**
 * Extracts evening verse from Notion page properties
 */
export const extractVerseEvening = properties => {
  return richTextToPlainText(properties.VerseEvening?.rich_text || properties.verseEvening?.rich_text)
}

/**
 * Converts Notion page to Devotional format
 * @param {Object} page - Notion page object
 * @param {Array} blocks - Notion blocks array
 * @returns {Object} Devotional object
 */
export const convertNotionPageToDevotional = (page, blocks) => {
  const properties = page.properties

  return {
    id: page.id,
    title: extractTitle(properties),
    date: extractDate(properties),
    quote: extractQuote(properties),
    text: blocks,
    spotifyEmbedUri: extractSpotifyUri(properties),
    questions: extractQuestions(properties),
    verseDay: extractVerseDay(properties),
    prayer: extractPrayer(properties),
    verseEvening: extractVerseEvening(properties),
    createdAt: page.created_time,
    updatedAt: page.last_edited_time,
    url: page.url,
  }
}
