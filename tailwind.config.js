/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f6fdf6',
          100: '#e2f7e2',
          200: '#c3edc3',
          300: '#94d894',
          400: '#5cbc5c',
          500: '#3a9f3a',
          600: '#2c822c',
          700: '#266a26',
          800: '#235523',
          900: '#1f471f',
          950: '#0f2a0f',
        },
        cream: {
          50: '#FDFBF7',
          100: '#FAF6F0',
          200: '#F3EDE3',
        },
      },
      boxShadow: {
        soft: '0 4px 24px -4px rgba(15, 23, 42, 0.06), 0 8px 48px -8px rgba(15, 23, 42, 0.08)',
        glow: '0 8px 32px -8px rgba(245, 158, 11, 0.35)',
        'glow-lg': '0 16px 48px -12px rgba(245, 158, 11, 0.4)',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
    },
  },
  plugins: [],
};
