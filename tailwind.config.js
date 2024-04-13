/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/ui/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse-strong': 'pulse-strong 3s cubic-bezier(0, 0, 0, 1.5) infinite;'
      },
      keyframes: {
        'pulse-strong': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.25 },
        }
      },
      colors: {
        // 'gray': '#FFFFFF'
      }
    },
  },
  plugins: [],
  darkMode: 'media'
}

