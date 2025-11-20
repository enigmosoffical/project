// Minimal server-side proxy for Google Gemini (Generative API).
// This file intentionally avoids external dependencies so you can run it with plain Node (v18+).
// Usage: GEMINI_API_KEY=your_key node server.js

import http from 'http';
import fs from 'fs';
import path from 'path';

// Load .env file (if present) into process.env for convenience when running the server locally.
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
      const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
      if (m) {
        const k = m[1];
        let v = m[2] || '';
        // Remove surrounding quotes
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1);
        }
        // Only set env var if not already set in process.env
        if (!process.env[k]) process.env[k] = v;
      }
    });
  }
} catch (e) {
  // ignore any errors reading .env
}

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

async function handleGemini(req, res) {
  if (req.method === 'OPTIONS') {
    // CORS preflight
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  let body = '';
  for await (const chunk of req) body += chunk;

  let payload;
  try {
    payload = JSON.parse(body || '{}');
  } catch (e) {
    return sendJson(res, 400, { error: 'Invalid JSON body' });
  }

  const messages = payload.messages || [];

  const API_KEY = process.env.GEMINI_API_KEY;
  const PROXY_KEY = process.env.GEMINI_PROXY_KEY || '';

  // If a proxy key is configured, require callers to present it in the X-PROXY-KEY header.
  if (PROXY_KEY) {
    const incomingKey = (req.headers['x-proxy-key'] || req.headers['x-proxy-key'.toLowerCase()]) || req.headers['x-proxy-key'];
    // Header values can be string or array; normalize
    const headerKey = Array.isArray(incomingKey) ? incomingKey[0] : incomingKey;
    if (!headerKey || String(headerKey) !== PROXY_KEY) {
      return sendJson(res, 401, { error: 'Missing or invalid X-PROXY-KEY header' });
    }
  }

  if (!API_KEY) return sendJson(res, 500, { error: 'Server missing GEMINI_API_KEY env var' });

  // Convert generic messages to Gemini contents format.
  let systemPrefix = '';
  const contents = [];
  for (const m of messages) {
    const roleRaw = m.role || 'user';
    if (roleRaw === 'system') {
      systemPrefix += (systemPrefix ? '\n' : '') + m.content;
      continue;
    }
    const role = roleRaw === 'assistant' ? 'model' : 'user';
    let text = m.content;
    if (role === 'user' && systemPrefix) {
      text = systemPrefix + '\n\n' + text;
      systemPrefix = '';
    }
    contents.push({ role, parts: [{ text }] });
  }
  if (systemPrefix) contents.unshift({ role: 'user', parts: [{ text: systemPrefix }] });

  const API_VERSION = process.env.GEMINI_API_VERSION || 'v1beta';
  const MODEL = process.env.GEMINI_MODEL || 'models/gemini-1.5-flash-latest';

  const candidates = (process.env.GEMINI_API_VERSION || process.env.GEMINI_MODEL)
    ? [{ version: API_VERSION, model: MODEL }]
    : [
        { version: 'v1beta', model: 'models/gemini-1.5-flash-latest' },
        { version: 'v1beta', model: 'models/gemini-1.5-pro-latest' },
        { version: 'v1', model: 'models/gemini-pro' }
      ];

  const reqBody = { contents, generationConfig: { temperature: 0.2 } };

  let lastErrorText = '';
  for (const cand of candidates) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/${cand.version}/${cand.model}:generateContent?key=${API_KEY}`;
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody),
      });

      if (!r.ok) {
        const t = await r.text();
        lastErrorText = `HTTP ${r.status} ${t}`;
        if (r.status === 404) continue; // try next candidate
        return sendJson(res, r.status, { error: t });
      }

      const data = await r.json();
      let text = '';
      try {
        if (Array.isArray(data.candidates) && data.candidates[0]?.content?.parts) {
          text = data.candidates[0].content.parts.map(p => p.text || '').join('');
        }
      } catch {}
      if (!text) text = JSON.stringify(data);
      return sendJson(res, 200, { text, raw: data });
    } catch (err) {
      lastErrorText = String(err);
      // try next candidate
    }
  }
  return sendJson(res, 502, { error: `Gemini request failed for all candidates: ${lastErrorText}` });
}

async function handleListModels(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) return sendJson(res, 500, { error: 'Server missing GEMINI_API_KEY env var' });

  const API_VERSION = process.env.GEMINI_API_VERSION || 'v1beta';
  const base = `https://generativelanguage.googleapis.com/${API_VERSION}/models?key=${API_KEY}`;

  try {
    const reqUrl = new URL(req.url || '/', `http://${req.headers.host}`);
    // Pass through query params (pageSize, pageToken, etc.)
    const qs = reqUrl.search ? reqUrl.search : '';
    const endpoint = base + qs;
    const r = await fetch(endpoint, { method: 'GET' });
    const data = await r.json();
    if (!r.ok) return sendJson(res, r.status, data);
    return sendJson(res, 200, data);
  } catch (err) {
    return sendJson(res, 502, { error: String(err) });
  }
}

const server = http.createServer((req, res) => {
  try {
    const base = `http://${req.headers.host}`;
    const parsed = new URL(req.url || '/', base);
    if (parsed.pathname === '/api/gemini') return handleGemini(req, res);
    if (parsed.pathname === '/api/gemini/models') return handleListModels(req, res);
    // Health endpoint
    if (parsed.pathname === '/health') return sendJson(res, 200, { status: 'ok' });
    // Fallback
    sendJson(res, 404, { error: 'Not found' });
  } catch (e) {
    sendJson(res, 500, { error: String(e) });
  }
});

function start(port, attemptsLeft = 5) {
  server.listen(port, () => {
    console.log(`Gemini proxy running on http://localhost:${port} — POST /api/gemini`);
  }).on('error', err => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} in use.`);
      if (attemptsLeft > 0) {
        const next = port + 1;
        console.log(`Retrying on port ${next} (attempts left: ${attemptsLeft - 1})...`);
        start(next, attemptsLeft - 1);
      } else {
        console.error('Out of port retry attempts. Set PORT env var to a free port or free the existing process.');
        process.exit(1);
      }
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
}

start(PORT);

