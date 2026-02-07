import { Link } from 'react-router-dom'
import Footer from './Footer'

function Contact() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1146px] mx-auto px-4 md:px-[30px] py-8">
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

        <div className="border-[5px] border-chnk-dark rounded-4xl p-8 md:p-[50px] space-y-6">
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
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Contact
