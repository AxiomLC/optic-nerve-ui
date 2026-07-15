// ============================================================
// DEV CONTROLS — Visual theme for the Optic Nerve graph UI
// Change values here to affect entity colors, emojis, file
// icons, node sizes, and graph behavior.
//
// Color reference (shown as hex in most editors):
//   #4f9 = mint green   #49f = sky blue   #f94 = orange
//   #94f = purple       #f49 = pink       #9f4 = lime
//   #ff4 = yellow       #999 = grey       #aaa = light grey
// ============================================================

// ── Entity emojis (shown on graph nodes) ──────────────────
export const ENTITY_EMOJI = {
  person:   '👤',
  org:      '🏢',
  place:    '📍',
  project:  '🚀',
  product:  '💼',
  document: '📄',
  event:    '🎪',
  thing:    '💡',
  concept:  '💡',
};

// ── Entity glow colors (hex) ──────────────────────────────
export const ENTITY_COLOR = {
  person:   '#4f9',   // mint green
  org:      '#49f',   // sky blue
  place:    '#f94',   // orange
  project:  '#94f',   // purple
  product:  '#f49',   // pink
  document: '#9f4',   // lime
  event:    '#ff4',   // yellow
  thing:    '#999',   // grey
  concept:  '#aaa',   // light grey
};

// ── Entity glow blob radius multiplier ────────────────────
// Actual radius = ENTITY_SIZE_TIERS[size] * GLOW.baseRadius
export const GLOW = {
  baseRadius: 1,       // default: 6 — minimum glow sphere radius
  opacity: 0.35,       // default: 0.25 — glow transparency (0=invisible, 1=solid)
};

// ── Entity node size by edge_count tiers ──────────────────
// { max: N, size: radius } — node matches first tier where edge_count <= max
export const ENTITY_SIZE_TIERS = [
  { max: 5,  size: 3  },  // default: 1-5  connections → size 6
  { max: 15, size: 5  },  // default: 6-15 connections → size 9
  { max: 30, size: 7 },  // default: 16-30 connections → size 13
  { max: Infinity, size: 10 },  // default: 31+  connections → size 17
];

// ── File type icons (matched against file_type prefix) ────
// Order matters: first match wins (e.g. "text/html" matches "text/" before "html")
export const FILE_ICON = {
  'application/pdf':                '📋',   // clipboard — PDFs
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',  // memo — DOCX
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':       '📉',  // chart down — XLSX
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📊',  // chart up — PPTX
  'text/':                          '📝',   // memo — text files, HTML, etc.
  'image/':                         '🖼️',  // framed picture — images
  'video/':                         '📽️',  // film projector — videos
  'audio/':                         '🎵',   // musical note — audio
  'message/':                       '💬',   // speech bubble — email/rfc822
  'ntn':                            '📓',   // notebook — Notion pages
  'eml':                            '📧',   // envelope — .eml files
};

// ── Default fallback icon (when no FILE_ICON entry matches) ──
// Change this if you see a generic icon you don't like
export const FILE_ICON_DEFAULT = '📎';  // paperclip

// ── Node display sizes ────────────────────────────────────
export const NODE_SIZE = {
  fileEmoji:   7,     // default: 7 — emoji size for file nodes
  entityEmoji: 10,    // default: 9 — emoji size for entity nodes (sits on glow)
};

// ── Link line styling ─────────────────────────────────────
export const LINK = {
  mentionWidth:  0.5,       // default: 0.5 — thin line for 'mention' edges
  linkWidth:     2,         // default: 2 — thick line for 'link' edges
  mentionColor:  '#555',    // default: #555 — grey
  linkColor:     '#ff6ec7', // default: #ff6ec7 — pink (matches border)
  particleSpeed: 0.005,     // default: 0.005 — flow particle speed along links
};

// ── Graph physics ─────────────────────────────────────────
export const PHYSICS = {
  alphaDecay:    0.02,   // default: 0.02 — how fast simulation settles (lower = longer)
  velocityDecay: 0.3,    // default: 0.3 — friction (lower = more bounce)
  linkDistance:  80,     // default: 80 — target link length in pixels
  warmupTicks:   100,    // default: 100 — pre-render simulation ticks
};
