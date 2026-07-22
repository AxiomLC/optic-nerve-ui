// ═══════════════════════════════════════════════════════════════════
// Optic Nerve — TTS Proxy (Cloudflare Pages Function)
// Reads GROK_TTS_API_KEY from Cloudflare runtime env vars (set in
// dashboard → Settings → Environment Variables).
// Key never reaches the browser.
// ═══════════════════════════════════════════════════════════════════

// ── DEV CONTROLS ──────────────────────────────────────────────────
const TTS_ENDPOINT = 'https://api.x.ai/v1/tts';
const TTS_VOICE    = 'Rex';
const TTS_LANGUAGE = 'en';
// ──────────────────────────────────────────────────────────────────

export async function onRequest(context) {
	const { request, env } = context;

	if (request.method !== 'POST') {
		return new Response('Method not allowed', { status: 405 });
	}

	const apiKey = env.GROK_TTS_API_KEY;
	if (!apiKey) {
		return new Response('TTS not configured — missing GROK_TTS_API_KEY', { status: 500 });
	}

	let text;
	try {
		const body = await request.json();
		text = body?.text;
	} catch {
		return new Response('Invalid JSON body', { status: 400 });
	}
	if (!text || typeof text !== 'string') {
		return new Response('Missing or invalid "text" field', { status: 400 });
	}

	const upstream = await fetch(TTS_ENDPOINT, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			text,
			voice_id: TTS_VOICE,
			language: TTS_LANGUAGE,
		}),
	});

	if (!upstream.ok) {
		return new Response(`TTS upstream error: ${upstream.status}`, { status: 502 });
	}

	return new Response(upstream.body, {
		headers: {
			'Content-Type': 'audio/mpeg',
			'Cache-Control': 'no-cache',
		},
	});
}
