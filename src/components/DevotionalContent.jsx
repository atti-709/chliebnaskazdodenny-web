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
      <div className="text-center flex flex-col gap-4 items-center mb-4">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-chnk-dark leading-tight">
          {devotional.title}
        </h2>
        <div className="font-display text-base md:text-lg text-chnk-dark/80 leading-7 max-w-2xl">
          <p className="italic">{quoteText}</p>
          {quoteReference && (
            <p className="not-italic mt-1 text-sm md:text-base font-bold text-chnk-dark/60">
              ({quoteReference})
            </p>
          )}
        </div>
      </div>

      {/* Bible References - Two Column Layout */}
      {(devotional.verseDay || devotional.verseEvening) && (
        <div className="bg-chnk-primary-2 flex flex-col md:flex-row gap-3 items-center justify-center p-3 rounded-3xl md:rounded-4xl w-full">
          {/* Day Reading */}
          {devotional.verseDay && (
            <div className="bg-chnk-primary flex-1 flex flex-col gap-2 items-start justify-center p-5 md:p-8 rounded-2xl md:rounded-4xl w-full min-w-0">
              <div className="flex gap-2 items-center">
                <img
                  src={iconReading}
                  alt=""
                  className="h-[20px] md:h-[24px] w-auto"
                  aria-hidden="true"
                />
                <p className="font-display font-bold text-lg md:text-xl text-chnk-dark">Čítanie</p>
              </div>
              <p className="font-body text-sm md:text-base text-chnk-dark">{devotional.verseDay}</p>
            </div>
          )}

          {/* Evening Reading */}
          {devotional.verseEvening && (
            <div className="bg-chnk-primary flex-1 flex flex-col gap-2 items-start justify-center p-5 md:p-8 rounded-2xl md:rounded-4xl w-full min-w-0">
              <div className="flex gap-2 items-center">
                <img
                  src={iconReadingEvening}
                  alt=""
                  className="h-[20px] md:h-[24px] w-auto"
                  aria-hidden="true"
                />
                <p className="font-display font-bold text-lg md:text-xl text-chnk-dark">
                  Večerné čítanie
                </p>
              </div>
              <p className="font-body text-sm md:text-base text-chnk-dark">
                {devotional.verseEvening}
              </p>
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
          className="prose max-w-none font-display font-normal text-chnk-dark text-sm md:text-base leading-relaxed"
          style={{ lineHeight: '1.8' }}
        >
          <NotionBlocksRenderer content={devotional.text} />
        </div>
      </div>

      {/* Prayer */}
      {prayerText && (
        <div className="border-[3px] md:border-[4px] border-chnk-dark rounded-2xl md:rounded-4xl flex flex-col gap-3 p-6 md:p-10 w-full bg-transparent shadow-none">
          <p className="font-display font-bold text-lg md:text-xl text-chnk-dark">Modlitba</p>
          <p className="font-display font-normal text-sm md:text-base text-chnk-dark leading-relaxed whitespace-pre-line text-opacity-90">
            {prayerText}
          </p>
        </div>
      )}

      {/* Questions */}
      {devotional.questions && (
        <div className="border-[3px] md:border-[4px] border-chnk-dark rounded-2xl md:rounded-4xl flex flex-col gap-3 p-6 md:p-10 w-full bg-transparent shadow-none">
          <p className="font-display font-bold text-lg md:text-xl text-chnk-dark">
            Otázky na zamyslenie
          </p>
          <p className="font-display font-normal text-sm md:text-base text-chnk-dark leading-relaxed whitespace-pre-line text-opacity-90">
            {devotional.questions}
          </p>
        </div>
      )}
    </article>
  )
}

export default DevotionalContent
