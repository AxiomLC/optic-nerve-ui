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

// ── Entity glow blob ───────────────────────────────────────
export const GLOW = {
  baseRadius: 1,        // minimum radius for glow sphere
  opacity: 0.35,        // transparency of the glow (0-1)
};

// ── Entity size by edge_count tiers ─────────────────────────
// { max: N, size: radius } - node gets first tier where edge_count <= max
export const ENTITY_SIZE_TIERS = [
  { max: 5,  size: 3  },
  { max: 15, size: 5  },
  { max: 30, size: 7 },
  { max: Infinity, size: 10 },
];

// ── File type icons (by mime/extension prefix) ─────────────
export const FILE_ICON = {
  'application/pdf':                                     '📋',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':       '📉',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📊',
  'text/':                     '📄',
  'image/':                    '🖼️',
  'video/':                    '📽️',
  'audio/':                    '🎵',
  'message/':                  '💬',
  'ntn':                       '📓',  // Notion pages
  'eml':                       '📧',  // Email
};

// ── Zoom label thresholds ──────────────────────────────────
// cameraDistance where labels fade in (relative to initial ~200)
export const ZOOM = {
  entityLabelAt: 120,   // entity name visible when camera distance <= this
  fileLabelAt:   80,    // file type + title visible when camera distance <= this
};

// ── Node sizes ─────────────────────────────────────────────
export const NODE_SIZE = {
  fileEmoji:   7,
  entityEmoji: 10,
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
