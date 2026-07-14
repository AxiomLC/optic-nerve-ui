/**
 * Convert Supabase canvas payload into react-force-graph-3d graph data.
 *
 * Nodes use internal DB primary keys (id) since that's what edge
 * foreign keys (file_id, target_entity_id) reference.
 * Full row data (source_id, canonical_name, etc.) is preserved on
 * each node for the viewer panel.
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

  return { nodes, links };
}
