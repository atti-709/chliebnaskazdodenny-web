import { useState, useEffect, useRef } from 'react'
import { addDays, subDays, parseISO, startOfDay, format, isValid, differenceInCalendarDays } from 'date-fns'

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
function updateURL(date, replace = false) {
  const dateString = format(date, 'yyyy-MM-dd')
  const url = new URL(window.location)
  url.searchParams.set('date', dateString)
  url.hash = '' // Remove trailing hash
  if (replace) {
    window.history.replaceState({}, '', url)
  } else {
    window.history.pushState({}, '', url)
  }
}

/**
 * Find the closest available date to a target date
 */
export function findClosestDate(targetDate, availableDates) {
  if (availableDates.size === 0) return null
  
  const targetDateStr = format(targetDate, 'yyyy-MM-dd')
  
  // If target date has a devotional, use it
  if (availableDates.has(targetDateStr)) {
    return targetDateStr
  }
  
  // Otherwise, find the closest date
  const sortedDates = Array.from(availableDates).sort()
  let closestDate = sortedDates[0]
  let minDiff = Math.abs(differenceInCalendarDays(parseISO(sortedDates[0]), targetDate))
  
  for (const dateStr of sortedDates) {
    const diff = Math.abs(differenceInCalendarDays(parseISO(dateStr), targetDate))
    if (diff < minDiff) {
      minDiff = diff
      closestDate = dateStr
    }
  }
  
  return closestDate
}

/**
 * Custom hook for managing date navigation state
 */
export function useDateNavigation() {
  const today = startOfDay(new Date())
  const [currentDate, setCurrentDate] = useState(getInitialDate)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [hasUserNavigated, setHasUserNavigated] = useState(false)
  const isInitialMount = useRef(true)
  const isPopState = useRef(false)

  // Update URL when date changes
  useEffect(() => {
    // Don't update URL if this change came from a popstate event
    if (isPopState.current) {
      isPopState.current = false
      return
    }

    if (isInitialMount.current) {
      // On initial mount, replace the URL instead of pushing
      updateURL(currentDate, true)
      isInitialMount.current = false
    } else {
      // On subsequent changes, push to history
      updateURL(currentDate, false)
    }
  }, [currentDate])

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      isPopState.current = true
      const date = getInitialDate()
      setCurrentDate(date)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handlePreviousDay = () => {
    setCurrentDate(prev => subDays(prev, 1))
    setShowDatePicker(false)
    setHasUserNavigated(true)
  }

  const handleNextDay = () => {
    const nextDate = addDays(currentDate, 1)
    setCurrentDate(nextDate)
    setShowDatePicker(false)
    setHasUserNavigated(true)
  }

  const handleDateSelect = dateString => {
    const selectedDate = startOfDay(parseISO(dateString))
    setCurrentDate(selectedDate)
    setShowDatePicker(false)
    setHasUserNavigated(true)
  }

  const toggleDatePicker = () => {
    setShowDatePicker(prev => !prev)
  }

  const navigateToClosestDate = (availableDates) => {
    const closestDate = findClosestDate(currentDate, availableDates)
    if (closestDate && closestDate !== format(currentDate, 'yyyy-MM-dd')) {
      // Treat auto-navigation like initial mount - use replaceState
      isInitialMount.current = true
      const selectedDate = startOfDay(parseISO(closestDate))
      setCurrentDate(selectedDate)
      setShowDatePicker(false)
      // Don't set hasUserNavigated for auto-navigation
    }
  }

  return {
    currentDate,
    today,
    showDatePicker,
    handlePreviousDay,
    handleNextDay,
    handleDateSelect,
    toggleDatePicker,
    navigateToClosestDate,
    hasUserNavigated,
  }
}
