#!/bin/bash
# Tail or follow logs from a VPS service.
#
# Usage:
#   scripts/vps-logs.sh                       last 100 lines, backend
#   scripts/vps-logs.sh backend               last 100 lines, backend
#   scripts/vps-logs.sh frontend 500          last 500 lines, frontend
#   scripts/vps-logs.sh nginx                 last 100 lines, nginx
#   scripts/vps-logs.sh backend -f            follow (live tail)
#   scripts/vps-logs.sh all                   tail all three in parallel

set -euo pipefail
source "$(dirname "$0")/lib/common.sh"

require_cmd ssh
require_vps_reachable

svc="${1:-backend}"
shift || true

# Parse remaining args: numeric = line count; -f = follow.
lines=100
follow=0
for arg in "$@"; do
  case "$arg" in
    -f|--follow) follow=1 ;;
    ''|*[!0-9]*) die "invalid argument: ${arg}" ;;
    *)           lines="${arg}" ;;
  esac
done

case "${svc}" in
  backend|frontend|nginx)
    container="term-${svc}"
    ;;
  all)
    log_info "following all services (ctrl+c to quit)..."
    on_vps "docker compose -f ${DEPLOY_PATH}/docker-compose.yml logs -f --tail=50 backend frontend nginx"
    exit 0
    ;;
  -h|--help)
    sed -n '2,/^$/p' "$0" | sed 's/^# \{0,1\}//'
    exit 0
    ;;
  *)
    die "unknown service: ${svc} (expected backend, frontend, nginx, or all)"
    ;;
esac

if (( follow )); then
  log_info "following ${container} (ctrl+c to quit)..."
  on_vps "docker logs --tail=${lines} -f ${container}"
else
  on_vps "docker logs --tail=${lines} ${container} 2>&1"
fi
