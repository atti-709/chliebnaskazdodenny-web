#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Check Episode Number Contiguity
 *
 * Fetches all episodes from RSS.com and checks that itunes_episode numbers
 * are contiguous (no gaps or duplicates) within each season.
 *
 * Usage:
 *   node scripts/check-episode-numbers.mjs
 *
 * Environment Variables (add to .env.local):
 *   RSS_API_KEY             - RSS.com API key
 *   RSS_PODCAST_ID          - RSS.com podcast/channel ID
 */

import { validateAllConfig } from './lib/config.js'
import { getExistingEpisodes } from './lib/rss-api.js'

async function main() {
  console.log('🔍 Episode Number Contiguity Check\n')

  validateAllConfig()
  console.log('')

  console.log('📥 Fetching all episodes from RSS.com...')
  const episodes = await getExistingEpisodes()

  if (episodes.length === 0) {
    console.log('❌ No episodes found')
    return
  }

  console.log(`   Found ${episodes.length} episode(s)\n`)

  // Group by season
  const seasons = new Map()
  const noSeason = []
  const noEpisodeNum = []

  for (const ep of episodes) {
    const season = ep.itunes_season
    const epNum = ep.itunes_episode

    if (epNum == null) {
      noEpisodeNum.push(ep)
      continue
    }
    if (season == null) {
      noSeason.push(ep)
      continue
    }

    if (!seasons.has(season)) {
      seasons.set(season, [])
    }
    seasons.get(season).push({
      number: Number(epNum),
      title: ep.title,
      id: ep.id,
      status: ep.status,
      date: ep.publish_datetime || ep.schedule_datetime || ep.published_at || 'unknown',
    })
  }

  let hasIssues = false

  // Check each season
  const sortedSeasons = [...seasons.keys()].sort((a, b) => a - b)
  for (const season of sortedSeasons) {
    const eps = seasons.get(season)
    eps.sort((a, b) => a.number - b.number)

    console.log('═'.repeat(60))
    console.log(`📺 Season ${season} — ${eps.length} episode(s)`)
    console.log('═'.repeat(60))

    // Check for duplicates
    const numCounts = new Map()
    for (const ep of eps) {
      if (!numCounts.has(ep.number)) {
        numCounts.set(ep.number, [])
      }
      numCounts.get(ep.number).push(ep)
    }

    const duplicates = [...numCounts.entries()].filter(([, list]) => list.length > 1)
    if (duplicates.length > 0) {
      hasIssues = true
      console.log('\n⚠️  DUPLICATES:')
      for (const [num, list] of duplicates) {
        console.log(`   Episode #${num} appears ${list.length} times:`)
        for (const ep of list) {
          console.log(`     - "${ep.title}" (${ep.status}, ${ep.date})`)
        }
      }
    }

    // Check for gaps
    const uniqueNums = [...new Set(eps.map(e => e.number))].sort((a, b) => a - b)
    const min = uniqueNums[0]
    const max = uniqueNums[uniqueNums.length - 1]
    const expectedCount = max - min + 1
    const missing = []

    for (let i = min; i <= max; i++) {
      if (!uniqueNums.includes(i)) {
        missing.push(i)
      }
    }

    if (missing.length > 0) {
      hasIssues = true
      console.log('\n⚠️  GAPS — missing episode numbers:')
      console.log(`   ${missing.join(', ')}`)
    }

    // Check if starts at 1
    if (min !== 1) {
      hasIssues = true
      console.log(`\n⚠️  Season does not start at 1 (starts at ${min})`)
    }

    // Summary
    console.log(`\n   Range: #${min} — #${max}`)
    console.log(`   Unique numbers: ${uniqueNums.length}`)
    console.log(`   Expected: ${expectedCount}`)

    if (missing.length === 0 && duplicates.length === 0 && min === 1) {
      console.log('   ✅ Contiguous')
    }

    // List all episodes
    console.log('\n   Episodes:')
    for (const ep of eps) {
      const dup = numCounts.get(ep.number).length > 1 ? ' ⚠️ DUP' : ''
      console.log(`     #${String(ep.number).padStart(3)} — "${ep.title}" (${ep.status})${dup}`)
    }
    console.log('')
  }

  // Report episodes without numbers or season
  if (noEpisodeNum.length > 0) {
    hasIssues = true
    console.log('⚠️  Episodes WITHOUT episode number:')
    for (const ep of noEpisodeNum) {
      console.log(`   - "${ep.title}" (season: ${ep.itunes_season ?? 'none'}, status: ${ep.status})`)
    }
    console.log('')
  }

  if (noSeason.length > 0) {
    hasIssues = true
    console.log('⚠️  Episodes WITHOUT season:')
    for (const ep of noSeason) {
      console.log(`   - "${ep.title}" (#${ep.itunes_episode}, status: ${ep.status})`)
    }
    console.log('')
  }

  // Final verdict
  console.log('═'.repeat(60))
  if (hasIssues) {
    console.log('❌ Issues found — see above for details')
    process.exit(1)
  } else {
    console.log('✅ All episode numbers are contiguous — no gaps or duplicates')
  }
}

main().catch(error => {
  console.error('\n💥 Unexpected error:', error)
  process.exit(1)
})
