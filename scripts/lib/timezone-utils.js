/**
 * Timezone utilities for handling Prague time with DST
 * Uses date-fns-tz for reliable timezone conversions
 */

import { zonedTimeToUtc, format } from 'date-fns-tz'

const PRAGUE_TIMEZONE = 'Europe/Prague'

/**
 * Creates a Date object for 4 AM Prague time on a given date
 * Automatically handles DST using date-fns-tz
 * 
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Date} Date object set to 4 AM Prague time (in UTC)
 */
export function createPragueTime4AM(dateStr) {
  // Parse the date string and create a date at 4 AM in Prague timezone
  const [year, month, day] = dateStr.split('-').map(Number)
  
  // Create a date object representing 4 AM on that day (in local/naive time)
  const naiveDate = new Date(year, month - 1, day, 4, 0, 0)
  
  // Convert from Prague time to UTC (this handles DST automatically)
  return zonedTimeToUtc(naiveDate, PRAGUE_TIMEZONE)
}

/**
 * Creates an ISO string for 4 AM Prague time on a given date
 * Automatically handles DST using date-fns-tz
 * 
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {string} ISO string for 4 AM Prague time
 */
export function createPragueTime4AMISO(dateStr) {
  return createPragueTime4AM(dateStr).toISOString()
}

/**
 * Gets the timezone offset for Prague time on a given date
 * Prague uses CET (UTC+1) in winter and CEST (UTC+2) in summer
 * 
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {string} Timezone offset string (e.g., '+01:00' or '+02:00')
 */
export function getPragueTimezoneOffset(dateStr) {
  const date = createPragueTime4AM(dateStr)
  const formatted = format(date, 'xxx', { timeZone: PRAGUE_TIMEZONE })
  return formatted
}

