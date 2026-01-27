import { useEffect } from 'react'
import { format } from 'date-fns'

const BASE_URL = 'https://chliebnaskazdodenny.sk'
const SITE_TITLE = 'Chlieb náš každodenný'

/**
 * Updates meta tags dynamically for better SEO and social sharing
 * Keeps title and description stable, only updates URL-related tags
 * @param {Object} options - Configuration options
 * @param {Date} options.currentDate - The current date being displayed
 * @param {Object} options.devotional - The devotional data (optional)
 */
export function useMetaTags({ currentDate, devotional }) {
  useEffect(() => {
    const isoDate = format(currentDate, 'yyyy-MM-dd')
    const url = `${BASE_URL}/?date=${isoDate}`

    // Keep title and description stable
    document.title = SITE_TITLE

    // Update URL-related meta tags only
    updateMetaTag('og:url', url, 'property')
    updateMetaTag('twitter:url', url, 'property')

    // Update canonical URL
    updateLinkTag('canonical', url)

    // Add article-specific meta tags if we have a devotional
    if (devotional) {
      updateMetaTag('og:type', 'article', 'property')
      updateMetaTag('article:published_time', isoDate, 'property')
      updateMetaTag('article:section', 'Duchovné zamyslenia', 'property')
    } else {
      updateMetaTag('og:type', 'website', 'property')
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
