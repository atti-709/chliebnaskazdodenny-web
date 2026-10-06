/* eslint-disable no-console */
/**
 * Configuration Management
 * 
 * Centralizes environment variable loading and validation
 */

import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import {
  getDatabaseIdForDate,
  getDatabaseIdForYear,
  getNotionDatabases,
  NOTION_VERSION,
} from '../../api/_utils.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '..', '.env.local') })

/**
 * RSS.com API configuration
 */
export const rssConfig = {
  apiKey: process.env.RSS_API_KEY,
  podcastId: process.env.RSS_PODCAST_ID,
  apiBase: 'https://api.rss.com/v4',
  
  validate() {
    if (!this.apiKey || !this.podcastId) {
      console.error('❌ Error: RSS_API_KEY and RSS_PODCAST_ID must be set in .env.local')
      console.error('\nTo get these credentials:')
      console.error('1. Log in to your RSS.com account')
      console.error('2. Go to Settings → API Access')
      console.error('3. Generate an API key')
      console.error('4. Find your Podcast ID in your podcast settings')
      throw new Error('RSS.com credentials not configured')
    }
    
    console.log('🔐 RSS.com credentials loaded:')
    console.log(`   API Key: ${this.apiKey.substring(0, 8)}...${this.apiKey.substring(this.apiKey.length - 4)}`)
    console.log(`   Podcast ID: ${this.podcastId}`)
  }
}

/**
 * Notion API configuration
 *
 * Devotionals live in one Notion database per year, configured as
 * NOTION_DATABASE_IDS="2026:<id>,2027:<id>". A legacy single
 * NOTION_DATABASE_ID is still accepted and used for every year.
 * Parsing is shared with the serverless functions (api/_utils.js).
 */
export const notionConfig = {
  apiKey: process.env.NOTION_API_KEY,
  version: NOTION_VERSION,

  /**
   * Configured databases sorted by year; `year: null` is the legacy all-years database
   * @returns {Array<{year: number|null, id: string}>}
   */
  get databases() {
    return getNotionDatabases(process.env)
  },

  /**
   * @param {number|string} year - Four-digit year
   * @returns {string|null} Database ID for that year, or null if none is configured
   */
  getDatabaseIdForYear(year) {
    return getDatabaseIdForYear(this.databases, year)
  },

  /**
   * @param {string} date - Date (YYYY-MM-DD)
   * @returns {string|null} Database ID for the date's year, or null if none is configured
   */
  getDatabaseIdForDate(date) {
    return getDatabaseIdForDate(this.databases, date)
  },

  /**
   * Like getDatabaseIdForYear, but throws a helpful error when the year is missing
   * @param {number|string} year - Four-digit year
   * @returns {string} Database ID
   */
  requireDatabaseIdForYear(year) {
    const databaseId = this.getDatabaseIdForYear(year)
    if (!databaseId) {
      throw new Error(
        `No Notion database configured for year ${year}. ` +
          `Add "${year}:<database id>" to NOTION_DATABASE_IDS in .env.local`
      )
    }
    return databaseId
  },

  validate() {
    if (!this.apiKey || this.databases.length === 0) {
      throw new Error(
        'NOTION_API_KEY and NOTION_DATABASE_IDS (e.g. "2026:<id>,2027:<id>") must be set in .env.local'
      )
    }
  },
}

/**
 * Episodes directory configuration
 *
 * Episode folders are grouped by year:
 *   EPIZÓDY/<YYYY>/<YYYYMMDD_slug>/{SRC,FINAL}
 */
export const episodesConfig = {
  path: '/Users/atti/Library/CloudStorage/GoogleDrive-xzsiros@gmail.com/Shared drives/Chlieb náš každodenný/EPIZÓDY',

  /**
   * @param {number|string} year - Four-digit year
   * @returns {string} Folder containing that year's episode folders
   */
  yearPath(year) {
    return path.join(this.path, String(year))
  },
}

/**
 * Validates all configurations
 */
export function validateAllConfig() {
  rssConfig.validate()
  notionConfig.validate()
}

