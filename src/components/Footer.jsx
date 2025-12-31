import { Link } from 'react-router-dom'

function Footer() {
  // TODO: Update these URLs with your actual podcast links
  const podcastLinks = {
    spotify: 'https://open.spotify.com/show/5MTEMypdAqch4jM79yFbBT?si=b67a5dda1b02462a',
    apple:
      'https://podcasts.apple.com/us/podcast/chlieb-n%C3%A1%C5%A1-ka%C5%BEdodenn%C3%BD/id1865524479',
    pocketcasts:
      'https://pocketcasts.com/podcast/chlieb-n%C3%A1%C5%A1-ka%C5%BEdodenn%C3%BD/953acad0-c8d0-013e-e0ba-0e1ab590d6db',
  }

  return (
    <footer className="mt-20 py-8 border-t border-gray-200">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex flex-col items-center gap-4">
          {/* Podcast Platform Links */}
          <div className="flex items-center gap-4">
            <a
              href={podcastLinks.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#1DB954] smooth-transition"
              aria-label="Počúvajte na Spotify"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
            </a>
            <a
              href={podcastLinks.apple}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#9933CC] smooth-transition"
              aria-label="Počúvajte na Apple Podcasts"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 300 300">
                <path d="M175.7,181.1c-0.4-3.6-1.6-6.2-4-8.6c-4.5-4.7-12.4-7.8-21.7-7.8c-9.3,0-17.2,3-21.7,7.8c-2.3,2.5-3.6,5-4,8.6c-0.8,7-0.3,13,0.5,22.7c0.8,9.2,2.3,21.5,4.2,33.9c1.4,8.9,2.5,13.7,3.5,17.1c1.7,5.6,7.8,10.4,17.5,10.4c9.7,0,15.9-4.9,17.5-10.4c1-3.4,2.1-8.2,3.5-17.1c1.9-12.5,3.4-24.7,4.2-33.9C176.1,194.1,176.5,188.1,175.7,181.1z" />
                <path d="M174.6,130.1c0,13.6-11,24.6-24.6,24.6s-24.6-11-24.6-24.6c0-13.6,11-24.6,24.6-24.6S174.6,116.6,174.6,130.1z" />
                <path d="M149.7,33.2C92.3,33.4,45.3,80,44.5,137.4c-0.6,46.5,29.1,86.3,70.6,100.9c1,0.4,2-0.5,1.9-1.5c-0.5-3.6-1.1-7.2-1.5-10.8c-0.2-1.3-1-2.3-2.1-2.9c-32.8-14.3-55.7-47.2-55.3-85.3c0.5-50,41.3-90.7,91.2-91.1c51.1-0.4,92.8,41,92.8,92c0,37.7-22.8,70.1-55.3,84.4c-1.2,0.5-2,1.6-2.1,2.9c-0.5,3.6-1,7.2-1.5,10.8c-0.2,1.1,0.9,1.9,1.9,1.5c41.1-14.4,70.6-53.6,70.6-99.6C255.5,80.5,208,33.1,149.7,33.2z" />
                <path d="M147.3,68.2c-37.4,1.4-67.4,32.3-67.9,69.7c-0.3,24.6,12,46.4,30.9,59.3c0.9,0.6,2.2-0.1,2.2-1.2c-0.3-4.3-0.3-8.1-0.1-12.1c0.1-1.3-0.4-2.5-1.4-3.4c-11.5-10.8-18.5-26.2-18.1-43.2c0.8-30,24.9-54.4,54.9-55.6c32.6-1.3,59.4,24.9,59.4,57.1c0,16.4-7,31.2-18.1,41.7c-0.9,0.9-1.4,2.1-1.4,3.4c0.2,3.9,0.1,7.7-0.1,12c-0.1,1.1,1.2,1.9,2.2,1.2c18.6-12.7,30.9-34.2,30.9-58.4C220.8,98.9,187.5,66.6,147.3,68.2z" />
              </svg>
            </a>
            <a
              href={podcastLinks.pocketcasts}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#F43E37] smooth-transition"
              aria-label="Počúvajte na Pocket Casts"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 32 32">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M16 32c8.837 0 16-7.163 16-16S24.837 0 16 0 0 7.163 0 16s7.163 16 16 16Zm0-28.444C9.127 3.556 3.556 9.127 3.556 16c0 6.873 5.571 12.444 12.444 12.444v-3.11A9.333 9.333 0 1 1 25.333 16h3.111c0-6.874-5.571-12.445-12.444-12.445ZM8.533 16A7.467 7.467 0 0 0 16 23.467v-2.715A4.751 4.751 0 1 1 20.752 16h2.715a7.467 7.467 0 0 0-14.934 0Z"
                />
              </svg>
            </a>
          </div>

          {/* Contact Link */}
          <div className="text-sm text-gray-500">
            <Link to="/kontakt" className="hover:text-accent smooth-transition">
              Kontakt
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
