import { NotionBlocksRenderer } from './NotionBlocksRenderer/index.tsx'
import PodcastPlayer from './SpotifyPlayer'
import BibleVerse from './BibleVerse'

// Strip Markdown formatting (asterisks) from text
function stripMarkdown(text) {
  if (!text) return ''
  // Remove bold (**text**)
  let result = text.replace(/\*\*(.+?)\*\*/g, '$1')
  // Remove italic (*text*)
  result = result.replace(/\*(.+?)\*/g, '$1')
  return result
}

// Format quote: remove trailing period, split quote and reference
function formatQuote(quote) {
  if (!quote) return { text: '', reference: '' }

  const cleaned = stripMarkdown(quote)

  // Match text and reference in parentheses
  // Pattern: "quote text" (Reference)
  const match = cleaned.match(/^(.+?)\s*\(([^)]+)\)\.?$/)

  if (match) {
    let text = match[1].trim()
    const reference = match[2].trim()

    // Remove trailing period from text
    text = text.replace(/\.$/, '')

    return { text, reference }
  }

  // If no match, return as-is but remove trailing period
  return { text: cleaned.replace(/\.$/, ''), reference: '' }
}

function DevotionalContent({ devotional }) {
  const { text: quoteText, reference: quoteReference } = formatQuote(devotional.quote)
  const prayerText = stripMarkdown(devotional.prayer)

  return (
    <article className="fade-in space-y-8">
      {/* Title and Quote */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl font-serif font-light text-gray-800">
          {devotional.title}
        </h2>
        <div className="text-lg text-accent font-medium">
          <p className="italic">{quoteText}</p>
          {quoteReference && <p className="mt-1 italic">({quoteReference})</p>}
        </div>
      </div>

      {/* Bible References - Two Column Layout */}
      {(devotional.verseDay || devotional.verseEvening) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Day Verse - Morning Reading (source of the quote) - Warm color */}
          {/* Expanded to show full verse text from bible4u.net */}
          {devotional.verseDay && (
            <div className="bg-amber-50 rounded-lg p-6 border-l-4 border-amber-500">
              <p className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-2">
                Čítanie
              </p>
              <BibleVerse reference={devotional.verseDay} expanded={true} />
            </div>
          )}

          {/* Evening Verse - Evening Reading - Gray color */}
          {/* Only reference, not expanded */}
          {devotional.verseEvening && (
            <div className="bg-gray-100 rounded-lg p-6 border-l-4 border-gray-500">
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Večerné čítanie
              </p>
              <BibleVerse reference={devotional.verseEvening} expanded={false} />
            </div>
          )}
        </div>
      )}

      {/* Podcast Player (supports Podbean, Spotify, etc.) */}
      <PodcastPlayer embedUri={devotional.spotifyEmbedUri} episodeDate={devotional.date} />

      {/* Devotional Text */}
      <div
        className="prose prose-lg max-w-none font-serif text-gray-700 leading-relaxed"
        style={{
          lineHeight: '1.8',
        }}
      >
        <NotionBlocksRenderer content={devotional.text} />
      </div>

      {/* Prayer */}
      {prayerText && (
        <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-500">
          <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-3">
            Modlitba
          </p>
          <p className="text-base text-gray-700 italic whitespace-pre-line">{prayerText}</p>
        </div>
      )}

      {/* Questions */}
      {devotional.questions && (
        <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">
            Otázky na zamyslenie
          </p>
          <p className="text-base text-gray-700 whitespace-pre-line">{devotional.questions}</p>
        </div>
      )}
    </article>
  )
}

export default DevotionalContent
