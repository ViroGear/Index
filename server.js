/* =========================================================
   Career Copilot — minimal zero-dependency server.
   - Serves the static index.html
   - Proxies Gemini calls so the API key stays server-side
   Requires Node 18+ (built-in fetch). No npm install needed.

   Run:  GEMINI_API_KEY=your_key  node server.js
   (or put the key in a .env file — see .env.example)
========================================================= */
const http = require('http');
const fs = require('fs');
const path = require('path');

/* ---- tiny .env loader (no dependency) ---- */
(function loadEnv() {
  try {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) return;
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
  } catch {}
})();

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY || '';
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const ALLOWED_MODELS = new Set([
  'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'
]);

function send(res, status, body, type = 'application/json') {
  res.writeHead(status, { 'Content-Type': type });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

async function handleGemini(req, res) {
  if (!API_KEY) {
    return send(res, 500, { error: 'Server has no GEMINI_API_KEY configured. Set it in .env or the environment.' });
  }
  let raw = '';
  req.on('data', c => { raw += c; if (raw.length > 1e6) req.destroy(); });
  req.on('end', async () => {
    let payload;
    try { payload = JSON.parse(raw || '{}'); }
    catch { return send(res, 400, { error: 'Invalid JSON body.' }); }

    const { prompt, schema, model } = payload;
    if (!prompt || typeof prompt !== 'string') {
      return send(res, 400, { error: 'Missing "prompt".' });
    }
    const useModel = ALLOWED_MODELS.has(model) ? model : DEFAULT_MODEL;

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 }
    };
    if (schema) {
      body.generationConfig.responseMimeType = 'application/json';
      body.generationConfig.responseSchema = schema;
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${useModel}:generateContent?key=${encodeURIComponent(API_KEY)}`;
      const gRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await gRes.json();
      if (!gRes.ok) {
        return send(res, gRes.status, { error: data.error?.message || `Gemini error ${gRes.status}` });
      }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      // Return just the text; client parses (handles schema/non-schema uniformly).
      send(res, 200, { text });
    } catch (e) {
      send(res, 502, { error: 'Upstream request failed: ' + e.message });
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/gemini') {
    return handleGemini(req, res);
  }
  // expose whether a server key is configured (so the UI can hide the key prompt)
  if (req.method === 'GET' && req.url === '/api/status') {
    return send(res, 200, { proxy: true, keyConfigured: !!API_KEY, model: DEFAULT_MODEL });
  }
  // static: only ever serve index.html
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    const file = path.join(__dirname, 'index.html');
    fs.readFile(file, (err, buf) => {
      if (err) return send(res, 404, 'Not found', 'text/plain');
      send(res, 200, buf, 'text/html; charset=utf-8');
    });
    return;
  }
  send(res, 404, 'Not found', 'text/plain');
});

server.listen(PORT, () => {
  console.log(`\n  Career Copilot → http://localhost:${PORT}`);
  console.log(`  Gemini key configured: ${API_KEY ? 'yes ✓' : 'NO — set GEMINI_API_KEY'}\n`);
});
