/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
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
      },
    },
  },
  plugins: [],
};
