# Optic Nerve VK™

**visual kernel** — a knowledge graph UI that maps files, entities, and relationships from OneDrive and Notion into an interactive 3D mind map.

Built with React + Vite, deployed on Cloudflare Pages via GitHub Actions.

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

For local dev, create a `.env` file with:

| Var | Purpose |
|---|---|
| `VITE_N8N_BASE_URL` | n8n instance URL |

Supabase credentials are handled server-side via Cloudflare Pages Functions — not needed in the client bundle.

## Env vars (production)

**Cloudflare Dashboard → Variables and Secrets:**

| Var | Purpose |
|---|---|
| `VITE_N8N_BASE_URL` | n8n instance URL (build-time) |
| `SUPABASE_URL` | Supabase project REST endpoint (server-side only, no `VITE_` prefix) |
| `SUPABASE_ANON_KEY` | Supabase anon key (server-side only, no `VITE_` prefix) |

## Deploy

Push to `main` — Cloudflare Pages auto-deploys.

## Security

Supabase URL and anon key live server-side in a Cloudflare Pages Function proxy. The browser never calls Supabase directly — only `/api/login` on its own domain. No sensitive credentials are exposed in the client bundle.

## Contact

dev@w57th.agency
