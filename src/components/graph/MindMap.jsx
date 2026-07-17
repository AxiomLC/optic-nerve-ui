import ForceGraph3D from 'react-force-graph-3d';
import { useState, useCallback, useRef, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import * as THREE from 'three';
import * as LucideIcons from 'lucide-react';
import { nodeColor, linkWidth } from './nodeStyles';
import {
  ENTITY_ICON, ENTITY_COLOR, ENTITY_SIZE_TIERS, ENTITY_LABEL, ENTITY_GLOW,
  FILE_ICON, FILE_ICON_DEFAULT, FILE_LABEL, FILE_GLOW,
  NODE_SIZE, PHYSICS, LINK,
} from '../../config/theme';

// ── Icon SVG cache (render lucide-react to SVG once per name/color) ──
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

function makeGroupLabel(lines, config = {}) {
  const { offY = 0, lineSpacing = 1.4 } = config;
  if (!lines || lines.length === 0) return new THREE.Group();

  // Measure all lines to size canvas
  const temp = document.createElement('canvas');
  const tctx = temp.getContext('2d');
  let totalH = 0, maxW = 0;
  lines.forEach(l => {
    tctx.font = `bold ${l.fontSize}px sans-serif`;
    const m = tctx.measureText(l.text);
    const h = l.fontSize * lineSpacing;
    totalH += h;
    maxW = Math.max(maxW, m.width);
  });

  const pad = 6;
  const cw = Math.ceil(maxW + pad * 2);
  const ch = Math.ceil(totalH + pad * 2);

  const c = document.createElement('canvas');
  c.width = cw;
  c.height = ch;
  const ctx = c.getContext('2d');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let y = pad + (lines[0].fontSize * lineSpacing) / 2;
  lines.forEach(l => {
    ctx.font = `bold ${l.fontSize}px sans-serif`;
    ctx.fillStyle = l.color;
    ctx.fillText(l.text, cw / 2, y);
    y += l.fontSize * lineSpacing;
  });

  const t = new THREE.CanvasTexture(c);
  const m = new THREE.SpriteMaterial({
    map: t, transparent: true, depthWrite: false, depthTest: false,
    alphaTest: 0.01, opacity: 1.0,
  });
  const s = new THREE.Sprite(m);
  const aspect = cw / ch;
  s.scale.set(6 * aspect, 6, 1);
  s.position.y = offY;
  s.renderOrder = 20;
  return s;
}

function makeLabel(text, color, fontSize, offY) {
  return makeGroupLabel([{ text, color, fontSize }], { offY, lineSpacing: 1.4 });
}

// ── Feathered glow (radial gradient sprite) ──
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

function entityRadius(edgeCount) {
  const c = edgeCount || 0;
  for (const t of ENTITY_SIZE_TIERS) {
    if (c <= t.max) return t.size;
  }
  return 17;
}

export default function MindMap({ graphData, onSelectEntity, onSelectFile }) {
  const [selected, setSelected] = useState(new Set());
  const fgRef = useRef(null);

  const handleClick = useCallback((node) => {
    if (node.type === 'file') {
      setSelected(new Set([node.id]));
      onSelectFile(node);
    } else {
      setSelected(new Set([node.id]));
      onSelectEntity(node);
    }
  }, [onSelectEntity, onSelectFile]);

  const handleNodeThreeObject = useCallback((node) => {
    const group = new THREE.Group();

    if (node.type === 'entity') {
      const r = entityRadius(node.edge_count);
      const glowColor = ENTITY_COLOR[node.entity_type] || '#999';
      group.add(makeFeatheredGlow(glowColor, r * ENTITY_GLOW.baseRadius, ENTITY_GLOW));

      // Combined "Entity" + entity name label
      group.add(makeGroupLabel([
        { text: ENTITY_LABEL.top.text, color: ENTITY_LABEL.top.color, fontSize: ENTITY_LABEL.top.fontSize },
        { text: node.canonical_name || '', color: ENTITY_LABEL.bottom.color, fontSize: ENTITY_LABEL.bottom.fontSize },
      ], { offY: 0, lineSpacing: ENTITY_LABEL.lineSpacing }));

      // Icon at bottom
      const iconName = ENTITY_ICON[node.entity_type] || 'Lightbulb';
      const iconSprite = makeIconSprite(iconName, ENTITY_LABEL.icon.size, ENTITY_LABEL.icon.color, ENTITY_LABEL.icon.opacity, ENTITY_LABEL.icon);
      iconSprite.position.y = ENTITY_LABEL.iconOffset;
      group.add(iconSprite);

    } else if (node.type === 'file') {
      // File glow
      group.add(makeFeatheredGlow(FILE_GLOW.color, FILE_GLOW.radius, FILE_GLOW));

      // Combined file_type + file title label
      group.add(makeGroupLabel([
        { text: node.file_type || '', color: FILE_LABEL.top.color, fontSize: FILE_LABEL.top.fontSize },
        { text: node.title || '', color: FILE_LABEL.bottom.color, fontSize: FILE_LABEL.bottom.fontSize },
      ], { offY: 0, lineSpacing: FILE_LABEL.lineSpacing }));

      const iconName = getFileIcon(node);
      const iconSprite = makeIconSprite(iconName, FILE_LABEL.icon.size, FILE_LABEL.icon.color, FILE_LABEL.icon.opacity, FILE_LABEL.icon);
      iconSprite.position.y = FILE_LABEL.iconOffset;
      group.add(iconSprite);
    }

    return group;
  }, []);

  const handleEngineStop = useCallback(() => {
    if (!graphData?.nodes) return;
    const orphans = graphData.nodes.filter(n => n.isOrphan);
    window.__orphans = orphans;
    window.__graphData = graphData;
    console.log(`[Orphan] Engine stopped, ${orphans.length} orphans`);
  }, [graphData, graphData?.nodes]);

  return (
    <div className="mindmap-container">
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        nodeId="graphId"
        nodeColor={n => nodeColor(n, selected.has(n.id))}
        linkWidth={linkWidth}
        linkColor={e => e.edge_type === 'link' ? LINK.linkColor : LINK.mentionColor}
        onNodeClick={handleClick}
        nodeThreeObject={handleNodeThreeObject}
        linkDirectionalParticles={1}
        linkDirectionalParticleSpeed={LINK.particleSpeed}
        warmupTicks={PHYSICS.warmupTicks}
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
