import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const NOTION_API_KEY = process.env.NOTION_API_KEY
const DATABASE_ID = process.env.NOTION_DATABASE_ID

async function discoverSchema() {
  try {
    // Get database schema
    const dbResponse = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}`, {
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
    const queryResponse = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
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

discoverSchema()

