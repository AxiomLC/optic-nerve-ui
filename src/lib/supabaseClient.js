import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function missing(name) {
  throw new Error(
    `Missing env var ${name}. ` +
    `Set it in Cloudflare Pages → Settings → Environment Variables ` +
    `under the Build (not Runtime) section, then re-deploy.`
  );
}

if (!SUPABASE_URL) missing('VITE_SUPABASE_URL');
if (!SUPABASE_ANON_KEY) missing('VITE_SUPABASE_ANON_KEY');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getCanvas(username, password) {
  const { data, error } = await supabase.rpc('get_canvas', { username, password });
  if (error) throw error;
  return data; // { files: [...], entities: [...], edges: [...] }
}
