#!/bin/bash
# Rebuild + restart only the backend (Express + socket.io) on the VPS.
# Leaves frontend, nginx, and portfolio container image untouched.
#
# Usage: scripts/deploy-backend.sh

set -euo pipefail
source "$(dirname "$0")/lib/common.sh"

require_cmd ssh
require_vps_reachable

log_step "deploying backend to ${VPS}"
ensure_deploy_owned

log_info "pulling latest..."
# Run git as deploy user — root trips git's "unsafe directory" check.
on_vps_deploy "sudo -u ${DEPLOY_USER} git pull --rebase"

log_info "rebuilding backend container..."
on_vps_deploy 'docker compose up -d --no-deps --build backend 2>&1 | tail -8'

log_info "waiting for backend to become healthy..."
for i in 1 2 3 4 5 6 7 8 9 10; do
  if on_vps 'docker exec term-backend wget -qO- http://localhost:3001/health >/dev/null 2>&1'; then
    log_ok "backend healthy after ${i}s"
    exit 0
  fi
  sleep 1
done
die "backend did not come up within 10s"
