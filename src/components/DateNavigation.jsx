import { format } from 'date-fns'
import { sk } from 'date-fns/locale'
import dateSelectorBg from '../assets/date-selector-bg.svg'

function DateNavigation({
  currentDate,
  isToday: _isToday,
  onPreviousDay,
  onNextDay,
  onToggleDatePicker,
  hasPreviousDate,
  hasNextDate,
  episodeNumber,
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2 md:px-[30px] md:py-[10px]">
      {/* Episode number - left */}
      <div className="w-[50px] md:w-[120px] shrink-0">
        {episodeNumber && (
          <p className="font-body text-sm md:text-base text-chnk-dark text-center">
            #{episodeNumber}
          </p>
        )}
      </div>

      {/* Date selector - center */}
      <div className="relative flex items-center justify-center h-[36px] md:h-[42px] w-[220px] md:w-[280px]">
        {/* Parallelogram background */}
        <img
          src={dateSelectorBg}
          alt=""
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
        />

        {/* Navigation controls */}
        <div className="relative z-10 flex items-center justify-between w-[180px] md:w-[230px]">
          <button
            onClick={onPreviousDay}
            disabled={!hasPreviousDate}
            className={`p-1 smooth-transition ${
              hasPreviousDate ? 'cursor-pointer opacity-100' : 'opacity-30 cursor-not-allowed'
            }`}
            aria-label="Previous day"
          >
            <svg
              className="w-[14px] h-[18px] md:w-[18px] md:h-[24px] rotate-180"
              viewBox="0 0 24.8155 32.3885"
              fill="none"
            >
              <path
                d="M0 0H8.45045L20.5932 12.1427L22.825 14.3805L24.8155 16.3709L8.79789 32.3885H0.34744L16.365 16.365L0 0Z"
                fill="#EAEAEA"
              />
            </svg>
          </button>

          <button
            onClick={onToggleDatePicker}
            data-datepicker-toggle
            className="font-body text-sm md:text-base text-chnk-neutral text-center smooth-transition hover:opacity-80 cursor-pointer"
          >
            {format(currentDate, 'd. MMMM', { locale: sk })}
          </button>

          <button
            onClick={onNextDay}
            disabled={!hasNextDate}
            className={`p-1 smooth-transition ${
              hasNextDate ? 'cursor-pointer opacity-100' : 'opacity-30 cursor-not-allowed'
            }`}
            aria-label="Next day"
          >
            <svg
              className="w-[14px] h-[18px] md:w-[18px] md:h-[24px]"
              viewBox="0 0 24.8155 32.3885"
              fill="none"
            >
              <path
                d="M0 0H8.45045L20.5932 12.1427L22.825 14.3805L24.8155 16.3709L8.79789 32.3885H0.34744L16.365 16.365L0 0Z"
                fill="#EAEAEA"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Year - right */}
      <div className="w-[50px] md:w-[120px] shrink-0">
        <p className="font-body text-sm md:text-base text-chnk-dark text-center">
          {format(currentDate, 'yyyy')}
        </p>
      </div>
    </div>
  )
}

export default DateNavigation
