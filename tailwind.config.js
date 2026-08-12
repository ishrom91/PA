/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F2F0EB',
        surface: '#FFFFFF',
        graphite: '#1C1C1E',
        'graphite-secondary': 'rgba(28, 28, 30, 0.55)',
        'graphite-tertiary': 'rgba(28, 28, 30, 0.35)',
        terracotta: '#C05621',
        'terracotta-soft': 'rgba(192, 86, 33, 0.12)',
        olive: '#5A7A52',
        'olive-soft': 'rgba(90, 122, 82, 0.12)',
        paper: 'rgba(28, 28, 30, 0.08)',
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
        float: '0 8px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)',
        nav: '0 -4px 24px rgba(0, 0, 0, 0.06)',
      },
      spacing: {
        safe: 'env(safe-area-inset-bottom, 0px)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
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
