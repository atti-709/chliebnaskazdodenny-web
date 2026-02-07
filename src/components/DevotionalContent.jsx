import { NotionBlocksRenderer } from './NotionBlocksRenderer/index.tsx'
import PodcastPlayer from './SpotifyPlayer'
import iconReading from '../assets/icon-reading.svg'
import iconReadingEvening from '../assets/icon-reading-evening.svg'

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
    <article className="fade-in flex flex-col gap-5 md:gap-8 items-center">
      {/* Title and Quote */}
      <div className="text-center flex flex-col gap-2 items-center">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-chnk-dark leading-tight">
          {devotional.title}
        </h2>
        <div className="font-display text-base md:text-lg text-chnk-dark leading-7">
          <p>{quoteText}</p>
          {quoteReference && <p>({quoteReference})</p>}
        </div>
      </div>

      {/* Bible References */}
      {(devotional.verseDay || devotional.verseEvening) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
          {/* Day Reading */}
          {devotional.verseDay && (
            <div className="flex items-center gap-4 md:gap-5 bg-chnk-primary-2/40 border border-chnk-primary rounded-2xl px-5 py-4 md:px-6 md:py-5 w-full">
              <img src={iconReading} alt="" className="h-[28px] md:h-[32px] w-auto shrink-0" aria-hidden="true" />
              <div className="flex flex-col gap-0.5 min-w-0">
                <p className="font-display font-bold text-base md:text-lg text-chnk-dark">
                  Čítanie
                </p>
                <p className="font-body text-base md:text-lg text-chnk-dark/70">
                  {devotional.verseDay}
                </p>
              </div>
            </div>
          )}

          {/* Evening Reading */}
          {devotional.verseEvening && (
            <div className="flex items-center gap-4 md:gap-5 bg-chnk-dark/[0.04] border border-chnk-dark/10 rounded-2xl px-5 py-4 md:px-6 md:py-5 w-full">
              <img src={iconReadingEvening} alt="" className="h-[28px] md:h-[32px] w-auto shrink-0" aria-hidden="true" />
              <div className="flex flex-col gap-0.5 min-w-0">
                <p className="font-display font-bold text-base md:text-lg text-chnk-dark">
                  Večerné čítanie
                </p>
                <p className="font-body text-base md:text-lg text-chnk-dark/70">
                  {devotional.verseEvening}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Podcast Player */}
      <div className="w-full">
        <PodcastPlayer embedUri={devotional.spotifyEmbedUri} episodeDate={devotional.date} />
      </div>

      {/* Devotional Text */}
      <div className="w-full">
        <div
          className="prose max-w-none font-display font-normal text-chnk-dark text-base md:text-lg leading-relaxed"
          style={{ lineHeight: '1.8' }}
        >
          <NotionBlocksRenderer content={devotional.text} />
        </div>
      </div>

      {/* Prayer */}
      {prayerText && (
        <div className="border-l-[4px] border-chnk-dark bg-chnk-primary-2/30 rounded-r-2xl md:rounded-r-3xl flex flex-col gap-3 p-5 md:p-8 w-full">
          <p className="font-display font-bold text-lg md:text-xl text-chnk-dark">
            Modlitba
          </p>
          <p className="font-display font-normal text-base md:text-lg text-chnk-dark leading-relaxed whitespace-pre-line">
            {prayerText}
          </p>
        </div>
      )}

      {/* Questions */}
      {devotional.questions && (
        <div className="border-l-[4px] border-chnk-dark bg-chnk-primary-2/30 rounded-r-2xl md:rounded-r-3xl flex flex-col gap-3 p-5 md:p-8 w-full">
          <p className="font-display font-bold text-lg md:text-xl text-chnk-dark">
            Otázky na zamyslenie
          </p>
          <p className="font-display font-normal text-base md:text-lg text-chnk-dark leading-relaxed whitespace-pre-line">
            {devotional.questions}
          </p>
        </div>
      )}
    </article>
  )
}

export default DevotionalContent
