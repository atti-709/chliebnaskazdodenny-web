// Serverless API Route for Notion Integration
// This handles Notion API calls server-side using direct HTTP requests
// Using CommonJS format for serverless function compatibility

const NOTION_VERSION = '2022-06-28'

// Notion utilities - CommonJS compatible
const richTextToPlainText = richText => {
  return richText ? richText.map(text => text.plain_text).join('') : ''
}

const extractDate = properties => {
  const dateProperty = properties.Date?.date?.start || properties.date?.date?.start
  return dateProperty ? dateProperty.split('T')[0] : ''
}

const extractTitle = properties => {
  return richTextToPlainText(properties.Title?.title || properties.title?.title)
}

const extractQuote = properties => {
  return richTextToPlainText(properties.Quote?.rich_text || properties.quote?.rich_text)
}

const extractSpotifyUri = properties => {
  return properties['Spotify Embed URI']?.url || properties.spotifyEmbedUri?.url || ''
}

const extractQuestions = properties => {
  return richTextToPlainText(properties.Questions?.rich_text || properties.questions?.rich_text)
}

const extractVerseDay = properties => {
  return richTextToPlainText(properties.VerseDay?.rich_text || properties.verseDay?.rich_text)
}

const extractPrayer = properties => {
  return richTextToPlainText(properties.Prayer?.rich_text || properties.prayer?.rich_text)
}

const extractVerseEvening = properties => {
  return richTextToPlainText(
    properties.VerseEvening?.rich_text || properties.verseEvening?.rich_text
  )
}

const convertNotionPageToDevotional = (page, blocks) => {
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

/**
 * Makes a request to Notion API using fetch
 */
async function notionRequest(endpoint, apiKey, options = {}) {
  const response = await fetch(`https://api.notion.com/v1${endpoint}`, {
    method: options.method || 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
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

module.exports = async function handler(req, res) {
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
  const NOTION_API_KEY = process.env.VITE_NOTION_API_KEY
  const DATABASE_ID = process.env.VITE_NOTION_DATABASE_ID

  if (!NOTION_API_KEY || !DATABASE_ID) {
    console.error('Missing required environment variables')
    res.status(500).json({ error: 'Server configuration error' })
    return
  }

  // Fetches blocks for a page and converts to devotional format
  const fetchAndConvertPage = async page => {
    const blocksResponse = await notionRequest(
      `/blocks/${page.id}/children`,
      NOTION_API_KEY,
      { method: 'GET' }
    )

    return convertNotionPageToDevotional(page, blocksResponse.results)
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

      const response = await notionRequest(
        `/databases/${DATABASE_ID}/query`,
        NOTION_API_KEY,
        {
          body: {
            filter: {
              property: 'Date',
              date: {
                equals: date,
              },
            },
          },
        }
      )

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

      const response = await notionRequest(
        `/databases/${DATABASE_ID}/query`,
        NOTION_API_KEY,
        {
          body: {
            sorts: [
              {
                property: 'Date',
                direction: 'descending',
              },
            ],
            page_size: limit,
          },
        }
      )

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
      const response = await notionRequest(
        `/databases/${DATABASE_ID}/query`,
        NOTION_API_KEY,
        {
          body: {
            sorts: [
              {
                property: 'Date',
                direction: 'descending',
              },
            ],
          },
        }
      )

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
