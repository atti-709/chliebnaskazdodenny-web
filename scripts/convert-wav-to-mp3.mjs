#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * WAV to MP3 Converter
 * 
 * Converts WAV files in FINAL folders to MP3 format for Podbean upload.
 * Podbean only supports MP3 and M4A formats.
 * 
 * Usage:
 *   node scripts/convert-wav-to-mp3.mjs [--all | --date YYYY-MM-DD]
 * 
 * Requirements:
 *   - ffmpeg must be installed: brew install ffmpeg
 * 
 * Options:
 *   --all              Convert all WAV files found
 *   --date YYYY-MM-DD  Convert only the episode for this date
 *   --dry-run          Show what would be converted without converting
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const EPISODES_PATH = '/Users/atti/Library/CloudStorage/GoogleDrive-xzsiros@gmail.com/Shared drives/Chlieb náš každodenný/EPIZÓDY'

/**
 * Checks if ffmpeg is installed
 */
async function checkFFmpeg() {
  return new Promise((resolve) => {
    const ffmpeg = spawn('ffmpeg', ['-version'])
    
    ffmpeg.on('error', () => {
      resolve(false)
    })
    
    ffmpeg.on('close', (code) => {
      resolve(code === 0)
    })
  })
}

/**
 * Converts WAV file to MP3 using ffmpeg
 */
async function convertToMP3(wavPath, mp3Path) {
  return new Promise((resolve, reject) => {
    console.log('   Converting with ffmpeg...')
    
    const ffmpeg = spawn('ffmpeg', [
      '-i', wavPath,           // Input file
      '-codec:a', 'libmp3lame', // MP3 encoder
      '-b:a', '128k',           // Constant bitrate 320 kbps
      '-y',                     // Overwrite if exists
      mp3Path                   // Output file
    ])
    
    let stderr = ''
    
    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString()
    })
    
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`ffmpeg failed with code ${code}\n${stderr}`))
      }
    })
    
    ffmpeg.on('error', (err) => {
      reject(err)
    })
  })
}

/**
 * Extracts date from folder name
 */
function extractDateFromFolderName(folderName) {
  const match = folderName.match(/^(\d{4})(\d{2})(\d{2})_/)
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`
  }
  return null
}

/**
 * Scans for WAV files that need conversion
 */
async function scanForWAVFiles(targetDate = null) {
  console.log('📂 Scanning for WAV files...')
  
  const entries = await fs.readdir(EPISODES_PATH, { withFileTypes: true })
  const wavFiles = []

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) {
      continue
    }

    const date = extractDateFromFolderName(entry.name)
    
    // Skip if target date specified and doesn't match
    if (targetDate && date !== targetDate) {
      continue
    }

    const finalPath = path.join(EPISODES_PATH, entry.name, 'FINAL')

    try {
      await fs.access(finalPath)
    } catch {
      continue
    }

    const finalFiles = await fs.readdir(finalPath)
    const wavFile = finalFiles.find(file => file.endsWith('.wav'))

    if (wavFile) {
      const wavPath = path.join(finalPath, wavFile)
      const mp3File = wavFile.replace(/\.wav$/i, '.mp3')
      const mp3Path = path.join(finalPath, mp3File)

      // Check if MP3 already exists
      let mp3Exists = false
      try {
        await fs.access(mp3Path)
        mp3Exists = true
      } catch {
        // MP3 doesn't exist yet
      }

      const stats = await fs.stat(wavPath)

      wavFiles.push({
        date,
        folderName: entry.name,
        wavFile,
        wavPath,
        mp3File,
        mp3Path,
        mp3Exists,
        fileSize: stats.size,
        fileSizeMB: (stats.size / (1024 * 1024)).toFixed(2),
      })
    }
  }

  return wavFiles
}

/**
 * Converts a single WAV file
 */
async function convertFile(file, options = {}) {
  try {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`📅 Date: ${file.date}`)
    console.log(`📁 Folder: ${file.folderName}`)
    console.log(`📄 WAV File: ${file.wavFile} (${file.fileSizeMB} MB)`)
    console.log(`🎵 MP3 File: ${file.mp3File}`)
    
    if (file.mp3Exists) {
      console.log('⏭️  MP3 already exists - skipping')
      return { success: true, skipped: true }
    }
    
    if (options.dryRun) {
      console.log('🏃 DRY RUN - Would convert this file')
      return { success: true, dryRun: true }
    }
    
    // Convert
    await convertToMP3(file.wavPath, file.mp3Path)
    
    // Verify output file was created
    const stats = await fs.stat(file.mp3Path)
    const mp3SizeMB = (stats.size / (1024 * 1024)).toFixed(2)
    
    console.log(`✅ Converted successfully`)
    console.log(`   Output: ${mp3SizeMB} MB`)
    
    return { success: true, outputSize: mp3SizeMB }
  } catch (error) {
    console.error(`❌ Conversion failed:`, error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Main function
 */
async function main() {
  try {
    const args = process.argv.slice(2)
    
    const options = {
      all: args.includes('--all'),
      dryRun: args.includes('--dry-run'),
      date: args.includes('--date') ? args[args.indexOf('--date') + 1] : null,
    }
    
    console.log('🎵 WAV to MP3 Converter\n')
    
    // Check if ffmpeg is installed
    const hasFFmpeg = await checkFFmpeg()
    if (!hasFFmpeg) {
      console.error('❌ Error: ffmpeg is not installed')
      console.error('\nPlease install ffmpeg:')
      console.error('  macOS: brew install ffmpeg')
      console.error('  Linux: sudo apt-get install ffmpeg')
      console.error('  Windows: Download from https://ffmpeg.org/download.html')
      process.exit(1)
    }
    
    console.log('✅ ffmpeg is installed\n')
    
    if (options.dryRun) {
      console.log('🏃 DRY RUN MODE - No files will be converted\n')
    }
    
    // Scan for WAV files
    const wavFiles = await scanForWAVFiles(options.date)
    
    if (wavFiles.length === 0) {
      if (options.date) {
        console.log(`ℹ️  No WAV files found for date ${options.date}`)
      } else {
        console.log('ℹ️  No WAV files found')
      }
      return
    }
    
    console.log(`✅ Found ${wavFiles.length} WAV file(s)\n`)
    
    // Convert files
    let successCount = 0
    let skipCount = 0
    let failCount = 0
    
    for (const file of wavFiles) {
      const result = await convertFile(file, options)
      
      if (result.success) {
        if (result.skipped) {
          skipCount++
        } else {
          successCount++
        }
      } else {
        failCount++
      }
    }
    
    // Summary
    console.log(`\n${'='.repeat(60)}`)
    console.log('📊 Conversion Summary:')
    console.log(`✅ Converted: ${successCount}`)
    if (skipCount > 0) {
      console.log(`⏭️  Skipped: ${skipCount}`)
    }
    console.log(`❌ Failed: ${failCount}`)
    console.log(`📝 Total: ${wavFiles.length}`)
    
    if (!options.dryRun && successCount > 0) {
      console.log('\n💡 Tip: You can now run the Podbean upload script:')
      console.log('   npm run podbean:upload')
    }
    
  } catch (error) {
    console.error('\n💥 Conversion failed:', error.message)
    process.exit(1)
  }
}

// Run the script
main()
  .then(() => {
    console.log('\n✨ Done!')
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error)
    process.exit(1)
  })

