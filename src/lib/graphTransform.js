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
  // Prefix IDs by type to prevent collision between file_ids and entity_ids
  // (both tables use auto-increment PKs — they overlap)
  const nodes = [
    ...(files || []).map(f => ({ id: `f_${f.id}`, type: 'file', ...f })),
    ...(entities || []).map(e => ({ id: `e_${e.id}`, type: 'entity', ...e })),
  ];

  const links = (edges || []).flatMap(e => {
    const result = [];
    // Entity-targeted edge
    if (e.target_entity_id != null) {
      result.push({
        source: `f_${e.file_id}`,
        target: `e_${e.target_entity_id}`,
        edge_type: e.edge_type,
        action: e.action,
      });
    }
    // File-to-file edge
    if (e.target_file_id != null) {
      result.push({
        source: `f_${e.file_id}`,
        target: `f_${e.target_file_id}`,
        edge_type: e.edge_type,
        action: e.action,
      });
    }
    return result;
  });

  // Mark orphaned nodes: a node is orphan only if it has NO resolvable edges
  // (an edge must connect to a type-prefixed ID that actually exists)
  const linkedIds = new Set();
  const validNodeIds = new Set(nodes.map(n => n.id));
  
  links.forEach(l => {
    if (validNodeIds.has(l.source) && validNodeIds.has(l.target)) {
      linkedIds.add(l.source);
      linkedIds.add(l.target);
    }
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
