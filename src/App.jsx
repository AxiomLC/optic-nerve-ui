import { useState, useCallback } from 'react';
import LoginForm from './auth/LoginForm';
import MindMap from './graph/MindMap';
import SearchPanel from './search/SearchPanel';
import ViewerPanel from './viewer/ViewerPanel';
import VoiceChat from './voice/VoiceChat';
import { toGraphData } from './lib/graphTransform';
import { getPreviewUrls, getPreviewUrlSingle } from './lib/n8nClient';

export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [canvas, setCanvas] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [previewUrls, setPreviewUrls] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [voiceExpanded, setVoiceExpanded] = useState(false);

  function handleLogin({ username, canvas: canvasData }) {
    setAuthUser({ username });
    setCanvas(canvasData);
    setGraphData(toGraphData(canvasData));

    const items = (canvasData.files || [])
      .filter(f => f.drive_id && f.source_id)
      .map(f => ({ driveId: f.drive_id, source_id: f.source_id }));

    if (items.length > 0) {
      getPreviewUrls(items)
        .then(urls => setPreviewUrls(urls || {}))
        .catch(err => console.error('Preview batch failed:', err));
    }
  }

  const handleSelectFile = useCallback((file) => {
    setSelectedFile(file);
  }, []);

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
