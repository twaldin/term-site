#!/bin/bash
# Rebuild the portfolio session container image on the VPS.
# Critically, produces the exact tag the backend hardcodes — otherwise new
# sessions keep spawning the OLD image (deploy footgun 1).
#
# Usage:
#   scripts/deploy-container.sh           rebuild + verify tag
#   scripts/deploy-container.sh --pull    also docker pull the base image first

set -euo pipefail
source "$(dirname "$0")/lib/common.sh"

require_cmd ssh
require_vps_reachable

PULL_BASE=0
for arg in "$@"; do
  case "$arg" in
    --pull) PULL_BASE=1 ;;
    *) die "unknown flag: ${arg}" ;;
  esac
done

log_step "rebuilding portfolio container: ${IMAGE}"
ensure_deploy_owned
on_vps_deploy "sudo -u ${DEPLOY_USER} git pull --rebase 2>&1 | tail -5"

if (( PULL_BASE )); then
  log_info "pulling base image..."
  on_vps "docker pull ubuntu:24.04 2>&1 | tail -3"
fi

log_info "building..."
on_vps_deploy "bash container/build.sh 2>&1 | tail -8"

# The session backend hard-codes `twaldin/terminal-portfolio:latest`. If
# container/build.sh was ever changed to emit a different tag, new sessions
# would silently spawn the old image. Verify post-build that the tag exists.
log_info "verifying tag..."
if on_vps "docker image inspect ${IMAGE} >/dev/null 2>&1"; then
  size="$(on_vps "docker image inspect ${IMAGE} --format '{{.Size}}'")"
  log_ok "${IMAGE} present (size $(human_bytes "${size}"))"
else
  die "build completed but ${IMAGE} is missing — check container/build.sh's -t flag"
fi

# New pool containers will use the new image. Existing pool containers still
# run the old image until they're assigned and destroyed. Drain the pool now
# so readers see the latest portfolio scripts immediately.
log_info "draining existing pool so new warmed containers use the new image..."
on_vps 'docker ps --filter label=session=pool --format "{{.ID}}" | xargs -r docker rm -f' \
  2>&1 | sed 's/^/    /' || true

# Restarting the backend rewarms a fresh pool from the new image.
log_info "restarting backend to rewarm pool..."
on_vps_deploy "docker compose restart backend 2>&1 | tail -3"

log_ok "portfolio container + pool refreshed"
