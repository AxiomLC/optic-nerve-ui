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
 *   previewUrls,    // { [source_id]: url }
 *   setPreviewUrls,
 *   selectedFile,   // optic_file row or null
 *   setSelectedFile,
 *   voiceExpanded,  // boolean
 *   setVoiceExpanded,
 *   authUser,       // { username } or null
 *   setAuthUser,
 *   searchResults,  // [{ source_id, title, summary, score }] or null
 *   setSearchResults,
 * }
 */
