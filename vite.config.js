import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Build-time env check — visible in GitHub Actions build logs
console.log('[build] VITE_N8N_BASE_URL:', process.env.VITE_N8N_BASE_URL ? 'SET' : 'MISSING');
console.log('[build] SUPABASE_URL + SUPABASE_ANON_KEY: set server-side via CF Dashboard runtime vars');

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
