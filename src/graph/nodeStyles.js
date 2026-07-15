// ============================================================
// DEV CONTROLS — Node styling helpers
// Core values live in src/lib/theme.js — edit them there.
// This file just wires them into the graph renderer.
// ============================================================

import { ENTITY_COLOR, FILE_COLOR, LINK } from '../lib/theme';

export function nodeColor(node, selected) {
  if (selected) return '#ffcc00';
  if (node.type === 'file') return FILE_COLOR;
  return ENTITY_COLOR[node.entity_type] || '#999';
}

export function linkWidth(edge) {
  return edge.edge_type === 'link' ? LINK.linkWidth : LINK.mentionWidth;
}
