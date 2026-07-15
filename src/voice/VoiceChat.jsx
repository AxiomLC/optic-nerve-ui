import { useState, useRef, useEffect } from 'react';

/**
 * VoiceChat — in-column layer component.
 * Displays inside the left column's layer container.
 * Mic UI with 3 states: idle (purple), listening (green), speaking (light purple).
 * Placeholder — real STT/TTS/LLM wiring comes later via n8n webhook.
 *
 * Props:
 *   onExpandChange  — called with expanded state
 *   voiceExpanded   — boolean
 *   onSearchPayload — called if AI returns search-shaped results
 */
const STATE = { IDLE: 'idle', LISTENING: 'listening', SPEAKING: 'speaking' };

export default function VoiceChat({ onExpandChange, voiceExpanded, onSearchPayload }) {
  const [micState, setMicState] = useState(STATE.IDLE);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const timerRef = useRef(null);

  // Auto-timeout listening after 2s
  useEffect(() => {
    if (micState === STATE.LISTENING) {
      timerRef.current = setTimeout(() => {
        setMicState(STATE.IDLE);
      }, 2000);
    }
    return () => clearTimeout(timerRef.current);
  }, [micState]);

  function toggleMic() {
    if (micState === STATE.IDLE) {
      setMicState(STATE.LISTENING);
    } else {
      setMicState(STATE.IDLE);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    // TODO: wire to n8n voice-chat webhook
    // If response has search results shape, call onSearchPayload(results)
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', text: '[voice response placeholder]' }]);
    }, 500);
  }

  return (
    <div className="voice-layer">
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

      {/* Mic button with emanate rings */}
      <div className={`voice-mic-container ${micState}`} onClick={toggleMic}>
        <div className="mic-ring ring-1" />
        <div className="mic-ring ring-2" />
        <div className="mic-ring ring-3" />
        <div className="mic-icon">
          {micState === STATE.IDLE ? '🎤' : micState === STATE.LISTENING ? '🔴' : '💬'}
        </div>
      </div>
    </div>
  );
}
