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

For local dev, create a `.env` file with the same vars as `.env.production`.

## Env vars

All three are public-safe values, committed in `.env.production` — Vite bakes them into the JS at build time:

| Var | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project REST endpoint |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key (safe to expose, RLS enforces access) |
| `VITE_N8N_BASE_URL` | n8n instance URL |

## Deploy

Push to `main` — Cloudflare Pages auto-deploys.

## Security

Supabase anon key is designed to be public. Data access is enforced server-side by the `get_canvas` RPC function which validates username/password. No sensitive credentials ever reach the browser.

## Contact

dev@w57th.agency
