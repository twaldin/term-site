#!/bin/bash
# List local blog posts with date, slug, title, and snapshot status.
# Handy when deciding what to capture / preview.
#
# Usage:
#   scripts/blog-list.sh                      all posts
#   scripts/blog-list.sh --missing-snapshots  only posts without captured ANSI

set -euo pipefail
source "$(dirname "$0")/lib/common.sh"
require_repo_root

posts_dir="${REPO_ROOT}/container/blog/posts"
snaps_dir="${REPO_ROOT}/frontend/public/blog-snapshots"

only_missing=0
for arg in "$@"; do
  case "$arg" in
    --missing-snapshots) only_missing=1 ;;
    -h|--help)
      sed -n '2,/^$/p' "$0" | sed 's/^# \{0,1\}//'
      exit 0 ;;
    *) die "unknown arg: $arg" ;;
  esac
done

[[ -d "${posts_dir}" ]] || die "no posts dir at ${posts_dir}"

# Read each post's frontmatter to get title + date.
rows=()
shopt -s nullglob
for f in "${posts_dir}"/*.md; do
  slug="$(basename "${f}" .md)"
  date="$(awk '/^date:/ {sub(/^date: */, ""); print; exit}' "${f}")"
  title="$(awk '/^title:/ {sub(/^title: */, ""); print; exit}' "${f}")"
  [[ -z "${date}" ]] && date="0000-00-00"
  [[ -z "${title}" ]] && title="${slug}"

  snap_status="no"
  [[ -f "${snaps_dir}/${slug}.ansi" ]] && snap_status="yes"

  if (( only_missing )) && [[ "${snap_status}" == "yes" ]]; then
    continue
  fi

  rows+=("${date}|${snap_status}|${slug}|${title}")
done
shopt -u nullglob

if (( ${#rows[@]} == 0 )); then
  if (( only_missing )); then
    log_ok "every post has a captured snapshot"
  else
    log_warn "no posts found in ${posts_dir}"
  fi
  exit 0
fi

printf '%s\n' "${rows[@]}" | sort -r | {
  printf '  %-10s  %-4s  %-50s  %s\n' "DATE" "SNAP" "SLUG" "TITLE"
  printf '  %-10s  %-4s  %-50s  %s\n' "----" "----" "----" "-----"
  while IFS='|' read -r d snap s t; do
    case "${snap}" in
      yes) snap="${C_GREEN}yes${C_RESET}" ;;
      no)  snap="${C_YELLOW}no${C_RESET} " ;;
    esac
    printf '  %-10s  %-15b  %-50s  %s\n' "${d}" "${snap}" "${s}" "${t}"
  done
}
