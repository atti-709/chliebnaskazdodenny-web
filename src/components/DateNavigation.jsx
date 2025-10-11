import { format } from 'date-fns'
import { sk } from 'date-fns/locale'
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
        data-datepicker-toggle
        className="px-6 py-2 rounded-full bg-accent/10 hover:bg-accent/20 smooth-transition relative"
      >
        <span className="text-sm md:text-base font-medium text-gray-700 capitalize">
          {format(currentDate, 'd. MMMM yyyy', { locale: sk })}
        </span>
      </button>

      <button
        onClick={onNextDay}
        className="p-2 rounded-full hover:bg-gray-100 smooth-transition"
        aria-label="Next day"
      >
        <ChevronRightIcon />
      </button>
    </div>
  )
}

export default DateNavigation
