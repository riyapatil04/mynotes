A local-first, personal placement preparation tracker. No backend. No login. Your data lives in your browser.

## Features

- **Roadmap** — Subject → Topic → Problem / Note hierarchy
- **Topic Types** — "Code Problems" (Monaco editor, solutions, complexity) or "Theory / Notes" (Markdown notebook)
- **Multiple Solutions** — Brute Force / Better / Optimal with side-by-side compare
- **Mistake Log** — Per-item mistake log + global aggregated view with analytics
- **Spaced Repetition** — Confidence-based review scheduling for both problems and notes
- **Dashboard** — Progress bars, activity heatmap, streak counter, weak-area ranking, placement countdown
- **Flashcards** — Flip-card review for theory subjects
- **Pattern Library** — All problems grouped by algorithmic pattern
- **Dark Mode** — Light / System / Dark with no flash on load
- **PWA** — Installable on any device, works fully offline after first load
- **Export / Import** — One-click JSON backup and restore

## Tech Stack

React 18 · Vite · TypeScript (strict) · Tailwind CSS v4 · Zustand · Dexie.js (IndexedDB) · Monaco Editor · Recharts · react-markdown · React Router v6 · vite-plugin-pwa

---

## ⚠️ Important: Data Storage

> **Your data stays on this device.**
>
> All notes, problems, solutions, and progress are stored in your **browser's IndexedDB**. They are **not synced** across browsers or devices automatically.
>
> Use the **Export button** (↓ icon in the top bar) regularly to download a JSON backup. Use **Import** to restore it on another browser or device.
>
> The app will remind you if you haven't exported in over 7 days.

---

## Running Locally

```bash
npm install
npm run dev
# Open http://localhost:5173
```

## Production Build

```bash
npm run build
# Output is in /dist — serve any static file host
```

---

## Deploy to Vercel (recommended)

### Option A — Vercel CLI (fastest)

```bash
# 1. Install the Vercel CLI (once)
npm install -g vercel

# 2. Build the app
npm run build

# 3. Deploy — follow the prompts
vercel

# For subsequent deploys:
vercel --prod
```

The `vercel.json` in this repo already handles:
- SPA rewrites (deep links like `/problem/123` don't 404 on refresh)
- Immutable cache headers for hashed assets
- Correct `Service-Worker-Allowed` header for the PWA

### Option B — GitHub + Vercel Dashboard (no CLI needed)

```
1. Push this repo to GitHub (git init → git add . → git commit → git remote add origin <url> → git push)
2. Go to https://vercel.com/new
3. Import your GitHub repo
4. Framework preset: Vite   |   Build command: npm run build   |   Output: dist
5. Click Deploy
```

Every `git push` to `main` will auto-deploy.

---

## Deploy to Netlify (fallback)

```bash
# Option A — Netlify CLI
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist

# Option B — Drag & Drop
# 1. npm run build
# 2. Go to https://app.netlify.com/drop
# 3. Drag the /dist folder into the browser
```

`netlify.toml` is already configured for SPA routing and correct cache headers.

---

## PWA — Install on Mobile / Desktop

After opening the deployed URL:
- **Android/Chrome**: tap the "Add to Home Screen" banner or the ⋮ menu → Install app
- **iOS/Safari**: tap Share → Add to Home Screen
- **Desktop Chrome/Edge**: click the install icon (⊕) in the address bar

Once installed, the app works fully **offline** — your data is in IndexedDB which persists without a network connection.

---

## Generating Real PWA Icons (optional)

The repo ships with placeholder 1×1 PNG icons. To generate proper icons:

```bash
npm install -D sharp
node scripts/generate-icons.mjs
npm run build
```

Or replace `public/icons/icon-192.png` and `public/icons/icon-512.png` with your own 192×192 and 512×512 PNG images.
