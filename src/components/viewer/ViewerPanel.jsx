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
          <button className="btn-get-file" onClick={onGetFile}>Get File</button>
        </div>
      )}
    </div>
  );
}
