# Career Copilot

AI career copilot — pick a dream goal (e.g. *"SWE role at Meta"*), and Gemini builds your
roadmap, analyzes your skill gaps, and gives you real-world challenges to prove yourself.
Built for the **Build with Gemini XPRIZE**.

Three tabs:
1. **User Identity** — who you are + your goal.
2. **Roadmap** — AI readiness score, gap analysis, and milestone plan.
3. **Portfolio** — your projects + AI-generated skill challenges with scored feedback.

## Two ways to run

### A. Quick (no server) — key lives in your browser
Just open `index.html` in a browser. Click **Connect Gemini** and paste a key from
[aistudio.google.com/apikey](https://aistudio.google.com/apikey). Fine for solo demos.

### B. Recommended — server proxy, key stays server-side
The Gemini key never reaches the browser.

```bash
# 1. add your key
cp .env.example .env        # then edit .env and paste your key
#   (Windows PowerShell:  Copy-Item .env.example .env)

# 2. start (needs Node 18+, no npm install required)
node server.js
# or: npm start
```

Then open <http://localhost:3000>. The client auto-detects it's behind the proxy and
routes all AI calls through `POST /api/gemini`, which injects the key server-side.

## How it works
- `index.html` — the whole app (UI + logic). State persists in `localStorage`.
- `server.js` — zero-dependency Node server: serves the page and proxies Gemini.
- Every AI call goes through one `callGemini(prompt, schema)` function and uses Gemini's
  **structured JSON output** (`responseSchema`) so responses parse reliably.

## Next steps
- Milestone progress tracking (check off milestones, watch readiness climb).
- Export roadmap + portfolio as a shareable recruiter page / PDF.
