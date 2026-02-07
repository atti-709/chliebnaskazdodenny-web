import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import DateNavigation from './DateNavigation'
import DatePicker from './DatePicker'
import logoHeader from '../assets/logo-header.svg'

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
  episodeNumber,
}) {
  const isToday = format(currentDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  const [isClosing, setIsClosing] = useState(false)
  const [isPickerMounted, setIsPickerMounted] = useState(showDatePicker)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 4)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (showDatePicker) {
      setIsPickerMounted(true)
      setIsClosing(false)
    } else if (isPickerMounted) {
      setIsClosing(true)
      const timer = setTimeout(() => {
        setIsPickerMounted(false)
        setIsClosing(false)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [showDatePicker, isPickerMounted])

  return (
    <header className={`sticky top-0 z-50 transition-shadow duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
      {/* Dark brown header bar */}
      <div className="bg-chnk-dark flex items-center justify-between px-3 py-3 md:px-[30px] md:py-[16px]">
        <a href="/" className="h-[28px] md:h-[40px] shrink-0">
          <img alt="ChNK Logo" className="h-full w-auto" src={logoHeader} />
        </a>
        <a href="/" className="font-display font-bold text-base md:text-2xl text-chnk-primary text-center leading-tight no-underline">
          Chlieb náš každodenný
        </a>
        <div className="w-[28px] md:w-[40px] shrink-0" />
      </div>

      {/* Date selector stripe */}
      <div className="bg-white relative">
        <DateNavigation
          currentDate={currentDate}
          isToday={isToday}
          onPreviousDay={onPreviousDay}
          onNextDay={onNextDay}
          onToggleDatePicker={onToggleDatePicker}
          hasPreviousDate={hasPreviousDate}
          hasNextDate={hasNextDate}
          episodeNumber={episodeNumber}
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
    </header>
  )
}

export default Header
