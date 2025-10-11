/**
 * Local Development Server for Notion API
 * This mimics the serverless function locally
 */

/* eslint-env node */

import { Client } from '@notionhq/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

let notion = null
let DATABASE_ID = null

// Initialize Notion client (lazy initialization)
function getNotionClient() {
  if (!notion) {
    const apiKey = process.env.VITE_NOTION_API_KEY
    if (!apiKey) {
      throw new Error('VITE_NOTION_API_KEY is not set')
    }
    notion = new Client({ auth: apiKey })
    DATABASE_ID = process.env.VITE_NOTION_DATABASE_ID
    if (!DATABASE_ID) {
      throw new Error('VITE_NOTION_DATABASE_ID is not set')
    }
  }
  return { notion, DATABASE_ID }
}

/**
 * Converts Notion rich text to plain text
 */
const richTextToPlainText = richText => {
  return richText ? richText.map(text => text.plain_text).join('') : ''
}

/**
 * Converts Notion page to Devotional format
 */
const convertNotionPageToDevotional = async page => {
  const { notion } = getNotionClient()
  const properties = page.properties

  // Extract title
  const title = richTextToPlainText(properties.Title?.title || properties.title?.title)

  // Extract date
  const date = properties.Date?.date?.start || properties.date?.date?.start || ''

  // Extract quote
  const quote = richTextToPlainText(properties.Quote?.rich_text || properties.quote?.rich_text)

  // Extract Spotify embed URI (URL type)
  const spotifyEmbedUri =
    properties['Spotify Embed URI']?.url || properties.spotifyEmbedUri?.url || ''

  // Extract new properties
  const questions = richTextToPlainText(
    properties.Questions?.rich_text || properties.questions?.rich_text
  )
  const verseDay = richTextToPlainText(
    properties.VerseDay?.rich_text || properties.verseDay?.rich_text
  )
  const prayer = richTextToPlainText(properties.Prayer?.rich_text || properties.prayer?.rich_text)
  const verseEvening = richTextToPlainText(
    properties.VerseEvening?.rich_text || properties.verseEvening?.rich_text
  )

  // Fetch page content (blocks)
  const { results: blocks } = await notion.blocks.children.list({
    block_id: page.id,
  })

  return {
    id: page.id,
    title,
    date: date.split('T')[0], // Extract just the date part
    quote,
    text: blocks,
    spotifyEmbedUri,
    questions,
    verseDay,
    prayer,
    verseEvening,
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
    name: 'notion-api',
    configureServer(server) {
      console.log('✅ Notion API plugin loaded')
      console.log('📡 Database ID:', process.env.VITE_NOTION_DATABASE_ID ? 'Set' : 'MISSING')
      console.log('🔑 API Key:', process.env.VITE_NOTION_API_KEY ? 'Set' : 'MISSING')

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
          const { notion, DATABASE_ID } = getNotionClient()

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

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(devotionals))
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
