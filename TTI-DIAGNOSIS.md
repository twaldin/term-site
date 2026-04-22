# Desktop TTI Diagnosis — 2026-04-21

## Symptom A: Font preload "not used within a few seconds" warning

**Root cause:** Fonts are preloaded with `crossOrigin="anonymous"` (`layout.tsx:26`) but nginx serves them without an `Access-Control-Allow-Origin` response header. While same-origin requests don't strictly require CORS, the `crossOrigin` attribute tells the browser to perform a CORS-mode fetch; without the header, the browser marks the preload as "credentials mismatch" with the CSS @font-face fetch, then the FontFace API in `Terminal.tsx:71-85` creates *new* FontFace objects for the same URLs. The browser's "used within a few seconds" heuristic doesn't connect the preloaded bytes to the JS-created FontFace objects, so it emits the warning. The font is downloaded, but potentially twice.

**Evidence:**
- `frontend/src/app/layout.tsx:21-34` — preload links with `crossOrigin="anonymous"`
- `frontend/src/components/Terminal.tsx:71-85` — separate FontFace API loading of same URLs
- `curl -sI https://tim.waldin.net/fonts/JetBrainsMonoNerdFontMono-Regular.woff2` — no `Access-Control-Allow-Origin` header in response
- `frontend/src/app/globals.css:10` — `font-display: swap` (not related to warning, but relevant to TTI)

**Proposed fix:**
1. Add CORS header to font responses in `nginx.conf`:
   ```nginx
   location /fonts/ {
       add_header Access-Control-Allow-Origin "https://tim.waldin.net" always;
       add_header Cache-Control "public, max-age=31536000, immutable" always;
   }
   ```
2. Alternatively, remove `crossOrigin="anonymous"` from the preload links if CORS is truly unnecessary (same-origin). This is simpler but may not work if the site ever moves behind a CDN.

**Risk/tradeoff:** Adding the CORS header is safer and forward-compatible. Removing crossOrigin is simpler but fragile.

---

## Symptom B: Fonts never cached — re-downloaded on every visit

**Root cause:** Nginx serves font files with `Cache-Control: public, max-age=0` and weak ETag validation. Every page visit triggers a full re-download of ~2MB (Regular 1,044,512 bytes + Bold 1,046,020 bytes). This is the single biggest contributor to TTI — on a typical connection, font download alone takes 400-800ms.

**Evidence:**
- `curl -sI` response headers: `Cache-Control: public, max-age=0`
- Font files are immutable assets ( filenames contain no hash, but content changes only on deploy)
- `nginx.conf` has no location block for `/fonts/` — fonts fall through to the general `/` proxy to Next.js, which sets `max-age=0`

**Proposed fix:** Add a dedicated `/fonts/` location in `nginx.conf` with long cache:
```nginx
location /fonts/ {
    proxy_pass http://frontend;
    proxy_cache_valid 200 365d;
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

**Risk/tradeoff:** Cached fonts survive deploys. If font files change, users need a hard refresh. Mitigate by appending a content hash to font filenames and updating references.

---

## Symptom C: Initial page hangs waiting for zsh prompt

**Root cause:** The client boot chain is sequential across several async barriers:
1. HTML parse → preload fonts + load JS bundles (~200ms)
2. `Promise.all([loadFonts(), import("@xterm/xterm"), ...])` — waits for font download (1MB+ if uncached) AND dynamic imports (~100ms for cached fonts) — `Terminal.tsx:98-103`
3. xterm instance created → `xterm.open()` → first paint (empty canvas)
4. `wsManager.connect()` → Socket.IO handshake (websocket transport) → server assigns pool container → replays buffered prompt → client receives output
5. Client sends resize (at 100ms + 200ms timeouts) — `Terminal.tsx:174-177` and `Terminal.tsx:247-250`
6. Server's `maybeRunInitCommand` gate opens (promptSeen + firstResizeApplied) — `session.js:579-598`
7. `autoTypeCommand` types "welcome" char-by-char at 60ms intervals (7 chars = 420ms) — `session.js:526-538`
8. Welcome script runs (figlet, etc.)

Total cold TTI: ~1.5-3s on desktop with cached fonts, ~3-5s with uncached fonts.

**Evidence:**
- `session.js:30-31` — pool size 3, warm containers available
- `session.js:126-128` — pool containers wait up to 10s for prompt (already warmed)
- `Terminal.tsx:174-177` — resize fires at 100ms after xterm.open()
- `session.js:597` — 200ms delay before auto-typing starts
- `session.js:526-538` — 60ms per character auto-type

**Proposed fix:**
1. Fix font caching (Symptom B) — eliminates the largest variable.
2. Reduce auto-type delay from 60ms to 30ms per char (still visible but 2x faster): `session.js:530`
3. Reduce the 200ms gate delay before auto-type: `session.js:597`
4. Consider eliminating the two `setTimeout(() => fitAddon.fit(), ...)` calls (100ms + 200ms) in favor of a single requestAnimationFrame: `Terminal.tsx:174-177` and `Terminal.tsx:247-250`

**Risk/tradeoff:** Faster auto-type feels less "natural" but improves perceived TTI. Removing one fit() call could miss edge cases where the container isn't fully laid out at 100ms.

---

## Symptom D: Typing lag over warm WebSocket

**Root cause:** Socket.IO protocol overhead on every keystroke. Each keypress traverses: `xterm.onData` → `socket.emit('input', data)` → Socket.IO framing (packet type + namespace + event name + JSON-encoded payload) → WS frame → nginx proxy → Socket.IO server parse → command buffer loop (`server.js:134-147`) → `session.stream.write(data)` → Docker attach stream → PTY echo → Docker stream → `socket.emit('output', data)` → Socket.IO framing → nginx → client parse → `xterm.write(data)`.

That's ~8 process hops with Socket.IO encoding/decoding at each end. For a single character like 'a', the Socket.IO frame is roughly: `42["input","a"]` (~16 bytes vs the raw 1 byte). The overhead is especially noticeable because each keystroke is a discrete round-trip.

Secondary contributors:
- **No WebGL renderer**: xterm 5.5.0 uses canvas renderer by default (no `@xterm/addon-webgl` imported in `Terminal.tsx:98-103`). Canvas renderer re-paints the viewport on every write. At 139 cols x ~40 visible rows, that's ~5,500 glyphs to render per keystroke echo.
- **WebLinksAddon**: `Terminal.tsx:117` loads it. It runs a URL-detection regex across all visible lines on every render, adding CPU cost to each keystroke echo.
- **xterm 5.5.0 default renderer**: Uses canvas2d, not WebGL. For a 139-col terminal with scrollback, this is slower than the WebGL addon which can GPU-accelerate glyph rendering.

**Evidence:**
- `frontend/src/lib/websocket.ts:97-110` — Socket.IO client config
- `backend/server.js:30-37` — Socket.IO server config with `transports: ['polling', 'websocket']` (note: server lists polling first, client lists websocket first — mismatch forces a transport upgrade negotiation on every connection)
- `frontend/src/components/Terminal.tsx:98-103` — no WebGL addon imported
- `frontend/src/components/Terminal.tsx:117` — WebLinksAddon loaded unconditionally
- `backend/server.js:134-147` — per-keystroke command buffer loop (O(n) in data length per event)
- `package.json` — `"@xterm/xterm": "^5.5.0"`, no `@xterm/addon-webgl`

**Proposed fix:**
1. **Align transport order** between client and server: set `transports: ['websocket', 'polling']` on server too, eliminating the upgrade negotiation: `server.js:36`
2. **Add WebGL renderer** as primary with canvas fallback:
   ```typescript
   import { WebglAddon } from '@xterm/addon-webgl';
   const webglAddon = new WebglAddon();
   webglAddon.onContextLoss(() => { webglAddon.dispose(); });
   try { xterm.loadAddon(webglAddon); } catch { /* fallback to canvas */ }
   ```
3. **Lazy-load WebLinksAddon**: Only activate when the user makes a selection or hovers, not on every render.
4. Consider a raw WebSocket (no Socket.IO) for the terminal data channel, keeping Socket.IO only for control events (connect, resize, disconnect). This would reduce the per-keystroke encoding overhead significantly.

**Risk/tradeoff:** WebGL addon requires WebGPU support; not available on all browsers. Raw WebSocket requires re-implementing reconnection logic. Lazy WebLinks breaks link-click-on-appear UX.

---

## Instrumentation gaps

1. **No server-side latency logging** — The backend logs session start/end but doesn't time the individual phases (container attach, prompt replay, resize, initCommand). Adding `console.time` / `console.timeEnd` around each phase in `session.js` would reveal which step dominates.
2. **No client-side TTI metrics** — No `performance.mark()` / `performance.measure()` in the frontend. Adding marks at: font load start/end, xterm init, WS connect, first output, first resize, initCommand complete would give exact breakdowns.
3. **Socket.IO transport negotiation timing** — The client/server transport order mismatch (polling-first on server, websocket-first on client) likely causes an upgrade negotiation. Confirm with browser DevTools Network tab whether the initial connection uses polling then upgrades to websocket, adding an extra round-trip.
4. **nginx TCP_NODELAY** — Not explicitly set in `nginx.conf`. If nginx buffers TCP packets, small Socket.IO frames may be delayed. Add `tcp_nodelay on;` to the server block.
5. **Font file subsetting** — Don't know which Unicode ranges are actually used. A pyftsubset to remove unused Nerd Font glyphs (icon ranges like Powerline, devicons, etc.) could cut font size by 50-70%. Need to audit which codepoints the terminal scripts actually emit.
