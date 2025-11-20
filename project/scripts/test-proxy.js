// Simple script to POST a test message to the local Gemini proxy.
// Usage:
//   GEMINI_PROXY_KEY=token node scripts/test-proxy.js
// If the proxy requires no proxy key, you can run it without GEMINI_PROXY_KEY.

const PROXY_URL = process.env.PROXY_URL || 'http://localhost:3000/api/gemini';
const PROXY_KEY = process.env.GEMINI_PROXY_KEY || '';

async function run() {
  const messages = [
    { role: 'user', content: 'Hello! Please summarize how to prepare for exams using PYQs.' }
  ];

  const headers = { 'Content-Type': 'application/json' };
  if (PROXY_KEY) headers['X-PROXY-KEY'] = PROXY_KEY;

  try {
    const res = await fetch(PROXY_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ messages }),
    });

    const json = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(json, null, 2));
  } catch (err) {
    console.error('Request failed:', err);
  }
}

run();
