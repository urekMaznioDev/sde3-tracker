# SDE3 Prep Tracker

A DSA / Java / LLD / System Design interview prep tracker with progress tracking and bookmarks. Progress is saved automatically in your browser (localStorage) — no backend, no database, no sign-in.

## Run it locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## Deploy to GitHub Pages (free hosting)

### 1. Create a GitHub repo

Create a new repo (e.g. `sde3-tracker`) on GitHub and push this project to it:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

### 2. Set the base path

Open `vite.config.js` and set `base` to match your repo name:

```js
base: '/<your-repo-name>/',
```

If you're deploying to `<your-username>.github.io` directly (a "root" GitHub Pages repo, not a project subpage), set `base: '/'` instead.

Commit and push this change.

### 3. Enable GitHub Pages

In your repo on GitHub: **Settings → Pages → Source → select "GitHub Actions"**.

That's it. The included workflow (`.github/workflows/deploy.yml`) automatically builds and deploys the site every time you push to `main`. After the first push, check the **Actions** tab to watch it deploy — it usually takes 1–2 minutes.

Your site will be live at:
```
https://<your-username>.github.io/<your-repo-name>/
```

### 4. Future updates

Just push to `main` — it redeploys automatically:

```bash
git add .
git commit -m "Update tracker content"
git push
```

## How persistence works

Progress (checked-off items and bookmarks) is stored in your browser's `localStorage`, scoped to this site's origin. This means:

- ✅ Survives page refreshes and browser restarts
- ✅ No account, no backend, no setup needed
- ❌ Local to one browser/device — won't sync if you open the site on your phone vs laptop, or in a different browser
- ❌ Cleared if you clear your browser's site data/cache

### Want sync across devices instead?

If you want progress to follow you across devices, you'd need a small backend or a service like:
- **Firebase / Supabase** — free tier, a few lines of code to swap `localStorage` calls for a database read/write, optionally with login
- **GitHub Gist as a poor-man's database** — store progress JSON in a Gist via the GitHub API (works if only you use it, since it needs a token)

Ask if you want help wiring up either of these — the current code is structured so the persistence layer (`usePersistedState` in `App.jsx`) is the one place that would need to change.

## Editing content

All topics, sub-points, and LeetCode links live in `src/App.jsx` near the top of the file, in the `DSA_DATA`, `JAVA_DATA`, `LLD_DATA`, and `HLD_DATA` objects. Each entry follows this shape:

```js
{ r: 1, title: "...", diff: "medium", tags: ["..."], points: ["...", "..."] }
```

(DSA entries use `lc: <leetcode number>` instead of `r: <id>`.)
