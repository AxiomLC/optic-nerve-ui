// Optic Nerve — ver 1.0 beta July 2026
// AppContext definition and shape documentation.

import { createContext, useContext } from 'react';

export const AppContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppContext.Provider');
  return ctx;
}

/**
 * Shape of the context value:
 * {
 *   canvas,         // { files, entities, edges } or null
 *   setCanvas,
 *   graphData,      // { nodes, links } or null
 *   setGraphData,
 *   previewUrls,    // { [source_id]: url }
 *   setPreviewUrls,
 *   selectedFile,   // optic_file row or null
 *   setSelectedFile,
 *   selectedEntity, // optic_entity row or null
 *   setSelectedEntity,
 *   previewMode,    // boolean — true = show preview URL instead of snippet
 *   setPreviewMode,
 *   voiceExpanded,  // boolean
 *   setVoiceExpanded,
 *   authUser,       // { username } or null
 *   setAuthUser,
 *   searchResults,  // [{ source_id, title, summary, score }] or null
 *   setSearchResults,
 *   errorLog,       // [{ msg, time }]
 *   addLog,         // (msg) => void
 * }
 */
