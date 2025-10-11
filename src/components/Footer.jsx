function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-20 py-8 border-t border-gray-200">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <p className="text-sm text-gray-500">© {currentYear} Chlieb náš každodenný</p>
        {/* <div className="mt-4 flex justify-center gap-6 text-sm text-gray-500">
          <a href="#" className="hover:text-accent smooth-transition">
            Ochrana súkromia
          </a>
          <a href="#" className="hover:text-accent smooth-transition">
            Podmienky použitia
          </a>
          <a href="#" className="hover:text-accent smooth-transition">
            Kontakt
          </a>
        </div> */}
      </div>
    </footer>
  )
}

export default Footer
