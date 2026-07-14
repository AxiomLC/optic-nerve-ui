import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Build-time env check — visible in Cloudflare Pages build logs
console.log('[build] VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING');
console.log('[build] VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
console.log('[build] VITE_N8N_BASE_URL:', process.env.VITE_N8N_BASE_URL ? 'SET' : 'MISSING');

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
