/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        calm: {
          50: '#f8fafc',
          100: '#f1f5f9',
          600: '#475569',
          700: '#334155'
        }
      }
    }
  },
  plugins: []
};
