import { BookIcon } from './icons'

function EmptyState({ isFutureDate }) {
  return (
    <div className="text-center py-20 fade-in">
      <div className="mb-4">
        <BookIcon />
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
  )
}

export default EmptyState
