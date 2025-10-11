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
}) {
  const isToday = format(currentDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl md:text-3xl font-serif font-light text-center text-gray-800 mb-6">
          Chlieb náš každodenný
        </h1>

        <DateNavigation
          currentDate={currentDate}
          isToday={isToday}
          onPreviousDay={onPreviousDay}
          onNextDay={onNextDay}
          onToggleDatePicker={onToggleDatePicker}
        />

        {showDatePicker && (
          <DatePicker currentDate={currentDate} today={today} onDateSelect={onDateSelect} />
        )}
      </div>
    </header>
  )
}

export default Header
