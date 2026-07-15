import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import LoginForm from './auth/LoginForm';
import SearchPanel from './search/SearchPanel';
import ViewerPanel from './viewer/ViewerPanel';
import VoiceChat from './voice/VoiceChat';
import { toGraphData } from './lib/graphTransform';
import { getPreviewUrls } from './lib/n8nClient';
import { getCanvas } from './lib/supabaseClient';

const MindMap = lazy(() => import('./graph/MindMap'));

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
  // ── Auth ──────────────────────────────────────────────────
  const [authUser, setAuthUser] = useState(null);
  const [canvas, setCanvas] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [previewUrls, setPreviewUrls] = useState({});
  const [previewMode, setPreviewMode] = useState(false);

  // ── Selection ─────────────────────────────────────────────
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);

  // ── Search ────────────────────────────────────────────────
  const [searchResults, setSearchResults] = useState(null);

  // ── Voice ─────────────────────────────────────────────────
  const [voiceExpanded, setVoiceExpanded] = useState(false);

  // ── Error log ─────────────────────────────────────────────
  const [errorLog, setErrorLog] = useState([]);
  const addLog = useCallback((msg) => {
    setErrorLog(prev => [...prev.slice(-50), { msg, time: new Date().toLocaleTimeString() }]);
  }, []);

  // ── Restore session on mount ─────────────────────────────
  useEffect(() => {
    const saved = loadSession();
    if (saved && saved.canvas && saved.username) {
      setAuthUser({ username: saved.username });
      setCanvas(saved.canvas);
      setGraphData(toGraphData(saved.canvas));
      if (saved.previewUrls) setPreviewUrls(saved.previewUrls);

      // Re-fetch in background
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

  // ── Login handler ────────────────────────────────────────
  async function handleLogin({ username, canvas: canvasData }) {
    setAuthUser({ username });
    setCanvas(canvasData);
    setGraphData(toGraphData(canvasData));
    setPreviewMode(false);
    setSelectedFile(null);
    setSelectedEntity(null);

    // Fetch preview URLs (non-blocking)
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

    // Save to localStorage for session persistence
    const password = document?.forms?.[0]?.password?.value || '';
    saveSession({ username, password, canvas: canvasData, previewUrls: urls });
  }

  // ── Logout handler ───────────────────────────────────────
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

  // ── Select file from graph / search ──────────────────────
  const handleSelectFile = useCallback((file) => {
    setSelectedFile(file);
    setSelectedEntity(null);
    setPreviewMode(false);
  }, []);

  // ── Select entity from graph ─────────────────────────────
  const handleSelectEntity = useCallback((entity) => {
    setSelectedEntity(entity);
    setSelectedFile(null);
    setPreviewMode(false);
  }, []);

  // ── Get File button: show preview ────────────────────────
  const handleGetFile = useCallback(() => {
    setPreviewMode(true);
  }, []);

  const getFileAvailable = selectedFile?.drive_id && selectedFile?.source_id;

  // ── If not logged in ────────────────────────────────────
  if (!authUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const previewUrl = selectedFile?.source_id ? previewUrls[selectedFile.source_id] : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-left">
          <h1>Optic Nerve VK<sup>™</sup></h1>
          <p className="sub">visual kernel</p>
        </div>

        {/* Error log strip */}
        <div className="header-log">
          {errorLog.map((e, i) => (
            <span key={i} className="log-entry">{e.time} {e.msg}</span>
          ))}
        </div>

        <div className="header-logo">
          <button className="btn-logout" onClick={handleLogout}>New Login</button>
        </div>
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
            entity={selectedEntity}
            previewUrl={previewUrl}
            previewMode={previewMode}
            onGetFile={handleGetFile}
            getFileAvailable={getFileAvailable}
          />

          {/* Get File button — flush right, below viewer */}
          {!voiceExpanded && !previewMode && getFileAvailable && (
            <div className="get-file-bar">
              <button className="btn-get-file" onClick={handleGetFile}>Get File</button>
            </div>
          )}
        </div>

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
