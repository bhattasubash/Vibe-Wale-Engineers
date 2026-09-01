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
          surface: '#FFFFFF',    // rgb(255, 255, 255) Pure white
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
        sans: ['"Open Sans"', '"Noto Sans Devanagari"', 'Arial', 'Helvetica', 'sans-serif'],
      },
      borderRadius: {
        'kiosk-sm': '4px',
        'kiosk-md': '8px',
        'kiosk-lg': '12px',
        'kiosk-btn': '8px',
      },
      boxShadow: {
        'kiosk-panel': '0 2px 8px rgba(10, 45, 101, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'kiosk-btn': '0 4px 12px rgba(10, 45, 101, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
