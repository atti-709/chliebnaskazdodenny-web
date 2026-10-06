// Serverless API Route for Notion Integration
// This handles Notion API calls server-side using direct HTTP requests
// Using ES module format
//
// Devotionals live in one Notion database per year (see NOTION_DATABASE_IDS in
// NOTION_SETUP.md). Single-date lookups go to that year's database; list
// endpoints aggregate across all configured databases.

import {
  convertNotionPageToDevotional,
  fetchAllDates,
  fetchLatestPages,
  fetchPageBlocks,
  findPageByDate,
  getNotionDatabases,
} from './_utils.js'

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
  const NOTION_API_KEY = process.env.NOTION_API_KEY
  let databases

  try {
    databases = getNotionDatabases()
  } catch (error) {
    console.error('Invalid Notion database configuration:', error.message)
    res.status(500).json({ error: 'Server configuration error' })
    return
  }

  if (!NOTION_API_KEY || databases.length === 0) {
    console.error('Missing required environment variables')
    res.status(500).json({ error: 'Server configuration error' })
    return
  }

  // Fetches blocks for a page and converts to devotional format
  const fetchAndConvertPage = async page => {
    const blocks = await fetchPageBlocks(page.id, NOTION_API_KEY)
    return convertNotionPageToDevotional(page, blocks)
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

      // Queries the database for the date's year (null if that year has no database)
      const page = await findPageByDate(databases, NOTION_API_KEY, date)

      if (!page) {
        res.status(404).json({ error: 'Devotional not found' })
        return
      }

      const devotional = await fetchAndConvertPage(page)

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

      const pages = await fetchLatestPages(databases, NOTION_API_KEY, limit)

      const devotionals = []
      for (const page of pages) {
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
      const dates = await fetchAllDates(databases, NOTION_API_KEY)

      // Cache for 1 hour (dates don't change frequently)
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
      res.status(200).json(dates)
      return
    }

    // Invalid action
    res.status(400).json({
      error: 'Invalid action. Valid actions are: getByDate, getAll, getDates',
    })
  } catch (error) {
    console.error('Notion API error:', error)

    // Don't expose sensitive error details in production
    const errorMessage =
      process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'

    res.status(500).json({ error: errorMessage })
  }
}
