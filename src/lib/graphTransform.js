/**
 * Convert Supabase canvas payload into react-force-graph-3d graph data.
 *
 * Nodes: every optic_file + every optic_entity.
 *   - File nodes use source_id as id.
 *   - Entity nodes use `entity:<canonical_name>` to avoid collisions.
 * Links: every optic_edge.
 *   - source -> file's source_id
 *   - target -> entity's `entity:<canonical_name>`
 */
export function toGraphData({ files, entities, edges }) {
  const nodes = [
    ...(files || []).map(f => ({ id: f.source_id, type: 'file', ...f })),
    ...(entities || []).map(e => ({
      id: `entity:${e.canonical_name}`,
      type: 'entity',
      ...e,
    })),
  ];

  const links = (edges || []).map(e => ({
    source: e.file_id_source_id,
    target: `entity:${e.entity_canonical_name}`,
    edge_type: e.edge_type,
    action: e.action,
  }));

  return { nodes, links };
}
