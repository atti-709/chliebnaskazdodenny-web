import { Link } from 'react-router-dom'
import logoFooter from '../assets/logo-footer.svg'
import FooterLinks from './FooterLinks'

function Footer() {
  return (
    <footer className="bg-chnk-dark flex flex-col gap-6 md:gap-10 items-center justify-center px-4 py-12 md:px-[30px] md:py-20 mt-auto">
      {/* Social & Podcast Links */}
      <div className="w-full">
        <FooterLinks />
      </div>

      {/* Copyright, Logo, Contact */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-center text-chnk-primary/80">
        <p className="font-display font-bold text-sm md:text-base text-center">
          &copy; {new Date().getFullYear()} IN Network Slovakia
        </p>

        <div className="h-[32px] md:h-[40px] w-auto">
          <img src={logoFooter} alt="ChNK Logo" className="h-full w-auto" />
        </div>

        <Link
          to="/kontakt"
          className="font-display font-bold text-sm md:text-base text-chnk-primary text-center hover:text-white smooth-transition"
        >
          Kontakt
        </Link>
      </div>
    </footer>
  )
}

export default Footer
