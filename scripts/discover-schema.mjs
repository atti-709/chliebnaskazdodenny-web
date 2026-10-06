/**
 * Prints the schema (and one sample page) of the Notion devotional database(s).
 *
 * Usage:
 *   node scripts/discover-schema.mjs [--year YYYY]
 *
 * Without --year, every database from NOTION_DATABASE_IDS is printed, which is
 * handy for checking that a new year's database matches the previous one.
 */

import { notionConfig } from './lib/config.js' // also loads .env.local

const NOTION_API_KEY = notionConfig.apiKey

async function discoverSchema(databaseId) {
  try {
    // Get database schema
    const dbResponse = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
    })

    const database = await dbResponse.json()
    console.log('=== DATABASE PROPERTIES ===')
    console.log(JSON.stringify(database.properties, null, 2))

    // Get one page to see actual data
    const queryResponse = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page_size: 1,
      }),
    })

    const queryData = await queryResponse.json()

    if (queryData.results && queryData.results.length > 0) {
      console.log('\n=== SAMPLE PAGE PROPERTIES ===')
      console.log(JSON.stringify(queryData.results[0].properties, null, 2))
    }
  } catch (error) {
    console.error('Error:', error.message)
    console.error(error)
  }
}

async function main() {
  notionConfig.validate()

  const args = process.argv.slice(2)
  const year = args.includes('--year') ? args[args.indexOf('--year') + 1] : null

  const databases = year
    ? [{ year, id: notionConfig.requireDatabaseIdForYear(year) }]
    : notionConfig.databases

  for (const database of databases) {
    console.log(`\n##### ${database.year ?? 'All years'}: ${database.id} #####\n`)
    await discoverSchema(database.id)
  }
}

main().catch(error => {
  console.error('Error:', error.message)
  process.exit(1)
})
