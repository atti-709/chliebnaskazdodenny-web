/**
 * Notion API Client
 *
 * Handles fetching devotional content from Notion database via API endpoint
 */

import type { Devotional } from './notion.types'
import { API_ENDPOINT, DEFAULT_DEVOTIONALS_LIMIT } from '../utils/constants'

/**
 * Fetches a devotional by date from Notion
 */
export const getDevotionalByDate = async (dateString: string): Promise<Devotional | null> => {
  try {
    const response = await fetch(`${API_ENDPOINT}?action=getByDate&date=${dateString}`)

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`API error: ${response.statusText}`)
    }

    const devotional: Devotional = await response.json()
    return devotional
  } catch (error) {
    console.error('Notion API error:', error)
    return null
  }
}

/**
 * Fetches all devotionals from Notion
 */
export const getAllDevotionals = async (
  limit = DEFAULT_DEVOTIONALS_LIMIT
): Promise<Devotional[]> => {
  try {
    const response = await fetch(`${API_ENDPOINT}?action=getAll&limit=${limit}`)

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    const devotionals: Devotional[] = await response.json()
    return devotionals
  } catch (error) {
    console.error('Notion API error:', error)
    return []
  }
}

/**
 * Gets available devotional dates from Notion
 */
export const getAvailableDates = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_ENDPOINT}?action=getDates`)

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    const dates: string[] = await response.json()
    return dates
  } catch (error) {
    console.error('Notion API error:', error)
    return []
  }
}
