/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        deep: '#0A0E14',
        card: '#141B24',
        cyan: {
          DEFAULT: '#00D9FF',
          glow: 'rgba(0, 217, 255, 0.35)',
        },
        amber: {
          DEFAULT: '#FF9F1C',
          glow: 'rgba(255, 159, 28, 0.35)',
        },
        bodyText: '#B8C2CC',
      },
      fontFamily: {
        title: ['Space Grotesk', 'sans-serif'],
        body: ['Be Vietnam Pro', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'cyan-glow': '0 0 24px rgba(0, 217, 255, 0.35), 0 0 48px rgba(0, 217, 255, 0.15)',
        'amber-glow': '0 0 24px rgba(255, 159, 28, 0.35)',
      },
    },
  },
  plugins: [],
}
