/**
 * PodcastPlayer component
 *
 * Generic podcast player that works with any embed URL:
 * - Podbean embed URLs
 * - Spotify embed URLs
 * - Any other podcast platform with iframe embed support
 */
function PodcastPlayer({ embedUri }) {
  if (!embedUri) return null

  return (
    <div className="my-8">
      <iframe
        style={{ borderRadius: '12px' }}
        src={embedUri}
        width="100%"
        height="152"
        frameBorder="0"
        allowFullScreen=""
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="shadow-md"
        title="Podcast Episode Player"
      ></iframe>
    </div>
  )
}

// Keep backward compatibility
export default PodcastPlayer
export { PodcastPlayer as SpotifyPlayer }
