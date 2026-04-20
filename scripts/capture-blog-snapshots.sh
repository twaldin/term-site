#!/bin/bash
# Captures ANSI output of `blog <slug>` for each post, for static blog pages.
# Runs the blog command inside the live container image (on the VPS by default)
# and saves the raw ANSI stream to frontend/public/blog-snapshots/<slug>.ansi.
#
# Usage:
#   scripts/capture-blog-snapshots.sh                   # all posts
#   scripts/capture-blog-snapshots.sh <slug> [<slug>]   # specific posts
#
# Env:
#   VPS=user@host   (default: root@tim.waldin.net)
#   IMAGE=...       (default: twaldin/terminal-portfolio:latest)
#   COLS=140        terminal width for capture
set -euo pipefail

VPS="${VPS:-root@tim.waldin.net}"
IMAGE="${IMAGE:-twaldin/terminal-portfolio:latest}"
# Two widths — desktop keeps the full 140-col render (tables fit comfortably),
# mobile renders narrower so blog pages don't need horizontal scroll on
# phones. Frontend picks at runtime based on viewport.
DESKTOP_COLS="${DESKTOP_COLS:-140}"
MOBILE_COLS="${MOBILE_COLS:-48}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT/frontend/public/blog-snapshots"
POSTS_DIR="$ROOT/container/blog/posts"

mkdir -p "$OUT_DIR"

if [ $# -gt 0 ]; then
  slugs=("$@")
else
  slugs=()
  for f in "$POSTS_DIR"/*.md; do
    [ -f "$f" ] || continue
    slugs+=("$(basename "$f" .md)")
  done
fi

capture_one() {
  local slug="$1" cols="$2" out="$3"
  local tmp
  tmp=$(mktemp)
  if ssh "$VPS" "docker run --rm -t \
    -e COLUMNS=$cols \
    -e LINES=40 \
    -e TERM=xterm-256color \
    --entrypoint /home/portfolio/scripts/blog.sh \
    $IMAGE \
    $slug" > "$tmp" 2>/dev/null; then
    local size
    size=$(wc -c < "$tmp")
    if [ "$size" -gt 100 ] && ! grep -q "no post with slug" "$tmp" 2>/dev/null; then
      mv "$tmp" "$out"
      echo "  → $out ($size bytes, ${cols} cols)"
      return 0
    fi
  fi
  rm -f "$tmp"
  return 1
}

for slug in "${slugs[@]}"; do
  echo "Capturing: $slug"

  if ! capture_one "$slug" "$DESKTOP_COLS" "$OUT_DIR/$slug.ansi"; then
    echo "  desktop capture failed (post not in image?) — skipping"
    continue
  fi
  capture_one "$slug" "$MOBILE_COLS" "$OUT_DIR/$slug.mobile.ansi" \
    || echo "  (mobile capture failed — frontend will fall back to desktop ansi)"
done

echo ""
echo "Done. Snapshots in $OUT_DIR"
