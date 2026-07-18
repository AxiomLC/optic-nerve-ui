// Optic Nerve — ver 1.0 beta July 2026
// Supabase client singleton and RPC call to fetch scoped graph canvas.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =============== 1. Fetch Canvas (Supabase RPC) ===============
export async function getCanvas(username, password) {
  const { data, error } = await supabase.rpc('get_canvas', { username, password });
  if (error) throw error;
  return data; // { files: [...], entities: [...], edges: [...] }
}
