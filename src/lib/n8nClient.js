const N8N_BASE = import.meta.env.VITE_N8N_BASE_URL;

export async function getPreviewUrls(items) {
  // items: [{ driveId, source_id }]
  const res = await fetch(`${N8N_BASE}/webhook/preview-batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error(`preview-batch failed: ${res.status}`);
  return res.json(); // { source_id: previewUrl }
}

export async function getPreviewUrlSingle(driveId, source_id) {
  const res = await fetch(`${N8N_BASE}/webhook/preview-single`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ driveId, source_id }),
  });
  if (!res.ok) throw new Error(`preview-single failed: ${res.status}`);
  return res.json(); // { getUrl }
}

export async function vectorSearch(query) {
  const res = await fetch(`${N8N_BASE}/webhook/optic-query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`vector-search failed: ${res.status}`);
  return res.json(); // [{ source_id, title, summary, score }, ...]
}
