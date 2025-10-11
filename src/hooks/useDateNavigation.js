import { useState, useEffect } from 'react'
import { addDays, subDays, parseISO, startOfDay, format, isValid, differenceInCalendarDays } from 'date-fns'

/**
 * Get initial date from URL or use today
 * Returns { date, hasDateParam } where hasDateParam indicates if URL had a date parameter
 */
function getInitialDate() {
  const params = new URLSearchParams(window.location.search)
  const dateParam = params.get('date')
  
  if (dateParam) {
    try {
      const parsedDate = parseISO(dateParam)
      if (isValid(parsedDate)) {
        return { date: startOfDay(parsedDate), hasDateParam: true }
      }
    } catch (e) {
      // Invalid date in URL, fall back to today
    }
  }
  
  return { date: startOfDay(new Date()), hasDateParam: false }
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
  const [initialState] = useState(getInitialDate)
  const [currentDate, setCurrentDate] = useState(initialState.date)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [hasNavigatedToClosest, setHasNavigatedToClosest] = useState(initialState.hasDateParam)

  // Update URL when date changes
  useEffect(() => {
    updateURL(currentDate)
  }, [currentDate])

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const { date } = getInitialDate()
      setCurrentDate(date)
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

  const navigateToClosestDate = (availableDates) => {
    const closestDate = findClosestDate(today, availableDates)
    if (closestDate) {
      handleDateSelect(closestDate)
      setHasNavigatedToClosest(true)
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
    hasNavigatedToClosest,
    navigateToClosestDate,
  }
}
