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
//   #555 #444 #333  = dark greys      — error/strip backgrounds
//   #ffcc00 = gold         — selected node
//   #060 = dark green   #004400 dark darker green
//  #001133 = dark navy, #0a0a2e = dark midnight blue
//
// ══════════════════════════════════════════════════════════════
// MAP FONT — applied to all label text on the graph
// ══════════════════════════════════════════════════════════════
// Change fontFamily to any system or webfont. The `sans-serif`
// fallback catches cases where the named font isn't installed.

// ── Map font family ─────────────────────────────────────────
export const MAP_FONT = {
  fontFamily: 'system-ui, sans-serif',  // tried first, falls back to sans-serif if missing
};

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
  { max: 5,  size: 7  },
  { max: 15, size: 8  },
  { max: 30, size: 9  },
  { max: Infinity, size: 10 },
];

// ── Entity label + icon styling ───────────────────────────
export const ENTITY_LABEL = {
  top:    { text: 'Entity', color: '#fff', fontSize: 18, fontWeight: 400 },   // "Entity" label (small, above name); fontWeight 300=light, 400=normal, 700=bold, 900=black
  bottom: { color: '#fff', fontSize: 28, fontWeight: 200 },  // entity name (bigger)
  icon:   { color: '#000', size: 75, opacity: 1.0, strokeWidth: 1.0 }, // icon drawn on same canvas as text; opacity controls alpha; strokeWidth = line thickness (1=thin, 3=bold)
  lineSpacing: 1.6,   // gap between top and bottom lines (multiplier of fontSize)
  iconGap: 1,          // pixels between text bottom and icon top (negative = closer/overlap)
};

// ── Entity glow (feathered radial gradient sprite) ────────
export const ENTITY_GLOW = {
  baseRadius: 0.8,    // multiplier × entity tier size
  spriteScale: 3,     // glow size = radius × spriteScale. Higher = bigger glow ball in 3D space.
  featherStart: 0.4,  // where feathering begins (0=fully feathered, 1=solid circle)
  opacity: 1.0,
};

// ══════════════════════════════════════════════════════════════
// FILE — Labels, icon, glow
// ══════════════════════════════════════════════════════════════

// ── File label + icon styling ─────────────────────────────
export const FILE_LABEL = {
  top:    { color: '#004400', fontSize: 16, fontWeight: 100 },  // #060 dark green; fontWeight 300=light, 400=normal, 700=bold, 900=black
  bottom: { color: '#fff', fontSize: 20, fontWeight: 50 },  // file title line
  icon:   { color: '#004400', size: 40, opacity: 1.0, strokeWidth: 1.0 },   // line thickness (1=thin, 3=bold); opacity controls icon alpha
  lineSpacing: 1.6,   // gap between type and title lines
  iconGap: -2,         // pixels between text bottom and icon top (negative = closer/overlap) — tighter for files
};

// ── File glow (feathered radial gradient sprite) ──────────
export const FILE_GLOW = {
  radius: 5,          // fixed radius for all file glows
  spriteScale: 3,     // glow size = radius × spriteScale. Higher = bigger glow ball in 3D space.
  featherStart: 0.4,  // where feathering begins
  color: '#222',      // 555 drak gray, 999 gray — file glow
  opacity: 1.0,
};

// ══════════════════════════════════════════════════════════════
// LINK / PHYSICS
// ══════════════════════════════════════════════════════════════

// ── Link styling ──────────────────────────────────────────
export const LINK = {
  mentionWidth:  0.2,
  linkWidth:     2,
  mentionColor:  '#49f',       // 49f sky blue, fff white, #001133 dark blue, 999 dark grey — 'mention' edges
  linkColor:     '#ff6ec7',    // hot pink — 'link' edges
  particleSpeed: 0.005,
};

// ── Graph physics ─────────────────────────────────────────
export const PHYSICS = {
  alphaDecay:    0.02,
  velocityDecay: 0.3,
  linkDistance:  80,
  warmupTicks:   100,
  orphanRingRadius: 230,  // distance from center to place orphan nodes (on a sphere at this radius)
};

// ── Logo ──────────────────────────────────────────────────
// Place logo.png in optic-nerve-ui/public/logo.png
// Displayed inline with header title via <img src="/logo.png">
