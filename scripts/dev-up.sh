#!/bin/bash
# Bring up the local dev stack via docker-compose.local.yml.
# Exposes backend + frontend on localhost without nginx in front, so you can
# iterate without touching the VPS.
#
# Usage:
#   scripts/dev-up.sh                  build + start + logs
#   scripts/dev-up.sh --no-logs        build + start, don't tail

set -euo pipefail
source "$(dirname "$0")/lib/common.sh"

require_cmd docker
require_repo_root

compose_file="${REPO_ROOT}/docker-compose.local.yml"
[[ -f "${compose_file}" ]] || die "no ${compose_file}"

no_logs=0
for arg in "$@"; do
  case "$arg" in
    --no-logs) no_logs=1 ;;
    *) die "unknown flag: $arg" ;;
  esac
done

log_step "starting local dev stack"
(cd "${REPO_ROOT}" && docker compose -f docker-compose.local.yml up -d --build 2>&1 | tail -15)

log_step "status"
(cd "${REPO_ROOT}" && docker compose -f docker-compose.local.yml ps)

log_ok "backend:  http://localhost:3001"
log_ok "frontend: http://localhost:3000"

if (( ! no_logs )); then
  log_step "tailing logs (ctrl+c to detach — stack keeps running)"
  (cd "${REPO_ROOT}" && docker compose -f docker-compose.local.yml logs -f --tail=50)
fi
