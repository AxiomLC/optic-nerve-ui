/**
 * Login — calls our own server-side proxy (/api/login)
 * instead of Supabase directly.
 *
 * Supabase credentials never touch the browser.
 */

export async function getCanvas(username, password) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Login failed' }));
    throw new Error(err.error || `Login failed (${res.status})`);
  }

  return res.json(); // { files: [...], entities: [...], edges: [...] }
}
