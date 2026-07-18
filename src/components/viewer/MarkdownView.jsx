// Optic Nerve — ver 1.0 beta July 2026
// Renders file markdown content via react-markdown.

import ReactMarkdown from 'react-markdown';

export default function MarkdownView({ md }) {
  if (!md) return null;
  // =============== 1. Render Markdown ===============
  return (
    <div className="markdown-body">
      <ReactMarkdown>{md}</ReactMarkdown>
    </div>
  );
}
