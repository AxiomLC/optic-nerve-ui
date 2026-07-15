import { useState, useRef, useEffect } from 'react';

/**
 * VoiceChat — microphone UI with 3 states:
 *   idle    (purple)    — static mic icon
 *   listening (green)   — mic + CSS pulse rings, turns off on click or 2s timeout
 *   speaking  (light purple) — same pulse, slower — AI talking
 *
 * Chat area above mic: scrolling message list with input at bottom.
 * Placeholder — real STT/TTS/LLM wiring comes later via n8n webhook.
 */

const STATE = { IDLE: 'idle', LISTENING: 'listening', SPEAKING: 'speaking' };

export default function VoiceChat({ onExpandChange, voiceExpanded, onSearchPayload }) {
  const [micState, setMicState] = useState(STATE.IDLE);
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

  // TODO: wire to n8n voice-chat webhook
  // On response: if payload has search results shape → onSearchPayload(results)
  // Else → add as chat message

  return (
    <div className={`voice-chat-panel ${voiceExpanded ? 'expanded' : ''}`}>
      <div className="voice-chat-box">
        {/* Chat messages area — placeholder */}
        <div className="voice-messages">
          <p className="msg assistant">AI Voice ready. Tap the mic to speak.</p>
        </div>

        {/* Typing input — placeholder */}
        <div className="voice-input-area">
          <input type="text" placeholder="Type a message..." className="voice-text-input" />
        </div>
      </div>

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
