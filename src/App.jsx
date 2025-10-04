import { useState, useEffect } from 'react'
import { format, addDays, subDays, parseISO, isAfter, startOfDay } from 'date-fns'

// Mock data - This will be replaced with CMS API calls
const mockDevotionals = {
  '2025-10-04': {
    date: '2025-10-04',
    title: 'Ježiš volá hriešnikov',
    scripture: 'Marek 2:17',
    devotionalText: `
      <p>Boží Syn prišiel na tento svet nie preto, aby sa zaoberal spravodlivými, ale aby hľadal a zachránil stratených. Jeho poslanie nebolo odsúdiť, ale spasiť.</p>
      
      <p>Keď sa farizeji pýtali, prečo Ježiš jedáva s hriešnikmi a celníkmi, Jeho odpoveď bola jasná a plná milosrdenstva: "Nie zdraví potrebujú lekára, ale chorí."</p>
      
      <p>Táto pravda nás dnes povzbudzuje. Nech sme v akomkoľvek stave, Ježiš nás volá k sebe. Nemusíme byť dokonalí, aby sme prišli k Nemu. Práve naša slabosť a naše potreby nás vedú k Jeho milosti.</p>
      
      <p><strong>Modlitba:</strong> Pane Ježišu, ďakujem Ti, že si prišiel kvôli mne, hoci som bol stratený. Pomôž mi dnes kráčať v Tvojej milosti a zdieľať túto lásku s ostatnými. Amen.</p>
    `,
    spotifyEmbedUri: 'https://open.spotify.com/embed/episode/2wKLJXkYV0VgQz4hDfZYD9'
  },
  '2025-10-03': {
    date: '2025-10-03',
    title: 'Večný život v Kristovi',
    scripture: 'Ján 3:16',
    devotionalText: `
      <p>Lebo Boh tak miloval svet, že dal svojho jednorodeného Syna, aby nezahynul nikto, kto v neho verí, ale aby mal večný život.</p>
      
      <p>Tento verš je srdcom evanjelia. Božia láska k nám je taká veľká, že dal to najcennejšie, čo mal - svojho vlastného Syna. Nie kvôli našim zásluhám, ale kvôli svojej nezmernej láske.</p>
      
      <p>Večný život nie je len o budúcnosti v nebi. Je to nový život, ktorý začína teraz, keď prijmeme Ježiša ako svojho Spasiteľa a Pána. Je to život naplnený pokojom, radosťou a nádejou, bez ohľadu na okolnosti.</p>
      
      <p><strong>Zamyslenie:</strong> Už som prijal tento dar večného života? Ak áno, ako sa to prejavuje v mojom každodennom živote?</p>
    `,
    spotifyEmbedUri: 'https://open.spotify.com/embed/episode/3wKLJXkYV0VgQz4hDfZYE0'
  },
  '2025-10-05': {
    date: '2025-10-05',
    title: 'Božia milosť stačí',
    scripture: '2. Korinťanom 12:9',
    devotionalText: `
      <p>"Stačí ti moja milosť, veď moja moc sa dokonale prejavuje v slabosti." Toto boli slová, ktoré Pán povedal apoštolovi Pavlovi, keď sa modlil za odstránenie trápenia.</p>
      
      <p>Často chceme, aby Boh odstránil naše problémy, ale On nám namiesto toho ponúka svoju milosť. Jeho moc sa najlepšie prejavuje práve vtedy, keď sme na konci svojich síl.</p>
      
      <p>Keď si uvedomíme svoju slabosť, otvárame priestor pre Božiu moc. Prestávame sa spoliehať na seba samých a začíname sa spoliehať na Neho. A to je miesto, kde sa dejú zázraky.</p>
      
      <p><strong>Výzva:</strong> Kde vo svojom živote potrebujem dnes prijať Božiu milosť? Ako môžem prestať bojovať vo vlastnej sile a začať sa spoliehať na Jeho moc?</p>
    `,
    spotifyEmbedUri: 'https://open.spotify.com/embed/episode/4wKLJXkYV0VgQz4hDfZYF1'
  }
}

// Helper function to get devotional by date
const getDevotionalByDate = (dateString) => {
  // In production, this would be an API call to the CMS
  // For now, return mock data
  return mockDevotionals[dateString] || null
}

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
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300))
        const dateString = format(currentDate, 'yyyy-MM-dd')
        const data = getDevotionalByDate(dateString)
        setDevotional(data)
      } catch (error) {
        console.error('Error fetching devotional:', error)
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

  const handleDateSelect = (dateString) => {
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
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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
                isToday 
                  ? 'opacity-30 cursor-not-allowed' 
                  : 'hover:bg-gray-100'
              }`}
              aria-label="Next day"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
                  onChange={(e) => handleDateSelect(e.target.value)}
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
              <p className="text-lg text-accent font-medium">
                {devotional.scripture}
              </p>
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
              dangerouslySetInnerHTML={{ __html: devotional.devotionalText }}
              style={{
                lineHeight: '1.8',
              }}
            />
          </article>
        ) : (
          <div className="text-center py-20 fade-in">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-serif text-gray-600 mb-2">
              {isFutureDate ? 'Zamyslenie ešte nie je dostupné' : 'Zamyslenie nenájdené'}
            </h3>
            <p className="text-gray-500">
              {isFutureDate 
                ? 'Toto zamyslenie bude dostupné v uvedený deň.'
                : 'Pre tento dátum nie je k dispozícii žiadne zamyslenie.'
              }
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            © 2025 Chlieb náš každodenný
          </p>
          <div className="mt-4 flex justify-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-accent smooth-transition">Ochrana súkromia</a>
            <a href="#" className="hover:text-accent smooth-transition">Podmienky použitia</a>
            <a href="#" className="hover:text-accent smooth-transition">Kontakt</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

