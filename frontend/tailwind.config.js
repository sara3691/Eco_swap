/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        eco: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        clay: {
          50: '#faf7f5',
          100: '#f5efeb',
          200: '#e8dcd2',
          300: '#d5c0b0',
          400: '#bda08a',
          500: '#a8866e',
          600: '#95715a',
          700: '#7c5d4b',
          800: '#674e40',
          900: '#564237',
        }
      },
      backgroundImage: {
        'grain': "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}
