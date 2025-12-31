import { Link } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

function Contact() {
  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center text-accent hover:text-accent-dark smooth-transition mb-8"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Späť na úvod
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Kontakt</h1>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Licencia obsahu</h2>
            <p className="text-gray-700">© Our Daily Bread Ministries, Grand Rapids, MI, USA</p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Slovenské vydanie</h2>
            <div className="space-y-2 text-gray-700">
              <p className="font-medium">IN Network Slovakia, n.o.</p>
              <p>Sokolská 12, 984 01 Lučenec</p>
              <p>
                <span className="font-medium">Tel.:</span>{' '}
                <a
                  href="tel:+421907169875"
                  className="text-accent hover:text-accent-dark smooth-transition"
                >
                  +421 907 169 875
                </a>
              </p>
              <p>
                <span className="font-medium">E-mail:</span>{' '}
                <a
                  href="mailto:innetwork.sk@gmail.com"
                  className="text-accent hover:text-accent-dark smooth-transition"
                >
                  innetwork.sk@gmail.com
                </a>
              </p>
              <p>
                <span className="font-medium">Web:</span>{' '}
                <a
                  href="https://innetwork.sk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-dark smooth-transition"
                >
                  innetwork.sk
                </a>
              </p>
              <p>Publikáciu si môžete objednať písomne, telefonicky alebo emailom.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Contact
