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
  const data = await res.json();
  // n8n Respond to Webhook wraps response in array: [{ previews: {...} }]
  const map = Array.isArray(data) ? data[0] : data;
  return map?.previews || {};
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

// =============== 4. Voice Chat (Charles AI agent) ===============
export async function voiceChat(text, sessionId) {
  requireBase();
  const res = await fetch(`${N8N_BASE}/webhook/charles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, sessionId }),
  });
  if (!res.ok) throw new Error(`voice-chat failed: ${res.status}`);
  return res.json();
}
