import { useState, useEffect } from 'react'
import { getAvailableDates } from '../api/notion.ts'

/**
 * Custom hook for fetching available devotional dates
 */
export function useAvailableDates() {
  const [availableDates, setAvailableDates] = useState(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDates = async () => {
      try {
        const dates = await getAvailableDates()
        setAvailableDates(new Set(dates))
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

