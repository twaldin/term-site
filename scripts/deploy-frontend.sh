#!/bin/bash
# Rebuild + restart only the frontend (Next.js) on the VPS.
# Also checks blog snapshots are up to date before building.
#
# Usage: scripts/deploy-frontend.sh

set -euo pipefail
source "$(dirname "$0")/lib/common.sh"

require_cmd ssh
require_vps_reachable

# ---- Pre-flight: warn if local blog posts lack captured snapshots ----------

posts_dir="${REPO_ROOT}/container/blog/posts"
snaps_dir="${REPO_ROOT}/frontend/public/blog-snapshots"

if [[ -d "${posts_dir}" ]]; then
  missing=()
  for post in "${posts_dir}"/*.md; do
    [[ -f "${post}" ]] || continue
    slug="$(basename "${post}" .md)"
    [[ -f "${snaps_dir}/${slug}.ansi" ]] || missing+=("${slug}")
  done
  if (( ${#missing[@]} > 0 )); then
    log_warn "blog posts without captured snapshots (will render as markdown fallback):"
    for m in "${missing[@]}"; do printf '    %s\n' "$m"; done
    log_dim "run:  scripts/capture-blog-snapshots.sh  — to capture missing snapshots"
  fi
fi

# ---- Deploy ------------------------------------------------------------------

log_step "deploying frontend to ${VPS}"
ensure_deploy_owned

log_info "pulling latest..."
on_vps_deploy 'git pull --rebase 2>&1 | tail -5'

log_info "rebuilding frontend container (Next.js build runs here)..."
on_vps_deploy 'docker compose up -d --no-deps --build frontend 2>&1 | tail -10'

log_info "verifying..."
for i in 1 2 3 4 5 6 7 8 9 10 11 12; do
  if curl -fsS --max-time 3 "https://${VPS_HOST}/" -o /dev/null 2>/dev/null; then
    log_ok "frontend serving after ${i}s"
    exit 0
  fi
  sleep 1
done
die "frontend did not come up within 12s"
