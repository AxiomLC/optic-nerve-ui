import ForceGraph3D from 'react-force-graph-3d';
import { useState, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { nodeColor, linkWidth } from './nodeStyles';
import {
  ENTITY_EMOJI, ENTITY_COLOR, ENTITY_EMOJI_OPACITY, FILE_ICON, FILE_ICON_DEFAULT, FILE_LABEL,
  GLOW, ENTITY_SIZE_TIERS, NODE_SIZE, PHYSICS, LINK,
} from '../lib/theme';

// ── Sprite factory: emoji ─────────────────────────────────
function makeSprite(emoji, size, opacity) {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const ctx = c.getContext('2d');
  ctx.globalAlpha = opacity || 1;
  ctx.font = `${size * 6}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, 32, 32);
  const t = new THREE.CanvasTexture(c);
  const m = new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false });
  const s = new THREE.Sprite(m);
  s.scale.set(7, 7, 1);
  return s;
}

// ── Sprite factory: text label (single line) ─────────────
function makeLabel(text, color, fontSize, offY) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 64;
  const ctx = c.getContext('2d');
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = color;
  ctx.fillText(text, 256, 40);
  const t = new THREE.CanvasTexture(c);
  const m = new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, opacity: 1.0 });
  const s = new THREE.Sprite(m);
  s.scale.set(32, 4, 1);
  s.position.y = offY || 0;
  return s;
}

// ── Glow blob factory ─────────────────────────────────────
function makeGlow(color, radius) {
  const geo = new THREE.SphereGeometry(radius, 16, 16);
  const mat = new THREE.MeshBasicMaterial({
    color, transparent: true, opacity: GLOW.opacity, depthWrite: false,
  });
  return new THREE.Mesh(geo, mat);
}

// ── Resolve emoji for any node ────────────────────────────
function nodeEmoji(node) {
  if (node.type === 'file') {
    const ft = node.file_type || '';
    const match = Object.entries(FILE_ICON).find(([key]) =>
      ft === key || ft.startsWith(key) || ft.startsWith('.' + key)
    );
    return match ? match[1] : FILE_ICON_DEFAULT;
  }
  return ENTITY_EMOJI[node.entity_type] || '💡';
}

// ── Entity blob radius from edge_count ────────────────────
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

  // ── Build custom Three.js objects per node ──────────────
  const handleNodeThreeObject = useCallback((node) => {
    const group = new THREE.Group();

    if (node.type === 'entity') {
      const r = entityRadius(node.edge_count);
      const color = ENTITY_COLOR[node.entity_type] || '#999';

      // Glow blob
      group.add(makeGlow(color, r * GLOW.baseRadius));

      // Emoji with configurable transparency
      const emoji = makeSprite(nodeEmoji(node), NODE_SIZE.entityEmoji, ENTITY_EMOJI_OPACITY);
      group.add(emoji);

      // Entity name label
      const label = makeLabel(node.canonical_name || '', '#fff', 28, 5);
      group.add(label);

    } else if (node.type === 'file') {
      // Emoji only — no blob
      const emoji = makeSprite(nodeEmoji(node), NODE_SIZE.fileEmoji, 1.0);
      group.add(emoji);

      // File type label (light green, above emoji)
      const typeLabel = makeLabel(node.file_type || '', FILE_LABEL.color, FILE_LABEL.fontSize, -4.5);
      group.add(typeLabel);

      // File title label (white, below emoji)
      const titleLabel = makeLabel(node.title || '', '#fff', FILE_LABEL.fontSize, 4);
      group.add(titleLabel);
    }

    return group;
  }, []);

  return (
    <div className="mindmap-container">
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
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
      />
    </div>
  );
}
