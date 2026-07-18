// Optic Nerve — ver 1.0 beta July 2026
// n8n webhook fetch wrappers for preview URLs and vector search.

const N8N_BASE = import.meta.env.VITE_N8N_BASE_URL;

function requireBase() {
  if (!N8N_BASE) throw new Error(
    'Missing env var VITE_N8N_BASE_URL. ' +
    'Set it in Cloudflare Pages → Settings → Environment Variables → Build, then re-deploy.'
  );
}

// =============== 1. Batch Preview URL Fetch ===============
export async function getPreviewUrls(items) {
  requireBase();
  const res = await fetch(`${N8N_BASE}/webhook/preview-batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error(`preview-batch failed: ${res.status}`);
  const text = await res.text();
  console.log('[n8nClient] RAW response:', text.slice(0, 300));
  const data = JSON.parse(text);
  console.log('[n8nClient] Parsed type:', Array.isArray(data) ? 'array[' + data.length + ']' : typeof data);
  // n8n Respond to Webhook wraps in array: [{ previews: {...} }]
  const map = Array.isArray(data) ? data[0] : data;
  console.log('[n8nClient] map keys:', map ? Object.keys(map) : 'null');
  const result = map?.previews || {};
  console.log('[n8nClient] result keys:', Object.keys(result).length);
  return result;
}

// =============== 2. Single-Item Preview Retry (not built yet) ===============
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

// =============== 3. Semantic Vector Search ===============
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
