/**
 * Simple Notion API Plugin for Vite
 * Uses direct HTTP calls instead of the Notion SDK to avoid bundling issues
 */

/* eslint-env node */

import dotenv from 'dotenv'
import { convertNotionPageToDevotional } from './src/utils/notion.js'

// Load environment variables
dotenv.config({ path: '.env.local' })

const NOTION_API_KEY = process.env.NOTION_API_KEY
const DATABASE_ID = process.env.NOTION_DATABASE_ID
const NOTION_VERSION = '2022-06-28'

/**
 * Makes a request to Notion API
 */
async function notionRequest(endpoint, options = {}) {
  const response = await fetch(`https://api.notion.com/v1${endpoint}`, {
    method: options.method || 'POST',
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
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
 * Fetches blocks for a page and converts to devotional format
 */
const fetchAndConvertPage = async page => {
  // Fetch page content (blocks)
  const blocksResponse = await notionRequest(`/blocks/${page.id}/children`, {
    method: 'GET',
  })

  return convertNotionPageToDevotional(page, blocksResponse.results)
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

            const devotional = await fetchAndConvertPage(response.results[0])
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
              const devotional = await fetchAndConvertPage(page)
              devotionals.push(devotional)
            }

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(devotionals))
            return
          }

          // Get available dates
          if (action === 'getDates') {
            let allResults = []
            let hasMore = true
            let startCursor = undefined

            // Fetch all pages with pagination
            while (hasMore) {
              const response = await notionRequest(`/databases/${DATABASE_ID}/query`, {
                body: {
                  sorts: [
                    {
                      property: 'Date',
                      direction: 'descending',
                    },
                  ],
                  start_cursor: startCursor,
                },
              })

              allResults = allResults.concat(response.results)
              hasMore = response.has_more
              startCursor = response.next_cursor
            }

            const dates = allResults
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
