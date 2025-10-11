import { useState, useEffect } from 'react'
import { addDays, subDays, parseISO, startOfDay, format, isValid } from 'date-fns'

/**
 * Get initial date from URL or use today
 */
function getInitialDate() {
  const params = new URLSearchParams(window.location.search)
  const dateParam = params.get('date')
  
  if (dateParam) {
    try {
      const parsedDate = parseISO(dateParam)
      if (isValid(parsedDate)) {
        return startOfDay(parsedDate)
      }
    } catch (e) {
      // Invalid date in URL, fall back to today
    }
  }
  
  return startOfDay(new Date())
}

/**
 * Update URL with current date
 */
function updateURL(date) {
  const dateString = format(date, 'yyyy-MM-dd')
  const url = new URL(window.location)
  url.searchParams.set('date', dateString)
  url.hash = '' // Remove trailing hash
  window.history.pushState({}, '', url)
}

/**
 * Custom hook for managing date navigation state
 */
export function useDateNavigation() {
  const today = startOfDay(new Date())
  const [currentDate, setCurrentDate] = useState(getInitialDate)
  const [showDatePicker, setShowDatePicker] = useState(false)

  // Update URL when date changes
  useEffect(() => {
    updateURL(currentDate)
  }, [currentDate])

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const newDate = getInitialDate()
      setCurrentDate(newDate)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handlePreviousDay = () => {
    setCurrentDate(prev => subDays(prev, 1))
    setShowDatePicker(false)
  }

  const handleNextDay = () => {
    const nextDate = addDays(currentDate, 1)
    setCurrentDate(nextDate)
    setShowDatePicker(false)
  }

  const handleDateSelect = dateString => {
    const selectedDate = startOfDay(parseISO(dateString))
    setCurrentDate(selectedDate)
    setShowDatePicker(false)
  }

  const toggleDatePicker = () => {
    setShowDatePicker(prev => !prev)
  }

  return {
    currentDate,
    today,
    showDatePicker,
    handlePreviousDay,
    handleNextDay,
    handleDateSelect,
    toggleDatePicker,
  }
}
