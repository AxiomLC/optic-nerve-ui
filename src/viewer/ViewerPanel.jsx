import MarkdownView from './MarkdownView';

export default function ViewerPanel({ file, entity, previewUrl, previewMode, onGetFile, getFileAvailable }) {
  // ── Entity snippet ──────────────────────────────────────
  if (entity) {
    return (
      <div className="viewer panel">
        <div className="snippet-header">
          <span className="snippet-type">{entity.entity_type}</span>
        </div>
        <h2 className="snippet-title">{entity.canonical_name}</h2>
      </div>
    );
  }

  // ── No selection ────────────────────────────────────────
  if (!file) {
    return <div className="viewer panel empty-state">Select a file to view</div>;
  }

  const isMedia = file.file_type?.startsWith('image/') || file.file_type?.startsWith('video/');

  // ── Preview mode: show full preview URL ─────────────────
  if (previewMode) {
    if (previewUrl) {
      return (
        <div className="viewer panel scrollable">
          {isMedia ? (
            <img src={previewUrl} alt={file.title || ''} className="media-preview" />
          ) : (
            <iframe src={previewUrl} className="preview-iframe" title="file preview" />
          )}
          <div className="viewer-actions">
            <button onClick={() => window.open(previewUrl, '_blank')}>Open File</button>
          </div>
        </div>
      );
    }
    return (
      <div className="viewer panel">
        <p className="preview-unavail">Preview unavailable. <button onClick={onGetFile} className="link-btn">Refresh now</button> for previews to load.</p>
      </div>
    );
  }

  // ── Snippet mode: file summary ──────────────────────────
  return (
    <div className="viewer panel scrollable">
      {/* File type + title header */}
      <div className="snippet-header">
        <span className="snippet-type">{file.file_type}</span>
        <span className="snippet-title">{file.title}</span>
      </div>

      {/* Media: show thumb_url if available */}
      {isMedia && file.thumb_url && (
        <img src={file.thumb_url} alt={file.title || ''} className="media-thumb" />
      )}

      {/* Documents: show markdown */}
      {file.md && <MarkdownView md={file.md} />}

      {/* Get File button */}
      {getFileAvailable && (
        <div className="viewer-actions">
          <button className="btn-get-file" onClick={onGetFile}>Get File</button>
        </div>
      )}
    </div>
  );
}
