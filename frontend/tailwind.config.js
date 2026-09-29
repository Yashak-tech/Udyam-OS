/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        udyam: {
          bg: '#080C16',
          card: '#0F172A',
          cardBorder: '#1E293B',
          accent: '#38BDF8',
          primary: '#10B981',
          gold: '#F59E0B',
          danger: '#EF4444',
          text: '#F8FAFC',
          muted: '#94A3B8',
          dim: '#64748B'
        }
      }
    },
  },
  plugins: [],
}
