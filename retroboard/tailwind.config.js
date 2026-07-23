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
          // === BACKGROUNDS ===
          bg: '#F9FAFB',
          'bg-warm': '#FFFBF5',
          card: '#FFFFFF',
          surface: '#F3F4F6',

          // === PRIMARY BRAND (Deep Indigo with personality) ===
          primary: {
            50: '#EEF2FF',
            100: '#E0E7FF',
            400: '#818CF8',
            DEFAULT: '#6366F1',
            500: '#6366F1',
            600: '#4F46E5',
            700: '#4338CA',
          },
          'primary-light': '#EEF2FF',
          'primary-hover': '#4F46E5',

          // === MOOD STATES (più sofisticati) ===
          glad: {
            DEFAULT: '#059669',
            light: '#ECFDF5',
            glow: '#10B981',
          },
          sad: {
            DEFAULT: '#D97706',
            light: '#FFFBEB',
            glow: '#F59E0B',
          },
          mad: {
            DEFAULT: '#DC2626',
            light: '#FEF2F2',
            glow: '#EF4444',
          },

          // === NEUTRALS (improved hierarchy) ===
          text: {
            DEFAULT: '#111827',
            secondary: '#6B7280',
            tertiary: '#9CA3AF',
          },

          border: {
            DEFAULT: '#E5E7EB',
            strong: '#D1D5DB',
          },

          sidebar: '#F1F5F9',
        },

        // === GLASS & PLAY DESIGN SYSTEM ===
        glass: {
          primary: {
            DEFAULT: '#2563EB',
            light: '#3B82F6',
          },
          cta: '#F97316',
          vibrant: {
            glad: '#10B981',
            mad: '#EF4444',
            purple: '#8B5CF6',
            yellow: '#F59E0B',
            blue: '#2563EB',
          },
        },
      },
      boxShadow: {
        'soft': '0 1px 2px 0 rgb(0 0 0 / 0.05), 0 1px 3px 0 rgb(0 0 0 / 0.08)',
        'card': '0 2px 4px 0 rgb(0 0 0 / 0.06), 0 4px 12px 0 rgb(0 0 0 / 0.08)',
        'card-hover': '0 8px 16px 0 rgb(0 0 0 / 0.12), 0 2px 6px 0 rgb(0 0 0 / 0.08)',
        'float': '0 12px 32px 0 rgb(0 0 0 / 0.16)',
        'primary': '0 4px 16px 0 rgb(99 102 241 / 0.4)',
        'glad': '0 4px 12px 0 rgb(5 150 105 / 0.3)',
        'mad': '0 4px 12px 0 rgb(220 38 38 / 0.3)',
      },
      borderRadius: {
        '2xl': '16px',
      },
      fontFamily: {
        sans: ['Open Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
        display: ['Righteous', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
