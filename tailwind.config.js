/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      borderRadius: {
        md: 'var(--radius)',
        lg: 'var(--radius)', // Use CSS variable from viplay-ui instead of hardcoded value
      },
    },
  },
  plugins: [],
}
