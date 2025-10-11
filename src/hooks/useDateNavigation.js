import { useState } from 'react'
import { addDays, subDays, parseISO, startOfDay } from 'date-fns'

/**
 * Custom hook for managing date navigation state
 */
export function useDateNavigation(initialDate = new Date()) {
  const today = startOfDay(new Date())
  const [currentDate, setCurrentDate] = useState(startOfDay(initialDate))
  const [showDatePicker, setShowDatePicker] = useState(false)

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
