// Serverless API Route for Notion Integration
// This handles Notion API calls server-side

import { Client } from '@notionhq/client'
import { convertNotionPageToDevotional } from '../src/utils/notion.js'

const notion = new Client({
  auth: process.env.VITE_NOTION_API_KEY,
})

const DATABASE_ID = process.env.VITE_NOTION_DATABASE_ID

// Fetches blocks for a page and converts to devotional format
const fetchAndConvertPage = async page => {
  const { results: blocks } = await notion.blocks.children.list({
    block_id: page.id,
  })

  return convertNotionPageToDevotional(page, blocks)
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  // Verify environment variables are set
  if (!process.env.VITE_NOTION_API_KEY || !process.env.VITE_NOTION_DATABASE_ID) {
    console.error('Missing required environment variables')
    res.status(500).json({ error: 'Server configuration error' })
    return
  }

  try {
    const { date, action } = req.query

    // Get devotional by date
    if (action === 'getByDate' && date) {
      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' })
        return
      }

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

      const devotional = await fetchAndConvertPage(response.results[0])
      
      // Cache for 1 hour (devotionals don't change frequently)
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
      res.status(200).json(devotional)
      return
    }

    // Get all devotionals
    if (action === 'getAll') {
      const limit = parseInt(req.query.limit || '100')

      // Validate limit
      if (isNaN(limit) || limit < 1 || limit > 100) {
        res.status(400).json({ error: 'Invalid limit. Must be between 1 and 100' })
        return
      }

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
        const devotional = await fetchAndConvertPage(page)
        devotionals.push(devotional)
      }

      // Cache for 30 minutes (list changes more frequently)
      res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate')
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

      // Cache for 1 hour (dates don't change frequently)
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
      res.status(200).json(dates)
      return
    }

    // Invalid action
    res.status(400).json({ 
      error: 'Invalid action. Valid actions are: getByDate, getAll, getDates' 
    })
  } catch (error) {
    console.error('Notion API error:', error)
    
    // Don't expose sensitive error details in production
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Internal server error'
    
    res.status(500).json({ error: errorMessage })
  }
}
