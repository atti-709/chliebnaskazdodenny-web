/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Rustic', 'Georgia', 'serif'],
        body: ['Arimo', 'system-ui', 'sans-serif'],
        serif: ['Rustic', 'Georgia', 'serif'],
        sans: ['Arimo', 'system-ui', 'sans-serif'],
      },
      colors: {
        'chnk-dark': '#332e21',
        'chnk-primary': '#d7d09a',
        'chnk-primary-2': '#e5e0b5',
        'chnk-neutral': '#eaeaea',
        accent: '#d7d09a',
        'accent-hover': '#c9c188',
      },
      borderRadius: {
        '4xl': '50px',
      },
    },
  },
  plugins: [],
}
