/**
 * Simple Notion API Plugin for Vite
 * Uses direct HTTP calls instead of the Notion SDK to avoid bundling issues
 */

/* eslint-env node */

import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const NOTION_API_KEY = process.env.VITE_NOTION_API_KEY
const DATABASE_ID = process.env.VITE_NOTION_DATABASE_ID

/**
 * Converts Notion rich text to plain text
 */
const richTextToPlainText = (richText) => {
  return richText ? richText.map(text => text.plain_text).join('') : ''
}

/**
 * Makes a request to Notion API
 */
async function notionRequest(endpoint, options = {}) {
  const response = await fetch(`https://api.notion.com/v1${endpoint}`, {
    method: options.method || 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
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
 * Converts Notion page to Devotional format
 */
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
  const blocksResponse = await notionRequest(`/blocks/${page.id}/children`, {
    method: 'GET',
  })
  
  return {
    id: page.id,
    title,
    date: date.split('T')[0],
    scripture,
    text: blocksResponse.results,
    spotifyEmbedUri,
    createdAt: page.created_time,
    updatedAt: page.last_edited_time,
    url: page.url,
  }
}

/**
 * Vite plugin to handle API requests during development
 */
export function notionApiPlugin() {
  return {
    name: 'notion-api-simple',
    configureServer(server) {
      console.log('✅ Notion API plugin loaded (Simple HTTP version)')
      console.log('📡 Database ID:', DATABASE_ID ? 'Set' : 'MISSING')
      console.log('🔑 API Key:', NOTION_API_KEY ? 'Set' : 'MISSING')
      
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/devotionals')) {
          return next()
        }
        
        console.log('🔍 API request:', req.url)

        // Parse query params
        const url = new URL(req.url, `http://${req.headers.host}`)
        const action = url.searchParams.get('action')
        const date = url.searchParams.get('date')
        const limit = parseInt(url.searchParams.get('limit') || '100')

        try {
          // Get devotional by date
          if (action === 'getByDate' && date) {
            const response = await notionRequest(`/databases/${DATABASE_ID}/query`, {
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
              res.statusCode = 404
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Devotional not found' }))
              return
            }

            const devotional = await convertNotionPageToDevotional(response.results[0])
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(devotional))
            return
          }

          // Get all devotionals
          if (action === 'getAll') {
            const response = await notionRequest(`/databases/${DATABASE_ID}/query`, {
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

            const devotionals = []
            for (const page of response.results) {
              const devotional = await convertNotionPageToDevotional(page)
              devotionals.push(devotional)
            }

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(devotionals))
            return
          }

          // Get available dates
          if (action === 'getDates') {
            const response = await notionRequest(`/databases/${DATABASE_ID}/query`, {
              body: {
                sorts: [
                  {
                    property: 'Date',
                    direction: 'descending',
                  },
                ],
              },
            })

            const dates = response.results
              .map(page => {
                const date = page.properties.Date?.date?.start || page.properties.date?.date?.start
                return date ? date.split('T')[0] : null
              })
              .filter(Boolean)

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(dates))
            return
          }

          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Invalid action' }))
        } catch (error) {
          console.error('Notion API error:', error)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: error.message || 'Internal server error' }))
        }
      })
    },
  }
}
