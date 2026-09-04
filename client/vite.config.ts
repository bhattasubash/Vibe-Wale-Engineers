import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || (process.env.GITHUB_PAGES === 'true' ? '/Vibe-Wale-Engineers/' : '/'),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
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
}));
