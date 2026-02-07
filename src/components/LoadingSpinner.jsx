import logoHeader from '../assets/logo-header.svg'

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-300px)]">
      <img
        src={logoHeader}
        alt=""
        className="w-16 h-16 md:w-20 md:h-20 animate-pulse-slow"
        aria-hidden="true"
      />
    </div>
  )
}

export default LoadingSpinner
