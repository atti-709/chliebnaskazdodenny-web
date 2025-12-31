import { useState, useEffect, useRef } from 'react'
import { parseISO, isAfter, startOfDay, addDays } from 'date-fns'
import { getAvailableDates } from '../api/notion.ts'

/**
 * Custom hook for fetching available devotional dates
 * Uses VITE_DEBUG environment variable to control date filtering:
 * - VITE_DEBUG=1: Debug mode - shows all dates from Notion
 * - VITE_DEBUG=0 (or unset): Production mode - shows dates up to 1 week in advance
 */
export function useAvailableDates() {
  const [availableDates, setAvailableDates] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const hasFetched = useRef(false)

  useEffect(() => {
    // Prevent duplicate fetches (especially in React StrictMode)
    if (hasFetched.current) return
    hasFetched.current = true

    const fetchDates = async () => {
      try {
        const dates = await getAvailableDates()
        
        // In production, filter out future dates (beyond 1 week)
        // Debug mode (VITE_DEBUG=1) shows all dates, otherwise only dates up to 1 week ahead
        const isDebugMode = import.meta.env.VITE_DEBUG === '1'
        const today = startOfDay(new Date())
        const oneWeekAhead = addDays(today, 7)
        
        // eslint-disable-next-line no-console
        console.log('Environment:', {
          VITE_DEBUG: import.meta.env.VITE_DEBUG,
          isDebugMode,
          totalDates: dates.length,
          cutoffDate: oneWeekAhead.toISOString().split('T')[0]
        })
        
        const filteredDates = isDebugMode 
          ? dates // Debug mode: show all dates
          : dates.filter(dateString => { // Production mode: filter dates beyond 1 week
              const date = parseISO(dateString)
              return !isAfter(date, oneWeekAhead)
            })
        
        // eslint-disable-next-line no-console
        console.log(`Filtered dates: ${filteredDates.length} available (${dates.length - filteredDates.length} dates beyond 1 week hidden)`)
        
        setAvailableDates(new Set(filteredDates))
      } catch (error) {
        console.error('Error fetching available dates:', error)
        setAvailableDates(new Set())
      } finally {
        setLoading(false)
      }
    }

    fetchDates()
  }, [])

  return { availableDates, loading }
}

