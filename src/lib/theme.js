// ============================================================
// DEV CONTROLS — Visual theme for the Optic Nerve graph UI
// Change values here to affect entity colors, emojis, file
// icons, node sizes, and graph behavior.
//
// Color reference:
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

// ── Entity emoji transparency ─────────────────────────────
// 0 = invisible, 1 = fully opaque
export const ENTITY_EMOJI_OPACITY = 0.5;

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
export const GLOW = {
  baseRadius: 1,       // default: 6
  opacity: 0.6,       // default: 0.25 — glow transparency (0=invisible, 1=solid)
};

// ── Entity node size by edge_count tiers ──────────────────
export const ENTITY_SIZE_TIERS = [
  { max: 5,  size: 6  },  // default: 6
  { max: 15, size: 7  },  // default: 9
  { max: 30, size: 8  },  // default: 13
  { max: Infinity, size: 9},  // default: 17
];

// ── File type icons (matched against file_type prefix) ────
// Order matters: first match wins. Supports MIME and extension matching.
export const FILE_ICON = {
  'application/pdf':                '📋',
  '.pdf':                           '📋',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  '.docx':                          '📝',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':       '📉',
  '.xlsx':                          '📉',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📊',
  '.pptx':                          '📊',
  'text/':                          '📝',
  '.txt':                           '📝',
  'image/':                         '🖼️',
  '.jpg':                           '🖼️',
  '.jpeg':                          '🖼️',
  '.png':                           '🖼️',
  'video/':                         '📽️',
  '.mp4':                           '📽️',
  '.mov':                           '📽️',
  'audio/':                         '🎵',
  '.mp3':                           '🎵',
  'message/':                       '💬',
  '.eml':                           '📧',
  'ntn':                            '📓',
};

// ── Default fallback icon ─────────────────────────────────
export const FILE_ICON_DEFAULT = '📎';

// ── File label styling (on graph nodes) ───────────────────
export const FILE_LABEL = {
  color: '#0f0',      // light green
  fontSize: 18,       // font size for both type and title
  typePrefix: '',     // optional prefix before file_type text
};

// ── Node display sizes ────────────────────────────────────
export const NODE_SIZE = {
  fileEmoji:   8,
  entityEmoji: 9,
};

// ── Link line styling ─────────────────────────────────────
export const LINK = {
  mentionWidth:  0.7,
  linkWidth:     2,
  mentionColor:  '#94f', // purple #94f gray #555
  linkColor:     '#ff6ec7', // pink
  particleSpeed: 0.004,
};

// ── Graph physics ─────────────────────────────────────────
export const PHYSICS = {
  alphaDecay:    0.02,
  velocityDecay: 0.3,
  linkDistance:  80,
  warmupTicks:   100,
  orphanRadius:  1,   // initial cluster radius for orphaned nodes
};

// ── Logo ──────────────────────────────────────────────────
// Place logo.png in optic-nerve-ui/public/logo.png
// The UI displays it inline with the header title.
// If the file is absent, the browser shows a small broken-icon — no crash.

// ── Resizable panel (left column) ─────────────────────────
// Values are percentage of total width (0-100)
export const PANEL = {
  defaultSize: 26,   // default: 26 — initial left column width (~380px at 1440px)
  minSize:     15,   // default: 15 — narrowest allowed (~216px at 1440px)
  maxSize:     50,   // default: 50 — widest allowed (~720px at 1440px)
};
