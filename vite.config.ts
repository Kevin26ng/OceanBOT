// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // built-in Node module

export default defineConfig({
  root: './', // your project root
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client'), // map @ to client folder
    },
  },
  server: {
    fs: {
      allow: [
        './frontend',
        './shared',
        './', // allow project root
      ],
    },
  },
});
