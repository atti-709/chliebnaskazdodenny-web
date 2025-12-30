/**
 * Configuration Management
 * 
 * Centralizes environment variable loading and validation
 */

import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '..', '.env.local') })

/**
 * Validates that required environment variables are set
 * @param {string[]} requiredVars - Array of required variable names
 * @throws {Error} If any required variables are missing
 */
function validateEnvVars(requiredVars) {
  const missing = requiredVars.filter(varName => !process.env[varName])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

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
 */
export const notionConfig = {
  apiKey: process.env.NOTION_API_KEY,
  databaseId: process.env.NOTION_DATABASE_ID,
  version: '2022-06-28',
  
  validate() {
    if (!this.apiKey || !this.databaseId) {
      throw new Error('NOTION_API_KEY and NOTION_DATABASE_ID must be set in .env.local')
    }
  }
}

/**
 * Episodes directory configuration
 */
export const episodesConfig = {
  path: '/Users/atti/Library/CloudStorage/GoogleDrive-xzsiros@gmail.com/Shared drives/Chlieb náš každodenný/EPIZÓDY',
}

/**
 * Validates all configurations
 */
export function validateAllConfig() {
  rssConfig.validate()
  notionConfig.validate()
}

