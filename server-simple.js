/**
 * Simple Notion API Plugin for Vite
 * Uses direct HTTP calls instead of the Notion SDK to avoid bundling issues
 */

/* eslint-env node */

import dotenv from 'dotenv'
import { convertNotionPageToDevotional } from './src/utils/notion.js'

// Load environment variables
dotenv.config({ path: '.env.local' })

const NOTION_API_KEY = process.env.NOTION_API_KEY
const DATABASE_ID = process.env.NOTION_DATABASE_ID
const NOTION_VERSION = '2022-06-28'

/**
 * Makes a request to Notion API
 */
async function notionRequest(endpoint, options = {}) {
  const response = await fetch(`https://api.notion.com/v1${endpoint}`, {
    method: options.method || 'POST',
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    throw new Error(`Notion API error: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Fetches blocks for a page and converts to devotional format
 */
const fetchAndConvertPage = async page => {
  // Fetch page content (blocks)
  const blocksResponse = await notionRequest(`/blocks/${page.id}/children`, {
    method: 'GET',
  })

  return convertNotionPageToDevotional(page, blocksResponse.results)
}

/**
 * Maps Slovak book names to bible4u.net standard abbreviations
 * See: https://bible4u.net/sk/api
 */
const BOOK_ABBREVIATIONS = {
  // Starý zákon - full names
  genezis: 'Gen',
  exodus: 'Exod',
  levitikus: 'Lev',
  numeri: 'Num',
  deuteronómium: 'Deut',
  jozue: 'Josh',
  sudcov: 'Judg',
  rút: 'Ruth',
  '1. samuelova': '1Sam',
  '2. samuelova': '2Sam',
  '1. kráľov': '1Kgs',
  '2. kráľov': '2Kgs',
  '1. kroník': '1Chr',
  '2. kroník': '2Chr',
  ezdráš: 'Ezra',
  nehemiáš: 'Neh',
  ester: 'Esth',
  jób: 'Job',
  žalmy: 'Ps',
  žalm: 'Ps',
  príslovia: 'Prov',
  kazateľ: 'Eccl',
  'pieseň piesní': 'Song',
  izaiáš: 'Isa',
  jeremiáš: 'Jer',
  plač: 'Lam',
  ezechiel: 'Ezek',
  daniel: 'Dan',
  ozeáš: 'Hos',
  joel: 'Joel',
  ámos: 'Amos',
  abdiáš: 'Obad',
  jonáš: 'Jonah',
  micheáš: 'Mic',
  nahum: 'Nah',
  habakuk: 'Hab',
  sofoniáš: 'Zeph',
  aggeus: 'Hag',
  zachariáš: 'Zech',
  malachiáš: 'Mal',
  // Nový zákon - full names
  matúš: 'Matt',
  marek: 'Mark',
  lukáš: 'Luke',
  ján: 'John',
  skutky: 'Acts',
  rimanom: 'Rom',
  '1. korinťanom': '1Cor',
  '2. korinťanom': '2Cor',
  galatským: 'Gal',
  galačanom: 'Gal',
  efezanom: 'Eph',
  efezským: 'Eph',
  filipanom: 'Phil',
  filipským: 'Phil',
  kolosanom: 'Col',
  kolosenským: 'Col',
  '1. tesaloničanom': '1Thess',
  '2. tesaloničanom': '2Thess',
  '1. timotejovi': '1Tim',
  '2. timotejovi': '2Tim',
  títovi: 'Titus',
  títusovi: 'Titus',
  filemonovi: 'Phlm',
  hebrejom: 'Heb',
  jakub: 'Jas',
  jakubov: 'Jas',
  '1. petrov': '1Pet',
  '2. petrov': '2Pet',
  '1. jánov': '1John',
  '2. jánov': '2John',
  '3. jánov': '3John',
  júdov: 'Jude',
  zjavenie: 'Rev',
  // Common abbreviations
  gen: 'Gen',
  ex: 'Exod',
  lev: 'Lev',
  num: 'Num',
  dt: 'Deut',
  deut: 'Deut',
  joz: 'Josh',
  josh: 'Josh',
  judg: 'Judg',
  ruth: 'Ruth',
  '1sam': '1Sam',
  '2sam': '2Sam',
  '1kgs': '1Kgs',
  '2kgs': '2Kgs',
  '1chr': '1Chr',
  '2chr': '2Chr',
  ezra: 'Ezra',
  neh: 'Neh',
  esth: 'Esth',
  job: 'Job',
  ps: 'Ps',
  ž: 'Ps',
  z: 'Ps',
  prov: 'Prov',
  eccl: 'Eccl',
  song: 'Song',
  isa: 'Isa',
  iz: 'Isa',
  jer: 'Jer',
  lam: 'Lam',
  ezek: 'Ezek',
  dan: 'Dan',
  hos: 'Hos',
  amos: 'Amos',
  obad: 'Obad',
  jonah: 'Jonah',
  mic: 'Mic',
  nah: 'Nah',
  hab: 'Hab',
  zeph: 'Zeph',
  hag: 'Hag',
  zech: 'Zech',
  mal: 'Mal',
  matt: 'Matt',
  mt: 'Matt',
  mark: 'Mark',
  mk: 'Mark',
  luke: 'Luke',
  lk: 'Luke',
  john: 'John',
  jn: 'John',
  acts: 'Acts',
  sk: 'Acts',
  rom: 'Rom',
  rim: 'Rom',
  '1cor': '1Cor',
  '1kor': '1Cor',
  '2cor': '2Cor',
  '2kor': '2Cor',
  gal: 'Gal',
  eph: 'Eph',
  ef: 'Eph',
  phil: 'Phil',
  flp: 'Phil',
  col: 'Col',
  kol: 'Col',
  '1thess': '1Thess',
  '1tes': '1Thess',
  '2thess': '2Thess',
  '2tes': '2Thess',
  '1tim': '1Tim',
  '2tim': '2Tim',
  titus: 'Titus',
  tit: 'Titus',
  phlm: 'Phlm',
  flm: 'Phlm',
  heb: 'Heb',
  žid: 'Heb',
  jas: 'Jas',
  jk: 'Jas',
  '1pet': '1Pet',
  '1pt': '1Pet',
  '2pet': '2Pet',
  '2pt': '2Pet',
  '1john': '1John',
  '1jn': '1John',
  '2john': '2John',
  '2jn': '2John',
  '3john': '3John',
  '3jn': '3John',
  jude: 'Jude',
  jud: 'Jude',
  rev: 'Rev',
  zjv: 'Rev',
  zj: 'Rev',
}

/**
 * Parses a Slovak Bible reference string
 */
function parseVerseReference(reference) {
  if (!reference) return null

  const normalized = reference.trim().toLowerCase()
  const match = normalized.match(/^(.+?)\s+(\d+)[,:](\d+)(?:-(\d+))?$/)

  if (!match) return null

  const [, bookName, chapter, startVerse, endVerse] = match
  const bookKey = bookName.trim()
  const bookAbbr = BOOK_ABBREVIATIONS[bookKey]

  if (!bookAbbr) {
    console.warn(`Unknown book: ${bookName}`)
    return null
  }

  return {
    book: bookAbbr,
    chapter: parseInt(chapter, 10),
    startVerse: parseInt(startVerse, 10),
    endVerse: endVerse ? parseInt(endVerse, 10) : null,
  }
}

/**
 * Fetches verse content from bible4u.net API
 * See: https://bible4u.net/sk/api
 * @param {object} parsedRef - Parsed reference object
 * @param {string} translation - Bible translation code (default: SEB for Slovak)
 */
async function fetchVerseFromBible4u(parsedRef, translation = 'ROH') {
  const { book, chapter, startVerse, endVerse } = parsedRef
  const lastVerse = endVerse || startVerse

  // Build the API URL for passage
  // Format: https://bible4u.net/api/v1/passage/{BIBLE}/{BOOK}?start-chapter={}&start-verse={}&end-verse={}
  const apiUrl = `https://bible4u.net/api/v1/passage/${translation}/${book}?start-chapter=${chapter}&start-verse=${startVerse}&end-verse=${lastVerse}`
  console.log('Fetching from bible4u.net:', apiUrl)

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'application/json',
      },
    })

    console.log('bible4u.net response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('bible4u.net API error response:', errorText)
      return null
    }

    const data = await response.json()
    console.log('bible4u.net API response:', JSON.stringify(data, null, 2))

    if (!data.success) {
      console.log('bible4u.net API returned success=false')
      return null
    }

    if (!data.data || !data.data.verses || data.data.verses.length === 0) {
      console.log('bible4u.net API returned no verses')
      return null
    }

    // Combine the verses into a single text
    const verseTexts = data.data.verses.map(v => v.text)
    return verseTexts.join(' ')
  } catch (error) {
    console.error('Error fetching verse from bible4u.net:', error)
    return null
  }
}

/**
 * Vite plugin to handle API requests during development
 */
export function notionApiPlugin() {
  return {
    name: 'notion-api-simple',
    configureServer(server) {
      console.log('✅ Notion API plugin loaded (Simple HTTP version)')
      console.log('📡 Database ID:', DATABASE_ID ? 'Set' : 'MISSING')
      console.log('🔑 API Key:', NOTION_API_KEY ? 'Set' : 'MISSING')

      // Bible verse API handler
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/bible-verse')) {
          return next()
        }

        console.log('📖 Bible verse request:', req.url)

        const url = new URL(req.url, `http://${req.headers.host}`)
        const reference = url.searchParams.get('reference')

        if (!reference) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Missing reference parameter' }))
          return
        }

        const parsedRef = parseVerseReference(reference)

        if (!parsedRef) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Invalid verse reference format', reference }))
          return
        }

        try {
          const verseText = await fetchVerseFromBible4u(parsedRef)

          // Build URL to bible4u.net for reading the full chapter
          const bibleUrl = `https://bible4u.net/sk/b/ROH/${parsedRef.book}/${parsedRef.chapter}`

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              reference,
              parsed: parsedRef,
              text: verseText,
              url: bibleUrl,
              translation: 'ROH',
            })
          )
        } catch (error) {
          console.error('Bible verse API error:', error)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: error.message || 'Internal server error' }))
        }
      })

      // Devotionals API handler
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/devotionals')) {
          return next()
        }

        console.log('🔍 API request:', req.url)

        // Parse query params
        const url = new URL(req.url, `http://${req.headers.host}`)
        const action = url.searchParams.get('action')
        const date = url.searchParams.get('date')
        const limit = parseInt(url.searchParams.get('limit') || '100')

        try {
          // Get devotional by date
          if (action === 'getByDate' && date) {
            const response = await notionRequest(`/databases/${DATABASE_ID}/query`, {
              body: {
                filter: {
                  property: 'Date',
                  date: {
                    equals: date,
                  },
                },
              },
            })

            if (response.results.length === 0) {
              res.statusCode = 404
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Devotional not found' }))
              return
            }

            const devotional = await fetchAndConvertPage(response.results[0])
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(devotional))
            return
          }

          // Get all devotionals
          if (action === 'getAll') {
            const response = await notionRequest(`/databases/${DATABASE_ID}/query`, {
              body: {
                sorts: [
                  {
                    property: 'Date',
                    direction: 'descending',
                  },
                ],
                page_size: limit,
              },
            })

            const devotionals = []
            for (const page of response.results) {
              const devotional = await fetchAndConvertPage(page)
              devotionals.push(devotional)
            }

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(devotionals))
            return
          }

          // Get available dates
          if (action === 'getDates') {
            let allResults = []
            let hasMore = true
            let startCursor = undefined

            // Fetch all pages with pagination
            while (hasMore) {
              const response = await notionRequest(`/databases/${DATABASE_ID}/query`, {
                body: {
                  sorts: [
                    {
                      property: 'Date',
                      direction: 'descending',
                    },
                  ],
                  start_cursor: startCursor,
                },
              })

              allResults = allResults.concat(response.results)
              hasMore = response.has_more
              startCursor = response.next_cursor
            }

            const dates = allResults
              .map(page => {
                const date = page.properties.Date?.date?.start || page.properties.date?.date?.start
                return date ? date.split('T')[0] : null
              })
              .filter(Boolean)

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(dates))
            return
          }

          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Invalid action' }))
        } catch (error) {
          console.error('Notion API error:', error)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: error.message || 'Internal server error' }))
        }
      })
    },
  }
}
