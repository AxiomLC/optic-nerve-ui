import ForceGraph3D from 'react-force-graph-3d';
import { useState, useCallback, useRef } from 'react';
import * as THREE from 'three';
import * as LucideIcons from 'lucide-react';
import { nodeColor, linkWidth } from './nodeStyles';
import {
  ENTITY_ICON, ENTITY_COLOR, ENTITY_ICON_STYLE, FILE_ICON, FILE_ICON_DEFAULT, FILE_LABEL,
  GLOW, ENTITY_SIZE_TIERS, NODE_SIZE, PHYSICS, LINK, FILE_ICON_STYLE,
} from '../../config/theme';

function renderLucideToCanvas(iconName, size, color, strokeWidth) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 256, 256);
  
  // Create an SVG and render lucide icon
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', size.toString());
  svg.setAttribute('height', size.toString());
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', color);
  svg.setAttribute('stroke-width', strokeWidth.toString());
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  
  // Get icon paths from lucide-react
  const IconComponent = LucideIcons[iconName];
  if (!IconComponent) {
    // Fallback: simple circle with letter
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(128, 128, size * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = `bold ${size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(iconName.charAt(0), 128, 128);
    return canvas;
  }
  
  // Render icon to temp element to extract SVG
  const temp = document.createElement('div');
  const root = document.createElement('svg');
  root.innerHTML = `<symbol id="${iconName}"><path/></symbol>`;
  
  // For now, use simple canvas-based icons
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth * 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Draw basic icon shapes
  const x = 128, y = 128, r = size * 3;
  
  switch (iconName) {
    case 'User':
      ctx.beginPath();
      ctx.arc(x, y - 20, r * 0.4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y + 20, r * 0.6, 0, Math.PI);
      ctx.stroke();
      break;
    case 'Building2':
      ctx.strokeRect(x - r * 0.4, y - r * 0.6, r * 0.8, r * 1.2);
      ctx.beginPath();
      ctx.moveTo(x, y - r * 0.6);
      ctx.lineTo(x, y + r * 0.6);
      ctx.stroke();
      break;
    case 'MapPin':
      ctx.beginPath();
      ctx.moveTo(x, y - r * 0.7);
      ctx.arc(x, y - r * 0.3, r * 0.4, Math.PI, Math.PI * 2);
      ctx.lineTo(x, y + r * 0.6);
      ctx.stroke();
      break;
    case 'Rocket':
      ctx.beginPath();
      ctx.moveTo(x, y - r * 0.8);
      ctx.lineTo(x - r * 0.3, y);
      ctx.lineTo(x - r * 0.2, y + r * 0.8);
      ctx.lineTo(x, y + r * 0.5);
      ctx.lineTo(x + r * 0.2, y + r * 0.8);
      ctx.lineTo(x + r * 0.3, y);
      ctx.closePath();
      ctx.stroke();
      break;
    case 'Package':
      ctx.strokeRect(x - r * 0.5, y - r * 0.4, r, r * 0.8);
      ctx.beginPath();
      ctx.moveTo(x - r * 0.5, y);
      ctx.lineTo(x + r * 0.5, y);
      ctx.stroke();
      break;
    case 'FileText':
      ctx.strokeRect(x - r * 0.3, y - r * 0.5, r * 0.6, r);
      for (let i = -3; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(x - r * 0.2, y - r * 0.3 + i * 12);
        ctx.lineTo(x + r * 0.2, y - r * 0.3 + i * 12);
        ctx.stroke();
      }
      break;
    case 'Sheet':
      ctx.strokeRect(x - r * 0.3, y - r * 0.5, r * 0.6, r);
      ctx.beginPath();
      ctx.moveTo(x - r * 0.2, y - r * 0.3);
      ctx.lineTo(x + r * 0.2, y - r * 0.3);
      ctx.moveTo(x - r * 0.2, y);
      ctx.lineTo(x + r * 0.2, y);
      ctx.moveTo(x - r * 0.2, y + r * 0.3);
      ctx.lineTo(x + r * 0.2, y + r * 0.3);
      ctx.stroke();
      break;
    case 'Presentation':
      ctx.strokeRect(x - r * 0.4, y - r * 0.3, r * 0.8, r * 0.6);
      ctx.beginPath();
      ctx.moveTo(x, y + r * 0.3);
      ctx.lineTo(x, y + r * 0.7);
      ctx.stroke();
      break;
    case 'Image':
      ctx.strokeRect(x - r * 0.5, y - r * 0.4, r, r * 0.8);
      ctx.beginPath();
      ctx.arc(x - r * 0.2, y - r * 0.15, r * 0.15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - r * 0.4, y + r * 0.2);
      ctx.lineTo(x, y - r * 0.2);
      ctx.lineTo(x + r * 0.4, y + r * 0.2);
      ctx.stroke();
      break;
    case 'Video':
      ctx.strokeRect(x - r * 0.4, y - r * 0.3, r * 0.8, r * 0.6);
      ctx.beginPath();
      ctx.moveTo(x - r * 0.1, y - r * 0.05);
      ctx.lineTo(x - r * 0.1, y + r * 0.25);
      ctx.lineTo(x + r * 0.15, y + r * 0.1);
      ctx.closePath();
      ctx.stroke();
      break;
    case 'Music':
      ctx.beginPath();
      ctx.arc(x - r * 0.15, y + r * 0.2, r * 0.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + r * 0.05, y + r * 0.2);
      ctx.lineTo(x + r * 0.05, y - r * 0.4);
      ctx.lineTo(x + r * 0.3, y - r * 0.5);
      ctx.stroke();
      break;
    case 'Mail':
      ctx.strokeRect(x - r * 0.5, y - r * 0.3, r, r * 0.6);
      ctx.beginPath();
      ctx.moveTo(x - r * 0.5, y - r * 0.3);
      ctx.lineTo(x, y);
      ctx.lineTo(x + r * 0.5, y - r * 0.3);
      ctx.stroke();
      break;
    case 'BookOpen':
      ctx.beginPath();
      ctx.moveTo(x, y - r * 0.6);
      ctx.lineTo(x - r * 0.4, y - r * 0.5);
      ctx.lineTo(x - r * 0.4, y + r * 0.5);
      ctx.lineTo(x, y + r * 0.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y - r * 0.6);
      ctx.lineTo(x + r * 0.4, y - r * 0.5);
      ctx.lineTo(x + r * 0.4, y + r * 0.5);
      ctx.lineTo(x, y + r * 0.6);
      ctx.stroke();
      break;
    case 'Calendar':
      ctx.strokeRect(x - r * 0.4, y - r * 0.5, r * 0.8, r);
      ctx.beginPath();
      ctx.moveTo(x - r * 0.25, y - r * 0.3);
      ctx.lineTo(x + r * 0.25, y - r * 0.3);
      ctx.stroke();
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(x - r * 0.3 + i * r * 0.27, y - r * 0.5);
        ctx.lineTo(x - r * 0.3 + i * r * 0.27, y - r * 0.4);
        ctx.stroke();
      }
      break;
    case 'Lightbulb':
      ctx.beginPath();
      ctx.arc(x, y - r * 0.2, r * 0.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeRect(x - r * 0.2, y + r * 0.1, r * 0.4, r * 0.4);
      break;
    case 'Brain':
      ctx.beginPath();
      ctx.arc(x - r * 0.25, y - r * 0.2, r * 0.25, 0, Math.PI * 2);
      ctx.arc(x + r * 0.25, y - r * 0.2, r * 0.25, 0, Math.PI * 2);
      ctx.arc(x, y + r * 0.2, r * 0.35, 0, Math.PI * 2);
      ctx.stroke();
      break;
    default:
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
  }
  
  return canvas;
}

function makeIconSprite(iconName, size, color, opacity, style) {
  const canvas = renderLucideToCanvas(iconName, size, color, style.strokeWidth);
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ 
    map: texture, 
    transparent: true, 
    depthWrite: false,
    opacity
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(8, 8, 1);
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
  return s;
}

function makeGlow(color, radius) {
  const geo = new THREE.SphereGeometry(radius, 16, 16);
  const mat = new THREE.MeshBasicMaterial({
    color, transparent: true, opacity: GLOW.opacity, depthWrite: false,
  });
  return new THREE.Mesh(geo, mat);
}

function getFileIcon(node) {
  const ft = node.file_type || '';
  const match = Object.entries(FILE_ICON).find(([key]) =>
    ft === key || ft.startsWith(key) || ft.startsWith('.' + key)
  );
  return match ? match[1] : FILE_ICON_DEFAULT;
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
      const color = ENTITY_COLOR[node.entity_type] || '#999';
      group.add(makeGlow(color, r * GLOW.baseRadius));
      
      const iconName = ENTITY_ICON[node.entity_type] || 'Lightbulb';
      const iconSprite = makeIconSprite(iconName, ENTITY_ICON_STYLE.size, color, ENTITY_ICON_STYLE.opacity, ENTITY_ICON_STYLE);
      iconSprite.position.y = 0;
      group.add(iconSprite);
      
      const label = makeLabel(node.canonical_name || '', '#fff', 28, 5);
      group.add(label);

    } else if (node.type === 'file') {
      // Stacked: file_type (green) → title (white) → icon
      const typeLabel = makeLabel(node.file_type || '', FILE_LABEL.color, FILE_LABEL.fontSize, 6.5);
      group.add(typeLabel);

      const titleLabel = makeLabel(node.title || '', '#fff', FILE_LABEL.fontSize, 2);
      group.add(titleLabel);

      const iconName = getFileIcon(node);
      const iconSprite = makeIconSprite(iconName, FILE_ICON_STYLE.size, '#0f0', FILE_ICON_STYLE.opacity, FILE_ICON_STYLE);
      iconSprite.position.y = -2.5;
      group.add(iconSprite);
    }

    return group;
  }, []);

  const handleEngineStop = useCallback(() => {
    if (!graphData?.nodes) return;

    const nodes = graphData.nodes;
    const orphans = nodes.filter(n => n.isOrphan);
    const connected = nodes.filter(n => !n.isOrphan);

    console.log('[Orphan Reposition] onEngineStop called');
    console.log('  Orphans found:', orphans.length, orphans.map(o => o.title));
    console.log('  Connected nodes:', connected.length);

    // If no orphans, nothing to do
    if (orphans.length === 0) {
      console.log('  No orphans, returning');
      return;
    }

    // Measure bounding box of HIGH-DEGREE connected nodes (core cluster, not outliers)
    // Filter to nodes with at least 3 edges (heuristic to exclude low-degree stragglers)
    const coreNodes = connected.filter(n => {
      if (n.type === 'entity') return (n.edge_count || 0) >= 3;
      if (n.type === 'file') return (n.edge_count || 0) >= 2; // Files typically have fewer edges
      return false;
    });

    console.log('  Core nodes (high degree):', coreNodes.length);

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    const nodesToMeasure = coreNodes.length > 0 ? coreNodes : connected; // Fallback to all connected if no core
    nodesToMeasure.forEach(n => {
      if (isFinite(n.x) && isFinite(n.y) && isFinite(n.z)) {
        minX = Math.min(minX, n.x);
        maxX = Math.max(maxX, n.x);
        minY = Math.min(minY, n.y);
        maxY = Math.max(maxY, n.y);
        minZ = Math.min(minZ, n.z);
        maxZ = Math.max(maxZ, n.z);
      }
    });

    // If no valid positions, skip
    if (!isFinite(maxX) || !isFinite(maxY) || !isFinite(maxZ)) {
      console.log('  No valid connected positions, returning');
      return;
    }

    console.log('  Cluster bounds:', { minX, maxX, minY, maxY, minZ, maxZ });

    const clusterWidth = maxX - minX;
    const clusterHeight = maxY - minY;
    const clusterDepth = maxZ - minZ;
    const clusterCenter = {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
      z: (minZ + maxZ) / 2,
    };

    // Ring radius: position orphans at ~20% beyond the measured core
    const maxDim = Math.max(clusterWidth, clusterHeight, clusterDepth);
    const ringRadius = (maxDim / 2) * 0.3; // Conservative: only 30% of half-width

    console.log('  Core cluster bounds:', { minX, maxX, minY, maxY, minZ, maxZ });
    console.log('  Cluster center:', clusterCenter);
    console.log('  Cluster dims:', { clusterWidth, clusterHeight, clusterDepth, maxDim });
    console.log('  Ring radius (30% of maxDim/2):', ringRadius);

    // Position orphans in a ring around the cluster
    orphans.forEach((orphan, i) => {
      const angle = (i / orphans.length) * Math.PI * 2;
      const phi = Math.random() * Math.PI; // Random elevation for 3D spread
      const r = ringRadius + (Math.random() * ringRadius * 0.2); // Add jitter to radius

      const x = clusterCenter.x + r * Math.cos(angle) * Math.sin(phi);
      const y = clusterCenter.y + r * Math.sin(angle) * Math.sin(phi);
      const z = clusterCenter.z + r * Math.cos(phi);

      // Freeze the orphan at this position
      orphan.fx = x;
      orphan.fy = y;
      orphan.fz = z;
      if (i < 3) console.log(`  Orphan ${orphan.title} (id:${orphan.id}) → fx:${x.toFixed(0)}, fy:${y.toFixed(0)}, fz:${z.toFixed(0)}`);
    });
    console.log(`  ... ${orphans.length - 3} more orphans positioned`);
  }, [graphData, graphData?.nodes]); // Re-run if nodes change

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
