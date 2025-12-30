/* eslint-disable no-console */
/**
 * Episode Scanner
 * 
 * Scans the episodes directory for episodes ready to upload
 */

import fs from 'fs/promises'
import path from 'path'
import { episodesConfig } from './config.js'

/**
 * Extracts date from folder name (format: YYYYMMDD_episode_name)
 * @param {string} folderName - Folder name to parse
 * @returns {string|null} Date in YYYY-MM-DD format or null
 */
export function extractDateFromFolderName(folderName) {
  const match = folderName.match(/^(\d{4})(\d{2})(\d{2})_/)
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`
  }
  return null
}

/**
 * Scans the episodes directory for episodes ready to upload
 * @param {Object} options - Scanning options
 * @param {string} options.startDate - Optional start date filter (YYYY-MM-DD)
 * @param {string} options.endDate - Optional end date filter (YYYY-MM-DD)
 * @returns {Promise<Array>} Array of episode objects
 */
export async function scanEpisodesDirectory(options = {}) {
  try {
    console.log('📂 Scanning episodes directory:', episodesConfig.path)
    
    const entries = await fs.readdir(episodesConfig.path, { withFileTypes: true })
    const episodes = []

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) {
        continue
      }

      const episodePath = path.join(episodesConfig.path, entry.name)
      const finalPath = path.join(episodePath, 'FINAL')

      // Check if FINAL folder exists
      try {
        await fs.access(finalPath)
      } catch {
        // No FINAL folder, skip this episode
        continue
      }

      // Check for audio file in FINAL folder
      const finalFiles = await fs.readdir(finalPath)
      let audioFile = finalFiles.find(file => 
        file.endsWith('.mp3') || 
        file.endsWith('.m4a')
      )

      // If no MP3/M4A found, check for WAV and mark for conversion
      let needsConversion = false
      if (!audioFile) {
        const wavFile = finalFiles.find(file => file.endsWith('.wav'))
        if (wavFile) {
          audioFile = wavFile
          needsConversion = true
        } else {
          console.log(`⚠️  No audio file found in ${entry.name}/FINAL`)
          console.log(`   Supported formats: MP3, M4A, WAV (will auto-convert)`)
          continue
        }
      }

      // Extract date from folder name
      const date = extractDateFromFolderName(entry.name)
      if (!date) {
        console.log(`⚠️  Could not extract date from folder name: ${entry.name}`)
        continue
      }

      // Apply date filters
      if (options.startDate && date < options.startDate) {
        continue
      }
      if (options.endDate && date > options.endDate) {
        continue
      }

      const audioFilePath = path.join(finalPath, audioFile)
      const stats = await fs.stat(audioFilePath)

      episodes.push({
        date,
        folderName: entry.name,
        audioFile: audioFile,
        audioFilePath: audioFilePath,
        fileSize: stats.size,
        fileSizeMB: (stats.size / (1024 * 1024)).toFixed(2),
        needsConversion: needsConversion,
      })
    }

    // Sort by date
    episodes.sort((a, b) => a.date.localeCompare(b.date))

    console.log(`✅ Found ${episodes.length} episodes ready to upload`)
    return episodes
  } catch (error) {
    console.error('❌ Error scanning episodes directory:', error.message)
    throw error
  }
}

