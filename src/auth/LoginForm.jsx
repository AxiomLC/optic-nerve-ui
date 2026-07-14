import { useState } from 'react';
import { getCanvas } from '../lib/supabaseClient';

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const canvas = await getCanvas(username, password);
      onLogin({ username, canvas });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-overlay">
      <form className="login-form panel" onSubmit={handleSubmit}>
        <h2>Optic Nerve</h2>
        <p className="sub">visual kernel</p>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoFocus
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
