import { useState, useEffect, useRef } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns'
import { sk } from 'date-fns/locale'
import { ChevronLeftIcon, ChevronRightIcon } from './icons'

function DatePicker({ currentDate, today, onDateSelect, onClose, isClosing, availableDates }) {
  const pickerRef = useRef(null)
  const [viewMonth, setViewMonth] = useState(currentDate)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = event => {
      // Check if clicking on the toggle button or its children
      const isToggleButton = event.target.closest('[data-datepicker-toggle]')

      if (pickerRef.current && !pickerRef.current.contains(event.target) && !isToggleButton) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  // Update view month when current date changes
  useEffect(() => {
    setViewMonth(currentDate)
  }, [currentDate])

  const monthStart = startOfMonth(viewMonth)
  const monthEnd = endOfMonth(viewMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const weekDays = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne']

  const handlePrevMonth = () => setViewMonth(prev => subMonths(prev, 1))
  const handleNextMonth = () => setViewMonth(prev => addMonths(prev, 1))

  const handleDayClick = day => {
    onDateSelect(format(day, 'yyyy-MM-dd'))
    onClose()
  }

  return (
    <div
      ref={pickerRef}
      className="absolute top-full mt-2 left-1/2 -translate-x-1/2 p-3 bg-white border border-gray-200 rounded-xl shadow-xl w-80 z-50"
      style={{
        animation: isClosing
          ? 'fadeOutPicker 0.2s ease-out forwards'
          : 'fadeInPicker 0.2s ease-out forwards',
      }}
    >
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handlePrevMonth}
          className="p-1.5 rounded-lg hover:bg-gray-200 smooth-transition"
          aria-label="Previous month"
        >
          <ChevronLeftIcon />
        </button>

        <h3 className="text-sm font-medium text-gray-800 capitalize">
          {format(viewMonth, 'MMMM yyyy', { locale: sk })}
        </h3>

        <button
          onClick={handleNextMonth}
          className="p-1.5 rounded-lg hover:bg-gray-200 smooth-transition"
          aria-label="Next month"
        >
          <ChevronRightIcon />
        </button>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {weekDays.map(day => (
          <div key={day} className="text-center text-[10px] font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, viewMonth)
          const isSelected = isSameDay(day, currentDate)
          const isToday = isSameDay(day, today)
          const dateString = format(day, 'yyyy-MM-dd')
          const isAvailable = availableDates.has(dateString)

          return (
            <button
              key={index}
              onClick={() => isAvailable && !isSelected && handleDayClick(day)}
              disabled={!isAvailable || isSelected}
              className={`
                aspect-square p-1 rounded-md text-xs smooth-transition
                ${!isCurrentMonth ? 'text-gray-300' : ''}
                ${isCurrentMonth && !isAvailable ? 'text-gray-400 cursor-not-allowed opacity-40' : ''}
                ${isCurrentMonth && isAvailable && !isSelected ? 'text-gray-700 hover:bg-gray-200 cursor-pointer' : ''}
                ${isSelected ? 'bg-accent text-white font-semibold cursor-default' : ''}
                ${isToday && !isSelected && isAvailable ? 'ring-1 ring-accent ring-inset' : ''}
              `}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>

      {/* Quick actions */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <button
          onClick={() => {
            const todayString = format(today, 'yyyy-MM-dd')
            if (availableDates.has(todayString)) {
              onDateSelect(todayString)
              onClose()
            }
          }}
          disabled={!availableDates.has(format(today, 'yyyy-MM-dd'))}
          className={`
            w-full py-1.5 px-3 rounded-lg text-xs font-medium smooth-transition
            ${
              availableDates.has(format(today, 'yyyy-MM-dd'))
                ? 'bg-gray-50 hover:bg-gray-200 text-gray-700 cursor-pointer'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
            }
          `}
        >
          Dnes
        </button>
      </div>
    </div>
  )
}

export default DatePicker
