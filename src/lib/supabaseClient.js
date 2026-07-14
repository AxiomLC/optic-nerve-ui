import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function checkConfig() {
  if (!SUPABASE_URL) throw new Error(
    'Missing env var VITE_SUPABASE_URL. ' +
    'Set it in Cloudflare Pages → Settings → Environment Variables → Build, then re-deploy.'
  );
  if (!SUPABASE_ANON_KEY) throw new Error(
    'Missing env var VITE_SUPABASE_ANON_KEY. ' +
    'Set it in Cloudflare Pages → Settings → Environment Variables → Build, then re-deploy.'
  );
}

let _supabase = null;
function getSupabase() {
  if (!_supabase) {
    checkConfig();
    _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _supabase;
}

export async function getCanvas(username, password) {
  const { data, error } = await getSupabase().rpc('get_canvas', { username, password });
  if (error) throw error;
  return data; // { files: [...], entities: [...], edges: [...] }
}

export function getSupabaseClient() {
  return getSupabase();
}
