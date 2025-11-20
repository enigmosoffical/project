// Lightweight Gemini client for browser usage.
// NOTE: For production, prefer calling Google Gemini from a server-side proxy to keep your API key secret.

export async function getGeminiResponse(messages: { role: 'user' | 'assistant' | 'system'; content: string }[]) {
  // If a proxy URL is provided via env, call the proxy instead of Google directly.
  const PROXY = String(import.meta.env.VITE_GEMINI_PROXY_URL || '').trim();
  if (PROXY) {
    try {
      const resp = await fetch(PROXY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(`Proxy request failed: ${resp.status} ${t}`);
      }

      const json = await resp.json();
      // Prefer `text` field returned by the proxy
      if (json && typeof json.text === 'string') return json.text;
      return JSON.stringify(json);
    } catch (e) {
      console.warn('Gemini proxy failed, falling back to direct client call:', e);
      // fall through to direct client path below
    }
  }

  // Direct client-side call (not recommended for production because it exposes the API key)
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!API_KEY) {
    // Return a friendly message instead of throwing – upstream caller can surface this directly.
    return 'Gemini is not configured. Add VITE_GEMINI_API_KEY to your .env or set VITE_GEMINI_PROXY_URL to a proxy endpoint.';
  }

    // Map our generic messages to Gemini's "contents" format.
    // Gemini expects: contents: [{ role: 'user'|'model', parts: [{ text: '...'}] }]
    // We'll fold 'system' into the first user message as a prefix.
    let systemPrefix = '';
    const contents = [] as any[];
    for (const m of messages) {
      if (m.role === 'system') {
        systemPrefix += (systemPrefix ? '\n' : '') + m.content;
        continue;
      }
      const role = m.role === 'assistant' ? 'model' : 'user';
      let text = m.content;
      if (role === 'user' && systemPrefix) {
        text = systemPrefix + '\n\n' + text;
        systemPrefix = ''; // only prepend once
      }
      contents.push({ role, parts: [{ text }] });
    }
    if (systemPrefix) {
      // If only system messages existed before any user, add a dummy user content.
      contents.unshift({ role: 'user', parts: [{ text: systemPrefix }] });
    }

    // Allow overriding API version/model via env; default to v1beta and -latest for best availability
  const API_VERSION = String(import.meta.env.VITE_GEMINI_API_VERSION || 'v1beta');
  const MODEL = String(import.meta.env.VITE_GEMINI_MODEL || 'models/gemini-1.5-flash-latest');
  // Keep env for possible future tuning (currently unused after prioritizing override)
  // const PREFER_FAST = String((import.meta.env.VITE_GEMINI_PREFER_FAST ?? 'true')).toLowerCase() === 'true';

    // If a specific model/version is provided, try only that; else try a small fallback list.
    const candidates: { version: string; model: string }[] = [];
    const hasOverride = Boolean(import.meta.env.VITE_GEMINI_API_VERSION || import.meta.env.VITE_GEMINI_MODEL);
    const baseChain: { version: string; model: string }[] = [
      { version: 'v1beta', model: 'models/gemini-1.5-flash-latest' },
      { version: 'v1beta', model: 'models/gemini-2.0-flash' },
      { version: 'v1beta', model: 'models/gemini-1.5-pro-latest' },
      { version: 'v1beta', model: 'models/gemini-2.5-pro' },
      { version: 'v1', model: 'models/gemini-pro' }
    ];
    // Always try explicit override first if present
    if (hasOverride) {
      candidates.push({ version: API_VERSION, model: MODEL });
    }
    for (const c of baseChain) {
      if (!(hasOverride && c.version === API_VERSION && c.model === MODEL)) {
        candidates.push(c);
      }
    }

    const DEBUG = String(import.meta.env.VITE_GEMINI_DEBUG || '').toLowerCase() === 'true';
    let lastErr: any = null;
    for (const cand of candidates) {
      if (DEBUG) console.info('[Gemini] trying', `${cand.version}/${cand.model}`);
      const url = `https://generativelanguage.googleapis.com/${cand.version}/${cand.model}:generateContent?key=${API_KEY}`;
      const body = { contents, generationConfig: { temperature: 0.2 } };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const text = await res.text();
        // Retryable statuses: 404 (wrong model), 429/5xx (overload)
        if ([404, 429, 500, 502, 503, 504].includes(res.status)) {
          lastErr = new Error(`Gemini ${res.status} for ${cand.version}/${cand.model}: ${text}`);
          // brief backoff before next candidate
          await new Promise(r => setTimeout(r, 150));
          continue;
        }
        throw new Error(`Gemini request failed: ${res.status} ${text}`);
      }

      const data = await res.json();
      let out = '';
      try {
        if (Array.isArray(data.candidates) && data.candidates[0]?.content?.parts) {
          out = data.candidates[0].content.parts.map((p: any) => p.text || '').join('');
        }
      } catch {}
      if (!out) out = JSON.stringify(data);
      return out;
    }
    // If we exhausted candidates
    if (lastErr) throw lastErr;
    throw new Error('Gemini request failed: no valid model endpoint was reachable');
}

// Streaming variant for lower perceived latency and typing effect
export async function streamGeminiResponse(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  opts: { onChunk: (delta: string) => void; timeoutMs?: number }
) {
  const PROXY = String(import.meta.env.VITE_GEMINI_PROXY_URL || '').trim();
  if (PROXY) {
    try {
      // Current proxy doesn't implement streaming; fallback to non-streaming via proxy first
      const full = await getGeminiResponse(messages);
      // Simulate typing effect
      const text = typeof full === 'string' ? full : JSON.stringify(full);
      for (let i = 0; i < text.length; i += 5) {
        opts.onChunk(text.slice(i, i + 5));
        await new Promise(r => setTimeout(r, 10));
      }
      return text;
    } catch (e) {
      console.warn('Gemini proxy (non-streaming) failed, falling back to direct streaming:', e);
      // fall through to direct streaming path below
    }
  }

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!API_KEY) {
    const msg = 'Gemini is not configured. Add VITE_GEMINI_API_KEY to your .env or set VITE_GEMINI_PROXY_URL to a proxy endpoint.';
    opts.onChunk(msg);
    return msg;
  }

  // Build contents from messages (same as non-streaming)
  let systemPrefix = '';
  const contents = [] as any[];
  for (const m of messages) {
    if (m.role === 'system') {
      systemPrefix += (systemPrefix ? '\n' : '') + m.content;
      continue;
    }
    const role = m.role === 'assistant' ? 'model' : 'user';
    let text = m.content;
    if (role === 'user' && systemPrefix) {
      text = systemPrefix + '\n\n' + text;
      systemPrefix = '';
    }
    contents.push({ role, parts: [{ text }] });
  }
  if (systemPrefix) {
    contents.unshift({ role: 'user', parts: [{ text: systemPrefix }] });
  }

  const API_VERSION = String(import.meta.env.VITE_GEMINI_API_VERSION || 'v1beta');
  const MODEL = String(import.meta.env.VITE_GEMINI_MODEL || 'models/gemini-1.5-flash-latest');

  const candidates: { version: string; model: string }[] = [];
  const hasOverride = Boolean(import.meta.env.VITE_GEMINI_API_VERSION || import.meta.env.VITE_GEMINI_MODEL);
  const baseChain: { version: string; model: string }[] = [
    { version: 'v1beta', model: 'models/gemini-1.5-flash-latest' },
    { version: 'v1beta', model: 'models/gemini-2.0-flash' },
    { version: 'v1beta', model: 'models/gemini-1.5-pro-latest' },
    { version: 'v1beta', model: 'models/gemini-2.5-pro' },
    { version: 'v1', model: 'models/gemini-pro' }
  ];
  // Always try explicit override first if present
  if (hasOverride) {
    candidates.push({ version: API_VERSION, model: MODEL });
  }
  for (const c of baseChain) {
    if (!(hasOverride && c.version === API_VERSION && c.model === MODEL)) {
      candidates.push(c);
    }
  }

  const DEBUG = String(import.meta.env.VITE_GEMINI_DEBUG || '').toLowerCase() === 'true';
  let lastErr: any = null;
  for (const cand of candidates) {
    if (DEBUG) console.info('[Gemini stream] trying', `${cand.version}/${cand.model}`);
    const url = `https://generativelanguage.googleapis.com/${cand.version}/${cand.model}:streamGenerateContent?key=${API_KEY}`;
    const body = { contents, generationConfig: { temperature: 0.2 } };
    try {
      const ac = new AbortController();
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: ac.signal
      });

      if (!res.ok) {
        const text = await res.text();
        if ([404, 429, 500, 502, 503, 504].includes(res.status)) {
          lastErr = new Error(`Gemini stream ${res.status} for ${cand.version}/${cand.model}: ${text}`);
          await new Promise(r => setTimeout(r, 150));
          continue;
        }
        throw new Error(`Gemini stream failed: ${res.status} ${text}`);
      }

      if (!res.body) throw new Error('No response body for streaming');
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let acc = '';
      let fullText = '';
      let gotFirst = false;
      const timeout = typeof opts.timeoutMs === 'number' ? opts.timeoutMs! : 3000;
      const timer = setTimeout(() => {
        if (!gotFirst) {
          try { ac.abort(); } catch {}
        }
      }, Math.max(1000, timeout));
      // Helper: extract complete JSON objects from acc using brace depth parsing
      const extractObjects = (buffer: string): { objects: any[]; rest: string } => {
        const objs: any[] = [];
        let depth = 0;
        let inStr = false;
        let esc = false;
        let start = -1;
        for (let i = 0; i < buffer.length; i++) {
          const ch = buffer[i];
          if (inStr) {
            if (esc) {
              esc = false;
            } else if (ch === '\\') {
              esc = true;
            } else if (ch === '"') {
              inStr = false;
            }
            continue;
          }
          if (ch === '"') { inStr = true; continue; }
          if (ch === '{') {
            if (depth === 0) start = i;
            depth++;
          } else if (ch === '}') {
            depth--;
            if (depth === 0 && start >= 0) {
              const chunk = buffer.slice(start, i + 1);
              try {
                const obj = JSON.parse(chunk);
                objs.push(obj);
                // remove processed part and restart scanning from beginning
                buffer = buffer.slice(i + 1);
                i = -1; // restart loop
                start = -1;
              } catch {
                // if parse fails, keep accumulating
              }
            }
          }
        }
        return { objects: objs, rest: buffer };
      };

      while (!done) {
        const { value, done: d } = await reader.read();
        done = d || false;
        if (value) {
          acc += decoder.decode(value, { stream: true });
          const { objects, rest } = extractObjects(acc);
          acc = rest;
          for (const obj of objects) {
            try {
              const parts = obj?.candidates?.[0]?.content?.parts || obj?.candidates?.[0]?.delta?.parts;
              if (Array.isArray(parts)) {
                const delta = parts.map((p: any) => p.text || '').join('');
                if (delta) {
                  fullText += delta;
                  if (!gotFirst) { gotFirst = true; clearTimeout(timer); }
                  opts.onChunk(delta);
                }
              }
            } catch {}
          }
        }
      }
      if (acc.trim()) {
        const { objects } = extractObjects(acc.trim());
        for (const obj of objects) {
          try {
            const parts = obj?.candidates?.[0]?.content?.parts || obj?.candidates?.[0]?.delta?.parts;
            if (Array.isArray(parts)) {
              const delta = parts.map((p: any) => p.text || '').join('');
              if (delta) {
                fullText += delta;
                if (!gotFirst) { gotFirst = true; clearTimeout(timer); }
                opts.onChunk(delta);
              }
            }
          } catch {}
        }
      }
      clearTimeout(timer);
      if (!fullText) {
        // As a last resort, fetch non-streaming full response to ensure the user sees something
        try {
          const full = await getGeminiResponse(messages);
          const text = typeof full === 'string' ? full : JSON.stringify(full);
          for (let i = 0; i < text.length; i += 5) {
            opts.onChunk(text.slice(i, i + 5));
            await new Promise(r => setTimeout(r, 10));
          }
          return text;
        } catch {}
      }
      return fullText || '';
    } catch (err) {
      // If timed out before first token, fall back to non-streaming
      if ((err as any)?.name === 'AbortError') {
        try {
          const full = await getGeminiResponse(messages);
          const text = typeof full === 'string' ? full : JSON.stringify(full);
          for (let i = 0; i < text.length; i += 5) {
            opts.onChunk(text.slice(i, i + 5));
            await new Promise(r => setTimeout(r, 10));
          }
          return text;
        } catch (e2) {
          lastErr = e2;
          continue;
        }
      } else {
        lastErr = err;
        continue;
      }
    }
  }
  if (lastErr) throw lastErr;
  throw new Error('Gemini streaming failed: no valid model endpoint was reachable');
}
