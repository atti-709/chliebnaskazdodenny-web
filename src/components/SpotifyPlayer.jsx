/**
 * PodcastPlayer component
 *
 * Generic podcast player that works with any embed URL:
 * - RSS.com embed URLs (with theme customization)
 * - Podbean embed URLs
 * - Spotify embed URLs
 * - Any other podcast platform with iframe embed support
 */
function PodcastPlayer({ embedUri }) {
  if (!embedUri) return null

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
    <div className="my-8">
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
        className="shadow-md"
        title="Podcast Episode Player"
      ></iframe>
    </div>
  )
}

// Keep backward compatibility
export default PodcastPlayer
export { PodcastPlayer as SpotifyPlayer }
