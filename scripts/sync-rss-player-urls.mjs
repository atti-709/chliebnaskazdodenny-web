#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Sync RSS.com Player URLs to Notion
 * 
 * This script fetches episodes from RSS.com and updates the Spotify Embed URI
 * field in Notion with the RSS.com player URL. Episodes are matched by title.
 * 
 * Usage:
 *   node scripts/sync-rss-player-urls.mjs [options]
 * 
 * Options:
 *   --dry-run          Show what would be updated without actually updating
 *   --start-date       Start date (YYYY-MM-DD) to filter episodes (optional)
 *   --end-date         End date (YYYY-MM-DD) to filter episodes (optional)
 *   --limit            Number of episodes to fetch from RSS.com (default: 100)
 * 
 * Matching Strategy:
 *   Episodes are matched by title between RSS.com and Notion.
 *   The episode title must match exactly for the sync to occur.
 * 
 * Environment Variables (add to .env.local):
 *   RSS_API_KEY             - RSS.com API key
 *   RSS_PODCAST_ID          - RSS.com podcast/channel ID
 *   NOTION_API_KEY          - Notion integration token
 *   NOTION_DATABASE_IDS     - Notion database per year, e.g. "2026:<id>,2027:<id>"
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
    startDate: args.includes('--start-date') ? args[args.indexOf('--start-date') + 1] : null,
    endDate: args.includes('--end-date') ? args[args.indexOf('--end-date') + 1] : null,
    limit: args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : 100,
  }
}

/**
 * Extracts date from RSS.com episode
 */
function getEpisodeDate(episode) {
  // RSS.com v4 API uses schedule_datetime for scheduled episodes
  // and publish_datetime for published episodes
  const dateStr = episode.publish_datetime || 
                 episode.schedule_datetime || 
                 episode.publishedAt || 
                 episode.published_at || 
                 episode.date
  if (!dateStr) return null
  
  try {
    return new Date(dateStr).toISOString().split('T')[0]
  } catch {
    return null
  }
}

/**
 * Gets the player/embed URL for an RSS.com episode
 */
function getPlayerUrl(episode) {
  // Extract podcast slug from website_url
  // Format: https://rss.com/podcasts/[slug]/[episode-id]
  let podcastSlug = null
  if (episode.website_url) {
    const match = episode.website_url.match(/rss\.com\/podcasts\/([^/]+)/)
    if (match) {
      podcastSlug = match[1]
    }
  }
  
  // Construct the RSS.com player embed URL
  // Format: https://player.rss.com/[podcast-slug]/[episode-id]
  if (episode.id && podcastSlug) {
    return `https://player.rss.com/${podcastSlug}/${episode.id}`
  }
  
  // Fallback to other URLs if player embed can't be constructed
  return episode.website_url ||
         episode.embed_url || 
         episode.player_url ||
         episode.permalink ||
         episode.link ||
         episode.url
}

/**
 * Syncs player URLs for episodes
 */
async function syncPlayerUrls(options) {
  console.log('📥 Fetching episodes from RSS.com...')
  const rssEpisodes = await getExistingEpisodes(options.limit)
  console.log(`   Found ${rssEpisodes.length} episodes\n`)
  
  let updatedCount = 0
  let skippedCount = 0
  let errorCount = 0
  
  for (const rssEpisode of rssEpisodes) {
    try {
      const date = getEpisodeDate(rssEpisode)
      const playerUrl = getPlayerUrl(rssEpisode)
      const episodeTitle = rssEpisode.title
      const episodeStatus = rssEpisode.status
      
      if (!episodeTitle) {
        console.log(`⚠️  Skipping episode (ID: ${rssEpisode.id}) - no title found`)
        skippedCount++
        continue
      }
      
      // Skip scheduled/unpublished episodes to avoid "episode not available" error
      if (episodeStatus !== 'published') {
        console.log(`⏰ Skipping "${episodeTitle}" - not published yet (status: ${episodeStatus})`)
        skippedCount++
        continue
      }
      
      if (!playerUrl) {
        console.log(`⚠️  Skipping episode "${episodeTitle}" - no player URL found`)
        skippedCount++
        continue
      }
      
      // Apply date filters if date is available
      if (date) {
        if (options.startDate && date < options.startDate) {
          continue
        }
        if (options.endDate && date > options.endDate) {
          continue
        }
      }
      
      console.log(`\n📝 Processing: "${episodeTitle}"`)
      if (date) {
        console.log(`   Date: ${date}`)
      }
      console.log(`   Player URL: ${playerUrl}`)
      
      // Fetch corresponding Notion episode by title (date picks the year's database first)
      const notionEpisode = await getEpisodeFromNotionByTitle(episodeTitle, date)
      
      if (!notionEpisode) {
        console.log(`   ⚠️  Not found in Notion (searching by title) - skipping`)
        skippedCount++
        continue
      }
      
      console.log(`   ✓ Found in Notion`)
      if (notionEpisode.date) {
        console.log(`   Notion date: ${notionEpisode.date}`)
      }
      
      if (options.dryRun) {
        console.log(`   🏃 DRY RUN - Would update Spotify Embed URI to: ${playerUrl}`)
        updatedCount++
      } else {
        const success = await updateNotionEmbedUri(notionEpisode.pageId, playerUrl)
        if (success) {
          console.log(`   ✅ Updated Spotify Embed URI`)
          updatedCount++
        } else {
          console.log(`   ❌ Failed to update Notion`)
          errorCount++
        }
      }
      
      // Rate limiting: wait 1 second between updates
      if (!options.dryRun) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
    } catch (error) {
      console.error(`❌ Error processing episode "${rssEpisode.title}":`, error.message)
      errorCount++
    }
  }
  
  // Print summary
  console.log(`\n${'='.repeat(60)}`)
  console.log('📊 Sync Summary:')
  console.log(`✅ Updated: ${updatedCount}`)
  console.log(`⏭️  Skipped: ${skippedCount}`)
  console.log(`❌ Errors: ${errorCount}`)
  console.log(`📝 Total: ${rssEpisodes.length}`)
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🚀 RSS.com Player URL Sync\n')
    
    // Validate configuration
    validateAllConfig()
    console.log('')
    
    // Parse command line arguments
    const options = parseArgs()
    
    if (options.dryRun) {
      console.log('🏃 DRY RUN MODE - No updates will be made\n')
    }
    
    if (options.startDate) {
      console.log(`📅 Start date filter: ${options.startDate}`)
    }
    if (options.endDate) {
      console.log(`📅 End date filter: ${options.endDate}`)
    }
    if (options.startDate || options.endDate) {
      console.log('')
    }
    
    await syncPlayerUrls(options)
    
    console.log('\n✨ Sync complete!')
    
  } catch (error) {
    console.error('\n💥 Sync failed:', error.message)
    process.exit(1)
  }
}

// Run the script
main().catch(error => {
  console.error('\n💥 Unexpected error:', error)
  process.exit(1)
})

