#!/usr/bin/env bash
set -euo pipefail

FONTS_DIR="$(dirname "$0")/../frontend/public/fonts"
UNICODES="U+0020-007E,U+00A0-00FF,U+2500-257F,U+2580-259F,U+25A0-25FF,U+2600-26FF,U+E000-E0FF,U+E0A0-E0FF,U+F000-F8FF"

for WEIGHT in Regular Bold; do
  pyftsubset "${FONTS_DIR}/JetBrainsMonoNerdFontMono-${WEIGHT}.ttf" \
    --output-file="${FONTS_DIR}/JetBrainsMonoNerdFontMono-${WEIGHT}.woff2" \
    --flavor=woff2 \
    --unicodes="${UNICODES}" \
    --layout-features='*' \
    --no-hinting
  echo "Subsetted ${WEIGHT}: $(du -h "${FONTS_DIR}/JetBrainsMonoNerdFontMono-${WEIGHT}.woff2" | cut -f1)"
done
