// ═══════════════════════════════════════════════════════════════════
// Optic Nerve — Voice Chat (Charles AI agent)
// STT: browser SpeechRecognition | TTS: /api/tts proxy (Grok) + fallback
// n8n: POST /webhook/charles with { text, sessionId }
// Search-shaped responses → onSearchPayload (switches to search layer)
// Chat responses → transcript bubbles + spoken aloud
// ═══════════════════════════════════════════════════════════════════

import { useState, useRef, useEffect, useCallback } from 'react';
import { voiceChat } from '../lib/n8nClient';
import Markdown from 'react-markdown';

const STATE = { IDLE: 'idle', LISTENING: 'listening', SPEAKING: 'speaking' };
const SESSION_KEY = 'optic-nerve-voice-session';

function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function isSearchPayload(data) {
  return Array.isArray(data) && data.length > 0 && data[0].source_id;
}

// Strip URLs from text before sending to TTS — never read URLs aloud
function stripUrls(text) {
  return text.replace(/https?:\/\/[^\s,)]+/g, '').replace(/\s{2,}/g, ' ').trim();
}

// =============== 1. Voice Chat Component ===============
export default function VoiceChat({ onSearchPayload, onClose, messages, setMessages }) {
  const [micState, setMicState] = useState(STATE.IDLE);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const recognitionRef = useRef(null);
  const messagesRef = useRef(null);
  const ttsGenRef = useRef(0);
  const sessionId = useRef(getSessionId());

  // Auto-scroll transcript
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  // -------------- 2. Speak (TTS via proxy, fallback to SpeechSynthesis) --------------
  const speakText = useCallback(async (text, gen) => {
    // Strip URLs + intro phrases before TTS (keep full text in chat bubble)
    let cleanText = stripUrls(text);
    // Strip everything after colon for web search and KB intro lines
    const introLines = ['Here\'s what I found on the web:', 'Here\'s the current Knowledge Base:'];
    for (const line of introLines) {
      if (cleanText.startsWith(line)) {
        cleanText = line;
        break;
      }
    }
    setMicState(STATE.SPEAKING);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText }),
      });
      if (!res.ok) throw new Error(`TTS proxy: ${res.status}`);
      if (gen !== ttsGenRef.current) { setMicState(STATE.IDLE); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => { setMicState(STATE.IDLE); URL.revokeObjectURL(url); };
      audio.onerror = () => { setMicState(STATE.IDLE); URL.revokeObjectURL(url); };
      await audio.play();
    } catch {
      if (gen !== ttsGenRef.current) { setMicState(STATE.IDLE); return; }
      try {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.onend = () => setMicState(STATE.IDLE);
        utterance.onerror = () => setMicState(STATE.IDLE);
        speechSynthesis.speak(utterance);
      } catch {
        setMicState(STATE.IDLE);
      }
    }
  }, []);

  // -------------- 3. Send text to n8n Charles agent --------------
  const sendToN8n = useCallback(async (text) => {
    ttsGenRef.current++;
    setIsProcessing(true);
    setMessages(prev => [...prev, { role: 'user', text }]);
    try {
      const data = await voiceChat(text, sessionId.current);
      if (isSearchPayload(data)) {
        onSearchPayload(data);
      } else {
        const reply = typeof data === 'string' ? data : JSON.stringify(data);
        setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
        if (reply) speakText(reply, ttsGenRef.current);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: `Error: ${err.message}` }]);
    } finally {
      setIsProcessing(false);
    }
  }, [onSearchPayload, speakText, setMessages]);

  // -------------- 4. STT (SpeechRecognition) --------------
  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Speech recognition not supported in this browser. Use the keyboard instead.' }]);
      setMicState(STATE.IDLE);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setMicState(STATE.IDLE);
      sendToN8n(text);
    };

    recognition.onerror = () => {
      setMicState(STATE.IDLE);
    };

    recognition.onend = () => {
      setMicState(prev => prev === STATE.LISTENING ? STATE.IDLE : prev);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function toggleMic() {
    if (micState === STATE.IDLE && !isProcessing) {
      setMicState(STATE.LISTENING);
      startListening();
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
      if (micState === STATE.SPEAKING) {
        speechSynthesis.cancel();
      }
      setMicState(STATE.IDLE);
    }
  }

  // -------------- 5. Keyboard submit --------------
  function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    const text = input.trim();
    setInput('');
    sendToN8n(text);
  }

  // -------------- 6. Render --------------
  return (
    <div className="voice-layer">
      {/* Header */}
      <div className="voice-header">
        <span className="voice-header-title">AI Voice</span>
        <button className="voice-close-btn" onClick={onClose} title="Close voice">&times;</button>
      </div>

      {/* Transcript */}
      <div className="voice-messages" ref={messagesRef}>
        {messages.map((m, i) => (
          <div key={i} className={`voice-bubble ${m.role}`}>
            <div className="bubble-text"><Markdown>{m.text}</Markdown></div>
          </div>
        ))}
        {isProcessing && (
          <div className="voice-bubble assistant">
            <div className="typing-indicator"><span>&#9679;</span><span>&#9679;</span><span>&#9679;</span></div>
          </div>
        )}
      </div>

      {/* Keyboard input — only when toggled open */}
      {keyboardOpen && (
        <form className="voice-input" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isProcessing}
          />
          <button type="submit" disabled={isProcessing || !input.trim()}>Send</button>
        </form>
      )}

      {/* Mic + keyboard toggle row */}
      <div className="voice-controls-row">
        <button
          className={`voice-kb-toggle ${keyboardOpen ? 'active' : ''}`}
          onClick={() => setKeyboardOpen(v => !v)}
          title="Toggle keyboard"
        >
          &#9000;
        </button>
        <div className="voice-controls-center">
          <div
            className={`voice-mic-container ${isProcessing ? 'processing' : micState}`}
            onClick={isProcessing ? undefined : toggleMic}
          >
            <div className="mic-ring ring-1" />
            <div className="mic-ring ring-2" />
            <div className="mic-ring ring-3" />
            <svg
              className="mic-icon-svg"
              width="22" height="22" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              style={{ display: micState === STATE.SPEAKING ? 'none' : 'block' }}
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            <svg
              className="mic-icon-svg"
              width="30" height="30" viewBox="0 0 24 24"
              fill="none" stroke="#c9a84c" strokeWidth="2"
              style={{ display: micState === STATE.SPEAKING ? 'block' : 'none' }}
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          </div>
        </div>
        <div className="voice-controls-spacer" />
      </div>
    </div>
  );
}
