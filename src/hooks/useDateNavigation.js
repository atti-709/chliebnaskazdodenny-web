import { useState, useEffect } from 'react'
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
function updateURL(date) {
  const dateString = format(date, 'yyyy-MM-dd')
  const url = new URL(window.location)
  url.searchParams.set('date', dateString)
  url.hash = '' // Remove trailing hash
  window.history.pushState({}, '', url)
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

  // Update URL when date changes
  useEffect(() => {
    updateURL(currentDate)
  }, [currentDate])

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
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
