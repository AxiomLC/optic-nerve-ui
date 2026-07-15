import ForceGraph3D from 'react-force-graph-3d';
import { useState, useCallback } from 'react';
import * as THREE from 'three';
import { nodeColor, linkWidth } from './nodeStyles';
import { ENTITY_EMOJI, FILE_ICON, NODE_SIZE, PHYSICS, LINK } from '../lib/theme';

// ── Emoji sprite generator ──────────────────────────────────
function createSprite(emoji, label, size) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');

  // Emoji
  ctx.font = `${size * 12}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, 64, label ? 36 : 48);

  // Label below emoji (shown on zoom)
  if (label) {
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(label, 64, 72);
  }

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(12, 9, 1);
  return sprite;
}

// ── Resolve emoji for any node ──────────────────────────────
function nodeEmoji(node) {
  if (node.type === 'file') {
    // Match by file_type prefix (e.g. "image/jpeg" → "image/")
    const match = Object.entries(FILE_ICON).find(([key]) =>
      node.file_type?.startsWith(key)
    );
    return match ? match[1] : '📄';
  }
  return ENTITY_EMOJI[node.entity_type] || '💡';
}

// ── Node size from edge_count ───────────────────────────────
function nodeVal(node) {
  if (node.type === 'file') return NODE_SIZE.fileDefault;
  return NODE_SIZE.entityMin + (node.edge_count || 0) * NODE_SIZE.entityScale;
}

export default function MindMap({ graphData, onSelectFile }) {
  const [selected, setSelected] = useState(new Set());

  const handleClick = useCallback((node) => {
    if (node.type === 'file') {
      setSelected(new Set([node.id]));
      onSelectFile(node);
    } else {
      setSelected(new Set([node.id]));
    }
  }, [onSelectFile]);

  const handleNodeThreeObject = useCallback((node) => {
    return createSprite(nodeEmoji(node), '', nodeVal(node));
  }, []);

  return (
    <div className="mindmap-container">
      <ForceGraph3D
        graphData={graphData}
        nodeColor={n => nodeColor(n, selected.has(n.id))}
        nodeVal={nodeVal}
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
