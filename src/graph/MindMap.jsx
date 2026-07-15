import ForceGraph3D from 'react-force-graph-3d';
import { useState, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { nodeColor, linkWidth } from './nodeStyles';
import {
  ENTITY_EMOJI, ENTITY_COLOR, FILE_ICON,
  GLOW, ENTITY_SIZE_TIERS, ZOOM, NODE_SIZE, PHYSICS, LINK,
} from '../lib/theme';

// ── Sprite factory: emoji ─────────────────────────────────
function makeSprite(emoji, size) {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const ctx = c.getContext('2d');
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

// ── Sprite factory: text label ────────────────────────────
function makeLabel(text, color, fontSize, offY) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 64;
  const ctx = c.getContext('2d');
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = color;
  ctx.fillText(text, 256, 40);
  const t = new THREE.CanvasTexture(c);
  const m = new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, opacity: 0 });
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
    const match = Object.entries(FILE_ICON).find(([key]) =>
      node.file_type?.startsWith(key)
    );
    return match ? match[1] : '📄';
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

      // Emoji
      const emoji = makeSprite(nodeEmoji(node), NODE_SIZE.entityEmoji);
      group.add(emoji);

      // Entity name label (hidden until zoom)
      const label = makeLabel(node.canonical_name || '', '#fff', 28, 5);
      label.userData.isLabel = true;
      group.add(label);

    } else if (node.type === 'file') {
      // Emoji only — no blob
      const emoji = makeSprite(nodeEmoji(node), NODE_SIZE.fileEmoji);
      group.add(emoji);

      // File type label (small, bright green — hidden until zoom)
      const typeLabel = makeLabel(node.file_type || '', '#0f0', 16, -3);
      typeLabel.userData.isLabel = true;
      typeLabel.userData.zoomType = 'file';
      group.add(typeLabel);

      // File title label (white — hidden until zoom)
      const titleLabel = makeLabel(node.title || '', '#fff', 22, 3.5);
      titleLabel.userData.isLabel = true;
      titleLabel.userData.zoomType = 'file';
      group.add(titleLabel);
    }

    return group;
  }, []);

  // ── Zoom-dependent label visibility ─────────────────────
  const handleEngineTick = useCallback(() => {
    if (!fgRef.current) return;
    const dist = fgRef.current.camera().position.length();

    // Walk all Three groups in the graph
    fgRef.current.graphData().nodes.forEach(node => {
      // Get the Three object for this node
      // We traverse the scene to find label sprites
      // Since 3d-force-graph doesn't expose node objects directly,
      // we use the internal _objects map (stable API)
      const obj3d = fgRef.current._objects?.get?.(node.id);
      if (!obj3d) return;

      obj3d.children.forEach(child => {
        if (!child.userData?.isLabel) return;

        const isEntity = child.userData.zoomType !== 'file';
        const threshold = isEntity ? ZOOM.entityLabelAt : ZOOM.fileLabelAt;

        // Fade in as camera gets closer, out as it gets farther
        const raw = 1 - (dist - threshold * 0.5) / (threshold * 0.8);
        child.material.opacity = Math.max(0, Math.min(1, raw));
      });
    });
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
        onEngineTick={handleEngineTick}
      />
    </div>
  );
}


