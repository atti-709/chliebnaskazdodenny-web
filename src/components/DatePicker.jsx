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
      className="absolute top-full mt-2 left-1/2 -translate-x-1/2 p-3 bg-white border-2 border-chnk-dark/20 rounded-2xl shadow-xl w-80 z-50"
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
          className="p-1.5 rounded-lg hover:bg-chnk-primary-2 smooth-transition"
          aria-label="Previous month"
        >
          <ChevronLeftIcon />
        </button>

        <h3 className="text-sm font-display font-bold text-chnk-dark">
          {format(viewMonth, 'LLLL yyyy', { locale: sk })}
        </h3>

        <button
          onClick={handleNextMonth}
          className="p-1.5 rounded-lg hover:bg-chnk-primary-2 smooth-transition"
          aria-label="Next month"
        >
          <ChevronRightIcon />
        </button>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {weekDays.map(day => (
          <div
            key={day}
            className="text-center text-[10px] font-body font-medium text-chnk-dark/50 py-1"
          >
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
                aspect-square p-1 rounded-md text-xs font-body smooth-transition
                ${!isCurrentMonth ? 'text-chnk-dark/15' : ''}
                ${isCurrentMonth && !isAvailable ? 'text-chnk-dark/30 cursor-not-allowed line-through decoration-chnk-dark/20' : ''}
                ${isCurrentMonth && isAvailable && !isSelected ? 'text-chnk-dark hover:bg-chnk-primary-2 cursor-pointer font-medium' : ''}
                ${isSelected ? 'bg-chnk-dark text-white font-semibold cursor-default' : ''}
                ${isToday && !isSelected && isAvailable ? 'ring-2 ring-chnk-dark ring-inset' : ''}
              `}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>

      {/* Quick actions */}
      <div className="mt-3 pt-3 border-t border-chnk-dark/10">
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
            w-full py-2 px-4 rounded-full text-xs font-display font-bold smooth-transition
            ${
              availableDates.has(format(today, 'yyyy-MM-dd'))
                ? 'bg-chnk-dark hover:bg-chnk-dark/80 text-white cursor-pointer'
                : 'bg-chnk-neutral/50 text-chnk-dark/40 cursor-not-allowed opacity-50'
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
