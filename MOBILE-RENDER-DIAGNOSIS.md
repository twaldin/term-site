# Mobile ASCII/Box-Drawing Render Diagnosis — 2026-04-21

Reference image: `/Users/twaldin/Downloads/IMG_1604 2.PNG`

## Symptom A: Font never cached, re-downloaded every visit on mobile

**Root cause:** Same as desktop TTI Symptom B — nginx serves font files with `Cache-Control: public, max-age=0`. On mobile networks (3G/4G), re-downloading 1MB+ per font means the font is unavailable during initial page render. Even on repeat visits, the font must be fetched from scratch. The `await loadFonts()` gate in `Terminal.tsx:84` blocks xterm initialization until the download completes, but on a slow connection this can take 2-5 seconds. If the download fails (timeout, network flake), the try/catch at `Terminal.tsx:91` silently falls back to system monospace.

**Evidence:**
- `curl -sI https://tim.waldin.net/fonts/JetBrainsMonoNerdFontMono-Regular.woff2` → `Cache-Control: public, max-age=0`
- Font files: Regular=1,044,512 bytes, Bold=1,046,020 bytes (WOFF2). TTF fallbacks in FontFace API src list are 2.4MB each.
- `Terminal.tsx:91-93` — failed font load caught silently, xterm creates with unresolvable font-family string

**Proposed fix:** Add immutable cache for font files in nginx (see TTI-DIAGNOSIS.md Symptom B). Additionally, consider subsetting the font to include only the Unicode ranges actually used by the terminal scripts: Basic Latin (U+0020-007F), Box Drawing (U+2500-U+257F), Block Elements (U+2580-U+259F), and any Nerd Font icon codepoints used by the zsh prompt. This could reduce the WOFF2 from 1MB to ~100-200KB.

**Risk/tradeoff:** Font subsetting removes fallback for characters not in the subset. Any terminal command that outputs chars outside the subset (e.g., CJK, emoji) would fall back to system font for those chars only.

---

## Symptom B: Box-drawing and block-element characters break on mobile Safari

**Root cause:** The `font-display: swap` in the CSS @font-face (`globals.css:10,19`) causes the browser to render text immediately with the fallback font chain (`"JetBrainsMono Nerd Font Mono" → "JetBrainsMono Nerd Font" → "JetBrains Mono" → "Fira Code" → "Monaco" → "Consolas" → monospace`). On iOS Safari, the system monospace font is Menlo. Menlo's box-drawing characters (U+2500-U+257F) and block elements (U+2588) have different advance widths and glyph designs than JetBrains Mono Nerd Font. When the Nerd Font eventually loads, xterm.js doesn't recalculate its cell grid — the canvas renderer keeps the character dimensions it computed during the initial paint. The mismatch between the font that was active during cell measurement and the font now active during rendering causes column misalignment, broken box borders, and fractured block elements.

Additionally, if the font download fails entirely on mobile (see Symptom A), xterm initializes with Menlo. Menlo DOES have box-drawing characters, but at a slightly different advance width than JetBrains Mono. The terminal scripts (welcome, figlet banners) assume a specific column width that doesn't match Menlo's metrics. The result: the TIM WALDIN banner (which uses `█` U+2588 for solid red blocks) renders at a different width than the surrounding ASCII chars, causing the "stippled dot pattern overlaid on solid red blocks" appearance described in the reference image.

**Evidence:**
- `frontend/src/app/globals.css:4-20` — `font-display: swap` on both Regular and Bold
- `frontend/src/components/Terminal.tsx:71-85` — FontFace API loads same fonts; `Terminal.tsx:91-93` silently catches failures
- `frontend/src/config/terminal-theme.ts:36` — fontFamily chain ends with `monospace` = Menlo on iOS
- No `unicode-range` on any @font-face — font covers all Unicode but is 1MB+
- Reference image shows: solid red blocks with visible stipple pattern (U+2588 at wrong advance width), broken `│` vertical lines (U+2502), malformed `─` horizontal dashes (U+2500), misaligned corners

**Proposed fix:**
1. Change `font-display` from `swap` to `block` in `globals.css:10,19`:
   ```css
   font-display: block;
   ```
   This holds rendering for up to 3s while the font loads, then falls back. For a terminal app where every character's width matters, `swap` is wrong — the fallback font's different metrics corrupt the grid layout irreversibly.
2. Remove `font-display: swap` from `frontend/public/fonts/jetbrains-mono-nerd.css:10,18,28,36` (duplicate declarations in the CSS file).
3. In `Terminal.tsx:68-94`, if `loadFonts()` fails, explicitly set xterm's `fontFamily` to a known monospace fallback AND set a flag to reduce the column count, since Menlo at the same font size fits fewer columns than JetBrains Mono.

**Risk/tradeoff:** `font-display: block` means the page appears blank for up to 3s on first visit if the font is slow to load. Mitigated by the preload tags + aggressive font caching (Symptom A fix). The blank period is better than a permanently broken grid.

---

## Symptom C: CHAR_WIDTH_RATIO assumption causes subpixel misalignment on mobile

**Root cause:** `Terminal.tsx:18` sets `CHAR_WIDTH_RATIO = 0.6`. The font size calculation (`Terminal.tsx:32`) uses this to determine how many pixels each character occupies: `fontSize = floor((usableWidth / targetCols) / 0.6)`. On an iPhone 14 Pro (393px logical, 1179px physical):
- usableWidth ≈ 393 - 28 (padding) - 10 (safety) ≈ 355px
- theoretical = floor(355 / 72 / 0.6) = floor(8.22) = 8
- conservative = floor(8 * 0.95) = 7
- result = max(10, 7) = **10px** (clamped to MIN_FONT_SIZE)

At 10px, JetBrains Mono's actual character width is approximately 6.0-6.1px (varies by browser). 72 cols × 6.0px = 432px, but the container is only 355px. xterm's FitAddon.fit() will therefore calculate that only ~59 columns fit (355 / 6.0), not the target 72. The server receives a resize for ~59 cols, but the welcome script's figlet banner and ASCII art were designed for wider terminals. At 59 cols, figlet output wraps and box borders break.

Even when the character width happens to be close to 6.0px, Safari's subpixel rendering on 3x DPR displays can introduce fractional-pixel differences. xterm.js internally rounds character dimensions to whole CSS pixels, but the actual rendered glyphs on a 3x display may be 17.7px or 18.3px wide in device pixels, causing the "stippled" appearance on block characters.

**Evidence:**
- `Terminal.tsx:14-21` — MOBILE_CONTENT_WIDTH=72, CHAR_WIDTH_RATIO=0.6, SAFETY_MARGIN=0.95, MIN_FONT_SIZE=10
- `Terminal.tsx:23-35` — calculateFontSize logic
- At 10px font size on mobile, the math targets 72 cols but only ~59 actually fit
- `Terminal.tsx:174-177` — fitAddon.fit() corrects cols after creation, but the initial 120-col default means the first resize fires with the wrong cols

**Proposed fix:**
1. Lower `MOBILE_CONTENT_WIDTH` from 72 to ~55 to match what actually fits at MIN_FONT_SIZE=10 on a 390px-wide device:
   ```typescript
   const MOBILE_CONTENT_WIDTH = 55;
   ```
   Or dynamically calculate: `const targetCols = Math.floor(usableWidth / (MIN_FONT_SIZE * CHAR_WIDTH_RATIO));`
2. Increase `SAFETY_MARGIN` from 0.95 to 0.90 on mobile (more conservative = smaller font = more cols fit):
   ```typescript
   const safetyMargin = viewportWidth < MOBILE_BREAKPOINT ? 0.90 : 0.95;
   ```
3. After `fitAddon.fit()` runs, if the actual cols are significantly less than MOBILE_CONTENT_WIDTH, log a warning or adjust the font size downward further.

**Risk/tradeoff:** Reducing target cols means figlet banners and box art render narrower. The scripts in the container already have auto-width detection (`7801770` commit: "auto-detect terminal width + fallback to plain title when figlet doesn't fit"), so they should adapt. But visual fidelity of ASCII art decreases at narrower widths.

---

## Symptom D: No CORS header on font responses may block Safari preload

**Root cause:** The `<link rel="preload" as="font" crossorigin="anonymous">` tags in `layout.tsx:21-34` instruct the browser to fetch fonts in CORS-anonymous mode. Nginx serves fonts without an `Access-Control-Allow-Origin` header. While technically correct for same-origin, Safari has historically been stricter about enforcing CORS checks on preloaded resources even within the same origin. If Safari rejects the preloaded font, the FontFace API in `Terminal.tsx:71-85` must re-download it. On mobile, this double-download adds 1-2 seconds of latency during which xterm may initialize with the fallback font.

**Evidence:**
- `layout.tsx:21-34` — `crossOrigin="anonymous"` on preload links
- `curl -sI` response — no `Access-Control-Allow-Origin` header
- Browser console warning: "The resource ... preloaded with link preload was not used within a few seconds" — indicates the preload succeeded but wasn't matched to a consumer

**Proposed fix:** Add `Access-Control-Allow-Origin` to font responses in nginx:
```nginx
location /fonts/ {
    proxy_pass http://frontend;
    add_header Access-Control-Allow-Origin "https://tim.waldin.net" always;
    add_header Cache-Control "public, max-age=31536000, immutable" always;
}
```

**Risk/tradeoff:** None. This is a strict improvement.

---

## Instrumentation gaps

1. **No runtime font-load measurement on mobile** — Can't confirm whether `loadFonts()` actually succeeds or falls into the catch block on iPhone Safari over cellular. Add a `performance.mark('font-loaded')` after the load and send it as a beacon.
2. **Safari-specific font rendering** — Can't reproduce Safari's subpixel rendering of box-drawing chars from code analysis alone. Need a BrowserStack/real-device test with the Nerd Font loaded at 10px to confirm whether U+2588 and U+2500-U+257F render at the correct advance width.
3. **FitAddon.fit() column count on mobile** — Don't know the exact cols reported by fit() on an iPhone 14 Pro. This determines the server-side PTY size and thus whether ASCII art wraps correctly. Log `xterm.cols` after `fitAddon.fit()` to verify.
4. **Font subset audit** — Don't know which Nerd Font codepoints (Powerline icons, devicons, pomicons, etc.) are actually used by the zsh prompt and scripts. `fc-query JetBrainsMonoNerdFontMono-Regular.woff2` would show all included codepoints; grepping the scripts for icon codepoints would show what's needed. Subsetting to only the used ranges could reduce the font from 1MB to ~150-200KB.
5. **`font-display: block` timing** — Need to measure how long the font actually takes to load on 3G/4G. If it's consistently under 1s with caching, `font-display: block` is a clear win. If it's 3-5s, the blank-screen period may be unacceptable and a loading spinner would be needed instead.
