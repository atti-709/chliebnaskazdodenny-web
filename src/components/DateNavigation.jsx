import { format } from 'date-fns'
import { sk } from 'date-fns/locale'
import { ChevronLeftIcon, ChevronRightIcon } from './icons'

function DateNavigation({
  currentDate,
  isToday: _isToday,
  onPreviousDay,
  onNextDay,
  onToggleDatePicker,
  hasPreviousDate,
  hasNextDate,
}) {
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={onPreviousDay}
        disabled={!hasPreviousDate}
        className={`p-2 rounded-full smooth-transition ${
          hasPreviousDate ? 'hover:bg-gray-100 cursor-pointer' : 'opacity-30 cursor-not-allowed'
        }`}
        aria-label="Previous day"
      >
        <ChevronLeftIcon />
      </button>

      <button
        onClick={onToggleDatePicker}
        data-datepicker-toggle
        className="px-6 py-2 rounded-full bg-accent/10 hover:bg-accent/20 smooth-transition relative"
      >
        <span className="text-sm md:text-base font-medium text-gray-700">
          {format(currentDate, 'd. MMMM yyyy', { locale: sk })}
        </span>
      </button>

      <button
        onClick={onNextDay}
        disabled={!hasNextDate}
        className={`p-2 rounded-full smooth-transition ${
          hasNextDate ? 'hover:bg-gray-100 cursor-pointer' : 'opacity-30 cursor-not-allowed'
        }`}
        aria-label="Next day"
      >
        <ChevronRightIcon />
      </button>
    </div>
  )
}

export default DateNavigation
