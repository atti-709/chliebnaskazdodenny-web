import { useEffect, useMemo } from 'react'
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
  } = useDateNavigation()

  const { devotional, loading } = useDevotional(currentDate)
  const { availableDates } = useAvailableDates()

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
        {loading ? (
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
