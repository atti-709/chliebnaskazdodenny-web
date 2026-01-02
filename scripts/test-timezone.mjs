#!/usr/bin/env node
/**
 * Test script for Prague timezone DST calculations
 * 
 * This script tests that episodes scheduled in winter get UTC+1
 * and episodes scheduled in summer get UTC+2
 */

import { getPragueTimezoneOffset, createPragueTime4AM, createPragueTime4AMISO } from './lib/timezone-utils.js'

console.log('🧪 Testing Prague Timezone DST Calculations\n')

// Test dates
const testDates = [
  { date: '2026-01-15', expected: '+01:00', season: 'Winter' },
  { date: '2026-02-10', expected: '+01:00', season: 'Winter' },
  { date: '2026-03-15', expected: '+01:00', season: 'Winter (before DST)' },
  { date: '2026-03-29', expected: '+02:00', season: 'Spring (DST starts last Sunday)' },
  { date: '2026-04-01', expected: '+02:00', season: 'Spring (DST)' },
  { date: '2026-06-15', expected: '+02:00', season: 'Summer (DST)' },
  { date: '2026-08-15', expected: '+02:00', season: 'Summer (DST)' },
  { date: '2026-10-15', expected: '+02:00', season: 'Fall (DST)' },
  { date: '2026-10-25', expected: '+01:00', season: 'Fall (DST ends last Sunday)' },
  { date: '2026-11-01', expected: '+01:00', season: 'Fall (after DST)' },
  { date: '2026-12-25', expected: '+01:00', season: 'Winter' },
]

let passed = 0
let failed = 0

for (const test of testDates) {
  const offset = getPragueTimezoneOffset(test.date)
  const date4am = createPragueTime4AM(test.date)
  const iso = createPragueTime4AMISO(test.date)
  
  const success = offset === test.expected
  const icon = success ? '✅' : '❌'
  
  console.log(`${icon} ${test.date} (${test.season})`)
  console.log(`   Expected: ${test.expected}, Got: ${offset}`)
  console.log(`   4 AM Prague: ${date4am.toISOString()}`)
  console.log(`   Readable: ${date4am.toLocaleString('en-US', { timeZone: 'Europe/Prague' })}`)
  console.log('')
  
  if (success) {
    passed++
  } else {
    failed++
  }
}

console.log('=' .repeat(60))
console.log(`📊 Results: ${passed} passed, ${failed} failed`)

if (failed === 0) {
  console.log('✨ All tests passed!')
  process.exit(0)
} else {
  console.log('❌ Some tests failed')
  process.exit(1)
}

