import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Vibe-Wale-Engineers/', // Explicit GitHub Pages repository path
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        doctor: path.resolve(__dirname, 'doctor.html'),
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
