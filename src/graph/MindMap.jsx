import ForceGraph3D from 'react-force-graph-3d';
import { useState } from 'react';
import { nodeColor, linkWidth } from './nodeStyles';

export default function MindMap({ graphData, onSelectFile }) {
  const [selected, setSelected] = useState(new Set());

  function handleClick(node) {
    if (node.type === 'file') {
      setSelected(new Set([node.id]));
      onSelectFile(node);
    } else {
      // Entity click — highlight connected files
      setSelected(new Set([node.id]));
    }
  }

  return (
    <div className="mindmap-container">
      <ForceGraph3D
        graphData={graphData}
        nodeColor={n => nodeColor(n, selected.has(n.id))}
        linkWidth={linkWidth}
        onNodeClick={handleClick}
        linkDirectionalParticles={1}
        linkDirectionalParticleSpeed={0.005}
      />
    </div>
  );
}
