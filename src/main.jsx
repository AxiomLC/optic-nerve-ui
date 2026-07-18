// Optic Nerve — ver 1.0 beta July 2026
// App entry point. Wraps App in ErrorBoundary + StrictMode.

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/layout.css';

function ErrorFallback({ error }) {
  return (
    <div style={{
      background: '#0a0a0a', color: '#f2f2f2',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', padding: '2rem', textAlign: 'center'
    }}>
      <div>
        <h1 style={{ color: '#ff6ec7' }}>Optic Nerve</h1>
        <p style={{ color: '#f55' }}>{error.message}</p>
        <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '1rem' }}>
          Check the browser console (F12) for details.
        </p>
      </div>
    </div>
  );
}

// =============== 1. Error Boundary ===============
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// =============== 2. Mount ===============
const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
