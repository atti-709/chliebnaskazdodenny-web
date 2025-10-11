import { useEffect, useMemo, useRef, useState } from 'react'
import { isAfter, format, addDays, subDays } from 'date-fns'
import { sk } from 'date-fns/locale'
import { useDevotional } from './hooks/useDevotional'
import { useDateNavigation } from './hooks/useDateNavigation'
import { useAvailableDates } from './hooks/useAvailableDates'
import Header from './components/Header'
import LoadingSpinner from './components/LoadingSpinner'
import DevotionalContent from './components/DevotionalContent'
import EmptyState from './components/EmptyState'
import Footer from './components/Footer'

function App() {
  const {
    currentDate,
    today,
    showDatePicker,
    handlePreviousDay,
    handleNextDay,
    handleDateSelect,
    toggleDatePicker,
    navigateToClosestDate,
    hasUserNavigated,
  } = useDateNavigation()

  const { availableDates, loading: datesLoading } = useAvailableDates()
  const hasCheckedInitialDate = useRef(false)
  const [readyToFetchDevotional, setReadyToFetchDevotional] = useState(false)

  // Check if we need to auto-navigate before fetching devotional
  useEffect(() => {
    // Wait for dates to load
    if (datesLoading) return

    // Only check once on initial load (not on manual navigation)
    if (hasCheckedInitialDate.current || hasUserNavigated) {
      setReadyToFetchDevotional(true)
      return
    }

    // Mark as checked
    hasCheckedInitialDate.current = true

    // Check if current date has a devotional available
    if (availableDates.size > 0) {
      const currentDateStr = format(currentDate, 'yyyy-MM-dd')
      if (!availableDates.has(currentDateStr)) {
        // Navigate to closest date immediately (don't fetch yet)
        navigateToClosestDate(availableDates)
        // Wait for next render cycle after navigation
        return
      }
    }

    // Current date is valid or no dates available, safe to fetch
    setReadyToFetchDevotional(true)
  }, [datesLoading, availableDates, currentDate, navigateToClosestDate, hasUserNavigated])

  // Fetch devotional only after initial date check is complete
  const shouldFetch = readyToFetchDevotional || hasUserNavigated
  const { devotional, loading: devotionalLoading } = useDevotional(shouldFetch ? currentDate : null)
  const loading = devotionalLoading || !readyToFetchDevotional

  const isFutureDate = isAfter(currentDate, today)

  // Check if there are available episodes on immediate next/previous day
  const { hasPreviousDate, hasNextDate } = useMemo(() => {
    if (availableDates.size === 0) {
      return { hasPreviousDate: false, hasNextDate: false }
    }

    const previousDay = format(subDays(currentDate, 1), 'yyyy-MM-dd')
    const nextDay = format(addDays(currentDate, 1), 'yyyy-MM-dd')

    return {
      hasPreviousDate: availableDates.has(previousDay),
      hasNextDate: availableDates.has(nextDay),
    }
  }, [availableDates, currentDate])

  // Update page title with current date
  useEffect(() => {
    const dateStr = format(currentDate, 'd. MMMM yyyy', { locale: sk })
    document.title = `${dateStr} - Chlieb náš každodenný`
  }, [currentDate])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header
        currentDate={currentDate}
        today={today}
        showDatePicker={showDatePicker}
        onPreviousDay={handlePreviousDay}
        onNextDay={handleNextDay}
        onDateSelect={handleDateSelect}
        onToggleDatePicker={toggleDatePicker}
        availableDates={availableDates}
        hasPreviousDate={hasPreviousDate}
        hasNextDate={hasNextDate}
      />

      <main className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {loading || datesLoading ? (
          <LoadingSpinner />
        ) : devotional ? (
          <DevotionalContent devotional={devotional} />
        ) : (
          <EmptyState isFutureDate={isFutureDate} />
        )}
      </main>

      <Footer />
    </div>
  )
}

export default App
