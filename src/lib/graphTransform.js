/**
 * Convert Supabase canvas payload into react-force-graph-3d graph data.
 *
 * Nodes use internal DB primary keys (id) since that's what edge
 * foreign keys (file_id, target_entity_id) reference.
 * Full row data (source_id, canonical_name, etc.) is preserved on
 * each node for the viewer panel.
 *
 * Orphaned files (no edges) get initial positions near center
 * so they don't drift to the edge of the graph.
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

  // Mark orphaned nodes and give them positions near center
  const linkedIds = new Set();
  links.forEach(l => {
    linkedIds.add(l.source);
    linkedIds.add(l.target);
  });

  const orphanRadius = 8; // small cluster radius for orphans
  nodes.forEach(n => {
    if (!linkedIds.has(n.id)) {
      n.x = (Math.random() - 0.5) * orphanRadius;
      n.y = (Math.random() - 0.5) * orphanRadius;
      n.z = (Math.random() - 0.5) * orphanRadius;
    }
  });

  return { nodes, links };
}
