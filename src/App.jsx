import { useState, useCallback, useEffect } from 'react';
import LoginForm from './auth/LoginForm';
import MindMap from './graph/MindMap';
import SearchPanel from './search/SearchPanel';
import ViewerPanel from './viewer/ViewerPanel';
import VoiceChat from './voice/VoiceChat';
import { toGraphData } from './lib/graphTransform';
import { getPreviewUrls, getPreviewUrlSingle } from './lib/n8nClient';

export default function App() {
  // Auth / canvas
  const [authUser, setAuthUser] = useState(null);
  const [canvas, setCanvas] = useState(null);
  const [graphData, setGraphData] = useState(null);

  // Preview URLs
  const [previewUrls, setPreviewUrls] = useState({});

  // Selection
  const [selectedFile, setSelectedFile] = useState(null);

  // Search
  const [searchResults, setSearchResults] = useState(null);

  // Voice
  const [voiceExpanded, setVoiceExpanded] = useState(false);

  // On login — transform canvas into graph data
  function handleLogin({ username, canvas: canvasData }) {
    setAuthUser({ username });
    setCanvas(canvasData);
    setGraphData(toGraphData(canvasData));

    // Kick off preview URL fetch (non-blocking)
    const items = (canvasData.files || [])
      .filter(f => f.drive_id && f.source_id)
      .map(f => ({ driveId: f.drive_id, source_id: f.source_id }));

    if (items.length > 0) {
      getPreviewUrls(items)
        .then(urls => setPreviewUrls(urls || {}))
        .catch(err => console.error('Preview batch failed:', err));
    }
  }

  // Select a file — either from mind-map click or search result
  const handleSelectFile = useCallback((file) => {
    setSelectedFile(file);
  }, []);

  // Retry single preview on error
  const handleRetryPreview = useCallback((file) => {
    if (!file.drive_id || !file.source_id) return;
    getPreviewUrlSingle(file.drive_id, file.source_id)
      .then(result => {
        if (result?.getUrl) {
          setPreviewUrls(prev => ({ ...prev, [file.source_id]: result.getUrl }));
        }
      })
      .catch(err => console.error('Preview retry failed:', err));
  }, []);

  // If not logged in, show login form
  if (!authUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const previewUrl = selectedFile?.source_id ? previewUrls[selectedFile.source_id] : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Optic Nerve VK<sup>™</sup></h1>
        <p className="sub">visual kernel</p>
      </header>

      <div className="layout-4tier">
        {/* Left column */}
        <div className="left-col">
          {!voiceExpanded && (
            <SearchPanel
              onSelectFile={handleSelectFile}
              searchResults={searchResults}
              setSearchResults={setSearchResults}
            />
          )}

          <ViewerPanel
            file={selectedFile}
            previewUrl={previewUrl}
            onRetryPreview={handleRetryPreview}
          />
        </div>

        {/* Right column — mind map */}
        <div className="right-col">
          {graphData && (
            <MindMap
              graphData={graphData}
              onSelectFile={handleSelectFile}
            />
          )}
        </div>
      </div>

      <VoiceChat
        voiceExpanded={voiceExpanded}
        onExpandChange={setVoiceExpanded}
      />

      <footer className="app-footer">
        creative intelligence: w57th.agency
      </footer>
    </div>
  );
}
