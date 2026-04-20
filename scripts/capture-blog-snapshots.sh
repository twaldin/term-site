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
COLS="${COLS:-140}"

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

for slug in "${slugs[@]}"; do
  echo "Capturing: $slug"
  tmp=$(mktemp)
  if ssh "$VPS" "docker run --rm -t \
    -e COLUMNS=$COLS \
    -e LINES=40 \
    -e TERM=xterm-256color \
    --entrypoint /home/portfolio/scripts/blog.sh \
    $IMAGE \
    $slug" > "$tmp" 2>/dev/null; then
    size=$(wc -c < "$tmp")
    if [ "$size" -gt 100 ] && ! grep -q "no post with slug" "$tmp" 2>/dev/null; then
      mv "$tmp" "$OUT_DIR/$slug.ansi"
      echo "  → $OUT_DIR/$slug.ansi ($size bytes)"
    else
      rm -f "$tmp"
      echo "  skipped: post not in container image (rebuild needed)"
    fi
  else
    rm -f "$tmp"
    echo "  failed"
  fi
done

echo ""
echo "Done. Snapshots in $OUT_DIR"
