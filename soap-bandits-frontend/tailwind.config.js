/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // SoapStandle Brand Palette
        'soap-deep': '#2c3848',
        'soap-steel': '#4a5e74',
        'soap-gold': '#d8ad5c',
      },
    },
  },
  plugins: [],
};
