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
 * Extracts scripture from Notion page properties
 */
export const extractScripture = properties => {
  return richTextToPlainText(properties.Scripture?.rich_text || properties.scripture?.rich_text)
}

/**
 * Extracts Spotify embed URI from Notion page properties
 */
export const extractSpotifyUri = properties => {
  return properties['Spotify Embed URI']?.url || properties.spotifyEmbedUri?.url || ''
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
    scripture: extractScripture(properties),
    text: blocks,
    spotifyEmbedUri: extractSpotifyUri(properties),
    createdAt: page.created_time,
    updatedAt: page.last_edited_time,
    url: page.url,
  }
}
