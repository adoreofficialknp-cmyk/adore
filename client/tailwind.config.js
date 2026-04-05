/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Jost', 'system-ui', 'sans-serif'],
      },
      colors: {
        gold: {
          DEFAULT: '#B8975A',
          light: '#D4AF7A',
          dark: '#9A7B40',
        },
        ink: '#1C1C1E',
      },
    },
  },
  plugins: [],
}
