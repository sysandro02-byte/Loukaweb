/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        loukaBlue: '#2563eb',
        loukaViolet: '#7c3aed'
      },
      boxShadow: {
        panel: '0 18px 45px rgba(17, 24, 39, 0.08)'
      }
    }
  },
  plugins: []
};
