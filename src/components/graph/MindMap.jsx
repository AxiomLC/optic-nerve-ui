// Optic Nerve — ver 1.0 beta July 2026
// 3D force-directed graph using react-force-graph-3d / Three.js.
// Builds custom sprites for entity and file nodes: feathered glow,
// composite label text, and lucide icons. Handles orphan column
// placement on engine stop.

import ForceGraph3D from 'react-force-graph-3d';
import { useState, useCallback, useRef, useEffect, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import * as THREE from 'three';
import * as LucideIcons from 'lucide-react';
import { nodeColor, linkWidth } from './nodeStyles';
import {
  ENTITY_ICON, ENTITY_COLOR, ENTITY_SIZE_TIERS, ENTITY_LABEL, ENTITY_GLOW,
  FILE_ICON, FILE_ICON_DEFAULT, FILE_LABEL, FILE_GLOW,
  MAP_FONT, PHYSICS, LINK,
} from '../../config/theme';
import { forceX, forceY, forceZ } from 'd3-force-3d';

// =============== 1. Icon SVG Cache ===============
// Renders a lucide-react component to inline SVG once per (name, color, strokeWidth).
const iconSvgCache = {};

function getIconSVG(iconName, color, strokeWidth) {
  const key = `${iconName}_${color}_${strokeWidth}`;
  if (iconSvgCache[key]) return iconSvgCache[key];

  const IconComponent = LucideIcons[iconName];
  if (!IconComponent) return null;

  try {
    const container = document.createElement('div');
    const root = createRoot(container);
    flushSync(() => {
      root.render(createElement(IconComponent, {
        size: 256,
        color,
        'stroke-width': strokeWidth,
        absoluteStrokeWidth: true,
      }));
    });
    const svgHTML = container.innerHTML;
    root.unmount();
    iconSvgCache[key] = svgHTML;
    return svgHTML;
  } catch (e) {
    console.warn('Icon SVG render failed:', iconName, e);
    return null;
  }
}

// =============== 2. makeIconSprite ===============
// Renders a lucide icon as a standalone THREE.Sprite (used rarely;
// most icons are embedded into the composite label via makeGroupLabel).
function makeIconSprite(iconName, size, color, opacity, style) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    alphaTest: 0.01,
    opacity,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(8, 8, 1);
  sprite.renderOrder = 21;

  // Load actual lucide SVG paths and draw to canvas (async; updates texture when ready)
  const svgHTML = getIconSVG(iconName, color || style.color, style.strokeWidth);
  if (svgHTML) {
    const img = new Image();
    const blob = new Blob([svgHTML], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      ctx.clearRect(0, 0, 256, 256);
      ctx.drawImage(img, (256 - size) / 2, (256 - size) / 2, size, size);
      texture.needsUpdate = true;
      URL.revokeObjectURL(url);
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  } else {
    // Fallback: single letter
    ctx.fillStyle = color || '#fff';
    ctx.font = `bold ${size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(iconName.charAt(0), 128, 128);
    texture.needsUpdate = true;
  }

  return sprite;
}

// =============== 3. makeGroupLabel ===============
// Draws text lines + optional icon onto one canvas, returns a single
// THREE.Sprite. All content on one canvas = zero parallax drift.
// Handles word-wrap at configurable maxWidth.
function makeGroupLabel(lines, config = {}) {
  const { offY = 0, lineSpacing = 1.4, icon = null, maxWidth = 0, fontFamily = 'system-ui, sans-serif', iconGap: cfgIconGap } = config;
  if (!lines || lines.length === 0) return new THREE.Group();

  // Measure + word-wrap: split long lines at maxWidth
  const temp = document.createElement('canvas');
  const tctx = temp.getContext('2d');
  const wrappedLines = [];
  lines.forEach(l => {
    const w = l.fontWeight || 700;
    tctx.font = `${w} ${l.fontSize}px ${fontFamily}`;
    const text = l.text || '';
    if (maxWidth > 0 && tctx.measureText(text).width > maxWidth) {
      const words = text.split(' ');
      let line = '';
      words.forEach(word => {
        const testLine = line ? line + ' ' + word : word;
        if (tctx.measureText(testLine).width > maxWidth && line) {
          wrappedLines.push({ ...l, text: line });
          line = word;
        } else {
          line = testLine;
        }
      });
      if (line) wrappedLines.push({ ...l, text: line });
    } else {
      wrappedLines.push(l);
    }
  });
  lines = wrappedLines;

  // Measure all (wrapped) lines to size canvas
  let totalH = 0, maxW = 0;
  lines.forEach((l, i) => {
    const w = l.fontWeight || 700;
    tctx.font = `${w} ${l.fontSize}px ${fontFamily}`;
    const m = tctx.measureText(l.text);
    // Last line uses just text height (no trailing lineSpacing gap)
    const h = i < lines.length - 1 ? l.fontSize * lineSpacing : l.fontSize;
    totalH += h;
    maxW = Math.max(maxW, m.width);
  });

  // Reserve space for icon below text
  const iconSizePx = icon ? (icon.size || 30) : 0;
  const iconGap = icon ? (cfgIconGap != null ? cfgIconGap : 1) : 0;

  const pad = 6;
  const dpr = window.devicePixelRatio || 1;
  const cw = Math.ceil(Math.max(maxW, iconSizePx) + pad * 2);
  const ch = Math.ceil(totalH + pad * 2 + iconSizePx + iconGap);

  const c = document.createElement('canvas');
  c.width = cw * dpr;
  c.height = ch * dpr;
  const ctx = c.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let y = pad + (lines[0].fontSize * lineSpacing) / 2;
  lines.forEach((l, i) => {
    ctx.font = `${l.fontWeight || 700} ${l.fontSize}px ${fontFamily}`;
    ctx.fillStyle = l.color;
    ctx.fillText(l.text, cw / 2, y);
    // On the last line, advance by just the text height (no trailing lineSpacing)
    // so the icon sits directly below the text, not a full lineSpace below
    if (i < lines.length - 1) {
      y += l.fontSize * lineSpacing;
    } else {
      y += l.fontSize;
    }
  });

  const t = new THREE.CanvasTexture(c);

  // Draw icon SVG below text (async load, updates texture when ready)
  if (icon && icon.svgHTML) {
    const img = new Image();
    const blob = new Blob([icon.svgHTML], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const iconY = y + iconGap;
    img.onload = () => {
      ctx.globalAlpha = icon.opacity != null ? icon.opacity : 1;
      ctx.drawImage(img, (cw - iconSizePx) / 2, iconY, iconSizePx, iconSizePx);
      ctx.globalAlpha = 1;
      t.needsUpdate = true;
      URL.revokeObjectURL(url);
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  }

  const m = new THREE.SpriteMaterial({
    map: t, transparent: true, depthWrite: false, depthTest: true,
    alphaTest: 0.01, opacity: 1.0,
    premultipliedAlpha: true,  // canvas data IS premultiplied — prevents dark fringes on anti-aliased text
  });
  const s = new THREE.Sprite(m);
  // Scale so the TEXT portion always occupies 6 world units in height;
  // if icon is present, the sprite grows taller to fit it, but text stays same readable size.
  const textPxH = totalH + pad * 2;
  s.scale.set(6 * cw / textPxH, 6 * ch / textPxH, 1);
  s.position.y = offY;
  s.renderOrder = 20;
  return s;
}

// =============== 4. makeLabel ===============
// Simple single-line label (convenience wrapper around makeGroupLabel).
function makeLabel(text, color, fontSize, offY) {
  return makeGroupLabel([{ text, color, fontSize }], { offY, lineSpacing: 1.4 });
}

// =============== 5. makeFeatheredGlow ===============
// Feathered radial gradient sprite for entity/file glow behind labels.
function makeFeatheredGlow(color, radius, config) {
  const { spriteScale = 6, featherStart = 0.3, opacity = 1.0 } = config || {};
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const cx = 128, cy = 128;
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 128);
  gradient.addColorStop(0,   color);
  gradient.addColorStop(featherStart, color);
  gradient.addColorStop(1,   'rgba(0,0,0,0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: true,
    depthTest: true,
    alphaTest: 0.01,
    opacity,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(radius * spriteScale, radius * spriteScale, 1);
  return sprite;
}

// =============== 6. getFileIcon ===============
// Looks up a lucide icon name by file extension or MIME subtype.
function getFileIcon(node) {
  const ft = (node.file_type || '').toLowerCase();
  if (!ft) return FILE_ICON_DEFAULT;

  // Strip leading dot ('.ext' → 'ext')
  let key = ft.startsWith('.') ? ft.slice(1) : ft;

  // Try direct match by extension
  if (FILE_ICON[key]) return FILE_ICON[key];

  // Try MIME subtype ('type/subtype' → 'subtype')
  const idx = ft.indexOf('/');
  if (idx !== -1) {
    key = ft.slice(idx + 1);
    // Aliases for common mismatches
    if (key === 'jpeg') key = 'jpg';
    if (key === 'rfc822') key = 'eml';
    if (FILE_ICON[key]) return FILE_ICON[key];
  }

  return FILE_ICON_DEFAULT;
}

// =============== 7. entityRadius ===============
// Maps edge_count to a size tier for entity glow sprites.
function entityRadius(edgeCount) {
  const c = edgeCount || 0;
  for (const t of ENTITY_SIZE_TIERS) {
    if (c <= t.max) return t.size;
  }
  return 17;
}

// =============== 8. MindMap Component ===============
export default function MindMap({ graphData, onSelectEntity, onSelectFile }) {
  const [selected, setSelected] = useState(new Set());
  const fgRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Measure container so ForceGraph3D renders at correct display size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width: Math.floor(width), height: Math.floor(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // -------------- Custom d3 forces (mount + data change) --------------
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg || !graphData?.nodes?.length) return;
    // Repulsion: how strongly nodes push apart. -10=tight, -30=default, -60=spread
    fg.d3Force('charge').strength(PHYSICS.chargeStrength ?? -30);
    // Centroid lock: keeps graph center at origin. 0=drifts, 0.5=soft, 1.0=fixed
    fg.d3Force('center').strength(PHYSICS.centerStrength ?? 1.0);
    // Axis gravity: per-node pull toward 0,0,0. Fixes small components drifting far.
    const axStr = PHYSICS.axisStrength ?? 0;
    if (axStr > 0) {
      fg.d3Force('x', forceX().strength(axStr));
      fg.d3Force('y', forceY().strength(axStr));
      fg.d3Force('z', forceZ().strength(axStr));
    } else {
      if (fg.d3Force('x')) fg.d3Force('x', null);
      if (fg.d3Force('y')) fg.d3Force('y', null);
      if (fg.d3Force('z')) fg.d3Force('z', null);
    }
  }, [graphData]);



  // -------------- 10. Handle Node Click --------------
  const handleClick = useCallback((node) => {
    if (node.type === 'file') {
      setSelected(new Set([node.id]));
      onSelectFile(node);
    } else {
      setSelected(new Set([node.id]));
      onSelectEntity(node);
    }
  }, [onSelectEntity, onSelectFile]);

  // -------------- 10. Build Three.js Node Objects --------------
  const handleNodeThreeObject = useCallback((node) => {
    const group = new THREE.Group();

    if (node.type === 'entity') {
      const r = entityRadius(node.edge_count);
      const glowColor = ENTITY_COLOR[node.entity_type] || '#999';
      group.add(makeFeatheredGlow(glowColor, r * ENTITY_GLOW.baseRadius, ENTITY_GLOW));

      // Composite label: "Entity" + entity name + icon (one sprite, no parallax drift)
      const entIconName = ENTITY_ICON[node.entity_type] || 'Lightbulb';
      const entIconSVG = getIconSVG(entIconName, ENTITY_LABEL.icon.color, ENTITY_LABEL.icon.strokeWidth);
      group.add(makeGroupLabel([
        { ...ENTITY_LABEL.top },
        { text: node.canonical_name || '', color: ENTITY_LABEL.bottom.color, fontSize: ENTITY_LABEL.bottom.fontSize, fontWeight: ENTITY_LABEL.bottom.fontWeight },
      ], {
        offY: 0,
        lineSpacing: ENTITY_LABEL.lineSpacing,
        maxWidth: 250,
        fontFamily: MAP_FONT.fontFamily,
        iconGap: ENTITY_LABEL.iconGap,
        icon: entIconSVG ? { svgHTML: entIconSVG, size: ENTITY_LABEL.icon.size, opacity: ENTITY_LABEL.icon.opacity } : null,
      }));

    } else if (node.type === 'file') {
      // File glow
      group.add(makeFeatheredGlow(FILE_GLOW.color, FILE_GLOW.radius, FILE_GLOW));

      // Composite label: file_type + title + icon (one sprite, no parallax drift)
      const fileIconName = getFileIcon(node);
      const fileIconSVG = getIconSVG(fileIconName, FILE_LABEL.icon.color, FILE_LABEL.icon.strokeWidth);
      group.add(makeGroupLabel([
        { text: node.file_type || '', color: FILE_LABEL.top.color, fontSize: FILE_LABEL.top.fontSize, fontWeight: FILE_LABEL.top.fontWeight },
        { text: node.title || '', color: FILE_LABEL.bottom.color, fontSize: FILE_LABEL.bottom.fontSize, fontWeight: FILE_LABEL.bottom.fontWeight },
      ], {
        offY: 0,
        lineSpacing: FILE_LABEL.lineSpacing,
        maxWidth: 250,
        fontFamily: MAP_FONT.fontFamily,
        iconGap: FILE_LABEL.iconGap,
        icon: fileIconSVG ? { svgHTML: fileIconSVG, size: FILE_LABEL.icon.size, opacity: FILE_LABEL.icon.opacity } : null,
      }));
    }

    return group;
  }, []);

  // -------------- 11. Engine Stop / Orphan Column --------------
  const handleEngineStop = useCallback(() => {
    if (!graphData?.nodes) return;
    const orphans = graphData.nodes.filter(n => n.isOrphan);
    window.__orphans = orphans;
    window.__graphData = graphData;
    window.__fgRef = fgRef.current;
    console.log(`[Orphan] Engine stopped, ${orphans.length} orphans`);

    if (orphans.length === 0) return;

    // Measure cluster radius (max distance of non-orphan nodes from center)
    const nonOrphans = graphData.nodes.filter(n => !n.isOrphan);
    let clusterR = 0;
    nonOrphans.forEach(n => {
      const d = Math.sqrt(n.x * n.x + n.y * n.y + n.z * n.z);
      if (d > clusterR) clusterR = d;
    });
    clusterR = Math.max(clusterR, 10);

    // Place orphans in vertical column(s) to the right of the cluster
    const colPadding = PHYSICS.orphanColumnPadding || 20;
    const spacing = PHYSICS.orphanSpacing || 15;
    const colX = clusterR + colPadding;
    const colHeight = clusterR * 2;
    const itemsPerCol = Math.max(1, Math.floor(colHeight / spacing));

    orphans.forEach((n, i) => {
      const col = Math.floor(i / itemsPerCol);
      const row = i % itemsPerCol;
      const countInCol = Math.min(orphans.length - col * itemsPerCol, itemsPerCol);
      const y = (countInCol - 1) * spacing / 2 - row * spacing;
      n.x = -(colX + col * (colPadding + 10));
      n.y = y;
      n.z = 0;
      n.fx = n.x;
      n.fy = n.y;
      n.fz = n.z;
    });
  }, [graphData]);

  // -------------- 12. Render ForceGraph3D --------------

  return (
    <div className="mindmap-container" ref={containerRef}>
      <ForceGraph3D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeId="graphId"
        nodeColor={n => nodeColor(n, selected.has(n.id))}
        linkWidth={linkWidth}
        linkColor={e => {
          if (e.edge_type === 'core') return LINK.coreColor;
          if (e.edge_type === 'link') return LINK.linkColor;
          return LINK.mentionColor;
        }}
        linkOpacity={LINK.linkOpacity}  // single global opacity, same for all edge types
        onNodeClick={handleClick}
        nodeThreeObject={handleNodeThreeObject}
        linkDirectionalParticles={1}
        linkDirectionalParticleSpeed={LINK.particleSpeed}
        warmupTicks={PHYSICS.warmupTicks}
        cooldownTime={5000}
        d3AlphaDecay={PHYSICS.alphaDecay}
        d3VelocityDecay={PHYSICS.velocityDecay}
        d3LinkDistance={PHYSICS.linkDistance}
        onEngineStop={handleEngineStop}
        nodeCanvasObject={(node, ctx) => {
          // Optional: visual debug - highlight orphans with a marker
          // if (node.isOrphan) {
          //   ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
          //   ctx.beginPath();
          //   ctx.arc(node.x, node.y, 50, 0, Math.PI * 2);
          //   ctx.fill();
          // }
        }}
      />
    </div>
  );
}
