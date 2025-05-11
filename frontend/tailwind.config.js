/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
        secondary: '#10b981',
        expense: '#ef4444',
        income: '#10b981',
        dark: {
          100: '#1e293b', // Fundo principal
          200: '#0f172a', // Componentes (cards)
          300: '#334155', // Bordas e elementos interativos
          400: '#475569', // Texto secundário
        }
      }
    },
  },
  plugins: [],
}