import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const NOTION_API_KEY = process.env.NOTION_API_KEY
const DATABASE_ID = process.env.NOTION_DATABASE_ID
const NOTION_VERSION = '2022-06-28'

if (!NOTION_API_KEY || !DATABASE_ID) {
  console.error('Error: NOTION_API_KEY and NOTION_DATABASE_ID must be set in .env.local')
  process.exit(1)
}

/**
 * Makes a request to Notion API using fetch
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
    const errorText = await response.text()
    throw new Error(`Notion API error (${response.status}): ${errorText}`)
  }

  return response.json()
}

/**
 * Decodes HTML entities to actual characters
 * Safety fallback in case source data contains HTML entities
 */
function decodeHTMLEntities(text) {
  if (!text) return ''
  
  const entities = {
    '&aacute;': 'á',
    '&eacute;': 'é',
    '&iacute;': 'í',
    '&oacute;': 'ó',
    '&uacute;': 'ú',
    '&yacute;': 'ý',
    '&Aacute;': 'Á',
    '&Eacute;': 'É',
    '&Iacute;': 'Í',
    '&Oacute;': 'Ó',
    '&Uacute;': 'Ú',
    '&Yacute;': 'Ý',
    '&acirc;': 'â',
    '&ecirc;': 'ê',
    '&icirc;': 'î',
    '&ocirc;': 'ô',
    '&ucirc;': 'û',
    '&auml;': 'ä',
    '&euml;': 'ë',
    '&iuml;': 'ï',
    '&ouml;': 'ö',
    '&uuml;': 'ü',
    '&Auml;': 'Ä',
    '&Ouml;': 'Ö',
    '&Uuml;': 'Ü',
    '&agrave;': 'à',
    '&egrave;': 'è',
    '&igrave;': 'ì',
    '&ograve;': 'ò',
    '&ugrave;': 'ù',
    '&atilde;': 'ã',
    '&ntilde;': 'ñ',
    '&otilde;': 'õ',
    '&ccedil;': 'ç',
    '&Ccedil;': 'Ç',
    '&scaron;': 'š',
    '&Scaron;': 'Š',
    '&zcaron;': 'ž',
    '&Zcaron;': 'Ž',
    '&ccaron;': 'č',
    '&Ccaron;': 'Č',
    '&ncaron;': 'ň',
    '&Ncaron;': 'Ň',
    '&dcaron;': 'ď',
    '&Dcaron;': 'Ď',
    '&tcaron;': 'ť',
    '&Tcaron;': 'Ť',
    '&lacute;': 'ľ',
    '&Lacute;': 'Ľ',
    '&racute;': 'ŕ',
    '&Racute;': 'Ŕ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&#39;': "'",
    '&nbsp;': ' ',
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&lsquo;': '\u2018',
    '&rsquo;': '\u2019',
    '&ndash;': '–',
    '&mdash;': '—',
    '&hellip;': '…',
  }
  
  return text.replace(/&[a-zA-Z0-9#]+;/g, (entity) => {
    return entities[entity] || entity
  })
}

/**
 * Unescapes Unicode sequences and converts them to actual characters
 */
function unescapeUnicode(text) {
  if (!text) return ''
  
  // Replace Unicode escape sequences like \u2026 with actual characters
  return text.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16))
  })
}

/**
 * Strips Markdown formatting and returns plain text
 */
function stripMarkdown(text) {
  if (!text) return ''
  
  // Decode HTML entities first (safety fallback)
  text = decodeHTMLEntities(text)
  
  // Unescape Unicode
  text = unescapeUnicode(text)
  
  // Remove bold (**text**)
  text = text.replace(/\*\*(.+?)\*\*/g, '$1')
  
  // Remove italic (*text*)
  text = text.replace(/\*(.+?)\*/g, '$1')
  
  return text
}

/**
 * Converts Markdown text to Notion rich text array
 * Supports **bold** and *italic* formatting
 */
function markdownToRichText(text) {
  if (!text) return []
  
  // Decode HTML entities first (safety fallback)
  text = decodeHTMLEntities(text)
  
  // Unescape Unicode
  text = unescapeUnicode(text)
  
  const richText = []
  const currentText = text
  
  // Parse bold (**text**) and italic (*text*)
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g
  let lastIndex = 0
  let match
  
  while ((match = regex.exec(currentText)) !== null) {
    // Add plain text before the match
    if (match.index > lastIndex) {
      const plainText = currentText.slice(lastIndex, match.index)
      if (plainText) {
        richText.push({
          type: 'text',
          text: { content: plainText },
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: 'default'
          }
        })
      }
    }
    
    // Add formatted text
    const isBold = match[0].startsWith('**')
    const content = isBold ? match[2] : match[3]
    
    richText.push({
      type: 'text',
      text: { content },
      annotations: {
        bold: isBold,
        italic: !isBold,
        strikethrough: false,
        underline: false,
        code: false,
        color: 'default'
      }
    })
    
    lastIndex = regex.lastIndex
  }
  
  // Add remaining plain text
  if (lastIndex < currentText.length) {
    const plainText = currentText.slice(lastIndex)
    if (plainText) {
      richText.push({
        type: 'text',
        text: { content: plainText },
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          underline: false,
          code: false,
          color: 'default'
        }
      })
    }
  }
  
  return richText
}

/**
 * Converts content text with Markdown to Notion paragraph blocks
 */
function contentToBlocks(content) {
  if (!content) return []
  
  const paragraphs = content.split('\n\n').filter(p => p.trim())
  
  return paragraphs.map(paragraph => ({
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: markdownToRichText(paragraph.trim())
    }
  }))
}

/**
 * Checks if a devotional page already exists for a given date
 */
async function checkExistingPage(date) {
  try {
    const data = await notionRequest(`/databases/${DATABASE_ID}/query`, {
      body: {
        filter: {
          property: 'Date',
          date: {
            equals: date
          }
        }
      }
    })
    
    return data.results.length > 0 ? data.results[0] : null
  } catch (error) {
    console.error(`Error checking for existing page:`, error.message)
    return null
  }
}

/**
 * Deletes a page from Notion (archives it)
 */
async function deletePage(pageId) {
  try {
    await notionRequest(`/pages/${pageId}`, {
      method: 'PATCH',
      body: {
        archived: true
      }
    })
    
    return true
  } catch (error) {
    console.error(`Error deleting page:`, error.message)
    return false
  }
}

/**
 * Creates a single devotional page in Notion
 */
async function createDevotionalPage(devotional, options = {}) {
  try {
    console.log(`📝 Creating page for ${devotional.date}: ${devotional.title}`)
    
    // Check if page already exists
    const existingPage = await checkExistingPage(devotional.date)
    
    if (existingPage) {
      if (options.force) {
        console.log(`⚠️  Page already exists for ${devotional.date}, deleting due to --force flag...`)
        const deleted = await deletePage(existingPage.id)
        if (!deleted) {
          throw new Error('Failed to delete existing page')
        }
        console.log(`🗑️  Deleted existing page`)
      } else {
        console.log(`❌ Page already exists for ${devotional.date}: ${devotional.title}`)
        throw new Error(`Page already exists for date ${devotional.date}. Use --force to override.`)
      }
    }
    
    // Prepare properties
    const properties = {
      'Title': {
        title: [
          {
            type: 'text',
            text: { content: stripMarkdown(devotional.title) }
          }
        ]
      },
      'Date': {
        date: {
          start: devotional.date
        }
      },
      'Quote': {
        rich_text: [
          {
            type: 'text',
            text: { content: stripMarkdown(devotional.quote || '') }
          }
        ]
      },
      'VerseDay': {
        rich_text: [
          {
            type: 'text',
            text: { content: unescapeUnicode(devotional.verseDay || '') }
          }
        ]
      },
      'VerseEvening': {
        rich_text: [
          {
            type: 'text',
            text: { content: unescapeUnicode(devotional.verseEvening || '') }
          }
        ]
      },
      'Questions': {
        rich_text: devotional.questions ? markdownToRichText(devotional.questions) : []
      },
      'Prayer': {
        rich_text: devotional.prayer ? markdownToRichText(devotional.prayer) : []
      }
    }
    
    // Add Spotify URI if present
    if (devotional.spotifyEmbedUri) {
      properties['Spotify Embed URI'] = {
        url: devotional.spotifyEmbedUri
      }
    }
    
    // Create page with content blocks
    const children = contentToBlocks(devotional.content)
    
    const response = await notionRequest('/pages', {
      body: {
        parent: { database_id: DATABASE_ID },
        properties,
        children
      }
    })
    
    console.log(`✅ Created: ${devotional.title} (${response.id})`)
    return response
  } catch (error) {
    console.error(`❌ Failed to create page for ${devotional.date}:`, error.message)
    throw error
  }
}

/**
 * Main function to upload all devotionals
 */
async function uploadDevotionals(jsonFile, options = {}) {
  try {
    // Resolve file path relative to assets directory if not absolute
    const filePath = path.isAbsolute(jsonFile) 
      ? jsonFile 
      : path.join(__dirname, 'assets', jsonFile)
    
    // Check if file exists
    try {
      await fs.access(filePath)
    } catch (error) {
      console.error(`❌ Error: File not found: ${filePath}`)
      console.error('\nPlease ensure the JSON file exists in scripts/assets/')
      console.error('Expected file: scripts/assets/devotionals-2026.json')
      throw new Error(`File not found: ${filePath}`)
    }
    
    console.log('📖 Reading JSON file:', filePath)
    const content = await fs.readFile(filePath, 'utf-8')
    const devotionals = JSON.parse(content)
    
    console.log(`📊 Found ${devotionals.length} devotionals to upload`)
    
    if (options.dryRun) {
      console.log('🏃 DRY RUN MODE - No pages will be created')
      console.log('Sample devotional:')
      console.log(JSON.stringify(devotionals[0], null, 2))
      return
    }
    
    // Option to upload a specific range
    const start = options.start || 0
    const end = options.end || devotionals.length
    const toUpload = devotionals.slice(start, end)
    
    console.log(`📤 Uploading ${toUpload.length} devotionals (from ${start} to ${end})`)
    
    let successCount = 0
    let failCount = 0
    
    for (let i = 0; i < toUpload.length; i++) {
      const devotional = toUpload[i]
      
      try {
        await createDevotionalPage(devotional, options)
        successCount++
        
        // Rate limiting: wait 350ms between requests (Notion allows ~3 req/sec)
        if (i < toUpload.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 350))
        }
      } catch (error) {
        failCount++
        console.error(`Failed to upload devotional ${i + start + 1}/${devotionals.length}`)
        
        if (options.stopOnError) {
          console.error('Stopping due to error (--stop-on-error flag)')
          break
        }
      }
    }
    
    console.log('\n📊 Upload Summary:')
    console.log(`✅ Success: ${successCount}`)
    console.log(`❌ Failed: ${failCount}`)
    console.log(`📝 Total: ${toUpload.length}`)
    
  } catch (error) {
    console.error('❌ Error uploading devotionals:', error)
    throw error
  }
}

// Parse command line arguments
const args = process.argv.slice(2)
const jsonFile = args[0] || 'devotionals-2026.json'

const options = {
  dryRun: args.includes('--dry-run'),
  stopOnError: args.includes('--stop-on-error'),
  force: args.includes('--force'),
  start: args.includes('--start') ? parseInt(args[args.indexOf('--start') + 1]) : 0,
  end: args.includes('--end') ? parseInt(args[args.indexOf('--end') + 1]) : undefined
}

console.log('🚀 Notion Devotional Uploader\n')

uploadDevotionals(jsonFile, options)
  .then(() => {
    console.log('\n✨ Upload complete!')
  })
  .catch(error => {
    console.error('\n💥 Upload failed:', error.message)
    process.exit(1)
  })

