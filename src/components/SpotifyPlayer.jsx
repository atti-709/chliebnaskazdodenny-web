import { zonedTimeToUtc } from 'date-fns-tz'

/**
 * Creates a Date object for 4 AM Prague time on a given date
 * Automatically handles DST using date-fns-tz
 *
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Date} Date object set to 4 AM Prague time (in UTC)
 */
function createPragueTime4AM(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const naiveDate = new Date(year, month - 1, day, 4, 0, 0)
  return zonedTimeToUtc(naiveDate, 'Europe/Prague')
}

/**
 * PodcastPlayer component
 *
 * Generic podcast player that works with any embed URL:
 * - RSS.com embed URLs (with theme customization)
 * - Podbean embed URLs
 * - Spotify embed URLs
 * - Any other podcast platform with iframe embed support
 *
 * @param {string} embedUri - The embed URL for the player
 * @param {string} episodeDate - Episode date (YYYY-MM-DD) - player only shows if date is today or in the past
 */
function PodcastPlayer({ embedUri, episodeDate }) {
  if (!embedUri) return null

  // Only show player if episode is published (4 AM Prague time on episode date or later)
  if (episodeDate) {
    const now = new Date()

    // Create publish time: 4 AM Prague time (DST-aware)
    const publishTime = createPragueTime4AM(episodeDate)

    // If current time is before the publish time, don't show player
    if (now < publishTime) {
      return null
    }
  }

  // Check if it's an RSS.com player URL and customize it
  let finalEmbedUri = embedUri
  let playerHeight = '152' // Default height for Spotify/Podbean

  if (embedUri.includes('player.rss.com')) {
    // RSS.com player - add theme and UI customization parameters if not present
    const url = new URL(embedUri)
    if (!url.searchParams.has('theme')) {
      url.searchParams.set('theme', 'light')
    }
    if (!url.searchParams.has('v')) {
      url.searchParams.set('v', '2')
    }
    if (!url.searchParams.has('share')) {
      url.searchParams.set('share', 'false')
    }
    if (!url.searchParams.has('about')) {
      url.searchParams.set('about', 'false')
    }
    if (!url.searchParams.has('hl')) {
      url.searchParams.set('hl', 'aGlkZV9sb2dv') // Hide RSS.com logo
    }
    finalEmbedUri = url.toString()
    playerHeight = '202' // RSS.com player height
  }

  return (
    <div className="my-8 w-full max-w-2xl mx-auto bg-white p-4 rounded-3xl shadow-sm">
      <iframe
        style={{ borderRadius: '12px' }}
        src={finalEmbedUri}
        width="100%"
        height={playerHeight}
        frameBorder="0"
        allowFullScreen=""
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"
        loading="lazy"
        scrolling="no"
        className="w-full"
        title="Podcast Episode Player"
      ></iframe>
    </div>
  )
}

// Keep backward compatibility
export default PodcastPlayer
export { PodcastPlayer as SpotifyPlayer }
