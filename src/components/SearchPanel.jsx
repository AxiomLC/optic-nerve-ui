import { useState } from 'react';
import { vectorSearch } from '../lib/n8nClient';

export default function SearchPanel({ onSelectFile, setSearchResults, searchResults, onSearchSubmit }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const results = await vectorSearch(query.trim());
      setSearchResults(results);
      if (onSearchSubmit) onSearchSubmit(results);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="search-panel">
      <div className="search-header">Vector Search</div>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Natural language search..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? '…' : 'Search'}
        </button>
      </form>
    </div>
  );
}
