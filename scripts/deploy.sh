#!/bin/bash
# Main deploy pipeline for tim.waldin.net.
#
# Does the full sequence: chown repo on VPS (fixes root-owned git objects),
# pull latest main, rebuild whichever services have changed, reload nginx,
# verify health.
#
# Usage:
#   scripts/deploy.sh                  full deploy (detects changes)
#   scripts/deploy.sh --all            rebuild everything unconditionally
#   scripts/deploy.sh --no-container   skip the portfolio container image
#   scripts/deploy.sh --dry-run        print what would run, don't execute
#
# Env:
#   VPS=user@host          override deploy target (default root@tim.waldin.net)
#   FORCE=1                skip "are you sure" prompts

set -euo pipefail
source "$(dirname "$0")/lib/common.sh"

require_cmd git ssh
require_repo_root

# ---- Parse flags -------------------------------------------------------------

REBUILD_ALL=0
SKIP_CONTAINER=0
DRY_RUN=0
for arg in "$@"; do
  case "$arg" in
    --all)          REBUILD_ALL=1 ;;
    --no-container) SKIP_CONTAINER=1 ;;
    --dry-run)      DRY_RUN=1 ;;
    -h|--help)
      sed -n '2,/^$/p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *) die "unknown flag: ${arg}" ;;
  esac
done

maybe_run() {
  if [[ "${DRY_RUN}" == "1" ]]; then
    log_dim "  (dry-run) $*"
  else
    eval "$@"
  fi
}

# ---- Local sanity check ------------------------------------------------------

log_step "local sanity"
if [[ -n "$(git status --porcelain)" ]]; then
  log_warn "working tree has uncommitted changes:"
  git status --short | sed 's/^/    /'
  confirm "deploy anyway?" || die "aborted"
fi

LOCAL_SHA="$(git rev-parse HEAD)"
log_info "local HEAD = ${LOCAL_SHA:0:10}"

# ---- Push local to origin (safe — already committed) -------------------------

if ! git diff --quiet "origin/main" 2>/dev/null; then
  log_info "pushing to origin/main..."
  maybe_run "git push"
else
  log_ok "origin/main already up to date"
fi

# ---- Prepare the VPS ---------------------------------------------------------

log_step "VPS prep"
require_vps_reachable
log_info "ensuring ${DEPLOY_PATH} is owned by ${DEPLOY_USER}..."
maybe_run "ensure_deploy_owned"

log_info "pulling latest on VPS..."
maybe_run "on_vps_deploy 'git pull --rebase 2>&1 | tail -5'"

# ---- Detect what changed -----------------------------------------------------

log_step "change detection"

changed_backend=0
changed_frontend=0
changed_container=0
changed_nginx=0

if [[ "${REBUILD_ALL}" == "1" ]]; then
  changed_backend=1; changed_frontend=1; changed_container=1; changed_nginx=1
  log_info "rebuilding everything (--all)"
else
  # Compare local HEAD to remote HEAD before we pushed — everything in that
  # diff is what's about to hit the VPS.
  REMOTE_SHA="$(on_vps_deploy 'git rev-parse HEAD@{1} 2>/dev/null || git rev-parse HEAD~1')"
  changed_files="$(git diff --name-only "${REMOTE_SHA}..HEAD" 2>/dev/null || echo '')"

  if [[ -z "${changed_files}" ]]; then
    log_warn "no file changes detected since last deploy — nothing to rebuild"
    log_dim "use --all to force rebuild"
    exit 0
  fi

  echo "${changed_files}" | sed 's/^/    /'

  grep -qE '^(backend/|docker-compose.yml)'            <<<"${changed_files}" && changed_backend=1   || true
  grep -qE '^(frontend/|docker-compose.yml)'           <<<"${changed_files}" && changed_frontend=1  || true
  grep -qE '^(container/|docker-compose.yml)'          <<<"${changed_files}" && changed_container=1 || true
  grep -qE '^nginx.conf$'                              <<<"${changed_files}" && changed_nginx=1     || true
fi

(( SKIP_CONTAINER )) && changed_container=0

# ---- Rebuild + restart services ---------------------------------------------

if (( changed_container )); then
  log_step "rebuild portfolio container image"
  maybe_run "on_vps_deploy 'bash container/build.sh 2>&1 | tail -5'"
fi

if (( changed_backend )) || (( changed_frontend )); then
  log_step "rebuild backend + frontend"
  services=""
  (( changed_backend ))  && services="${services} backend"
  (( changed_frontend )) && services="${services} frontend"
  maybe_run "on_vps_deploy 'docker compose up -d --no-deps --build${services} 2>&1 | tail -8'"
fi

if (( changed_nginx )); then
  log_step "reload nginx"
  maybe_run "bash '$(dirname "$0")/reload-nginx.sh'"
fi

# ---- Verify ------------------------------------------------------------------

log_step "verify"
sleep 2
if curl -fsS --max-time 5 "https://${VPS_HOST}/" -o /dev/null; then
  log_ok "https://${VPS_HOST}/ is responding"
else
  log_err "main site not responding — check logs"
fi

log_step "done"
log_ok "deployed ${LOCAL_SHA:0:10}"
