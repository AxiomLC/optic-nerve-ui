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

// ── Entity emoji transparency ─────────────────────────────
// 0 = invisible, 1 = fully opaque
export const ENTITY_EMOJI_OPACITY = 0.5;

// ── Entity glow colors ────────────────────────────────────
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

// ── Entity glow blob ──────────────────────────────────────
export const GLOW = {
  baseRadius: 1,
  opacity: 0.35,
};

// ── Entity size by edge_count tiers ───────────────────────
export const ENTITY_SIZE_TIERS = [
  { max: 5,  size: 3  },
  { max: 15, size: 5  },
  { max: 30, size: 7  },
  { max: Infinity, size: 10 },
];

// ── File type icons ───────────────────────────────────────
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
export const FILE_ICON_DEFAULT = '📎';

// ── File label styling ────────────────────────────────────
export const FILE_LABEL = {
  color: '#0f0',
  fontSize: 20,
};

// ── Node display sizes ────────────────────────────────────
export const NODE_SIZE = {
  fileEmoji:   7,
  entityEmoji: 10,
};

// ── Link styling ──────────────────────────────────────────
export const LINK = {
  mentionWidth:  0.5,
  linkWidth:     2,
  mentionColor:  '#555',
  linkColor:     '#ff6ec7',
  particleSpeed: 0.005,
};

// ── Graph physics ─────────────────────────────────────────
export const PHYSICS = {
  alphaDecay:    0.02,
  velocityDecay: 0.3,
  linkDistance:  80,
  warmupTicks:   100,
  orphanRadius:  0.3,
};

// ── Logo ──────────────────────────────────────────────────
// Place logo.png in optic-nerve-ui/public/logo.png
// Displayed inline with header title via <img src="/logo.png">
