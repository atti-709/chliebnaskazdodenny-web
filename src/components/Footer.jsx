import { Link } from 'react-router-dom'
import logoFooter from '../assets/logo-footer.svg'
import FooterLinks from './FooterLinks'

function Footer() {
  return (
    <footer className="bg-chnk-dark flex flex-col gap-6 md:gap-10 items-center justify-center px-4 py-10 md:px-[30px] md:py-16">
      {/* Social & Podcast Links */}
      <div className="w-full">
        <FooterLinks />
      </div>

      {/* Copyright, Logo, Contact */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-center">
        <p className="font-display font-bold text-sm md:text-base text-chnk-primary text-center">
          &copy; {new Date().getFullYear()}, IN Network Slovakia
        </p>

        <div className="h-[40px] md:h-[50px] w-auto">
          <img src={logoFooter} alt="ChNK Logo" className="h-full w-auto" />
        </div>

        <Link
          to="/kontakt"
          className="font-display font-bold text-sm md:text-base text-chnk-primary text-center hover:text-white transition-colors duration-300"
        >
          Kontakt
        </Link>
      </div>
    </footer>
  )
}

export default Footer
