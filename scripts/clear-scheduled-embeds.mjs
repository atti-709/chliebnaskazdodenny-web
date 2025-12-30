#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Clear Scheduled Episode Embeds from Notion
 * 
 * This script clears the Spotify Embed URI field from Notion for episodes
 * that are scheduled but not yet published on RSS.com. This prevents the
 * "episode not available" error from showing in the player.
 * 
 * Usage:
 *   node scripts/clear-scheduled-embeds.mjs [options]
 * 
 * Options:
 *   --dry-run          Show what would be cleared without actually clearing
 * 
 * Environment Variables (add to .env.local):
 *   RSS_API_KEY             - RSS.com API key
 *   RSS_PODCAST_ID          - RSS.com podcast/channel ID
 *   NOTION_API_KEY          - Notion integration token
 *   NOTION_DATABASE_ID      - Notion database ID for episodes
 */

import { validateAllConfig } from './lib/config.js'
import { getExistingEpisodes } from './lib/rss-api.js'
import { getEpisodeFromNotionByTitle, updateNotionEmbedUri } from './lib/notion-api.js'

/**
 * Parses command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2)
  
  return {
    dryRun: args.includes('--dry-run'),
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🧹 Clear Scheduled Episode Embeds\n')
    
    // Validate configuration
    validateAllConfig()
    console.log('')
    
    // Parse command line arguments
    const options = parseArgs()
    
    if (options.dryRun) {
      console.log('🏃 DRY RUN MODE - No changes will be made\n')
    }
    
    console.log('📥 Fetching episodes from RSS.com...')
    const rssEpisodes = await getExistingEpisodes(100)
    console.log(`   Found ${rssEpisodes.length} episodes\n`)
    
    // Filter scheduled episodes
    const scheduledEpisodes = rssEpisodes.filter(ep => ep.status !== 'published')
    
    if (scheduledEpisodes.length === 0) {
      console.log('✅ No scheduled episodes found - nothing to clear')
      return
    }
    
    console.log(`⏰ Found ${scheduledEpisodes.length} scheduled/unpublished episodes:\n`)
    
    let clearedCount = 0
    let skippedCount = 0
    let errorCount = 0
    
    for (const episode of scheduledEpisodes) {
      try {
        const episodeTitle = episode.title
        const episodeStatus = episode.status
        
        console.log(`📝 Checking: "${episodeTitle}"`)
        console.log(`   Status: ${episodeStatus}`)
        
        // Find in Notion
        const notionEpisode = await getEpisodeFromNotionByTitle(episodeTitle)
        
        if (!notionEpisode) {
          console.log(`   ⚠️  Not found in Notion - skipping\n`)
          skippedCount++
          continue
        }
        
        // Check if it has a player URL (we need to check if it's an RSS.com URL)
        // Since we can't fetch the current URL easily, we'll just clear it
        
        if (options.dryRun) {
          console.log(`   🏃 DRY RUN - Would clear Spotify Embed URI\n`)
          clearedCount++
        } else {
          // Clear the embed URI by setting it to empty string
          const success = await updateNotionEmbedUri(notionEpisode.pageId, '')
          
          if (success) {
            console.log(`   ✅ Cleared Spotify Embed URI\n`)
            clearedCount++
          } else {
            console.log(`   ❌ Failed to clear\n`)
            errorCount++
          }
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
      } catch (error) {
        console.error(`❌ Error processing "${episode.title}":`, error.message)
        errorCount++
      }
    }
    
    // Summary
    console.log('═'.repeat(60))
    console.log('📊 Summary:')
    console.log(`✅ Cleared: ${clearedCount}`)
    console.log(`⏭️  Skipped: ${skippedCount}`)
    console.log(`❌ Errors: ${errorCount}`)
    console.log(`📝 Total Scheduled: ${scheduledEpisodes.length}`)
    
    if (clearedCount > 0 && !options.dryRun) {
      console.log('\n💡 Note: These episodes will be synced automatically once they are published')
    }
    
    console.log('\n✨ Complete!')
    
  } catch (error) {
    console.error('\n💥 Failed:', error.message)
    process.exit(1)
  }
}

// Run the script
main().catch(error => {
  console.error('\n💥 Unexpected error:', error)
  process.exit(1)
})

