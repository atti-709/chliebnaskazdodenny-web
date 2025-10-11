import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import DateNavigation from './DateNavigation'
import DatePicker from './DatePicker'

function Header({
  currentDate,
  today,
  showDatePicker,
  onPreviousDay,
  onNextDay,
  onDateSelect,
  onToggleDatePicker,
  availableDates,
  hasPreviousDate,
  hasNextDate,
}) {
  const isToday = format(currentDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  const [isClosing, setIsClosing] = useState(false)
  const [isPickerMounted, setIsPickerMounted] = useState(showDatePicker)

  useEffect(() => {
    if (showDatePicker) {
      setIsPickerMounted(true)
      setIsClosing(false)
    } else if (isPickerMounted) {
      // Trigger close animation
      setIsClosing(true)
      const timer = setTimeout(() => {
        setIsPickerMounted(false)
        setIsClosing(false)
      }, 200) // Match animation duration
      return () => clearTimeout(timer)
    }
  }, [showDatePicker, isPickerMounted])

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl md:text-3xl font-serif font-light text-center text-gray-800 mb-6">
          Chlieb náš každodenný
        </h1>

        <div className="relative">
          <DateNavigation
            currentDate={currentDate}
            isToday={isToday}
            onPreviousDay={onPreviousDay}
            onNextDay={onNextDay}
            onToggleDatePicker={onToggleDatePicker}
            hasPreviousDate={hasPreviousDate}
            hasNextDate={hasNextDate}
          />

          {isPickerMounted && (
            <DatePicker
              currentDate={currentDate}
              today={today}
              onDateSelect={onDateSelect}
              onClose={onToggleDatePicker}
              isClosing={isClosing}
              availableDates={availableDates}
            />
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
