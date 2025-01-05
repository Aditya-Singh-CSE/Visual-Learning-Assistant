// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#fff7ed',
            100: '#ffedd5',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#f97316',  // Primary orange
            600: '#ea580c',
            700: '#c2410c',
            800: '#9a3412',
            900: '#7c2d12',
          },
          secondary: {
            50: '#fdf2f8',
            100: '#fce7f3',
            200: '#fbcfe8',
            300: '#f9a8d4',
            400: '#f472b6',
            500: '#ec4899',  // Secondary pink
            600: '#db2777',
            700: '#be185d',
            800: '#9d174d',
            900: '#831843',
          },
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
          devanagari: ['Noto Sans Devanagari', 'sans-serif'],
        },
        spacing: {
          '18': '4.5rem',
          '72': '18rem',
          '84': '21rem',
          '96': '24rem',
        },
        borderRadius: {
          'xl': '1rem',
          '2xl': '1.5rem',
          '3xl': '2rem',
        },
        boxShadow: {
          soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
          glow: '0 0 15px rgba(249, 115, 22, 0.5)',
        },
      },
    },
    plugins: [],
  }