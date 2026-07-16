// ============================================================
// DEV CONTROLS — Visual theme for the Optic Nerve graph UI
// Change values here to affect entity icons, file icons,
// node colors, sizes, and graph behavior.
// Uses lucide-react for crisp SVG icons.
// ============================================================
//
// Common colors used throughout (some overlap is intentional):
//   #ccc = light gray      — entity labels, entity icons
//   #dfd = light green     — file labels, file icons (near-white)
//   #000 = black           — file glow sphere
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
// ── Entity icon names (lucide-react) ──────────────────────
// Maps entity_type → lucide-react PascalCase component name
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

// ── Entity glow colors (per type) ─────────────────────────
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

// ── Entity icon styling ───────────────────────────────────
export const ENTITY_ICON_STYLE = {
  size: 28,
  opacity: 0.8,
  strokeWidth: 1.5,
  color: '#ccc',  // light gray — entity icons
};

// ── Entity label "Entity" word (smaller, above name) ─────
export const ENTITY_LABEL = {
  text: 'Entity',
  color: '#ccc',  // light gray — entity 'Entity' label
  fontSize: 14,
};

// ── Entity size by edge_count tiers ───────────────────────
export const ENTITY_SIZE_TIERS = [
  { max: 5,  size: 5  },
  { max: 15, size: 6  },
  { max: 30, size: 7  },
  { max: Infinity, size: 9 },
];

// ── File type icons (lucide-react) ────────────────────────
// Keys are file extensions (without dot). Dev can add or change.
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

// ── File icon styling ────────────────────────────────────
export const FILE_ICON_STYLE = {
  size: 20,
  opacity: 1.0,
  strokeWidth: 2,
  color: '#dfd',  // light green (near-white) — file icons
};

// ── File label styling ────────────────────────────────────
export const FILE_LABEL = {
  color: '#dfd',  // light green (near-white) — file labels
  fontSize: 20,
};

// ── Glow effects (feathered radial gradient sprites) ─────
// featherStart: 0=fully feathered, 1=solid circle (controls inner solid vs haze)
// spriteScale: world units per radius unit (total sprite size = radius × spriteScale)
export const GLOW = {
  entity: {
    baseRadius: 1,        // multiplier × entity tier size
    spriteScale: 6,       // world units per radius unit
    featherStart: 0.3,    // where feathering begins (0-1)
    opacity: 1.0,
  },
  file: {
    radius: 4,            // fixed radius for all file glows
    spriteScale: 6,       // world units per radius unit
    featherStart: 0.3,    // where feathering begins
    color: '#000000',     // black — file glow
    opacity: 1.0,
  },
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
