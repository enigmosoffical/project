// Lists available Gemini models for the current API key.
// Usage:
//   GEMINI_API_KEY=... node scripts/list-models.js
// Optional:
//   GEMINI_API_VERSION=v1beta (default)

const API_KEY = process.env.GEMINI_API_KEY;
const API_VERSION = process.env.GEMINI_API_VERSION || 'v1beta';

if (!API_KEY) {
  console.error('Missing GEMINI_API_KEY env var');
  process.exit(1);
}

async function run() {
  const url = `https://generativelanguage.googleapis.com/${API_VERSION}/models?key=${API_KEY}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) {
    console.error('Error:', JSON.stringify(json, null, 2));
    process.exit(2);
  }
  const models = json.models || [];
  if (!models.length) {
    console.log('No models returned');
    return;
  }
  for (const m of models) {
    const name = m.name || '(unknown)';
    const display = m.displayName || '';
    const methods = (m.supportedGenerationMethods || []).join(', ');
    console.log(`- ${name}${display ? ` (${display})` : ''}  methods: [${methods}]`);
  }
}

run().catch(e => {
  console.error('Failed to list models:', e);
  process.exit(3);
});
