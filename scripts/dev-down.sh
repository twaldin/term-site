#!/bin/bash
# Shut down the local dev stack and optionally clean up volumes.
#
# Usage:
#   scripts/dev-down.sh                 stop + remove containers
#   scripts/dev-down.sh --volumes       also remove volumes (wipes event log)
#   scripts/dev-down.sh --prune         after down, prune dangling images

set -euo pipefail
source "$(dirname "$0")/lib/common.sh"

require_cmd docker
require_repo_root

rm_volumes=0
prune=0
for arg in "$@"; do
  case "$arg" in
    --volumes) rm_volumes=1 ;;
    --prune)   prune=1 ;;
    *) die "unknown flag: $arg" ;;
  esac
done

flags=""
(( rm_volumes )) && flags="${flags} --volumes"

log_step "stopping local dev stack"
(cd "${REPO_ROOT}" && docker compose -f docker-compose.local.yml down${flags} 2>&1 | tail -10)

if (( prune )); then
  log_step "pruning dangling images"
  docker image prune -f 2>&1 | tail -3
fi

log_ok "dev stack down"
