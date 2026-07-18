// Optic Nerve — ver 1.0 beta July 2026
// Displays image/video preview with error fallback. Currently unused —
// ViewerPanel handles media inline.

import { useState } from 'react';

export default function MediaView({ file, previewUrl, onRetryPreview }) {
  const [error, setError] = useState(false);

  if (!file) return null;

  // =============== 1. Detect Media Type ===============
  const isVideo = file.file_type?.startsWith('video/');

  // =============== 2. Render Preview or Error ===============
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
    return <p className="media-error">Preview error. Click Get File to retry.</p>;
  }

  return null;
}
