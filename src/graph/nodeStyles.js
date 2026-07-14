/**
 * Color/size lookup by entity_type and edge_type.
 */

const ENTITY_COLORS = {
  person: '#4f9',
  org: '#49f',
  place: '#f94',
  project: '#94f',
  product: '#f49',
  document: '#9f4',
  event: '#ff4',
  thing: '#999',
  concept: '#aaa',
};

export function nodeColor(node, selected) {
  if (selected) return '#ffcc00';
  if (node.type === 'file') return '#888';
  return ENTITY_COLORS[node.entity_type] || '#999';
}

export function linkWidth(edge) {
  return edge.edge_type === 'link' ? 2 : 0.5;
}
