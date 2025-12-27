import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

if (!GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY not found in .env.local')
  process.exit(1)
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

/**
 * Parses a text file of devotionals using Gemini AI
 */
async function parseDevotionals(filePath, outputPath) {
  try {
    console.log('📖 Reading file:', filePath)
    const content = await fs.readFile(filePath, 'utf-8')
    
    console.log('🤖 Sending to Gemini for parsing...')
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
    
    const prompt = `Parse this Slovak devotional text file into a JSON array. Each devotional entry has the following structure:

1. Date line (e.g., "Štvrtok 1. januára 2026")
2. Two Bible references separated by spaces (e.g., "Jn 16,31-33        Ž 121")
   - First reference = verseDay
   - Second reference = verseEvening
3. Title (one or more lines before the quote)
4. Quote in quotes with Bible reference in parentheses
5. Main content (multiple paragraphs)
6. Prayer (usually starts with "Ďakujem Ti," "Drahý Bože," "Milujúci Bože," etc.)
7. Questions section starting with "Na zamyslenie:"

Parse ALL devotionals in the file and return a JSON array with this exact structure for each entry:

{
  "date": "2026-01-01",  // Convert Slovak date to YYYY-MM-DD format
  "title": "Title text",
  "quote": "Bible verse reference (e.g., Jn 16,33)",
  "verseDay": "First Bible reference",
  "verseEvening": "Second Bible reference",
  "content": "Main devotional text (combine all paragraphs with \\n\\n between them)",
  "prayer": "Prayer text",
  "questions": "Questions text"
}

Important:
- Convert Slovak dates to ISO format (YYYY-MM-DD)
- Keep all Slovak text exactly as written
- Combine content paragraphs with \\n\\n (double newline) between them
- Do NOT include the quote text itself in content, only the main devotional paragraphs
- Return ONLY valid JSON, no other text or markdown

Here is the text:

${content}

Return the parsed JSON array:`

    const result = await model.generateContent(prompt)
    const response = result.response
    let text = response.text()
    
    // Remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    console.log('✅ Parsing complete')
    
    // Parse and validate JSON
    const devotionals = JSON.parse(text)
    
    console.log(`📊 Parsed ${devotionals.length} devotionals`)
    
    // Resolve output path relative to assets directory
    const resolvedOutputPath = path.isAbsolute(outputPath)
      ? outputPath
      : path.join(__dirname, 'assets', outputPath)
    
    // Save to output file
    await fs.writeFile(resolvedOutputPath, JSON.stringify(devotionals, null, 2), 'utf-8')
    console.log('💾 Saved to:', resolvedOutputPath)
    
    return devotionals
  } catch (error) {
    console.error('❌ Error parsing devotionals:', error)
    throw error
  }
}

// Run the parser
const inputFile = process.argv[2] || 'CHLIEB 2026 JAN.txt'
const outputFile = process.argv[3] || 'devotionals-2026.json'

parseDevotionals(inputFile, outputFile)
  .then(devotionals => {
    console.log('\n✨ Success! Sample entry:')
    console.log(JSON.stringify(devotionals[0], null, 2))
  })
  .catch(error => {
    console.error('Failed to parse devotionals')
    process.exit(1)
  })

