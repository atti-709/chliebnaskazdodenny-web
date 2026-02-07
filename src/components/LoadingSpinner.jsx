function LoadingSpinner() {
  return (
    <div className="flex flex-col gap-4 justify-center items-center min-h-[calc(100vh-300px)]">
      <svg
        className="w-12 h-12 text-chnk-dark animate-pulse-slow"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Wheat/grain icon */}
        <path
          d="M24 4C24 4 20 12 20 20C20 28 24 36 24 36C24 36 28 28 28 20C28 12 24 4 24 4Z"
          fill="currentColor"
          opacity="0.7"
        />
        <path
          d="M24 12C24 12 18 16 16 22C14 28 16 34 16 34C16 34 22 30 24 24"
          fill="currentColor"
          opacity="0.5"
        />
        <path
          d="M24 12C24 12 30 16 32 22C34 28 32 34 32 34C32 34 26 30 24 24"
          fill="currentColor"
          opacity="0.5"
        />
        <path
          d="M24 36V44"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

export default LoadingSpinner
