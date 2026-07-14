import { useState } from 'react';

export default function MediaView({ file, previewUrl, onRetryPreview }) {
  const [error, setError] = useState(false);

  if (!file) return null;

  const isVideo = file.file_type?.startsWith('video/');

  if (previewUrl && !error) {
    if (isVideo) {
      return (
        <video controls className="media-preview" onError={() => { setError(true); onRetryPreview?.(file); }}>
          <source src={previewUrl} />
        </video>
      );
    }
    return (
      <img
        src={previewUrl}
        alt={file.title || ''}
        className="media-preview"
        onError={() => { setError(true); onRetryPreview?.(file); }}
      />
    );
  }

  if (error && onRetryPreview) {
    return <p className="media-error">Preview unavailable. Click to retry.</p>;
  }

  return <p className="media-pending">Loading preview…</p>;
}
