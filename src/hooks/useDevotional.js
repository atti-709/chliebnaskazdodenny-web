import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { getDevotionalByDate } from '../api/notion.ts'

/**
 * Custom hook for fetching devotional data
 */
export function useDevotional(currentDate) {
  const [devotional, setDevotional] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDevotional = async () => {
      setLoading(true)
      setError(null)

      try {
        const dateString = format(currentDate, 'yyyy-MM-dd')
        const data = await getDevotionalByDate(dateString)
        setDevotional(data)
      } catch (err) {
        console.error('Error fetching devotional from Notion:', err)
        setError(err)
        setDevotional(null)
      } finally {
        setLoading(false)
      }
    }

    fetchDevotional()
  }, [currentDate])

  return { devotional, loading, error }
}
