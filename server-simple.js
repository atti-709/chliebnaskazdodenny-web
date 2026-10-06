/**
 * Simple Notion API Plugin for Vite
 * Uses direct HTTP calls instead of the Notion SDK to avoid bundling issues
 */

/* eslint-env node */

import dotenv from 'dotenv'
import { convertNotionPageToDevotional } from './src/utils/notion.js'
import {
  fetchAllDates,
  fetchLatestPages,
  fetchPageBlocks,
  findPageByDate,
  getNotionDatabases,
} from './api/_utils.js'

// Load environment variables
dotenv.config({ path: '.env.local' })

const NOTION_API_KEY = process.env.NOTION_API_KEY

/**
 * Fetches blocks for a page and converts to devotional format
 */
const fetchAndConvertPage = async page => {
  // Fetch page content (blocks)
  const blocks = await fetchPageBlocks(page.id, NOTION_API_KEY)

  return convertNotionPageToDevotional(page, blocks)
}

/**
 * Vite plugin to handle API requests during development
 */
export function notionApiPlugin() {
  return {
    name: 'notion-api-simple',
    configureServer(server) {
      let databases = []
      try {
        databases = getNotionDatabases()
      } catch (error) {
        console.error('❌ Invalid Notion database configuration:', error.message)
      }

      console.log('✅ Notion API plugin loaded (Simple HTTP version)')
      console.log(
        '📡 Databases:',
        databases.length > 0
          ? databases.map(db => (db.year === null ? 'all years' : db.year)).join(', ')
          : 'MISSING'
      )
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
          // Get devotional by date (queries the database for the date's year)
          if (action === 'getByDate' && date) {
            const page = await findPageByDate(databases, NOTION_API_KEY, date)

            if (!page) {
              res.statusCode = 404
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Devotional not found' }))
              return
            }

            const devotional = await fetchAndConvertPage(page)
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(devotional))
            return
          }

          // Get all devotionals (across all yearly databases)
          if (action === 'getAll') {
            const pages = await fetchLatestPages(databases, NOTION_API_KEY, limit)

            const devotionals = []
            for (const page of pages) {
              const devotional = await fetchAndConvertPage(page)
              devotionals.push(devotional)
            }

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(devotionals))
            return
          }

          // Get available dates (across all yearly databases)
          if (action === 'getDates') {
            const dates = await fetchAllDates(databases, NOTION_API_KEY)

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
