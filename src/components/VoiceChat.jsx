// ═══════════════════════════════════════════════════════════════════
// Optic Nerve — Voice Chat (Charles AI agent)
// STT: browser SpeechRecognition | TTS: /api/tts proxy (Grok) + fallback
// n8n: POST /webhook/charles with { text, sessionId }
// Search-shaped responses → onSearchPayload (switches to search layer)
// Chat responses → transcript bubbles + spoken aloud
// ═══════════════════════════════════════════════════════════════════

import { useState, useRef, useEffect, useCallback } from 'react';
import { voiceChat } from '../lib/n8nClient';

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

// =============== 1. Voice Chat Component ===============
export default function VoiceChat({ onSearchPayload, onClose }) {
	const [micState, setMicState] = useState(STATE.IDLE);
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState('');
	const [isProcessing, setIsProcessing] = useState(false);
	const [keyboardOpen, setKeyboardOpen] = useState(false);
	const recognitionRef = useRef(null);
	const messagesRef = useRef(null);
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
	const speakText = useCallback(async (text) => {
		setMicState(STATE.SPEAKING);
		try {
			const res = await fetch('/api/tts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text }),
			});
			if (!res.ok) throw new Error(`TTS proxy: ${res.status}`);
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const audio = new Audio(url);
			audio.onended = () => { setMicState(STATE.IDLE); URL.revokeObjectURL(url); };
			audio.onerror = () => { setMicState(STATE.IDLE); URL.revokeObjectURL(url); };
			await audio.play();
		} catch {
			try {
				const utterance = new SpeechSynthesisUtterance(text);
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
		setIsProcessing(true);
		setMessages(prev => [...prev, { role: 'user', text }]);
		try {
			const data = await voiceChat(text, sessionId.current);
			if (isSearchPayload(data)) {
				onSearchPayload(data);
			} else {
				const reply = typeof data === 'string'
					? data
					: data?.output || data?.text || data?.response || JSON.stringify(data);
				setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
				if (reply) speakText(reply);
			}
		} catch (err) {
			setMessages(prev => [...prev, { role: 'assistant', text: `Error: ${err.message}` }]);
		} finally {
			setIsProcessing(false);
		}
	}, [onSearchPayload, speakText]);

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
				<span className="voice-header-title">Voice AI</span>
				<button className="voice-close-btn" onClick={onClose} title="Close voice">✕</button>
			</div>

			{/* Transcript */}
			<div className="voice-messages" ref={messagesRef}>
				{messages.length === 0 && (
					<p className="voice-hint">Ask a question about your documents, or tap the mic to speak.</p>
				)}
				{messages.map((m, i) => (
					<div key={i} className={`voice-bubble ${m.role}`}>
						<div className="bubble-text">{m.text}</div>
					</div>
				))}
				{isProcessing && (
					<div className="voice-bubble assistant">
						<div className="typing-indicator"><span>●</span><span>●</span><span>●</span></div>
					</div>
				)}
			</div>

			{/* Keyboard input — only when toggled open */}
			{keyboardOpen && (
				<form className="voice-input" onSubmit={handleSend}>
					<input
						type="text"
						placeholder="Type a message…"
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
					⌨
				</button>
				<div className="voice-controls-center">
					<div
						className={`voice-mic-container ${isProcessing ? 'processing' : micState}`}
						onClick={isProcessing ? undefined : toggleMic}
					>
						<div className="mic-ring ring-1" />
						<div className="mic-ring ring-2" />
						<div className="mic-ring ring-3" />
						<div className="mic-icon">
							{micState === STATE.IDLE && !isProcessing && '🎤'}
							{micState === STATE.LISTENING && '🎙'}
							{micState === STATE.SPEAKING && '🔊'}
							{isProcessing && '⏳'}
						</div>
					</div>
					<div className="mic-label">
						{micState === STATE.IDLE && !isProcessing && !keyboardOpen && 'Tap to speak'}
						{micState === STATE.IDLE && !isProcessing && keyboardOpen && ''}
						{micState === STATE.LISTENING && 'Listening…'}
						{micState === STATE.SPEAKING && 'Speaking…'}
						{isProcessing && 'Thinking…'}
					</div>
				</div>
				{/* Spacer to balance the row */}
				<div className="voice-controls-spacer" />
			</div>
		</div>
	);
}
