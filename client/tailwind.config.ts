import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ayush: {
          green: '#1B5E3F',       // Primary AYUSH Forest Green
          greenDark: '#14462F',   // Active / Hover Green
          greenLight: '#E8F3ED',  // Subtle Green tint
          saffron: '#C77A1E',     // Warm Turmeric / Saffron accent
          saffronLight: '#FEF5E7',// Saffron badge background
          navy: '#1F3864',        // Secondary Neutral Navy / Ink
          navyDark: '#0A2D65',    // Deep Ink
          navyLight: '#E8EDF5',   // Navy tint
          canvas: '#EAEDF0',      // Standard government light grey canvas
          surface: '#FFFFFF',     // Pure white
          border: '#CED4DA',      // Crisp 1px NIC border
          textDark: '#212529',
          textMuted: '#495057',
          textLight: '#6C757D',
        },
        status: {
          success: '#15803D',
          successBg: '#F0FDF4',
          danger: '#B91C1C',
          dangerBg: '#FEF2F2',
          warning: '#B45309',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans"', '"Noto Sans Devanagari"', 'Arial', 'Helvetica', 'sans-serif'],
      },
      borderRadius: {
        'kiosk-sm': '2px',
        'kiosk-md': '2px',
        'kiosk-lg': '2px',
        'kiosk-btn': '2px',
      },
      boxShadow: {
        'kiosk-panel': 'none',
        'kiosk-btn': 'none',
      },
    },
  },
  plugins: [],
};

export default config;
