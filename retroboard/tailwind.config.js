/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        retro: {
          bg: '#F8FAFC',
          'bg-warm': '#FEFCE8',
          card: '#FFFFFF',
          primary: '#6366F1',
          'primary-hover': '#4F46E5',
          'primary-light': '#EEF2FF',
          glad: '#10B981',
          'glad-light': '#ECFDF5',
          sad: '#F59E0B',
          'sad-light': '#FFFBEB',
          mad: '#EF4444',
          'mad-light': '#FEF2F2',
          text: '#0F172A',
          'text-secondary': '#64748B',
          border: '#E2E8F0',
          sidebar: '#F1F5F9',
          surface: '#F8FAFC',
        }
      },
      boxShadow: {
        'soft': '0 1px 2px 0 rgb(0 0 0 / 0.03), 0 1px 3px 0 rgb(0 0 0 / 0.06)',
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 2px 8px 0 rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.08), 0 1px 3px 0 rgb(0 0 0 / 0.04)',
        'float': '0 8px 24px 0 rgb(0 0 0 / 0.12)',
      },
      borderRadius: {
        '2xl': '16px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
