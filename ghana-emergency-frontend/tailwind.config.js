/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#221a7f",
        "primary-light": "#443cbd",
        "background-light": "#f6f6f8",
        "background-dark": "#131220",
        "accent-red": "#e11d48",
        "accent-blue": "#2563eb",
        "medical": {
          "main": "#0d9488",
          "light": "#f0fdfa",
        },
        "police": {
          "main": "#1e3a8a",
          "light": "#eff6ff",
        },
        "fire": {
          "main": "#ea580c",
          "light": "#fff7ed",
        }
      },
      fontFamily: {
        "display": ["Public Sans", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}