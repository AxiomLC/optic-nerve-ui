import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

console.log('[build] VITE_N8N_BASE_URL:', process.env.VITE_N8N_BASE_URL ? 'SET' : 'MISSING');

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
