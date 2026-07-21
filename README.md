# Optic Nerve VK™

**visual kernel** — a knowledge graph UI that maps files, entities, and relationships from OneDrive and Notion into an interactive 3D mind map.

Built with React + Vite, deployed on Cloudflare Pages via GitHub Actions.

## Stack

- **Frontend:** React, react-force-graph-3d, react-markdown
- **Backend:** n8n (OneDrive/Notion ingestion, LLM analysis, vector embeddings)
- **Database:** Postgres (pgvector) via Supabase
- **Hosting:** Cloudflare Pages

## App Flow

- **Initial run** — no OneDrive delta link, no Notion poll timestamp. n8n fetches all files from root, populates `optic_delta_link` table with delta tokens and `notion_last_poll` timestamp for subsequent incremental pulls.
- **OneDrive delta fetch** — weekly cron hits Graph API delta endpoint. New/changed files pass through hash dedup (`optic_hash`), then downloaded in parallel (6 concurrent, 30s timeout) and converted to Markdown via Python MarkItDown (single batch for all docs, O(1) Python startup). Dept/tier extracted from OneDrive folder naming convention (`Dept_Tier_X`).
- **Route split** — files route into three parallel ingest legs by type: **Docs** (Office docs + Notion `.ntn`), **Images** (JPG, PNG, etc.), **Videos** (MP4, MOV, etc.). Docs and Images use direct Gemini analysis; Videos run two parallel sub-legs (frames via ffmpeg scene detection + audio via Whisper STT) then merge for unified GPT-4o-mini review.
- **LLM analysis** — Gemini 2.5 Flash Lite (fallback to 3.1 Flash Lite on 503) extracts structured JSON: `{ summary, entities[{canonical_name, entity_type}], edges[{entity_canonical_name, edge_type, action, event_date}] }`. Entity types: person, org, place, project, product, document, event, thing. Edge types: core (central subject), link (specific action), mention (incidental). With `is_named_entity` boolean for filtering generic vs. named entities.
- **Video processing** — ffmpeg cuts video into frames (interval mode for <3min, scene-detect for ≥3min). Frames analyzed by Gemini; audio extracted per-frame, sent to Groq Whisper-large-v3-turbo for STT. Results merged and reconciled by GPT-4o-mini into one unified summary/entities/edges set, capped at 7 entities / 10 edges.
- **Vector DB ingest** — embeddings generated via OpenAI text-embedding-3-small (batched 15). Upsert into `optic_file` (ON CONFLICT source_id), then entities into `optic_entity` (dedup by canonical_name + entity_type), then edges into `optic_edge` (ON CONFLICT DO NOTHING). Orphan entities deleted via edge_count recomputation.
- **Thumbnail creation** — for images and videos, ffmpeg resizes to 500×500, uploaded to Supabase Storage bucket `optic_thumb/`, and `thumb_url` written back to `optic_file`.
- **UI login** — user enters username/password → Supabase RPC `get_canvas` returns scoped graph data filtered by user's `optic_user_scope` (dept/tier matrix). Session cached in `localStorage` for instant restore on browser refresh, with background re-fetch for fresh data.
- **UI — 3D mind map** — react-force-graph-3d renders files and entities as Three.js custom sprites (feathered glow + composite label with lucide icons). Color-coded by entity type, sized by connection count, with per-type edge styling (core=pink, link=blue, mention=grey). Orphan files placed in a column. Physics configurable via `theme.js` DEV CONTROLS.
- **UI — vector search** — semantic search via n8n `/webhook/optic-query`: embeds query text, calls Supabase `match_documents` RPC for pgvector similarity, returns ranked results to the search panel.
- **UI — voice search agent** — mic button opens voice chat layer. When a search-shaped payload is returned, switches to search results layer. (Mic UI functional, n8n webhook not yet wired.)
- **UI — entity & file viewer** — left panel shows: for entities — type, name, connection count, and clickable list of connected files; for files — summary + Markdown content + thumbnail (for media) or iframe preview (for docs), with Back/Get File/Open File buttons. OneDrive preview URLs fetched batch from n8n, stored ephemerally. Images/videos show thumbnail with overlay instead of broken iframe.

---

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
