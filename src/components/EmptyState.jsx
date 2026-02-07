import { BookIcon } from './icons'

function EmptyState({ isFutureDate, onGoToToday }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-300px)] fade-in text-center px-4">
      <div className="mb-6 p-4 rounded-full bg-chnk-primary-2/40">
        <BookIcon />
      </div>
      <h3 className="text-xl font-display font-bold text-chnk-dark mb-2">
        {isFutureDate ? 'Zamyslenie ešte nie je dostupné' : 'Zamyslenie nenájdené'}
      </h3>
      <p className="text-chnk-dark/60 font-body mb-6">
        {isFutureDate
          ? 'Toto zamyslenie bude dostupné v uvedený deň.'
          : 'Pre tento dátum nie je k dispozícii žiadne zamyslenie.'}
      </p>
      {onGoToToday && (
        <button
          onClick={onGoToToday}
          className="font-display font-bold text-sm px-6 py-2.5 bg-chnk-dark text-white rounded-full hover:bg-chnk-dark/80 smooth-transition cursor-pointer"
        >
          Prejsť na dnešok
        </button>
      )}
    </div>
  )
}

export default EmptyState
