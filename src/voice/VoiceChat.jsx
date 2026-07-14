import { useState } from 'react';

/**
 * VoiceChat — expandable panel that connects to the n8n voice-chat webhook.
 *
 * When expanded, the search panel collapses/minimizes to make room.
 * The viewer stays visible regardless of voice-chat state.
 *
 * Real voice logic (STT / TTS / streaming) lives in a separate module
 * that this component wires into the layout — see the Tech Buildout doc
 * for the `voiceChat.js` entry point.
 */
export default function VoiceChat({ onExpandChange, voiceExpanded }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  function toggle() {
    onExpandChange(!voiceExpanded);
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    // TODO: wire to n8n voice-chat webhook
    // const res = await fetch(`${N8N_BASE}/webhook/voice-chat`, { ... });
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', text: '[voice response placeholder]' }]);
    }, 500);
  }

  return (
    <div className={`voice-chat ${voiceExpanded ? 'expanded' : 'collapsed'}`}>
      <button className="voice-toggle" onClick={toggle}>
        {voiceExpanded ? '✕ Close Voice' : '🎙 AI Voice'}
      </button>

      {voiceExpanded && (
        <div className="voice-body">
          <div className="voice-messages">
            {messages.map((m, i) => (
              <p key={i} className={`msg ${m.role}`}>{m.text}</p>
            ))}
          </div>
          <form onSubmit={handleSend} className="voice-input">
            <input
              type="text"
              placeholder="Message…"
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}
