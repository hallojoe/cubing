import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  build: { rollupOptions: { input: { simulator: 'index.html', app: 'app/index.html' } } },
  plugins: [react()],
  base: command === 'build' ? '/cubing/' : '/',
}));
