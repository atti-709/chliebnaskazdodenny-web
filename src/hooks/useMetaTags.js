import { useEffect } from 'react'
import { format } from 'date-fns'
import { sk } from 'date-fns/locale'

const BASE_URL = 'https://chliebnaskazdodenny.sk'
const DEFAULT_TITLE = 'Chlieb náš každodenný - Denné duchovné zamyslenia'
const DEFAULT_DESCRIPTION =
  'Denné duchovné zamyslenia a modlitby pre váš každodenný duchovný rast. Počúvajte ako podcast alebo čítajte online.'

/**
 * Updates meta tags dynamically for better SEO and social sharing
 * @param {Object} options - Configuration options
 * @param {Date} options.currentDate - The current date being displayed
 * @param {Object} options.devotional - The devotional data (optional)
 */
export function useMetaTags({ currentDate, devotional }) {
  useEffect(() => {
    const dateStr = format(currentDate, 'd. MMMM yyyy', { locale: sk })
    const isoDate = format(currentDate, 'yyyy-MM-dd')

    // Build title and description based on devotional content
    let title = `${dateStr} - Chlieb náš každodenný`
    let description = DEFAULT_DESCRIPTION

    if (devotional) {
      title = `${devotional.title} - ${dateStr} | Chlieb náš každodenný`

      // Create description from devotional content
      if (devotional.quote) {
        description = `${devotional.quote} - Denné zamyslenie na ${dateStr}.`
      } else {
        description = `Duchovné zamyslenie na ${dateStr}. ${DEFAULT_DESCRIPTION}`
      }

      // Truncate description to ~155 characters for optimal SEO
      if (description.length > 160) {
        description = description.substring(0, 157) + '...'
      }
    }

    const url = `${BASE_URL}/?date=${isoDate}`

    // Update document title
    document.title = title

    // Update meta tags
    updateMetaTag('description', description)
    updateMetaTag('title', title)

    // Update Open Graph tags
    updateMetaTag('og:title', title, 'property')
    updateMetaTag('og:description', description, 'property')
    updateMetaTag('og:url', url, 'property')
    updateMetaTag('og:type', devotional ? 'article' : 'website', 'property')

    // Update Twitter tags
    updateMetaTag('twitter:title', title, 'property')
    updateMetaTag('twitter:description', description, 'property')
    updateMetaTag('twitter:url', url, 'property')

    // Update canonical URL
    updateLinkTag('canonical', url)

    // Add article-specific meta tags if we have a devotional
    if (devotional) {
      updateMetaTag('article:published_time', isoDate, 'property')
      updateMetaTag('article:section', 'Duchovné zamyslenia', 'property')
    }
  }, [currentDate, devotional])
}

/**
 * Updates or creates a meta tag
 * @param {string} name - The meta tag name or property
 * @param {string} content - The content value
 * @param {string} attribute - Either 'name' or 'property' (default: 'name')
 */
function updateMetaTag(name, content, attribute = 'name') {
  let element = document.querySelector(`meta[${attribute}="${name}"]`)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, name)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

/**
 * Updates or creates a link tag
 * @param {string} rel - The rel attribute value
 * @param {string} href - The href value
 */
function updateLinkTag(rel, href) {
  let element = document.querySelector(`link[rel="${rel}"]`)

  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }

  element.setAttribute('href', href)
}

export default useMetaTags
