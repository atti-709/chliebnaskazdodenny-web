/**
 * Vercel Cron Job: Sync Spotify Episode Embeds
 * 
 * This serverless function runs daily (6 AM) to:
 * 1. Fetch recent episodes from Spotify
 * 2. Match them with Notion devotional pages
 * 3. Update Notion with Spotify embed URIs
 * 
 * This allows automatic migration from Podbean embeds to Spotify embeds
 * once episodes sync to Spotify (typically 24-48 hours after Podbean upload)
 * 
 * Environment Variables Required:
 * - SPOTIFY_CLIENT_ID: Spotify API client ID
 * - SPOTIFY_CLIENT_SECRET: Spotify API client secret
 * - SPOTIFY_SHOW_ID: Your podcast's Spotify show ID
 * - NOTION_API_KEY: Notion integration token
 * - NOTION_DATABASE_ID: Notion database ID
 * - VERCEL_CRON_SECRET: (Optional) Secret for securing cron endpoint
 */

const NOTION_VERSION = '2022-06-28'

/**
 * Gets Spotify API access token using Client Credentials flow
 */
async function getSpotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set')
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Spotify auth failed: ${error}`)
  }

  const data = await response.json()
  return data.access_token
}

/**
 * Fetches recent episodes from Spotify
 */
async function getSpotifyEpisodes(accessToken, limit = 50) {
  const showId = process.env.SPOTIFY_SHOW_ID

  if (!showId) {
    throw new Error('SPOTIFY_SHOW_ID must be set')
  }

  const response = await fetch(
    `https://api.spotify.com/v1/shows/${showId}/episodes?limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Spotify API error: ${error}`)
  }

  const data = await response.json()
  return data.items
}

/**
 * Fetches all devotional pages from Notion
 */
async function getNotionPages() {
  const apiKey = process.env.NOTION_API_KEY
  const databaseId = process.env.NOTION_DATABASE_ID

  if (!apiKey || !databaseId) {
    throw new Error('NOTION_API_KEY and NOTION_DATABASE_ID must be set')
  }

  let allPages = []
  let hasMore = true
  let startCursor = undefined

  while (hasMore) {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sorts: [
          {
            property: 'Date',
            direction: 'descending',
          },
        ],
        start_cursor: startCursor,
        page_size: 100,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Notion API error: ${error}`)
    }

    const data = await response.json()
    allPages = allPages.concat(data.results)
    hasMore = data.has_more
    startCursor = data.next_cursor
  }

  return allPages
}

/**
 * Updates Notion page with Spotify embed URI
 */
async function updateNotionPage(pageId, spotifyEmbedUri) {
  const apiKey = process.env.NOTION_API_KEY

  const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        'Spotify Embed URI': {
          url: spotifyEmbedUri,
        },
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to update Notion page: ${error}`)
  }

  return await response.json()
}

/**
 * Extracts date from Notion page
 */
function getNotionPageDate(page) {
  const dateProperty = page.properties.Date?.date?.start || page.properties.date?.date?.start
  return dateProperty ? dateProperty.split('T')[0] : null
}

/**
 * Extracts title from Notion page
 */
function getNotionPageTitle(page) {
  const titleProperty = page.properties.Title?.title || page.properties.title?.title
  return titleProperty ? titleProperty.map(text => text.plain_text).join('') : ''
}

/**
 * Gets current Spotify Embed URI from Notion page
 */
function getNotionSpotifyUri(page) {
  return page.properties['Spotify Embed URI']?.url || ''
}

/**
 * Checks if a URI is a Spotify embed URI
 */
function isSpotifyUri(uri) {
  return uri && uri.includes('spotify.com')
}

/**
 * Creates Spotify embed URI from episode URI
 */
function createSpotifyEmbedUri(episodeUri) {
  // Convert spotify:episode:ID to https://open.spotify.com/embed/episode/ID
  if (episodeUri.startsWith('spotify:episode:')) {
    const episodeId = episodeUri.replace('spotify:episode:', '')
    return `https://open.spotify.com/embed/episode/${episodeId}`
  }
  return episodeUri
}

/**
 * Normalizes title for comparison (removes special characters, converts to lowercase)
 */
function normalizeTitle(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .trim()
}

/**
 * Matches Spotify episode with Notion page
 */
function matchEpisodeWithPage(episode, pages) {
  const episodeDate = episode.release_date // Format: YYYY-MM-DD
  const episodeTitle = normalizeTitle(episode.name)

  // Try to find by date first
  const pagesByDate = pages.filter(page => getNotionPageDate(page) === episodeDate)

  if (pagesByDate.length === 0) {
    return null
  }

  if (pagesByDate.length === 1) {
    return pagesByDate[0]
  }

  // If multiple pages on same date, try to match by title
  const matchedPage = pagesByDate.find(page => {
    const pageTitle = normalizeTitle(getNotionPageTitle(page))
    return pageTitle === episodeTitle || pageTitle.includes(episodeTitle) || episodeTitle.includes(pageTitle)
  })

  return matchedPage || pagesByDate[0] // Return first match as fallback
}

/**
 * Main handler function
 */
export default async function handler(req, res) {
  // Security: Verify cron secret if set
  const cronSecret = process.env.VERCEL_CRON_SECRET
  if (cronSecret && req.headers['x-vercel-cron-secret'] !== cronSecret) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    console.log('🎵 Starting Spotify embed sync...')

    // Get Spotify access token
    const spotifyToken = await getSpotifyAccessToken()
    console.log('✅ Authenticated with Spotify')

    // Fetch recent episodes from Spotify
    const spotifyEpisodes = await getSpotifyEpisodes(spotifyToken)
    console.log(`📻 Found ${spotifyEpisodes.length} episodes on Spotify`)

    // Fetch all pages from Notion
    const notionPages = await getNotionPages()
    console.log(`📚 Found ${notionPages.length} pages in Notion`)

    // Match and update
    let updatedCount = 0
    let skippedCount = 0
    let errorCount = 0
    const updates = []

    for (const episode of spotifyEpisodes) {
      try {
        // Find matching Notion page
        const matchedPage = matchEpisodeWithPage(episode, notionPages)

        if (!matchedPage) {
          console.log(`⚠️  No Notion page found for episode: ${episode.name} (${episode.release_date})`)
          skippedCount++
          continue
        }

        const pageId = matchedPage.id
        const currentUri = getNotionSpotifyUri(matchedPage)
        const newUri = createSpotifyEmbedUri(episode.uri)

        // Skip if already has Spotify URI
        if (isSpotifyUri(currentUri)) {
          console.log(`⏭️  Skipping ${episode.name} - already has Spotify URI`)
          skippedCount++
          continue
        }

        // Update Notion page
        await updateNotionPage(pageId, newUri)
        updatedCount++

        updates.push({
          date: episode.release_date,
          title: episode.name,
          spotifyUri: newUri,
          notionPageId: pageId,
        })

        console.log(`✅ Updated: ${episode.name} (${episode.release_date})`)

        // Rate limiting: wait 350ms between Notion updates
        await new Promise(resolve => setTimeout(resolve, 350))
      } catch (error) {
        console.error(`❌ Error processing episode ${episode.name}:`, error.message)
        errorCount++
      }
    }

    // Summary
    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      spotify_episodes: spotifyEpisodes.length,
      notion_pages: notionPages.length,
      updated: updatedCount,
      skipped: skippedCount,
      errors: errorCount,
      updates: updates,
    }

    console.log('📊 Sync Summary:', summary)

    res.status(200).json(summary)
  } catch (error) {
    console.error('💥 Sync failed:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
}

