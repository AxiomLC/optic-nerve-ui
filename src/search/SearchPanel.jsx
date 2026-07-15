import { useState } from 'react';
import { vectorSearch } from '../lib/n8nClient';

export default function SearchPanel({ onSelectFile, setSearchResults, searchResults }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const results = await vectorSearch(query.trim());
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="search-panel">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Semantic search…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? '…' : 'Search'}
        </button>
      </form>

      {searchResults && searchResults.length > 0 && (
        <ul className="search-results">
          {searchResults.map(r => (
            <li key={r.source_id} onClick={() => onSelectFile(r)}>
              <strong>{r.title}</strong>
              <span className="score">{(r.score * 100).toFixed(0)}%</span>
              <p>{r.summary}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
