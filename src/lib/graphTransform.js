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
  // Use separate graphId (prefixed by type) to prevent d3-force ID collision
  // while preserving numeric id for downstream code (ViewerPanel, selection, etc.)
  const nodes = [
    ...(files || []).map(f => ({ id: f.id, graphId: `f_${f.id}`, type: 'file', ...f })),
    ...(entities || []).map(e => ({ id: e.id, graphId: `e_${e.id}`, type: 'entity', ...e })),
  ];

  const links = (edges || []).flatMap(e => {
    const result = [];
    if (e.target_entity_id != null) {
      result.push({ source: `f_${e.file_id}`, target: `e_${e.target_entity_id}`, edge_type: e.edge_type, action: e.action });
    }
    if (e.target_file_id != null) {
      result.push({ source: `f_${e.file_id}`, target: `f_${e.target_file_id}`, edge_type: e.edge_type, action: e.action });
    }
    return result;
  });

  // Mark orphaned nodes (using graphId for collision-free comparison)
  const linkedIds = new Set();
  const validNodeIds = new Set(nodes.map(n => n.graphId));
  
  links.forEach(l => {
    if (validNodeIds.has(l.source) && validNodeIds.has(l.target)) {
      linkedIds.add(l.source);
      linkedIds.add(l.target);
    }
  });

  nodes.forEach(n => {
    n.isOrphan = !linkedIds.has(n.graphId);
    
    if (n.isOrphan) {
      // Stay near center during simulation so frozen orphans don't pull the centroid.
      // Teleported to outer rim in handleEngineStop after sim settles.
      n.x = (Math.random() - 0.5) * 5;
      n.y = (Math.random() - 0.5) * 5;
      n.z = (Math.random() - 0.5) * 5;
      n.fx = n.x;
      n.fy = n.y;
      n.fz = n.z;
    }
  });

  return { nodes, links };
}
