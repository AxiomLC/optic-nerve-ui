import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import LoginForm from './components/LoginForm';
import SearchPanel from './components/SearchPanel';
import ViewerPanel from './components/viewer/ViewerPanel';
import VoiceChat from './components/VoiceChat';
import { toGraphData } from './lib/graphTransform';
import { getPreviewUrls } from './lib/n8nClient';
import { getCanvas } from './lib/supabaseClient';

const MindMap = lazy(() => import('./components/graph/MindMap'));

const SESSION_KEY = 'optic-nerve-session';

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveSession(data) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(data)); } catch {}
}
function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch {}
}

export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [canvas, setCanvas] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [previewUrls, setPreviewUrls] = useState({});
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [activeLayer, setActiveLayer] = useState('viewer');
  const [searchResults, setSearchResults] = useState(null);
  const [errorLog, setErrorLog] = useState([]);
  const [leftPanelWidth, setLeftPanelWidth] = useState(380);
  const [connectedFiles, setConnectedFiles] = useState([]);
  const [backTo, setBackTo] = useState(null);

  const addLog = useCallback((msg) => {
    setErrorLog(prev => [...prev.slice(-50), { msg, time: new Date().toLocaleTimeString() }]);
  }, []);

  // ── Restore session on mount ──
  useEffect(() => {
    const saved = loadSession();
    if (saved && saved.canvas && saved.username) {
      setAuthUser({ username: saved.username });
      setCanvas(saved.canvas);
      setGraphData(toGraphData(saved.canvas));
      if (saved.previewUrls) setPreviewUrls(saved.previewUrls);
      getCanvas(saved.username, saved.password).then(canvasData => {
        setCanvas(canvasData);
        setGraphData(toGraphData(canvasData));
        const items = (canvasData.files || [])
          .filter(f => f.drive_id && f.source_id)
          .map(f => ({ driveId: f.drive_id, source_id: f.source_id }));
        if (items.length > 0) {
          getPreviewUrls(items).then(urls => setPreviewUrls(urls || {})).catch(() => {});
        }
        saveSession({ username: saved.username, password: saved.password, canvas: canvasData, previewUrls });
      }).catch(err => addLog(`Background refresh failed: ${err.message}`));
    }
  }, []);

  async function handleLogin({ username, canvas: canvasData }) {
    setAuthUser({ username });
    setCanvas(canvasData);
    setGraphData(toGraphData(canvasData));
    setPreviewMode(false);
    setSelectedFile(null);
    setSelectedEntity(null);
    const items = (canvasData.files || [])
      .filter(f => f.drive_id && f.source_id)
      .map(f => ({ driveId: f.drive_id, source_id: f.source_id }));
    let urls = {};
    if (items.length > 0) {
      try {
        urls = await getPreviewUrls(items);
        setPreviewUrls(urls || {});
      } catch (err) {
        addLog(`Preview batch failed: ${err.message}`);
      }
    }
    const password = document?.forms?.[0]?.password?.value || '';
    saveSession({ username, password, canvas: canvasData, previewUrls: urls });
  }

  function handleLogout() {
    clearSession();
    setAuthUser(null);
    setCanvas(null);
    setGraphData(null);
    setPreviewUrls({});
    setPreviewMode(false);
    setSelectedFile(null);
    setSelectedEntity(null);
    setSearchResults(null);
    setErrorLog([]);
  }

  const handleSelectFile = useCallback((file, { from } = {}) => {
    if (from === 'entity') setBackTo('entity');
    else if (from === 'search' || file.score != null) setBackTo('search');
    else setBackTo(null);
    if (file.score != null && canvas?.files) {
      const match = canvas.files.find(f => f.source_id === file.source_id);
      if (match) setSelectedFile(match);
      else setSelectedFile({ ...file, unauthorized: true });
    } else {
      setSelectedFile(file);
    }
    setSelectedEntity(null);
    setConnectedFiles([]);
    setPreviewMode(false);
    setActiveLayer('viewer');
  }, [canvas]);

  const handleSelectEntity = useCallback((entity) => {
    setSelectedEntity(entity);
    setSelectedFile(null);
    setBackTo(null);
    setPreviewMode(false);
    setActiveLayer('viewer');
    // Compute connected files from canvas edges
    if (canvas?.edges && canvas?.files) {
      const fileIds = canvas.edges
        .filter(e => e.target_entity_id === entity.id)
        .map(e => e.file_id);
      setConnectedFiles(canvas.files.filter(f => fileIds.includes(f.id)));
    } else {
      setConnectedFiles([]);
    }
  }, [canvas]);

  const handleSearchSubmit = useCallback(() => {
    setActiveLayer('search');
  }, []);

  const handleVoicePayload = useCallback((payload) => {
    if (payload && Array.isArray(payload) && payload.length > 0 && payload[0].source_id) {
      setSearchResults(payload);
      setActiveLayer('search');
    }
  }, []);

  const handleGetFile = useCallback(() => {
    setPreviewMode(true);
  }, []);

  const getFileAvailable = selectedFile?.drive_id && selectedFile?.source_id;

  const handleVoiceToggle = useCallback(() => {
    setActiveLayer(prev => prev === 'voice' ? 'viewer' : 'voice');
  }, []);

  // ── Draggable divider ──
  const isDragging = useRef(false);
  const handleDividerDown = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMove = (e) => {
      if (!isDragging.current) return;
      setLeftPanelWidth(Math.max(280, Math.min(760, e.clientX)));
    };
    const handleUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
    return () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
    };
  }, []);

  if (!authUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const previewUrl = selectedFile?.source_id ? previewUrls[selectedFile.source_id] : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div />
        <div className="header-center">
          <h1>
            <img src="/logo.png" alt="" className="header-logo-img" />
            {' '}Optic Nerve VK<sup>™</sup>
          </h1>
          <p className="sub">visual kernel</p>
        </div>
        <div className="header-right">
          <div className="header-log">
            {errorLog.map((e, i) => (
              <span key={i} className="log-entry">{e.time} {e.msg}</span>
            ))}
          </div>
          <button className="btn-logout" onClick={handleLogout}>New Login</button>
        </div>
      </header>

      <div className="layout-4tier">
        <div className="left-col" style={{ width: leftPanelWidth }}>
          <SearchPanel
            onSelectFile={handleSelectFile}
            searchResults={searchResults}
            setSearchResults={setSearchResults}
            onSearchSubmit={handleSearchSubmit}
          />

          <div className="layer-container">
            {activeLayer === 'viewer' && (
              <ViewerPanel
                file={selectedFile}
                entity={selectedEntity}
                connectedFiles={connectedFiles}
                onSelectFile={handleSelectFile}
                previewUrl={previewUrl}
                previewMode={previewMode}
                onGetFile={handleGetFile}
                getFileAvailable={getFileAvailable}
                onBack={backTo === 'entity' ? () => { setSelectedFile(null); setActiveLayer('viewer'); } : backTo === 'search' ? () => setActiveLayer('search') : undefined}
              />
            )}

            {activeLayer === 'search' && searchResults && searchResults.length > 0 && (
              <div className="layer-search scrollable">
                {searchResults.map(r => (
                  <div key={r.source_id} className="search-result-item" onClick={() => handleSelectFile(r, { from: 'search' })}>
                    <div className="search-result-title">{r.title}{!/\.\w{2,4}$/.test(r.title) ? ' (.ntn)' : ''}</div>
                    <div className="search-result-score">{(r.score * 100).toFixed(0)}%</div>
                    <div className="search-result-summary">{r.summary}</div>
                  </div>
                ))}
              </div>
            )}

            {activeLayer === 'voice' && (
              <VoiceChat
                voiceExpanded={true}
                onExpandChange={() => {}}
                onSearchPayload={handleVoicePayload}
              />
            )}
          </div>
        </div>

        <div className="drag-handle" onPointerDown={handleDividerDown} />

        <div className="right-col">
          {graphData && (
            <Suspense fallback={<div className="panel" style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#888'}}>Loading graph…</div>}>
              <MindMap
                graphData={graphData}
                onSelectFile={handleSelectFile}
                onSelectEntity={handleSelectEntity}
              />
            </Suspense>
          )}
        </div>
      </div>

      {activeLayer !== 'voice' && (
        <button className="voice-toggle-btn" onClick={handleVoiceToggle}>
          🎙 AI Voice
        </button>
      )}

      <footer className="app-footer">
        creative intelligence: w57th.agency
      </footer>
    </div>
  );
}
