// ============================================================
// DEV CONTROLS — Visual theme for the Optic Nerve graph UI
// Change values here to affect entity icons, file icons,
// node colors, sizes, and graph behavior.
// Uses lucide-react for crisp SVG icons.
//
// Color reference:
//   #4f9 = mint green   #49f = sky blue   #f94 = orange
//   #94f = purple       #f49 = pink       #9f4 = lime
//   #ff4 = yellow       #999 = grey       #aaa = light grey
// ============================================================

// ── Entity icon names (lucide-react) ──────────────────────
// Maps entity_type → icon component name from lucide-react
export const ENTITY_ICON = {
  person:   'User',
  org:      'Building2',
  place:    'MapPin',
  project:  'Rocket',
  product:  'Package',
  document: 'FileText',
  event:    'Calendar',
  thing:    'Lightbulb',
  concept:  'Brain',
};

// ── Entity icon styling ───────────────────────────────────
// Size in pixels, opacity 0–1
export const ENTITY_ICON_STYLE = {
  size: 28,
  opacity: 0.8,
  strokeWidth: 1.5,
};

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

// ── File type icons (lucide-react) ────────────────────────
// Maps MIME type or extension → icon component name
export const FILE_ICON = {
  'application/pdf':                'FileText',
  '.pdf':                           'FileText',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'FileText',
  '.docx':                          'FileText',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':       'Sheet',
  '.xlsx':                          'Sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'Presentation',
  '.pptx':                          'Presentation',
  'text/':                          'FileText',
  '.txt':                           'FileText',
  'image/':                         'Image',
  '.jpg':                           'Image',
  '.jpeg':                          'Image',
  '.png':                           'Image',
  'video/':                         'Video',
  '.mp4':                           'Video',
  '.mov':                           'Video',
  'audio/':                         'Music',
  '.mp3':                           'Music',
  'message/':                       'Mail',
  '.eml':                           'Mail',
  'ntn':                            'BookOpen',
};
export const FILE_ICON_DEFAULT = 'Paperclip';

// ── File icon styling ────────────────────────────────────
export const FILE_ICON_STYLE = {
  size: 20,
  opacity: 1.0,
  strokeWidth: 2,
};

// ── File label styling ────────────────────────────────────
export const FILE_LABEL = {
  color: '#0f0',
  fontSize: 20,
};

// ── Node display sizes ────────────────────────────────────
export const NODE_SIZE = {
  fileIcon:   7,
  entityIcon: 10,
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
