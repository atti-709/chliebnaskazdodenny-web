#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Debug RSS.com API
 * 
 * This script makes a raw API call to RSS.com to see the exact response
 */

import { validateAllConfig, rssConfig } from './lib/config.js'

async function debugRssApi() {
  try {
    console.log('🔍 Debug RSS.com API\n')
    
    validateAllConfig()
    console.log('')
    
    console.log('📡 Making API request to RSS.com...')
    console.log(`   Endpoint: ${rssConfig.apiBase}/podcasts/${rssConfig.podcastId}/episodes?limit=10`)
    console.log('')
    
    const response = await fetch(`${rssConfig.apiBase}/podcasts/${rssConfig.podcastId}/episodes?limit=10`, {
      method: 'GET',
      headers: {
        'X-Api-Key': rssConfig.apiKey,
        'Content-Type': 'application/json',
      }
    })
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`)
    console.log('')
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error Response:')
      console.error(errorText)
      return
    }
    
    const data = await response.json()
    
    console.log('✅ Response received successfully')
    console.log('')
    console.log('📦 Raw Response Structure:')
    console.log('─'.repeat(60))
    console.log(JSON.stringify(data, null, 2))
    console.log('')
    
    // Try to extract episodes from different possible structures
    console.log('🔎 Analyzing Response Structure:')
    console.log('─'.repeat(60))
    console.log(`Type: ${typeof data}`)
    console.log(`Is Array: ${Array.isArray(data)}`)
    console.log(`Keys: ${Object.keys(data).join(', ')}`)
    console.log('')
    
    // Check common response patterns
    const possibleEpisodeArrays = [
      { name: 'data', value: data.data },
      { name: 'items', value: data.items },
      { name: 'episodes', value: data.episodes },
      { name: 'results', value: data.results },
      { name: 'root array', value: Array.isArray(data) ? data : null }
    ]
    
    console.log('📋 Checking for episode arrays:')
    for (const { name, value } of possibleEpisodeArrays) {
      if (value && Array.isArray(value)) {
        console.log(`✓ Found episodes in: ${name} (${value.length} episodes)`)
      } else {
        console.log(`✗ No episodes in: ${name}`)
      }
    }
    console.log('')
    
    // Show pagination info if available
    if (data.pagination || data.meta || data.page) {
      console.log('📄 Pagination Info:')
      console.log(JSON.stringify(data.pagination || data.meta || data.page, null, 2))
      console.log('')
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message)
    console.error(error.stack)
  }
}

debugRssApi()

