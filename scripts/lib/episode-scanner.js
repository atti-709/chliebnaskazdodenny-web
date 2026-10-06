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

const YEAR_PATTERN = /^\d{4}$/

/**
 * Lists episode folders, which are grouped by year:
 *   EPIZÓDY/<YYYY>/<YYYYMMDD_slug>
 * Year folders entirely outside the requested year / date range are not read.
 * @param {Object} options - Listing options
 * @param {string|number} [options.year] - Only list this year's folder (YYYY)
 * @param {string} [options.startDate] - Skip years before this date's year (YYYY-MM-DD)
 * @param {string} [options.endDate] - Skip years after this date's year (YYYY-MM-DD)
 * @returns {Promise<Array<{name: string, path: string, date: string|null}>>}
 *   Episode folders sorted by year folder, `date` parsed from the folder name
 */
export async function listEpisodeFolders(options = {}) {
  const year = options.year != null ? String(options.year) : null
  if (year && !YEAR_PATTERN.test(year)) {
    throw new Error(`Invalid year "${options.year}" (expected YYYY)`)
  }

  const rootEntries = await fs.readdir(episodesConfig.path, { withFileTypes: true })

  // Episode folders left in the old flat layout (EPIZÓDY/<YYYYMMDD_slug>) are ignored
  const flatFolders = rootEntries.filter(
    entry => entry.isDirectory() && extractDateFromFolderName(entry.name)
  )
  if (flatFolders.length > 0) {
    console.log(
      `⚠️  Ignoring ${flatFolders.length} episode folder(s) directly in EPIZÓDY - move them into EPIZÓDY/<YYYY>/`
    )
  }

  const yearFolders = rootEntries
    .filter(entry => entry.isDirectory() && YEAR_PATTERN.test(entry.name))
    .map(entry => entry.name)
    .filter(name => !year || name === year)
    .filter(name => !options.startDate || name >= options.startDate.slice(0, 4))
    .filter(name => !options.endDate || name <= options.endDate.slice(0, 4))
    .sort()

  if (year && yearFolders.length === 0) {
    console.log(`⚠️  Year folder not found: ${episodesConfig.yearPath(year)}`)
  }

  const folders = []
  for (const yearFolder of yearFolders) {
    const yearPath = episodesConfig.yearPath(yearFolder)
    const entries = await fs.readdir(yearPath, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) {
        continue
      }

      folders.push({
        name: entry.name,
        path: path.join(yearPath, entry.name),
        date: extractDateFromFolderName(entry.name),
      })
    }
  }

  return folders
}

/**
 * Scans the episodes directory for episodes ready to upload
 * @param {Object} options - Scanning options
 * @param {string|number} options.year - Optional year (YYYY); scans all years if omitted
 * @param {string} options.startDate - Optional start date filter (YYYY-MM-DD)
 * @param {string} options.endDate - Optional end date filter (YYYY-MM-DD)
 * @returns {Promise<Array>} Array of episode objects
 */
export async function scanEpisodesDirectory(options = {}) {
  try {
    console.log(
      '📂 Scanning episodes directory:',
      options.year ? episodesConfig.yearPath(options.year) : `${episodesConfig.path}/<YYYY>`
    )

    const folders = await listEpisodeFolders(options)
    const episodes = []

    for (const folder of folders) {
      // Apply date filters early to avoid reading folders outside the range
      if (folder.date && options.startDate && folder.date < options.startDate) {
        continue
      }
      if (folder.date && options.endDate && folder.date > options.endDate) {
        continue
      }

      const finalPath = path.join(folder.path, 'FINAL')

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
          console.log(`⚠️  No audio file found in ${folder.name}/FINAL`)
          console.log(`   Supported formats: MP3, M4A, WAV (will auto-convert)`)
          continue
        }
      }

      // Date comes from the folder name
      const date = folder.date
      if (!date) {
        console.log(`⚠️  Could not extract date from folder name: ${folder.name}`)
        continue
      }

      const audioFilePath = path.join(finalPath, audioFile)
      const stats = await fs.stat(audioFilePath)

      episodes.push({
        date,
        folderName: folder.name,
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

