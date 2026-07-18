# GitHub Treasure Hunt — Project Brief

> **How to use this file:** Commit it to the root of your repo as `AGENTS.md` (Codex reads that file automatically), or attach it to your first Codex cloud task. It contains the full product spec, architecture rules, API reference, build order, and environment settings. Everything Codex needs is in this one document.

---

## 1. What we're building

**GitHub Treasure Hunt** — a discovery engine for open-source gems. StumbleUpon, but for GitHub.

- **For:** developers and curious people who want serendipity, not dashboards; contributors hunting for small, approachable projects; anyone with 30 minutes and an urge to explore.
- **The vibe:** early Google. White background. Logo. Search bar. Category chips. One 🎲 button. You arrive, you discover something cool, you leave.
- **Explicitly NOT:** no AI agents, no social network, no crypto, no accounts, no analytics, no infinite scroll, no sidebars with 500 metrics.

This is a **public open-source tool**. The repo itself should pass its own filters (small, beginner-friendly, looking for contributors).

---

## 2. Hard rules (read first)

1. **Static site only.** No server, no proxy, no database, no build-time secrets. Deploys to GitHub Pages.
2. **All GitHub API calls are unauthenticated and client-side.** Rate limits are per visitor IP (10 searches/min each) — never ship a default token, never embed any credential anywhere in the repo.
3. **One query builder powers everything.** Search, categories, filters, and Surprise Me all compile to a single `q=` string on the same endpoint. Do not create separate code paths.
4. **Cache aggressively.** Every query response (30 results) is cached by canonical query string. Surprise Me pops from the cache pouch; toggles hit the cache before the network.
5. **Debounce all filter changes (~400ms).** One request for the final toggle state, not one per click.
6. **Optional user-supplied token only.** A settings link lets a user paste their own fine-grained PAT (public read-only) into `localStorage` to raise *their* limit to 30/min. It never touches the repo or any server.
7. **Only make changes directly requested in each task.** Do not add features, backends, routers, or state libraries beyond this spec.

---

## 3. MVP feature spec

### 3.1 Search
Free-text search box. Submits to the query builder as raw keywords. Debounced.

### 3.2 Categories (chips under the search bar)
Each maps to a GitHub topic qualifier:

| Chip | Qualifier |
|---|---|
| 🤖 AI | `topic:ai` |
| 🧠 Machine Learning | `topic:machine-learning` |
| 🎨 Design | `topic:design` |
| 🌍 Climate | `topic:climate` |
| 🔒 Security | `topic:security` |
| 🎮 Games | `topic:game` |
| 📚 Education | `topic:education` |
| 🛠 Developer Tools | `topic:developer-tools` |
| 📱 Mobile | `topic:mobile` |
| 🌐 Web | `topic:web` |
| 📊 Data Science | `topic:data-science` |

Validate slugs against https://github.com/topics (use GitHub's curated slugs so `topic:` queries match).

### 3.3 Surprise Me 🎲
The best button. Each click shows one new random repository. Implementation in §5.3.

### 3.4 Repository card
Exactly these fields, nothing more: repo name, ⭐ star count, short description, language, last updated (humanized `pushed_at`), "Open Repository" link (`html_url`, new tab). All fields come from the search response — no extra API calls per card.

### 3.5 Hidden Gems toggle
Three **exclusive** star bands (radio behavior, since "under 1000" contains "under 100"):
`stars:<100` · `stars:100..500` · `stars:500..1000` · plus "Any" (off).

### 3.6 "I have 30 minutes"
One click applies a recipe for small, active, approachable repos:
`size:<3000 good-first-issues:>0 pushed:>{90 days ago} stars:5..300` + client-side check that `description` is non-empty.

### 3.7 Out of scope for MVP (do not build yet)
- **V2 filters:** recently updated, beginner friendly (`good-first-issues:>2`), looking for contributors (`help-wanted-issues:>1`), solo dev vs organization (client-side `owner.type`), license (`license:mit` etc.), language (`language:rust` etc.). Build the query builder so these are trivial to add later.
- **V3 AI:** "Why this recommendation" / "similar repos". Not before.

---

## 4. Architecture

```
Browser ──fetch──▶ https://api.github.com/search/repositories?q=...
   │                     (unauthenticated, CORS-enabled, per-IP limits)
   ├─ query builder  (filters + optional dice → one q= string)
   ├─ pouch cache    (Map<canonicalQuery, results[]>, session-scoped)
   ├─ localStorage   (optional user PAT only)
   └─ GitHub Pages   (static hosting, deployed by Actions)
```

- Every visitor brings their own 10 req/min. With the pouch (1 request ≈ 30 Surprise Me clicks) and debounce, users should almost never feel the limit.
- On 403/429: read the `X-RateLimit-Reset` header and show a friendly countdown ("GitHub asked us to breathe for 40 seconds"). Never a raw error.
- Caveat to handle gracefully: users behind shared IPs (offices/universities) share the quota — the BYO-token setting is their escape hatch.

---

## 5. GitHub Search API reference

**Endpoint:** `GET https://api.github.com/search/repositories?q={query}&per_page=30`
Headers: `Accept: application/vnd.github+json`. If user PAT present: `Authorization: Bearer {token}`.
Sort options if needed: `sort=stars|forks|help-wanted-issues|updated` (default: best match).
Limits: 10 req/min unauthenticated per IP; 30 req/min with token; results window is capped (~1,000 practical), so **randomness must live in the query, not in deep pagination**.

### 5.1 Qualifier cheat sheet

| Purpose | Qualifier |
|---|---|
| Always on | `archived:false` |
| Category | `topic:{slug}` |
| Star band | `stars:<100`, `stars:100..500`, `stars:500..1000` |
| Recently updated | `pushed:>{ISO date}` |
| Beginner friendly | `good-first-issues:>2` |
| Contributors wanted | `help-wanted-issues:>1` |
| License / Language | `license:mit`, `language:rust` |
| Small repo | `size:<3000` (KB) |
| Random slice (dice only) | `created:2019-03-01..2019-06-01` |

Canonical docs: https://docs.github.com/en/search-github/searching-on-github/searching-for-repositories

### 5.2 Query builder (reference implementation shape)

```js
function buildQuery(filters, dice = null) {
  const parts = ["archived:false"];
  if (filters.text)      parts.unshift(filters.text);
  if (filters.category)  parts.push(`topic:${filters.category}`);
  if (filters.starBand)  parts.push(`stars:${filters.starBand}`);
  if (filters.thirtyMin) parts.push("size:<3000", "good-first-issues:>0",
                                    `pushed:>${daysAgo(90)}`, "stars:5..300");
  if (dice) {
    if (!filters.category) parts.push(`topic:${dice.randomTopic}`);
    if (!filters.starBand && !filters.thirtyMin) parts.push("stars:>5"); // quality floor
    parts.push(`created:${dice.randomDateSlice}`);                       // e.g. random 3-month window, 2010→now
  }
  return parts.join(" ");
}
```

Toggles and dice **compose**: dice only randomize dimensions the user left open ("surprise me, but climate, but under 100 stars" must work).

### 5.3 Surprise Me algorithm
1. Build query from active filters + dice (random topic if none chosen, random 3-month `created:` slice, quality floor).
2. Fetch `per_page=30`; store in pouch keyed by canonical query; pop one **random unseen** item per click (track seen repo IDs for the session).
3. Pouch empty → roll new dice, fetch again.
4. `total_count === 0` → retry **once** dropping the `created:` slice. Still 0 → show "No gems here — loosen a filter." (Worst case 2 requests/roll ≈ 15 rolls/min headroom.)

### 5.4 Card fields from the response
`full_name`, `stargazers_count`, `description`, `language`, `pushed_at`, `html_url`, `owner.type` (for the future solo/org filter — filter client-side), `topics`, `license.spdx_id`.

---

## 6. Tech stack

- **Vite + React + Tailwind CSS.** No router. No state library (useState/useReducer only). Plain `fetch` — no SDK needed for one endpoint.
- **Vitest** for unit tests on the query builder and dice logic (the only parts worth testing hard).
- Node 20. npm with committed `package-lock.json`.

### File structure

```
index.html
vite.config.js            # base: '/github-treasure-hunt/'  ← required for Pages
src/
  main.jsx
  App.jsx
  api/github.js           # buildQuery, search, dice, rate-limit handling
  lib/pouch.js            # cache + seen-ID tracking
  components/
    SearchBar.jsx
    CategoryChips.jsx
    StarBandToggle.jsx
    ThirtyMinButton.jsx
    SurpriseButton.jsx
    RepoCard.jsx
    RateLimitNotice.jsx
    TokenSettings.jsx     # BYO-PAT modal, localStorage only
.github/workflows/deploy.yml
AGENTS.md                 # this file
LICENSE                   # MIT
README.md
```

---

## 7. Design spec

- White background, single centered column (max-width ~640px), logo, search bar, category chips, 🎲 button. Results as a clean vertical card list.
- One accent color max. System font stack or Inter. Fast: no layout shift, no spinners longer than necessary.
- Accessible: full keyboard navigation, visible focus states, `aria-label` on the dice button, semantic HTML. (A discovery tool that lists "Accessibility" as a search example must itself be accessible.)
- No dark patterns, no engagement mechanics. You arrive, you discover, you leave.

---

## 8. Build order (run as sequential Codex tasks)

| # | Task | Done when |
|---|---|---|
| 1 | Scaffold Vite + React + Tailwind; blank white page with centered logo + search bar | `npm run dev` shows the empty shell |
| 2 | `api/github.js` query builder + dice + Vitest tests | `npm test` passes; builder covers every qualifier in §5.1 |
| 3 | Search flow + RepoCard list | Typing "climate" renders real cards, debounced |
| 4 | Category chips + exclusive star bands + "30 minutes" button | All compose into one query; cache hits on repeat combos |
| 5 | Surprise Me + pouch + empty-result fallback | 30 clicks ≈ 1 network request; zero visible errors |
| 6 | Rate-limit countdown + BYO-token settings | 403 shows friendly countdown; pasted PAT raises limit |
| 7 | Pages workflow + README + polish | Site live on GitHub Pages from `main` |

---

## 9. Public repo hygiene

- **LICENSE:** MIT (public ≠ open source without it).
- **Repo topics:** `github-api`, `discovery`, `open-source`, `stumbleupon`, `serendipity` — so the tool can discover itself.
- **Labels:** seed a few `good first issue` and `help wanted` issues so the repo passes its own filters.
- **README:** what it is, screenshot, 3-command quick start (`git clone` → `npm install` → `npm run dev`), the philosophy ("no AI agents, no social network, no crypto"), CONTRIBUTING section.
- Secret scanning / push protection are on by default for public repos, but the real guarantee is architectural: there is no token to leak.

---

## 10. Deployment (GitHub Pages via Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy
on: { push: { branches: [main] } }
permissions: { contents: read, pages: write, id-token: write }
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: { name: github-pages }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci && npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
      - uses: actions/deploy-pages@v4
```

Remember `base: '/github-treasure-hunt/'` in `vite.config.js` (match the repo name) or Pages serves broken asset paths.

---

## 11. Codex environment settings (cloud)

- **Dependencies:** with `package-lock.json` committed, Codex auto-installs via npm. Explicit setup script if preferred: `npm ci`.
- **Node version:** environment variable `CODEX_ENV_NODE_VERSION=20`.
- **Secrets:** none. This project needs no credentials anywhere.
- **Agent internet access:** enable *limited* access and allowlist `api.github.com` so the agent can run real unauthenticated API calls while iterating.
- Container state is cached (~12h); it re-runs setup automatically if the script or env vars change.
- Commands the agent should use: `npm run dev` · `npm test` · `npm run lint` · `npm run build`.

---

## 12. Reference repos & resources

| Resource | Why it matters |
|---|---|
| https://github.com/zonetecde/random-github-repo-2 | Closest prior art (random repo site); note their token-rotation + prebuilt SQLite fallback patterns |
| https://gitrandom.digitalbunker.dev/ | UX reference for the one-button random loop + shortlist idea |
| https://docs.github.com/en/rest/search/search | Search endpoint reference (limits, sorting) |
| https://docs.github.com/en/search-github/searching-on-github/searching-for-repositories | The qualifier list — effectively this product's spec |
| https://github.com/topics | Canonical topic slugs for the category chips |
| https://github.com/octokit/octokit.js | Official SDK — **not used** (plain fetch), listed for awareness |
| https://star-history.com | Reference for the bring-your-own-token localStorage pattern |
| https://github.com/pingcap/ossinsight | Inspiration well for V3 ("why this repo") — do not build now |

---

*This prompt/brief is for an agentic tool with repo access. Scope: this repository only. Stop and ask before adding any dependency not named in §6 or any file outside §6's structure.*
