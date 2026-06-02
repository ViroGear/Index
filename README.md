# Career Copilot

AI career copilot — pick a dream goal (e.g. *"SWE role at Meta"*), and Gemini builds your
roadmap, analyzes your skill gaps, and gives you real-world challenges to prove yourself.
Built for the **Build with Gemini XPRIZE**.

**🔗 Live demo:** https://virogear.github.io/Index/
*(Bring your own free Gemini key — click "Connect Gemini" and paste one from
[aistudio.google.com/apikey](https://aistudio.google.com/apikey). It's stored only in your browser.)*

Six tabs: **Identity → Roadmap → Portfolio → Interview Prep → Daily Coach → Player** — including
a gamified XP/level system, an evolving character, a rival bracket, and unlockable mentor wisdom.

## Two ways to run

### A. Quick (no server) — key lives in your browser
Just open `index.html` in a browser. Click **Connect Gemini** and paste a key from
[aistudio.google.com/apikey](https://aistudio.google.com/apikey). Fine for solo demos.

### B. Local proxy — key stays server-side
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

### C. Hosted with a hidden key (one shared key for all visitors)
Deploy the proxy so the key lives in a server env var — never in the repo or the browser,
and no visitor needs their own key. A real key **cannot** be hidden on GitHub Pages (static
files are public), so use a Node host instead:

**Render (free):**
1. Push this repo to GitHub (done).
2. [render.com](https://render.com) → **New → Blueprint** → pick this repo (it reads `render.yaml`).
3. When prompted, paste your Gemini key into **`GEMINI_API_KEY`** (stored as a secret).
4. Deploy → open the `…onrender.com` URL. The app detects the server key and runs with no
   per-user setup.

**Railway (free):** New Project → Deploy from GitHub → add a `GEMINI_API_KEY` variable → it runs
`npm start` (the included `Procfile`/`package.json`).

The client probes `/api/status`; if the server reports a configured key it routes everything
through `/api/gemini` and hides the **Connect Gemini** button. If the server has *no* key, it
safely falls back to bring-your-own-key mode.

> Note: image/PDF uploads (resume parsing, proof-of-work files) use Gemini's multimodal API
> directly and still need a browser key. Core text features (roadmap, challenges, interviews,
> coaching, mentors) run fully through the hidden-key proxy.

## How it works
- `index.html` — the whole app (UI + logic). State persists in `localStorage`.
- `server.js` — zero-dependency Node server: serves the page and proxies Gemini.
- Every AI call goes through one `callGemini(prompt, schema)` function and uses Gemini's
  **structured JSON output** (`responseSchema`) so responses parse reliably.

## Next steps
- Milestone progress tracking (check off milestones, watch readiness climb).
- Export roadmap + portfolio as a shareable recruiter page / PDF.
