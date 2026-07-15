import MarkdownView from './MarkdownView';

export default function ViewerPanel({ file, entity, previewUrl, previewMode, onGetFile, getFileAvailable }) {
  // ── Entity snippet ──────────────────────────────────────
  if (entity) {
    return (
      <div className="viewer">
        <div className="snippet-header">
          <div className="snippet-type">Entity type: {entity.entity_type}</div>
        </div>
        <div className="snippet-title-line">title: {entity.canonical_name}</div>
      </div>
    );
  }

  // ── No selection ────────────────────────────────────────
  if (!file) {
    return <div className="viewer empty-state">Select a file to view</div>;
  }

  const isMedia = file.file_type?.startsWith('image/') || file.file_type?.startsWith('video/');

  // ── Preview mode: show full preview URL ─────────────────
  if (previewMode) {
    return (
      <div className="viewer scrollable">
        <div className="snippet-header">
          <div className="snippet-type">{file.file_type}</div>
          <div className="snippet-title-line">title: {file.title}</div>
        </div>
        {previewUrl ? (
          <>
            {isMedia ? (
              <img src={previewUrl} alt={file.title || ''} className="media-preview" />
            ) : (
              <iframe src={previewUrl} className="preview-iframe" title="file preview" />
            )}
            <div className="viewer-footer">
              <span />
              <button className="btn-get-file" onClick={() => window.open(previewUrl, '_blank')}>
                Open File
              </button>
            </div>
          </>
        ) : (
          <div className="preview-unavail">
            Preview unavailable.
            <button onClick={onGetFile} className="link-btn">Refresh now</button>
          </div>
        )}
      </div>
    );
  }

  // ── Snippet mode: file summary ──────────────────────────
  return (
    <div className="viewer scrollable">
      <div className="snippet-header">
        <div className="snippet-type">{file.file_type}</div>
        <div className="snippet-title-line">title: {file.title}</div>
      </div>

      {/* Media: show thumb_url if available */}
      {isMedia && file.thumb_url && (
        <img src={file.thumb_url} alt={file.title || ''} className="media-thumb" />
      )}

      {/* Documents: show markdown */}
      {file.md && <MarkdownView md={file.md} />}

      {/* Get File button — bottom-right */}
      {getFileAvailable && (
        <div className="viewer-footer">
          <span />
          <button className="btn-get-file" onClick={onGetFile}>Get File</button>
        </div>
      )}
    </div>
  );
}
