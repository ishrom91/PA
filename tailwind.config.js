/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F2F0EB',
          dark: '#1C1C1E',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#2C2C2E',
        },
        graphite: {
          DEFAULT: '#1C1C1E',
          dark: '#F5F5F7',
        },
        'graphite-secondary': {
          DEFAULT: 'rgba(28, 28, 30, 0.55)',
          dark: 'rgba(245, 245, 247, 0.55)',
        },
        'graphite-tertiary': {
          DEFAULT: 'rgba(28, 28, 30, 0.35)',
          dark: 'rgba(245, 245, 247, 0.35)',
        },
        terracotta: '#C05621',
        'terracotta-soft': 'rgba(192, 86, 33, 0.12)',
        'terracotta-soft-dark': 'rgba(224, 120, 72, 0.18)',
        olive: '#5A7A52',
        'olive-soft': 'rgba(90, 122, 82, 0.12)',
        'olive-soft-dark': 'rgba(120, 160, 110, 0.15)',
        paper: {
          DEFAULT: 'rgba(28, 28, 30, 0.08)',
          dark: 'rgba(255, 255, 255, 0.1)',
        },
      },
      fontFamily: {
        sans: ['Onest', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      boxShadow: {
        card: '0 2px 20px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.03)',
        'card-dark': '0 2px 24px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        float: '0 8px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)',
        'float-dark': '0 8px 40px rgba(0, 0, 0, 0.45)',
        nav: '0 -4px 24px rgba(0, 0, 0, 0.06)',
        'nav-dark': '0 -4px 24px rgba(0, 0, 0, 0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        spin: 'spin 0.8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(12px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
