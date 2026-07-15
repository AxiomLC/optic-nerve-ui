// ============================================================
// DEV CONTROLS — Visual theme for the Optic Nerve graph UI
// Change values here to affect entity colors, emojis, file
// icons, node sizes, and graph behavior.
// ============================================================

// ── Entity emojis ──────────────────────────────────────────
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

// ── Entity colors (hex) ────────────────────────────────────
export const ENTITY_COLOR = {
  person:   '#4f9',
  org:      '#49f',
  place:    '#f94',
  project:  '#94f',
  product:  '#f49',
  document: '#9f4',
  event:    '#ff4',
  thing:    '#999',
  concept:  '#aaa',
};

// ── File type icons (by file_type prefix) ──────────────────
export const FILE_ICON = {
  'application/pdf':           '📋',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':       '📊',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📽️',
  'text/':                     '📄',
  'image/':                    '🖼️',
  'video/':                    '🎬',
  'audio/':                    '🎵',
  'message/':                  '💬',
  'ntn':                       '📓',  // Notion pages
};

// ── File node fallback color ───────────────────────────────
export const FILE_COLOR = '#888';

// ── Node sizes ─────────────────────────────────────────────
export const NODE_SIZE = {
  fileDefault:      6,
  entityDefault:    8,
  entityMin:        5,   // minimum entity size regardless of edge_count
  entityScale:      1.5, // extra radius per edge_count
};

// ── Link styling ───────────────────────────────────────────
export const LINK = {
  mentionWidth: 0.5,
  linkWidth:    2,
  mentionColor: '#555',
  linkColor:    '#ff6ec7',
  particleSpeed: 0.005,
};

// ── Graph physics ──────────────────────────────────────────
export const PHYSICS = {
  alphaDecay:    0.02,
  velocityDecay: 0.3,
  linkDistance:  80,
  warmupTicks:   100,
};
