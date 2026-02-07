import { Link } from 'react-router-dom'
import Footer from './Footer'

function Contact() {
  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="max-w-[800px] mx-auto px-4 md:px-[30px] py-12">
        <Link
          to="/"
          className="inline-flex items-center text-chnk-dark hover:text-chnk-dark/70 smooth-transition mb-12 font-body font-medium"
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

        <h1 className="text-4xl md:text-5xl font-display font-bold text-chnk-dark mb-12 text-center">
          Kontakt
        </h1>

        <div className="bg-white shadow-sm rounded-3xl p-8 md:p-12 space-y-8">
          <div>
            <h2 className="text-2xl font-display font-bold text-chnk-dark mb-4">Licencia obsahu</h2>
            <p className="text-chnk-dark/80 font-body leading-relaxed">
              &copy; Our Daily Bread Ministries, Grand Rapids, MI, USA
            </p>
          </div>

          <div className="border-t border-chnk-dark/10 pt-8">
            <h2 className="text-2xl font-display font-bold text-chnk-dark mb-6">
              Slovenské vydanie
            </h2>
            <div className="space-y-3 text-chnk-dark/80 font-body leading-relaxed">
              <p className="font-bold text-chnk-dark">IN Network Slovakia, n.o.</p>
              <p>Sokolská 12, 984 01 Lučenec</p>
              <div className="pt-2 space-y-2">
                <p>
                  <span className="font-medium text-chnk-dark">Tel. / WhatsApp:</span>{' '}
                  <a
                    href="tel:+421907169875"
                    className="text-chnk-dark underline decoration-chnk-primary/50 hover:decoration-chnk-primary smooth-transition"
                  >
                    +421 907 169 875
                  </a>
                </p>
                <p>
                  <span className="font-medium text-chnk-dark">E-mail:</span>{' '}
                  <a
                    href="mailto:innetwork.sk@gmail.com"
                    className="text-chnk-dark underline decoration-chnk-primary/50 hover:decoration-chnk-primary smooth-transition"
                  >
                    innetwork.sk@gmail.com
                  </a>
                </p>
                <p>
                  <span className="font-medium text-chnk-dark">Web:</span>{' '}
                  <a
                    href="https://innetwork.sk/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-chnk-dark underline decoration-chnk-primary/50 hover:decoration-chnk-primary smooth-transition"
                  >
                    innetwork.sk
                  </a>
                </p>
              </div>
              <p className="pt-4 text-sm opacity-80">
                Publikáciu si môžete objednať písomne, telefonicky alebo emailom.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Contact
