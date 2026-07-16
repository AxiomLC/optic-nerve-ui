import ForceGraph3D from 'react-force-graph-3d';
import { useState, useCallback, useRef, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import * as THREE from 'three';
import * as LucideIcons from 'lucide-react';
import { nodeColor, linkWidth } from './nodeStyles';
import {
  ENTITY_ICON, ENTITY_COLOR, ENTITY_ICON_STYLE, ENTITY_LABEL, ENTITY_SIZE_TIERS,
  FILE_ICON, FILE_ICON_DEFAULT, FILE_ICON_STYLE, FILE_LABEL,
  GLOW, NODE_SIZE, PHYSICS, LINK,
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
    opacity,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(8, 8, 1);
  sprite.renderOrder = 20;

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

function makeLabel(text, color, fontSize, offY) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 64;
  const ctx = c.getContext('2d');
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = color;
  ctx.fillText(text, 256, 40);
  const t = new THREE.CanvasTexture(c);
  const m = new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, opacity: 1.0 });
  const s = new THREE.Sprite(m);
  s.scale.set(32, 4, 1);
  s.position.y = offY;
  s.renderOrder = 20;
  return s;
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
    const iconColor = '#ccc';

    if (node.type === 'entity') {
      const r = entityRadius(node.edge_count);
      const glowColor = ENTITY_COLOR[node.entity_type] || '#999';
      group.add(makeFeatheredGlow(glowColor, r * GLOW.entity.baseRadius, GLOW.entity));

      // "Entity" label (smaller font, above name)
      group.add(makeLabel(ENTITY_LABEL.text, ENTITY_LABEL.color, ENTITY_LABEL.fontSize, 4.5));

      // Entity name label
      group.add(makeLabel(node.canonical_name || '', ENTITY_LABEL.color, 28, 1.5));

      // Icon at bottom
      const iconName = ENTITY_ICON[node.entity_type] || 'Lightbulb';
      const iconSprite = makeIconSprite(iconName, ENTITY_ICON_STYLE.size, iconColor, ENTITY_ICON_STYLE.opacity, ENTITY_ICON_STYLE);
      iconSprite.position.y = -1.5;
      group.add(iconSprite);

    } else if (node.type === 'file') {
      // File glow (black, fixed size)
      group.add(makeFeatheredGlow(GLOW.file.color, GLOW.file.radius, GLOW.file));

      // Stacked: file_type → title → icon (tight spacing, #dfd colors)
      const typeLabel = makeLabel(node.file_type || '', FILE_LABEL.color, FILE_LABEL.fontSize, 4.5);
      group.add(typeLabel);

      const titleLabel = makeLabel(node.title || '', FILE_LABEL.color, FILE_LABEL.fontSize, 1.5);
      group.add(titleLabel);

      const iconName = getFileIcon(node);
      const iconSprite = makeIconSprite(iconName, FILE_ICON_STYLE.size, '#dfd', FILE_ICON_STYLE.opacity, FILE_ICON_STYLE);
      iconSprite.position.y = -1.0;
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
