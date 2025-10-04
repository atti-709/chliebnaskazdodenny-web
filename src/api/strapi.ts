/**
 * Strapi API Client
 *
 * Auto-generated typed client from OpenAPI schema
 */

import createClient from 'openapi-fetch'
import type { paths } from './strapi-schema'

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

/**
 * Helper type for devotional data
 */
export interface DevotionalData {
  id: number
  date: string
  title: string
  scripture: string
  text: any[] // Rich text blocks
  spotifyEmbedUri: string
}

/**
 * Fetches a devotional by date from Strapi
 */
export const getDevotionalByDate = async (dateString: string): Promise<DevotionalData | null> => {
  try {
    const { data, error } = await api.GET('/devotionals', {
      params: {
        query: {
          'filters[date][$eq]': dateString,
        },
      },
    })

    if (error) {
      console.error('Strapi API error:', error)
      return null
    }

    if (data?.data && data.data.length > 0) {
      const devotional = data.data[0] as any
      return {
        id: devotional.id,
        date: devotional.date,
        title: devotional.title,
        scripture: devotional.scripture,
        text: devotional.text,
        spotifyEmbedUri: devotional.spotifyEmbedUri,
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching devotional from Strapi:', error)
    throw error
  }
}

/**
 * Fetches all devotionals from Strapi
 */
export const getAllDevotionals = async (limit = 100): Promise<DevotionalData[]> => {
  try {
    const { data, error } = await api.GET('/devotionals', {
      params: {
        query: {
          'pagination[limit]': limit,
          sort: 'date:desc',
        },
      },
    })

    if (error) {
      console.error('Strapi API error:', error)
      return []
    }

    if (data?.data) {
      return data.data.map((item: any) => ({
        id: item.id,
        date: item.date,
        title: item.title,
        scripture: item.scripture,
        text: item.text,
        spotifyEmbedUri: item.spotifyEmbedUri,
      }))
    }

    return []
  } catch (error) {
    console.error('Error fetching all devotionals from Strapi:', error)
    throw error
  }
}

/**
 * Gets available devotional dates from Strapi
 */
export const getAvailableDates = async (): Promise<string[]> => {
  try {
    const devotionals = await getAllDevotionals()
    return devotionals.map(d => d.date.split('T')[0])
  } catch (error) {
    console.error('Error fetching available dates from Strapi:', error)
    return []
  }
}
