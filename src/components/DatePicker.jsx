import { format } from 'date-fns'

function DatePicker({ currentDate, today, onDateSelect }) {
  return (
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
          onChange={e => onDateSelect(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
    </div>
  )
}

export default DatePicker
