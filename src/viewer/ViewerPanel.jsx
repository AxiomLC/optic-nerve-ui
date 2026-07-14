import MarkdownView from './MarkdownView';
import MediaView from './MediaView';

export default function ViewerPanel({ file, previewUrl, onRetryPreview }) {
  if (!file) {
    return <div className="viewer panel empty-state">Select a file to view</div>;
  }

  return (
    <div className="viewer panel scrollable">
      {/* Always show markdown if present */}
      <MarkdownView md={file.md} />

      <div className="viewer-actions">
        {previewUrl && (
          <button onClick={() => window.open(previewUrl, '_blank')}>
            Open File
          </button>
        )}
        {file.source_url && (
          <button onClick={() => window.open(file.source_url, '_blank')}>
            Open Source
          </button>
        )}
      </div>

      <MediaView
        file={file}
        previewUrl={previewUrl}
        onRetryPreview={onRetryPreview}
      />
    </div>
  );
}
