// ============================================================
// DEV CONTROLS — Visual theme for the Optic Nerve graph UI
// Change values here to affect entity icons, file icons,
// node colors, sizes, and graph behavior.
// Uses lucide-react for crisp SVG icons.
// ============================================================
//
// Common colors used throughout (some overlap is intentional):
//   #fff = white           — entity labels
//   #ccc = light gray      — entity labels (old)
//   #dfd = light green     — file labels, file icons (near-white)
//   #000 = black           — entity icons
//   #999 = gray            — file glow
//   #4f9 = mint green      — person glow
//   #49f = sky blue        — org glow
//   #f94 = orange          — place glow
//   #94f = purple          — project glow
//   #f49 = pink            — product glow
//   #9f4 = lime            — document glow
//   #ff4 = yellow          — event glow
//   #999 = grey            — thing glow
//   #aaa = light grey      — concept glow
//   #ff6ec7 = hot pink     — 'link' type edges
//   #555  = dark grey      — error/strip backgrounds
//   #ffcc00 = gold         — selected node
//
// ══════════════════════════════════════════════════════════════
// ICONS — Entity and File lucide-react component names
// ══════════════════════════════════════════════════════════════

// ── Entity icon names ──────────────────────────────────────
// Keys: entity_type. Values: lucide-react PascalCase component.
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

// ── File icon names ────────────────────────────────────────
// Keys: file extension (no dot). Values: lucide-react PascalCase.
export const FILE_ICON = {
  pdf:  'FileText',
  docx: 'FileText',
  xlsx: 'Sheet',
  pptx: 'Presentation',
  txt:  'FileText',
  jpg:  'Image',
  jpeg: 'Image',
  png:  'Image',
  mp4:  'Video',
  mov:  'Video',
  mp3:  'Music',
  eml:  'Mail',
  ntn:  'BookOpen',
};
export const FILE_ICON_DEFAULT = 'Paperclip';

// ══════════════════════════════════════════════════════════════
// ENTITY — Per-type glow colors, size tiers, labels, glow
// ══════════════════════════════════════════════════════════════

// ── Entity glow colors (per entity_type) ───────────────────
export const ENTITY_COLOR = {
  person:   '#4f9',  // mint green — person glow
  org:      '#49f',  // sky blue — org glow
  place:    '#f94',  // orange — place glow
  project:  '#94f',  // purple — project glow
  product:  '#f49',  // pink — product glow
  document: '#9f4',  // lime — document glow
  event:    '#ff4',  // yellow — event glow
  thing:    '#999',  // grey — thing glow
  concept:  '#aaa',  // light grey — concept glow
};

// ── Entity size by edge_count tiers ───────────────────────
export const ENTITY_SIZE_TIERS = [
  { max: 5,  size: 5  },
  { max: 15, size: 6  },
  { max: 30, size: 7  },
  { max: Infinity, size: 9 },
];

// ── Entity label + icon styling ───────────────────────────
export const ENTITY_LABEL = {
  top:    { text: 'Entity', color: '#fff', fontSize: 14 },   // "Entity" label (small, above name)
  bottom: { color: '#fff', fontSize: 28 },                     // entity name (bigger)
  icon:   { color: '#000', size: 40, opacity: 1.0, strokeWidth: 1.5 }, // entity icon  // what the hell?
  lineSpacing: 1.6,   // gap between top and bottom lines (multiplier of fontSize)
  iconOffset: -3.5,   // how far below text the icon sits (negative = down)
};

// ── Entity glow (feathered radial gradient sprite) ────────
export const ENTITY_GLOW = {
  baseRadius: 0.8,    // multiplier × entity tier size
  spriteScale: 3,     // world units per radius unit
  featherStart: 0.4,  // where feathering begins (0=fully feathered, 1=solid circle)
  opacity: 1.0,
};

// ══════════════════════════════════════════════════════════════
// FILE — Labels, icon, glow
// ══════════════════════════════════════════════════════════════

// ── File label + icon styling ─────────────────────────────
export const FILE_LABEL = {
  top:    { color: '#dfd', fontSize: 20 },  // file_type line
  bottom: { color: '#dfd', fontSize: 20 },  // file title line
  icon:   { color: '#dfd', size: 30, opacity: 1.0, strokeWidth: 2 }, // file icon  // ??
  lineSpacing: 1.6,   // gap between type and title lines
  iconOffset: -3.0,   // how far below text the icon sits
};

// ── File glow (feathered radial gradient sprite) ──────────
export const FILE_GLOW = {
  radius: 4,          // fixed radius for all file glows
  spriteScale: 3,     // world units per radius unit
  featherStart: 0.4,  // where feathering begins
  color: '#999',      // gray — file glow
  opacity: 1.0,
};

// ══════════════════════════════════════════════════════════════
// NODE / LINK / PHYSICS
// ══════════════════════════════════════════════════════════════

// ── Node display sizes ────────────────────────────────────
export const NODE_SIZE = {
  fileIcon:   7,
  entityIcon: 10,
};

// ── Link styling ──────────────────────────────────────────
export const LINK = {
  mentionWidth:  0.5,
  linkWidth:     2,
  mentionColor:  '#999',       // dark grey — 'mention' edges
  linkColor:     '#ff6ec7',    // hot pink — 'link' edges
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
