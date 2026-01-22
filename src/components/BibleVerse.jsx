import { useState, useEffect } from 'react'

/**
 * Fetches verse text through our serverless function
 * The function fetches from bible4u.net API
 * @param {string} reference - Original verse reference string
 * @returns {Promise<{text: string|null, url: string|null}>} - The verse text and URL or null if failed
 */
async function fetchVerseText(reference) {
  try {
    const apiUrl = `/api/bible-verse?reference=${encodeURIComponent(reference)}`

    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch verse: ${response.status}`)
    }

    const data = await response.json()

    return {
      text: data.text || null,
      url: data.url || null,
    }
  } catch (error) {
    console.error('Error fetching verse:', error)
    return { text: null, url: null }
  }
}

/**
 * BibleVerse Component
 * Displays a Bible verse reference with optional expansion
 * Fetches verse content from bible4u.net API via serverless function
 *
 * @param {object} props
 * @param {string} props.reference - The verse reference (e.g., "Ján 3,16")
 * @param {boolean} props.expanded - Whether to fetch and display the verse text
 * @param {string} props.className - Additional CSS classes
 */
function BibleVerse({ reference, expanded = false, className = '' }) {
  const [verseText, setVerseText] = useState(null)
  const [verseUrl, setVerseUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!expanded || !reference) return

    setLoading(true)
    setError(null)

    fetchVerseText(reference)
      .then(({ text, url }) => {
        setVerseText(text)
        setVerseUrl(url)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [reference, expanded])

  return (
    <div className={className}>
      {/* Reference link */}
      {verseUrl ? (
        <a
          href={verseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-medium text-gray-800 hover:text-amber-700 transition-colors"
        >
          {reference}
        </a>
      ) : (
        <p className="text-lg font-medium text-gray-800">{reference}</p>
      )}

      {/* Expanded verse text */}
      {expanded && (
        <div className="mt-3">
          {loading && (
            <p className="text-sm text-gray-500 italic">Načítavam text verša...</p>
          )}
          {error && !verseText && (
            <p className="text-sm text-red-500">Nepodarilo sa načítať text verša.</p>
          )}
          {verseText && (
            <p className="text-base text-gray-700 italic leading-relaxed border-l-2 border-amber-300 pl-3">
              {verseText}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default BibleVerse
