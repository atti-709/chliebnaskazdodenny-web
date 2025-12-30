#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Inspect RSS.com Episode Response
 * 
 * This script fetches a single episode from RSS.com and displays the full
 * API response to help debug and understand the available fields.
 * 
 * Usage:
 *   node scripts/inspect-rss-episode.mjs [episode-number]
 * 
 * Example:
 *   node scripts/inspect-rss-episode.mjs 1  # Inspect the most recent episode
 *   node scripts/inspect-rss-episode.mjs 5  # Inspect the 5th most recent episode
 * 
 * Environment Variables (add to .env.local):
 *   RSS_API_KEY             - RSS.com API key
 *   RSS_PODCAST_ID          - RSS.com podcast/channel ID
 */

import { validateAllConfig } from './lib/config.js'
import { getExistingEpisodes } from './lib/rss-api.js'

/**
 * Pretty prints an object
 */
function prettyPrint(obj, indent = 0) {
  const spaces = '  '.repeat(indent)
  
  if (obj === null || obj === undefined) {
    console.log(`${spaces}${obj}`)
    return
  }
  
  if (typeof obj !== 'object') {
    console.log(`${spaces}${obj}`)
    return
  }
  
  if (Array.isArray(obj)) {
    console.log(`${spaces}[`)
    obj.forEach((item, i) => {
      console.log(`${spaces}  [${i}]:`)
      prettyPrint(item, indent + 2)
    })
    console.log(`${spaces}]`)
    return
  }
  
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      console.log(`${spaces}${key}:`)
      prettyPrint(value, indent + 1)
    } else if (Array.isArray(value)) {
      console.log(`${spaces}${key}: [${value.length} items]`)
      if (value.length > 0 && value.length <= 3) {
        prettyPrint(value, indent + 1)
      }
    } else {
      const displayValue = typeof value === 'string' && value.length > 100
        ? value.substring(0, 100) + '...'
        : value
      console.log(`${spaces}${key}: ${displayValue}`)
    }
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🔍 RSS.com Episode Inspector\n')
    
    // Validate configuration
    validateAllConfig()
    console.log('')
    
    // Get episode number from args (default to 1 - most recent)
    const episodeNumber = parseInt(process.argv[2]) || 1
    
    console.log(`📥 Fetching ${episodeNumber === 1 ? 'most recent' : `${episodeNumber} most recent`} episode(s)...\n`)
    
    const episodes = await getExistingEpisodes(episodeNumber)
    
    if (episodes.length === 0) {
      console.log('❌ No episodes found')
      return
    }
    
    const episode = episodes[episodeNumber - 1]
    
    if (!episode) {
      console.log(`❌ Episode #${episodeNumber} not found (only ${episodes.length} episode(s) available)`)
      return
    }
    
    console.log('═'.repeat(60))
    console.log(`Episode #${episodeNumber}: ${episode.title || 'Untitled'}`)
    console.log('═'.repeat(60))
    console.log('')
    
    // Highlight important fields
    console.log('🔑 KEY FIELDS:')
    console.log('─'.repeat(60))
    console.log(`ID: ${episode.id || 'N/A'}`)
    console.log(`Title: ${episode.title || 'N/A'}`)
    console.log(`Published: ${episode.publishedAt || episode.published_at || episode.date || 'N/A'}`)
    console.log('')
    
    console.log('🔗 AVAILABLE URLS:')
    console.log('─'.repeat(60))
    console.log(`embed_url: ${episode.embed_url || 'Not available'}`)
    console.log(`embed_player_url: ${episode.embed_player_url || 'Not available'}`)
    console.log(`player_url: ${episode.player_url || 'Not available'}`)
    console.log(`permalink: ${episode.permalink || 'Not available'}`)
    console.log(`link: ${episode.link || 'Not available'}`)
    console.log(`url: ${episode.url || 'Not available'}`)
    console.log('')
    
    console.log('📋 FULL RESPONSE:')
    console.log('─'.repeat(60))
    prettyPrint(episode)
    console.log('')
    
    // Provide recommendations
    console.log('💡 RECOMMENDATIONS:')
    console.log('─'.repeat(60))
    
    const hasEmbedUrl = episode.embed_url || episode.embed_player_url
    const hasPlayerUrl = episode.player_url
    const hasPermalink = episode.permalink || episode.link || episode.url
    
    if (hasEmbedUrl) {
      console.log('✅ Episode has embed URL - perfect for embedding in Notion!')
      console.log(`   Use: ${episode.embed_url || episode.embed_player_url}`)
    } else if (hasPlayerUrl) {
      console.log('⚠️  Episode has player URL but no embed URL')
      console.log(`   Use: ${episode.player_url}`)
    } else if (hasPermalink) {
      console.log('⚠️  Episode only has permalink/link')
      console.log(`   Use: ${episode.permalink || episode.link || episode.url}`)
    } else if (episode.id) {
      console.log('⚠️  No URLs found, but episode ID is available')
      console.log(`   Can construct URL: https://rss.com/podcasts/[PODCAST_ID]/episodes/${episode.id}/`)
    } else {
      console.log('❌ No usable URLs or ID found')
    }
    
    console.log('')
    console.log('✨ Inspection complete!')
    
  } catch (error) {
    console.error('\n💥 Inspection failed:', error.message)
    process.exit(1)
  }
}

// Run the script
main().catch(error => {
  console.error('\n💥 Unexpected error:', error)
  process.exit(1)
})

