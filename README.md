# Optic Nerve VK™

**visual kernel** — a knowledge graph UI that maps files, entities, and relationships from OneDrive and Notion into an interactive 3D mind map.

Built with React + Vite, deployed on Cloudflare Pages.

## Stack

- **Frontend:** React, react-force-graph-3d, react-markdown
- **Backend:** n8n (OneDrive/Notion ingestion, LLM analysis, vector embeddings)
- **Database:** Postgres (pgvector) via Supabase
- **Hosting:** Cloudflare Pages

## Getting started

```bash
npm install
npm run dev
```

Requires three environment variables (set in Cloudflare Pages → Settings → Environment Variables or a local `.env` file):

| Var | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project REST endpoint |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key |
| `VITE_N8N_BASE_URL` | n8n instance URL |

## Deploy

Push to `main` — Cloudflare Pages auto-deploys.

## Contact

dev@w57th.agency
