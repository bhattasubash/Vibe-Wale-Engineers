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
          navy: '#0A2D65',        // rgb(10, 45, 101) - Official Deep AYUSH Navy
          navyDark: '#071F45',    // rgb(7, 31, 69)
          navyLight: '#E8EDF5',   // Soft navy tint
          blue: '#0066CC',       // Action highlight blue
          blueHover: '#0052A3',
          canvas: '#EAEDF0',     // Standard government light grey canvas
          surface: '#FFFFFF',    // Pure white
          border: '#CED4DA',     // Crisp 1px NIC border
          borderDark: '#0A2D65',
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
