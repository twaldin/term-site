# term-site / tim.waldin.net — Session State

**Last updated:** 2026-04-20 ~09:30 UTC
**Project root:** `/Users/twaldin/dev/term-site/` (repo renamed to `twaldin/tim.waldin.net` on GitHub; local dir still `term-site`).
**Parent session:** flt fleet agent managing tim.waldin.net work. Parent is human (Tim) — message via `flt send parent "msg"`.

## Current state: STABLE / all changes deployed

Latest commit: `4b508d9 fix(blog): proper OSC handler disposal` (plus capture commit `7b2191c`).

**Most recent user request:** Fix mobile UI — "NEED FULL WORKING BEAUTIFUL SCROLL ON MOBILE WITH EVERYTHING + BEST READABILITY + 0 WRAP ISSUES ON BLOG; verify via playwright". Followed by "140 cols too big, need good custom mobile mode; ensure 1 readability 2 scroll 3 no wrap artifacts".

**Delivered + verified via Playwright mobile viewport (390×844):**
- Mobile captures at 48 cols (separate from 140-col desktop captures) → tables / code / lists intact.
- Font scales to fit viewport exactly (no horizontal scroll on mobile).
- Outer `<div overflow:auto>` with `WebkitOverflowScrolling: touch` → native iOS momentum scrolling.
- xterm's internal scroll disabled (`scrollback: 0`), all scrolling lives in the wrapper.
- Custom touch handler removed (native scroll works better than anything custom).
- Scroll container: clientHeight 844, scrollHeight 4032, scrollWidth = viewport (no horiz scroll).
- Scrolling verified works: 0 → 1500 programmatically, content renders correctly at any position.

## Architecture (current)

### Stack
- **Frontend:** Next.js 15.4.10 (App Router) / React 19 / TypeScript / Tailwind v4. Deployed as Docker container on VPS.
- **Backend:** Express 5 + socket.io 4 + dockerode. Manages per-session ephemeral containers via Tecnativa docker-socket-proxy.
- **Container image:** `twaldin/terminal-portfolio:latest` — Ubuntu 24.04 + zsh + oh-my-posh + mdcat + nvim + portfolio scripts. Hardcoded in `backend/session.js`.
- **Nginx:** Reverse proxy, WebSocket upgrade via `$connection_upgrade` map, admin panel route, rate limits.
- **VPS:** `root@tim.waldin.net` (Hetzner Falkenstein). Deploy path `/home/deploy/term-site/`.

### Pool architecture (backend/session.js)
- Pre-warms 3 containers at startup; grabs one on new connection; replenishes in background.
- `grabFromPool()` returns a warmed container, we replay the buffered prompt output to the socket.
- Session limit = 40 concurrent. Session idle timeout = 15min, resets on input/resize.
- Labels: `app=terminal-portfolio`, `session=<socketId>` or `session=pool`.

### Blog cold page (`/blog/<slug>`) — THE HOT PATH for Twitter mobile readers
- Static snapshot rendering — zero WebSocket, zero container on page load.
- **Two captures per post** (from `scripts/capture-blog-snapshots.sh`):
  - `frontend/public/blog-snapshots/<slug>.ansi` — 140 cols (desktop)
  - `frontend/public/blog-snapshots/<slug>.mobile.ansi` — 48 cols (mobile)
- `BlogTerminalStatic` picks at runtime via `window.innerWidth < 768` (MOBILE_BREAKPOINT).
- Mobile: fontSize computed so 48 cols × fontSize × 0.6 ≈ viewport width (no horizontal scroll).
- Desktop: fontSize = 14 (fixed readable), 140 cols fit in wide viewports.
- Outer div with `overflow: auto` + `WebkitOverflowScrolling: touch` = native smooth scroll.
- xterm `scrollback: 0` + rows sized to content (resize down after write completes).
- First keystroke → opens WebSocket with `initCommand: ''` → backend skips auto-welcome, user lands in live shell right after the blog content (no duplicate prompt — erase sequence `\r\x1b[2K\x1b[A\r\x1b[2K` fires on first backend output).
- **Capture workflow:** Tim writes a post in `container/blog/posts/<slug>.md`, commits, runs `scripts/capture-blog-snapshots.sh` (after container image rebuild), commits snapshots.

### Admin panel (`/admin`)
- HTTP Basic Auth via `backend/admin.js`. Creds from env: `ADMIN_EMAIL=timothy@waldin.net`, `ADMIN_PASSWORD` (Tim's 40-char keepassxc password — stored in `/home/deploy/term-site/.env` on VPS).
- Sessions grouped by IP (collapsible sections), sorted by session count desc.
- Event log in `backend_data` Docker volume at `/app/data/events.jsonl` (session_start, command, session_end events).
- Referrer badges (twitter, linkedin, HN, github, reddit, direct), device guess, init command shown, per-session command history.

### WebSocket transport
- Client & server: `transports: ['websocket', 'polling']` (WS-first, polling fallback).
- Nginx `Connection: $connection_upgrade` map (polling gets "close", WS gets "upgrade") — without this, all WS upgrades return 400.
- `rememberUpgrade: true` on reconnects.

### Scripts suite (26 shell scripts in `scripts/`)
- `deploy.sh` (+ subsidiaries `deploy-backend.sh`, `deploy-frontend.sh`, `deploy-container.sh`, `reload-nginx.sh`) — all auto-chown the repo on VPS before pulling (fixes root-owned git footgun).
- `vps-status.sh`, `vps-logs.sh`, `vps-sessions.sh`, `vps-flush-sessions.sh`, `vps-health.sh`, `vps-pool.sh`, `vps-ssh.sh`
- `blog-new.sh`, `blog-list.sh`, `blog-preview.sh`, `capture-blog-snapshots.sh`
- `fonts-check.sh`, `fonts-ttf-to-woff2.sh`
- `dev-up.sh`, `dev-down.sh`, `dev-logs.sh`
- `admin-stats.sh`, `admin-top-ips.sh`, `admin-backup-events.sh`
- `setup.sh`, `check-dependencies.sh`, `help.sh`
- Shared lib at `scripts/lib/common.sh`

## Timeline today (2026-04-20)

1. **Investigation:** Responded to Tim's ping about tim.waldin.net disconnect + perf issues. Found: 40+ session cap hit, all WebSocket upgrades failing (nginx Connection header bug), 15-min timeout not resetting on activity, 2.4MB TTF fonts served uncompressed, blog visitors from Twitter burning session slots.
2. **Critical fixes (early):** Fixed nginx `$connection_upgrade` map; raised MAX_SESSIONS 10→40; reset session timeout on each input/resize; converted Nerd Fonts TTF→woff2 (58% smaller); preload fonts in `<head>`; parallelize font+xterm imports.
3. **Blog cold page v1:** Built first version — react-markdown HTML render on `/blog/<slug>`, clickable "open in terminal" link for `/t/blog/<slug>`.
4. **Admin panel:** `backend/logger.js` (JSONL event log), `backend/admin.js` (HTTP Basic Auth + HTML dashboard), nginx `/admin` route.
5. **Blog cold v2:** Switched from HTML render to xterm.js static playback with captured ANSI (Tim wanted the terminal feel). Seamless handover on first keystroke.
6. **Prompt fix:** Fake prompt now matches pure-modified.omp.json (red `portfolio ~` \n red `❯`). Fixed OSC 8 hyperlink escape collision in blog list (typewriter's `echo -e` was eating `\` from RESET escape).
7. **Pool:** 3-container pre-warm pool, replenishes on grab. Makes live sessions feel instant.
8. **Welcome + blog commands:** Stripped "type 'X'" phrasing → command list with just names. `blog <N>` numeric shortcut (1=newest). Fuzzy slug match. OSC 8 clickable slugs in `blog` list.
9. **Repo rename:** `twaldin/term-site` → `twaldin/tim.waldin.net` on GitHub. Local + VPS git remotes updated. GitHub redirect covers old URLs. Local/VPS dir names still `term-site` (low-value to rename).
10. **Shell scripts:** 26 ops scripts (`scripts/`), 1683+ lines — flipped GitHub language stat toward Shell.
11. **Mobile UX (this final block):** Touch scroll v1 → v2 (1:1, momentum) → v3 (native overflow:auto wrapper, no custom handler). Mobile-width blog capture (48 cols) so tables/code/lists stay intact. Verified via Playwright.

## Saved memory highlights (in `~/.claude/projects/-Users-twaldin-dev-term-site/memory/`)

- `project_deploy_footguns.md` — Image tag mismatch (session.js hardcodes `twaldin/terminal-portfolio:latest`, build script must produce exactly that) + root-owned git files breaking deploy-user pulls. Both mitigated by shell script suite.
- `project_hot_cold_sessions.md` — Deferred design for detach-on-disconnect session architecture. Not built.

## Known open items (not urgent)

- `container/blog/posts/2026-04-20-honed-haiku-agentelo.md` — Tim's new post, uncommitted + not yet in container image. Capture skipped for it. When Tim commits, need to rebuild container image and re-run `scripts/capture-blog-snapshots.sh`.
- Blog cold page's typing-to-live transition: works, but on mobile keystroke buffer may lose first char if WS connect is slow. Low risk; not reported.
- Hot/cold (WS detach but keep container) — deferred until 40-session cap becomes a problem again.
- Third post not yet captured → will render via `BlogPost` (react-markdown HTML fallback) if a visitor hits it before Tim rebuilds/recaptures.

## Critical gotchas for future me

1. **Never push a container rebuild without also running capture-blog-snapshots.sh** — the container + blog scripts are tightly coupled; captures are made against the running image.
2. **nginx.conf bind-mount inode trap:** `sed -i` and git pull replace the file inode; container still points at old inode until `docker compose restart nginx` (not `reload`). `scripts/reload-nginx.sh` detects the mismatch and restarts.
3. **ADMIN_PASSWORD has special chars** (colons, quotes). Backend's basic auth must split on FIRST colon only (fixed). `.env` file needs raw value — no surrounding quotes.
4. **Tim's dotfiles preference:** No `Co-Authored-By` trailers on commits. No `as any`/`as unknown as` in TS. Never modify `git config user.email`. Use direct communication, no preambles.
5. **Repo on GitHub is `twaldin/tim.waldin.net`** but local dir is still `~/dev/term-site/`. Don't rename the local dir mid-session — breaks current cwd references.

## Resume checklist

If I come back without context, first actions:
1. `cd ~/dev/term-site && git log --oneline -20` — see recent work.
2. Read this file top-to-bottom.
3. Check `git status` — any uncommitted work, especially new blog posts.
4. Check VPS: `ssh root@tim.waldin.net "docker ps"` — containers healthy? Pool at 3?
5. If user is asking about something specific, grep for related files first.

## Raw data / recent decisions

- Session cap: 40 (was 10). Session idle: 15min (resets on activity).
- Pool size: 3 warm containers.
- Mobile blog cols: 48 (desktop 140).
- Mobile breakpoint: 768px.
- Font preload: woff2 in `<link rel="preload">` in layout.tsx.
- Admin URL: `https://tim.waldin.net/admin`.
- VPS docker-compose path: `/home/deploy/term-site/`.
- Backend-data volume: stores `events.jsonl` audit log.
- `frontend/blog-posts/` — symlink to `container/blog/posts/`, dev-only (recreated with `ln -sf ../container/blog/posts frontend/blog-posts`). Not checked in. Production Dockerfile copies from `container/blog/posts` directly.
