/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          500: '#ff385c', // Signature StayNest Rose
          600: '#e00b41',
          700: '#be123c',
        },
        staynest: {
          primary: '#FF385C',
          dark: '#222222',
          gray: '#717171',
          light: '#F7F7F7',
          border: '#DDDDDD'
        }
      },
    },
  },
  plugins: [],
};
