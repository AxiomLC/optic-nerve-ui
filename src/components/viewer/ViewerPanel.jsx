// Optic Nerve — ver 1.0 beta July 2026
// File/entity viewer panel. Dual mode: snippet (md/thumb) and
// preview (iframe/img). Entity display shows connected files.

import MarkdownView from './MarkdownView';

export default function ViewerPanel({ file, entity, connectedFiles, onSelectFile, previewUrl, previewMode, onGetFile, onBackFromPreview, onRefreshPreview, getFileAvailable, onBack }) {
  // File takes priority over entity (for Back from entity-connected files)
  if (file) {
    // falls through to file viewer below
  } else if (entity) {
    // =============== 1. Entity Snippet with Connected Files ===============
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
                <div className="search-result-title">{f.title}{f.file_type === '.ntn' ? '.ntn' : ''}</div>
                <div className="search-result-summary">{f.summary}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // =============== 2. No Selection ===============
  if (!file) {
    return <div className="viewer empty-state">Select a file to view</div>;
  }

  const isMedia = /\.(jpg|jpeg|png|gif|webp|bmp|tiff|mp4|mov|avi|mkv|webm|wmv)$/i.test(file.file_type);

  // =============== 3. Preview Mode (iframe / img) ===============
  if (previewMode) {
    const embedUrl = previewUrl?.getUrl;
    const openUrl  = previewUrl?.webUrl || previewUrl?.getUrl;

    if (embedUrl) {
      return (
        <div className="viewer scrollable">
          {isMedia ? (
            <img
              src={embedUrl}
              alt={file.title || ''}
              className="media-preview"
              onError={(e) => { e.target.alt = 'Preview failed. Use Open File for videos'; e.target.style.opacity = '0.3'; }}
            />
          ) : (
            <iframe src={embedUrl} className="preview-iframe" title="file preview" />
          )}
          <div className="viewer-footer">
            <div className="viewer-footer-row">
              <button className="btn-get-file" onClick={onBackFromPreview}>← Back</button>
              <button className="btn-get-file" onClick={() => window.open(openUrl, '_blank')}>Open File</button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="viewer">
        <p className="preview-unavail">Preview unavailable. For videos use Open File. <button onClick={onRefreshPreview} className="link-btn">Refresh now</button></p>
      </div>
    );
  }

  // =============== 4. Snippet Mode (md / thumb) ===============
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
