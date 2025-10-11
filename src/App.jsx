import { useEffect } from 'react'
import { isAfter, format } from 'date-fns'
import { sk } from 'date-fns/locale'
import { useDevotional } from './hooks/useDevotional'
import { useDateNavigation } from './hooks/useDateNavigation'
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

  const isFutureDate = isAfter(currentDate, today)

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
