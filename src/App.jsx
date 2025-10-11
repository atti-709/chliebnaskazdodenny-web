import { useState, useEffect } from 'react'
import { format, addDays, subDays, parseISO, isAfter, startOfDay } from 'date-fns'
import { NotionBlocksRenderer } from './components/NotionBlocksRenderer'
import { getDevotionalByDate } from './api/notion.ts'

function App() {
  const today = startOfDay(new Date())
  const [currentDate, setCurrentDate] = useState(today)
  const [devotional, setDevotional] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDatePicker, setShowDatePicker] = useState(false)

  // Fetch devotional when date changes
  useEffect(() => {
    const fetchDevotional = async () => {
      setLoading(true)
      try {
        const dateString = format(currentDate, 'yyyy-MM-dd')
        const data = await getDevotionalByDate(dateString)
        setDevotional(data)
      } catch (error) {
        console.error('Error fetching devotional from Notion:', error)
        setDevotional(null)
      } finally {
        setLoading(false)
      }
    }

    fetchDevotional()
  }, [currentDate])

  const handlePreviousDay = () => {
    setCurrentDate(prev => subDays(prev, 1))
    setShowDatePicker(false)
  }

  const handleNextDay = () => {
    const nextDate = addDays(currentDate, 1)
    if (!isAfter(nextDate, today)) {
      setCurrentDate(nextDate)
      setShowDatePicker(false)
    }
  }

  const handleDateSelect = dateString => {
    const selectedDate = startOfDay(parseISO(dateString))
    if (!isAfter(selectedDate, today)) {
      setCurrentDate(selectedDate)
      setShowDatePicker(false)
    }
  }

  const isToday = format(currentDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  const isFutureDate = isAfter(currentDate, today)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <h1 className="text-2xl md:text-3xl font-serif font-light text-center text-gray-800 mb-6">
            Chlieb náš každodenný
          </h1>

          {/* Date Navigation */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePreviousDay}
              className="p-2 rounded-full hover:bg-gray-100 smooth-transition"
              aria-label="Previous day"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="px-6 py-2 rounded-full bg-accent/10 hover:bg-accent/20 smooth-transition relative"
            >
              <span className="text-sm md:text-base font-medium text-gray-700">
                {format(currentDate, 'd. MMMM yyyy')}
              </span>
            </button>

            <button
              onClick={handleNextDay}
              disabled={isToday}
              className={`p-2 rounded-full smooth-transition ${
                isToday ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'
              }`}
              aria-label="Next day"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Simple Date Picker */}
          {showDatePicker && (
            <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-lg fade-in">
              <div className="flex flex-col gap-2">
                <label htmlFor="date-input" className="text-sm text-gray-600">
                  Vybrať dátum:
                </label>
                <input
                  id="date-input"
                  type="date"
                  max={format(today, 'yyyy-MM-dd')}
                  value={format(currentDate, 'yyyy-MM-dd')}
                  onChange={e => handleDateSelect(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        ) : devotional ? (
          <article className="fade-in space-y-8">
            {/* Title and Scripture */}
            <div className="text-center space-y-3">
              <h2 className="text-3xl md:text-4xl font-serif font-light text-gray-800">
                {devotional.title}
              </h2>
              <p className="text-lg text-accent font-medium">{devotional.scripture}</p>
            </div>

            {/* Spotify Player */}
            <div className="my-8">
              <iframe
                style={{ borderRadius: '12px' }}
                src={devotional.spotifyEmbedUri}
                width="100%"
                height="152"
                frameBorder="0"
                allowFullScreen=""
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="shadow-md"
              ></iframe>
            </div>

            {/* Devotional Text */}
            <div
              className="prose prose-lg max-w-none font-serif text-gray-700 leading-relaxed"
              style={{
                lineHeight: '1.8',
              }}
            >
              <NotionBlocksRenderer content={devotional.text} />
            </div>
          </article>
        ) : (
          <div className="text-center py-20 fade-in">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-xl font-serif text-gray-600 mb-2">
              {isFutureDate ? 'Zamyslenie ešte nie je dostupné' : 'Zamyslenie nenájdené'}
            </h3>
            <p className="text-gray-500">
              {isFutureDate
                ? 'Toto zamyslenie bude dostupné v uvedený deň.'
                : 'Pre tento dátum nie je k dispozícii žiadne zamyslenie.'}
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">© 2025 Chlieb náš každodenný</p>
          <div className="mt-4 flex justify-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-accent smooth-transition">
              Ochrana súkromia
            </a>
            <a href="#" className="hover:text-accent smooth-transition">
              Podmienky použitia
            </a>
            <a href="#" className="hover:text-accent smooth-transition">
              Kontakt
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
