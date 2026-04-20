#!/bin/bash
# Report font file sizes in frontend/public/fonts/ and potential savings
# if TTFs were converted to woff2.
#
# Usage: scripts/fonts-check.sh

set -euo pipefail
source "$(dirname "$0")/lib/common.sh"
require_repo_root

fonts_dir="${REPO_ROOT}/frontend/public/fonts"
[[ -d "${fonts_dir}" ]] || die "no fonts dir at ${fonts_dir}"

log_step "fonts in ${fonts_dir}"
printf '  %-48s  %s\n' "FILE" "SIZE"
printf '  %-48s  %s\n' "----" "----"

total=0
ttf_total=0
woff2_total=0

shopt -s nullglob
for f in "${fonts_dir}"/*.{ttf,woff,woff2}; do
  [[ -f "${f}" ]] || continue
  size=$(stat -f%z "${f}" 2>/dev/null || stat -c%s "${f}")
  total=$((total + size))
  case "${f##*.}" in
    ttf)   ttf_total=$((ttf_total + size)) ;;
    woff2) woff2_total=$((woff2_total + size)) ;;
  esac
  printf '  %-48s  %s\n' "$(basename "${f}")" "$(human_bytes "${size}")"
done
shopt -u nullglob

printf '  %-48s  %s\n' "----" "----"
printf '  %-48s  %s\n' "TOTAL" "$(human_bytes "${total}")"

# If any TTFs without matching woff2 remain, suggest conversion.
missing_woff2=0
for ttf in "${fonts_dir}"/*.ttf; do
  [[ -f "${ttf}" ]] || continue
  [[ -f "${ttf%.ttf}.woff2" ]] || missing_woff2=$((missing_woff2 + 1))
done

if (( missing_woff2 > 0 )); then
  log_warn "${missing_woff2} TTF(s) missing a matching .woff2"
  log_dim "    run:  scripts/fonts-ttf-to-woff2.sh"
fi
