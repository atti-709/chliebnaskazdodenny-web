/**
 * Netlify/Vercel Function to fetch Bible verse content from bible4u.net
 * See: https://bible4u.net/sk/api
 */

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
 * @param {string} reference - The verse reference string
 * @returns {object|null} - Parsed reference object or null if invalid
 */
function parseVerseReference(reference) {
  if (!reference) return null

  const normalized = reference.trim().toLowerCase()

  // Pattern: "Book Chapter,Verse" or "Book Chapter,StartVerse-EndVerse"
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
 * @returns {Promise<string|null>} - The verse text or null
 */
async function fetchVerseFromBible4u(parsedRef, translation = 'ROH') {
  const { book, chapter, startVerse, endVerse } = parsedRef
  const lastVerse = endVerse || startVerse

  // Build the API URL for passage
  // Format: https://bible4u.net/api/v1/passage/{BIBLE}/{BOOK}?start-chapter={}&start-verse={}&end-verse={}
  const apiUrl = `https://bible4u.net/api/v1/passage/${translation}/${book}?start-chapter=${chapter}&start-verse=${startVerse}&end-verse=${lastVerse}`

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    if (!data.success || !data.data || !data.data.verses) {
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

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { reference } = req.query

  if (!reference) {
    res.status(400).json({ error: 'Missing reference parameter' })
    return
  }

  const parsedRef = parseVerseReference(reference)

  if (!parsedRef) {
    res.status(400).json({ error: 'Invalid verse reference format', reference })
    return
  }

  const verseText = await fetchVerseFromBible4u(parsedRef)

  // Build URL to bible4u.net for reading the full chapter
  const bibleUrl = `https://bible4u.net/sk/b/ROH/${parsedRef.book}/${parsedRef.chapter}`

  // Cache for 24 hours
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate')

  res.status(200).json({
    reference,
    parsed: parsedRef,
    text: verseText,
    url: bibleUrl,
    translation: 'ROH',
  })
}
