import { PHYSICS } from './theme';

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

  // Mark orphaned nodes — freeze them near center
  const linkedIds = new Set();
  links.forEach(l => {
    linkedIds.add(l.source);
    linkedIds.add(l.target);
  });

  const r = PHYSICS.orphanRadius;
  nodes.forEach(n => {
    if (!linkedIds.has(n.id)) {
      n.fx = (Math.random() - 0.5) * r;
      n.fy = (Math.random() - 0.5) * r;
      n.fz = (Math.random() - 0.5) * r;
    }
  });

  return { nodes, links };
}
