import MarkdownView from './MarkdownView';

export default function ViewerPanel({ file, entity, connectedFiles, onSelectFile, previewUrl, previewMode, onGetFile, getFileAvailable, onBack }) {
  // ── Entity snippet with connected files ──────────────
  if (entity) {
    return (
      <div className="viewer scrollable">
        <div className="snippet-header">
          <div className="snippet-type">Entity type: {entity.entity_type}</div>
        </div>
        <div className="snippet-title-line">title: {entity.canonical_name}</div>
        <div className="snippet-title-line" style={{fontSize:'0.8rem',color:'#aaa',marginTop:8}}>
          connections: {connectedFiles?.length || 0}
        </div>

        {connectedFiles && connectedFiles.length > 0 && (
          <div style={{marginTop:12}}>
            <div className="snippet-type" style={{marginBottom:4}}>Connected Files</div>
            {connectedFiles.map(f => (
              <div key={f.id} className="search-result-item" onClick={() => onSelectFile?.(f, { from: 'entity' })}>
                <div className="search-result-title">{f.title}{f.file_type === '.ntn' ? ' (.ntn)' : ''}</div>
                <div className="search-result-summary">{f.summary}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── No selection ────────────────────────────────────────
  if (!file) {
    return <div className="viewer empty-state">Select a file to view</div>;
  }

  const isMedia = /\.(jpg|jpeg|png|gif|webp|bmp|tiff|mp4|mov|avi|mkv|webm|wmv)$/i.test(file.file_type);

  // ── Preview mode ────────────────────────────────────────
  if (previewMode) {
    if (previewUrl) {
      return (
        <div className="viewer scrollable">
          {isMedia ? (
            <img src={previewUrl} alt={file.title || ''} className="media-preview" />
          ) : (
            <iframe src={previewUrl} className="preview-iframe" title="file preview" />
          )}
          <div className="viewer-footer">
            <button onClick={() => window.open(previewUrl, '_blank')} className="btn-get-file">Open File</button>
          </div>
        </div>
      );
    }
    return (
      <div className="viewer">
        <p className="preview-unavail">Preview unavailable. <button onClick={onGetFile} className="link-btn">Refresh now</button></p>
      </div>
    );
  }

  // ── Snippet mode ────────────────────────────────────────
  return (
    <div className="viewer scrollable">
      <div className="snippet-header">
        <div className="snippet-type">{file.file_type}</div>
        <div className="snippet-title-line">title: {file.title}</div>
      </div>

      {isMedia && file.thumb_url && (
        <img src={file.thumb_url} alt={file.title || ''} className="media-thumb" />
      )}

      {file.md && <MarkdownView md={file.md} />}

      {getFileAvailable && (
        <div className="viewer-footer">
          <div className="viewer-footer-row">
            {onBack && <button className="btn-get-file" onClick={onBack}>← Back</button>}
            <button className="btn-get-file" onClick={onGetFile}>Get File</button>
          </div>
        </div>
      )}
    </div>
  );
}
