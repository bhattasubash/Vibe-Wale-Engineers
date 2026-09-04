import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        abdm: {
          blue: '#0B5FA5',         // ABDM/CoWIN Trust Blue (Primary Brand)
          blueDark: '#084B83',     // Active/Hover Blue
          blueLight: '#E8F1F8',    // Soft Blue Tint
          saffron: '#E07B1A',      // National Tricolor Accent (Used sparingly)
          saffronLight: '#FFF4EB',
          ayushGreen: '#186036',   // AYUSH Muted Dark Green (WCAG AA & AAA >6.3:1 contrast)
          ayushGreenLight: '#EDF7F1',
          canvas: '#EAEDF0',       // Neutral Pale Grey Canvas
          surface: '#FFFFFF',      // Pure White Surface
          border: '#CED4DA',       // Clean 1px NIC Border
          textPrimary: '#212529',  // Dark Text
          textMuted: '#495057',    // Secondary Text
          textLight: '#6C757D',
        },
        status: {
          success: '#15803D',
          successBg: '#F0FDF4',
          danger: '#DC2626',
          dangerBg: '#FEF2F2',
          warning: '#D97706',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans"', '"Noto Sans Devanagari"', 'Arial', 'Helvetica', 'sans-serif'],
      },
      borderRadius: {
        'kiosk-sm': '2px',
        'kiosk-md': '3px',
        'kiosk-lg': '4px',
      },
      boxShadow: {
        'none': 'none',
      },
    },
  },
  plugins: [],
};

export default config;
