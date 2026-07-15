// Note: PHYSICS.orphanRadius is used in MindMap.jsx post-warmup callback

/**
 * Convert Supabase canvas payload into react-force-graph-3d graph data.
 *
 * Nodes use internal DB primary keys (id) since that's what edge
 * foreign keys (file_id, target_entity_id) reference.
 * Full row data (source_id, canonical_name, etc.) is preserved on
 * each node for the viewer panel.
 *
 * Orphaned files (no edges) get frozen positions near center
 * using fx/fy/fz so the simulation cannot push them outward.
 */
export function toGraphData({ files, entities, edges }) {
  const nodes = [
    ...(files || []).map(f => ({ id: f.id, type: 'file', ...f })),
    ...(entities || []).map(e => ({ id: e.id, type: 'entity', ...e })),
  ];

  const links = (edges || []).map(e => ({
    source: e.file_id,
    target: e.target_entity_id,
    edge_type: e.edge_type,
    action: e.action,
  }));

  // Mark orphaned nodes (will be repositioned post-warmup in MindMap.jsx)
  const linkedIds = new Set();
  links.forEach(l => {
    linkedIds.add(l.source);
    linkedIds.add(l.target);
  });

  nodes.forEach(n => {
    n.isOrphan = !linkedIds.has(n.id);
    
    // Pre-freeze orphans near origin BEFORE simulation warms up
    // d3-force tick resets x=fx and zeros velocity each frame — charge force can't move them
    if (n.isOrphan) {
      // Small cloud spread so they don't stack at origin
      n.x = (Math.random() - 0.5) * 40;
      n.y = (Math.random() - 0.5) * 40;
      n.z = (Math.random() - 0.5) * 40;
      n.fx = n.x;
      n.fy = n.y;
      n.fz = n.z;
    }
  });

  return { nodes, links };
}
