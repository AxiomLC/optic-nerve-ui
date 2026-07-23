# Optic Nerve VK™
**visual kernel** — beta 1.3 · by w57th.agency

A GraphRAG platform that maps corporate files, entities, and relationships into an interactive 3D mind map with pgvector semantic search, hybrid retrieval, and AI voice chat.

---

## Stack

- **Frontend:** React, react-force-graph-3d, react-markdown, Cloudflare Pages (edge-deployed, no server)
- **Backend:** n8n (self-hosted) orchestrates OneDrive/Notion ingestion, LLM analysis, vector embeddings, and AI Voice Chat
- **Database:** Supabase (Postgres + pgvector) — all file data, entity graph, and vector embeddings in one managed service
- **Auth:** Database-backed login with dept/tier scope enforcement — no auth provider needed

---

## Getting started

```bash
npm install
npm run dev
```

For local dev, create a `.env` file with the same vars as `.env.production`.

### Env vars

All three are public-safe values, committed in `.env.production`:

| Var | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project REST endpoint |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key (safe to expose, RLS enforces access) |
| `VITE_N8N_BASE_URL` | n8n instance URL |

### Deploy

Push to `main` — Cloudflare Pages auto-deploys.

### Security

Supabase anon key is designed to be public. Data access is enforced server-side by the `get_canvas` RPC function which validates username/password. No sensitive credentials ever reach the browser.

---
## SUMMARY
## What It Does

Optic Nerve combines a **knowledge graph** with **semantic vector search** in one interface. Every file in your OneDrive and Notion is analyzed, embedded, and connected into a searchable 3D mind map.

An IT manager or department sub-manager can see at a glance which files exist, where they live, who they relate to — all scoped by their login permissions. No more hunting through OneDrive folders or guessing which doc is relevant.

### The MindMap

- **Entity nodes** glow by type (person, org, project, product) with labels and lucide icons — sized by connection count
- **File nodes** show file type, title, and icon — color-coded and glow-styled
- **Edges** show relationships: core (central subject), link (specific action), mention (incidental)
- **Orphaned files** sit in a tidy column so they don't scatter the simulation
- **Physics** — drag, zoom, rotate. Configurable via `theme.js`

### Left Panel

Three layers, one at a time: **Viewer** (entity details + file content with Markdown preview), **Search** (vector search results ranked by similarity), **Voice** (AI Voice Chat — speak or type to Charles).

### Auth & Security

Login via Supabase RPC — results scoped by dept/tier. `all_access` flag for admins. Session cached for instant restore on refresh.

## n8n
### File Ingestion

| Channel | Status |
|---|---|
| **OneDrive** — Delta API + hash dedup (`optic_hash`). Only new/changed files processed. Parallel download + batch MarkItDown. | SOLVED ✅ |
| **Notion** — Biweekly poll via Notion API. Markdown content per page. Same analysis pipeline as OneDrive. | SOLVED ✅ |
| **Google Drive** | Future add-on |

### LLM Analysis

Files route by type into three parallel legs: **Docs** (Gemini → structured JSON), **Images** (Gemini via file URI), **Video** (FFmpeg frames + Whisper STT → GPT-4o-mini reconciliation). All produce `{ summary, entities[], edges[] }`.

### GraphRAG — Knowledge Graph + Vector DB Combined

Each file gets an OpenAI embedding stored in the same row as its metadata. Entities deduplicated. Edges carry dept/tier scoping from the source file. Semantic search (vector) and graph exploration (entities + edges) work from the same data — a hybrid approach with no separate systems to sync.

### AI Voice Chat

Charles (Mistral Small + 20-turn memory) supports vector search ("find the batch records"), web search (Serper with clickable source links), and knowledge base stats ("how many files do we have?"). TTS via Grok API with SpeechSynthesis fallback.

### Utilities Dropdown (future)

An ⚙️ controls panel in the UI will toggle dept/tier filters, file type visibility, and map styling options.

## Contact

dev@w57th.agency
