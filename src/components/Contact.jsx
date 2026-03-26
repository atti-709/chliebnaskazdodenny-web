import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Footer from './Footer'
import logoHeader from '../assets/logo-header.svg'
import qrDonate from '../assets/qr-donate.svg'

function Contact() {
  useEffect(() => {
    if (window.location.hash === '#podporte-nas') {
      const el = document.getElementById('podporte-nas')
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50">
        <div className="bg-chnk-dark flex items-center justify-between px-3 py-3 md:px-[30px] md:py-[16px]">
          <a href="/" className="h-[28px] md:h-[40px] shrink-0">
            <img alt="ChNK Logo" className="h-full w-auto" src={logoHeader} />
          </a>
          <a href="/" className="font-display font-bold text-base md:text-2xl text-chnk-primary text-center leading-tight no-underline">
            Chlieb náš každodenný
          </a>
          <div className="w-[28px] md:w-[40px] shrink-0" />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <Link
          to="/"
          className="inline-flex items-center text-chnk-dark hover:text-chnk-dark/70 smooth-transition mb-8 font-body"
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

        <h1 className="text-4xl font-display font-bold text-chnk-dark mb-8">Kontakt</h1>

        <div className="border-l-[4px] border-chnk-dark bg-chnk-primary-2/30 rounded-r-2xl md:rounded-r-3xl p-8 md:p-[50px] space-y-6">
          <div>
            <h2 className="text-xl font-display font-bold text-chnk-dark mb-4">Licencia obsahu</h2>
            <p className="text-chnk-dark font-body">
              &copy; Our Daily Bread Ministries, Grand Rapids, MI, USA
            </p>
          </div>

          <div className="border-t border-chnk-dark/20 pt-6">
            <h2 className="text-xl font-display font-bold text-chnk-dark mb-4">
              Slovenské vydanie
            </h2>
            <div className="space-y-2 text-chnk-dark font-body">
              <p className="font-medium">IN Network Slovakia, n.o.</p>
              <p>Sokolská 12, 984 01 Lučenec</p>
              <p>
                <span className="font-medium">Tel. / WhatsApp:</span>{' '}
                <a
                  href="tel:+421907169875"
                  className="text-chnk-dark underline hover:text-chnk-dark/70 smooth-transition"
                >
                  +421 907 169 875
                </a>
              </p>
              <p>
                <span className="font-medium">E-mail:</span>{' '}
                <a
                  href="mailto:innetwork.sk@gmail.com"
                  className="text-chnk-dark underline hover:text-chnk-dark/70 smooth-transition"
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
                  className="text-chnk-dark underline hover:text-chnk-dark/70 smooth-transition"
                >
                  innetwork.sk
                </a>
              </p>
              <p>Publikáciu si môžete objednať písomne, telefonicky alebo emailom.</p>
            </div>
          </div>

          <div id="podporte-nas" className="border-t border-chnk-dark/20 pt-6">
            <h2 className="text-xl font-display font-bold text-chnk-dark mb-4">
              Podporte nás
            </h2>
            <div className="space-y-4 text-chnk-dark font-body">
              <p>
                Naša nezisková organizácia je plne prevádzkovaná z dobrovoľných
                darov a príspevkov jednotlivcom, či organizácií. Môžete podporiť
                našu činnosť zaslaním finančného daru na účet:
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img
                  src={qrDonate}
                  alt="QR kód pre darovanie"
                  className="w-[120px] h-[120px] rounded-xl border-2 border-chnk-dark"
                />
                <div className="leading-relaxed">
                  <p>
                    <span className="font-medium">IBAN:</span>{' '}
                    SK15 5600 0000 0060 1444 0004
                  </p>
                  <p>
                    <span className="font-medium">BIC:</span>{' '}
                    KOMASK2X
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Contact
