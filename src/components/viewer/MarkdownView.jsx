import ReactMarkdown from 'react-markdown';

export default function MarkdownView({ md }) {
  if (!md) return null;
  return (
    <div className="markdown-body">
      <ReactMarkdown>{md}</ReactMarkdown>
    </div>
  );
}
