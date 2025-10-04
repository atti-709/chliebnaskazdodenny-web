/**
 * Strapi API Client
 *
 * Auto-generated typed client from OpenAPI schema
 */

import createClient from 'openapi-fetch'
import type { paths, components } from './strapi-schema'

const STRAPI_API_URL = import.meta.env.VITE_STRAPI_API_URL || 'http://localhost:1337/api'
const STRAPI_API_TOKEN = import.meta.env.VITE_STRAPI_API_TOKEN

// Create typed API client
export const api = createClient<paths>({
  baseUrl: STRAPI_API_URL,
  headers: STRAPI_API_TOKEN
    ? {
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      }
    : {},
})

// Export generated types
export type Devotional = components['schemas']['DevotionalResponse']
export type DevotionalListResponse = components['schemas']['DevotionalListResponse']

/**
 * Fetches a devotional by date from Strapi
 */
export const getDevotionalByDate = async (dateString: string) => {
  const { data, error } = await api.GET('/devotionals', {
    params: {
      query: {
        'filters[date][$eq]': dateString,
      } as any,
    },
  })

  if (error) {
    console.error('Strapi API error:', error)
    return null
  }

  return data?.data && data.data.length > 0 ? data.data[0] : null
}

/**
 * Fetches all devotionals from Strapi
 */
export const getAllDevotionals = async (limit = 100) => {
  const { data, error } = await api.GET('/devotionals', {
    params: {
      query: {
        'pagination[limit]': limit,
        sort: 'date:desc',
      } as any,
    },
  })

  if (error) {
    console.error('Strapi API error:', error)
    return []
  }

  return data?.data ?? []
}

/**
 * Gets available devotional dates from Strapi
 */
export const getAvailableDates = async (): Promise<string[]> => {
  const devotionals = await getAllDevotionals()
  return devotionals.map(d => (d as any).date?.split('T')[0]).filter(Boolean)
}
