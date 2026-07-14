const N8N_BASE = import.meta.env.VITE_N8N_BASE_URL;

function requireBase() {
  if (!N8N_BASE) throw new Error(
    'Missing env var VITE_N8N_BASE_URL. ' +
    'Set it in Cloudflare Pages → Settings → Environment Variables → Build, then re-deploy.'
  );
}

export async function getPreviewUrls(items) {
  requireBase();
  const res = await fetch(`${N8N_BASE}/webhook/preview-batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error(`preview-batch failed: ${res.status}`);
  return res.json();
}

export async function getPreviewUrlSingle(driveId, source_id) {
  requireBase();
  const res = await fetch(`${N8N_BASE}/webhook/preview-single`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ driveId, source_id }),
  });
  if (!res.ok) throw new Error(`preview-single failed: ${res.status}`);
  return res.json();
}

export async function vectorSearch(query) {
  requireBase();
  const res = await fetch(`${N8N_BASE}/webhook/optic-query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`vector-search failed: ${res.status}`);
  return res.json();
}
