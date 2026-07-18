// Optic Nerve — ver 1.0 beta July 2026
// ============================================================
// Node styling helpers — delegates to theme.js for values.
// ============================================================

import { ENTITY_COLOR, LINK } from '../../config/theme';

export function nodeColor(node, selected) {
  if (selected) return '#ffcc00';
  if (node.type === 'entity') return ENTITY_COLOR[node.entity_type] || '#999';
  return null; // files have no blob, no color needed
}

export function linkWidth(edge) {
  return edge.edge_type === 'link' ? LINK.linkWidth : LINK.mentionWidth;
}
