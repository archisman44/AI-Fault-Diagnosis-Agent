/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark-bg': '#18181B',      // zinc-900
        'brand-surface': '#27272A',     // zinc-800
        'brand-border': '#3F3F46',      // zinc-700
        'brand-text': '#E4E4E7',         // zinc-200
        'brand-text-secondary': '#A1A1AA', // zinc-400
        'brand-primary': '#38BDF8',      // sky-400
        'brand-primary-hover': '#0EA5E9', // sky-500
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.3s ease-out forwards',
      },
    },
  },
  plugins: [
    forms,
    typography,
  ],
}