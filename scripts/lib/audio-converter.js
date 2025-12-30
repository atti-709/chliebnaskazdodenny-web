/* eslint-disable no-console */
/**
 * Audio Conversion Utilities
 * 
 * Handles audio file format conversions using ffmpeg
 */

import { spawn } from 'child_process'

/**
 * Checks if ffmpeg is installed on the system
 * @returns {Promise<boolean>} True if ffmpeg is available
 */
export async function checkFFmpeg() {
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
 * @param {string} wavPath - Path to input WAV file
 * @param {string} mp3Path - Path to output MP3 file
 * @returns {Promise<void>}
 */
export async function convertWAVtoMP3(wavPath, mp3Path) {
  return new Promise((resolve, reject) => {
    console.log('🔄 Converting WAV to MP3...')
    
    const ffmpeg = spawn('ffmpeg', [
      '-i', wavPath,           // Input file
      '-codec:a', 'libmp3lame', // MP3 encoder
      '-b:a', '128k',           // Constant bitrate 128 kbps
      '-y',                     // Overwrite if exists
      mp3Path                   // Output file
    ])
    
    ffmpeg.stderr.on('data', () => {
      // Suppress ffmpeg output
    })
    
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`ffmpeg conversion failed with code ${code}`))
      }
    })
    
    ffmpeg.on('error', (err) => {
      reject(err)
    })
  })
}

