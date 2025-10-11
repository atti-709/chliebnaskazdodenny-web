import { NotionBlocksRenderer } from './NotionBlocksRenderer/index.tsx'
import SpotifyPlayer from './SpotifyPlayer'

function DevotionalContent({ devotional }) {
  return (
    <article className="fade-in space-y-8">
      {/* Title and Scripture */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl font-serif font-light text-gray-800">
          {devotional.title}
        </h2>
        <p className="text-lg text-accent font-medium">{devotional.scripture}</p>
      </div>

      {/* Spotify Player */}
      <SpotifyPlayer embedUri={devotional.spotifyEmbedUri} />

      {/* Devotional Text */}
      <div
        className="prose prose-lg max-w-none font-serif text-gray-700 leading-relaxed"
        style={{
          lineHeight: '1.8',
        }}
      >
        <NotionBlocksRenderer content={devotional.text} />
      </div>
    </article>
  )
}

export default DevotionalContent
