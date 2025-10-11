import { NotionBlocksRenderer } from './NotionBlocksRenderer/index.tsx'
import SpotifyPlayer from './SpotifyPlayer'

function DevotionalContent({ devotional }) {
  return (
    <article className="fade-in space-y-8">
      {/* Title and Quote */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl font-serif font-light text-gray-800">
          {devotional.title}
        </h2>
        <p className="text-lg text-accent font-medium">{devotional.quote}</p>
      </div>

      {/* Bible References - Two Column Layout */}
      {(devotional.verseDay || devotional.verseEvening) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Day Verse - Morning Reading (source of the quote) - Warm color */}
          {devotional.verseDay && (
            <div className="bg-amber-50 rounded-lg p-6 border-l-4 border-amber-500">
              <p className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-2">
                Čítanie
              </p>
              <p className="text-lg text-gray-800 font-medium">{devotional.verseDay}</p>
            </div>
          )}

          {/* Evening Verse - Evening Reading - Gray color */}
          {devotional.verseEvening && (
            <div className="bg-gray-100 rounded-lg p-6 border-l-4 border-gray-500">
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Večerné čítanie
              </p>
              <p className="text-lg text-gray-800 font-medium">{devotional.verseEvening}</p>
            </div>
          )}
        </div>
      )}

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

      {/* Questions */}
      {devotional.questions && (
        <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">
            Otázky na zamyslenie
          </p>
          <p className="text-base text-gray-700 whitespace-pre-line">{devotional.questions}</p>
        </div>
      )}

      {/* Prayer */}
      {devotional.prayer && (
        <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-500">
          <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-3">
            Modlitba
          </p>
          <p className="text-base text-gray-700 italic whitespace-pre-line">{devotional.prayer}</p>
        </div>
      )}
    </article>
  )
}

export default DevotionalContent
