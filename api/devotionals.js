// Serverless API Route for Notion Integration
// This handles Notion API calls server-side

const { Client } = require('@notionhq/client')

const notion = new Client({
  auth: process.env.VITE_NOTION_API_KEY,
})

const DATABASE_ID = process.env.VITE_NOTION_DATABASE_ID

// Converts Notion rich text to plain text
const richTextToPlainText = (richText) => {
  return richText ? richText.map(text => text.plain_text).join('') : ''
}

// Converts Notion page to Devotional format
const convertNotionPageToDevotional = async (page) => {
  const properties = page.properties
  
  // Extract title
  const title = richTextToPlainText(properties.Title?.title || properties.title?.title)
  
  // Extract date
  const date = properties.Date?.date?.start || properties.date?.date?.start || ''
  
  // Extract scripture
  const scripture = richTextToPlainText(properties.Scripture?.rich_text || properties.scripture?.rich_text)
  
  // Extract Spotify embed URI (URL type)
  const spotifyEmbedUri = properties['Spotify Embed URI']?.url || properties.spotifyEmbedUri?.url || ''
  
  // Fetch page content (blocks)
  const { results: blocks } = await notion.blocks.children.list({
    block_id: page.id,
  })
  
  return {
    id: page.id,
    title,
    date: date.split('T')[0], // Extract just the date part
    scripture,
    text: blocks,
    spotifyEmbedUri,
    createdAt: page.created_time,
    updatedAt: page.last_edited_time,
    url: page.url,
  }
}

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    const { date, action } = req.query

    // Get devotional by date
    if (action === 'getByDate' && date) {
      const response = await notion.databases.query({
        database_id: DATABASE_ID,
        filter: {
          property: 'Date',
          date: {
            equals: date,
          },
        },
      })

      if (response.results.length === 0) {
        res.status(404).json({ error: 'Devotional not found' })
        return
      }

      const devotional = await convertNotionPageToDevotional(response.results[0])
      res.status(200).json(devotional)
      return
    }

    // Get all devotionals
    if (action === 'getAll') {
      const limit = parseInt(req.query.limit || '100')
      
      const response = await notion.databases.query({
        database_id: DATABASE_ID,
        sorts: [
          {
            property: 'Date',
            direction: 'descending',
          },
        ],
        page_size: limit,
      })

      const devotionals = []
      for (const page of response.results) {
        const devotional = await convertNotionPageToDevotional(page)
        devotionals.push(devotional)
      }

      res.status(200).json(devotionals)
      return
    }

    // Get available dates
    if (action === 'getDates') {
      const response = await notion.databases.query({
        database_id: DATABASE_ID,
        sorts: [
          {
            property: 'Date',
            direction: 'descending',
          },
        ],
      })

      const dates = response.results
        .map(page => {
          const date = page.properties.Date?.date?.start || page.properties.date?.date?.start
          return date ? date.split('T')[0] : null
        })
        .filter(Boolean)

      res.status(200).json(dates)
      return
    }

    res.status(400).json({ error: 'Invalid action' })
  } catch (error) {
    console.error('Notion API error:', error)
    res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
