function SpotifyPlayer({ embedUri }) {
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
      ></iframe>
    </div>
  )
}

export default SpotifyPlayer
