import { format } from 'date-fns'
import { ChevronLeftIcon, ChevronRightIcon } from './icons'

function DateNavigation({ currentDate, isToday, onPreviousDay, onNextDay, onToggleDatePicker }) {
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={onPreviousDay}
        className="p-2 rounded-full hover:bg-gray-100 smooth-transition"
        aria-label="Previous day"
      >
        <ChevronLeftIcon />
      </button>

      <button
        onClick={onToggleDatePicker}
        className="px-6 py-2 rounded-full bg-accent/10 hover:bg-accent/20 smooth-transition relative"
      >
        <span className="text-sm md:text-base font-medium text-gray-700">
          {format(currentDate, 'd. MMMM yyyy')}
        </span>
      </button>

      <button
        onClick={onNextDay}
        disabled={isToday}
        className={`p-2 rounded-full smooth-transition ${
          isToday ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'
        }`}
        aria-label="Next day"
      >
        <ChevronRightIcon />
      </button>
    </div>
  )
}

export default DateNavigation
