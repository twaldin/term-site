#!/bin/bash
# Inspect + manage the backend's container pool. The pool pre-warms N
# containers so new sessions skip the 1-2s cold-spawn cost.
#
# Usage:
#   scripts/vps-pool.sh                status
#   scripts/vps-pool.sh status         same
#   scripts/vps-pool.sh drain          kill all pool containers (backend rewarms)
#   scripts/vps-pool.sh refresh        restart backend to force a fresh pool
#                                      against the current portfolio image

set -euo pipefail
source "$(dirname "$0")/lib/common.sh"

require_cmd ssh
require_vps_reachable

cmd="${1:-status}"

case "${cmd}" in
  status)
    log_step "pool status"
    # Pool events in the last 500 lines of backend log.
    on_vps "docker logs --tail=500 term-backend 2>&1 | grep -i 'Pool:' | tail -10"
    echo
    on_vps "docker ps --filter 'label=session=pool' --format 'table {{.ID}}\t{{.Names}}\t{{.Status}}'"
    ;;
  drain)
    log_step "draining pool"
    confirm "kill all pool containers?" || die "aborted"
    on_vps '
      killed=$(docker ps --filter "label=session=pool" -q | xargs -r docker rm -f | wc -l)
      printf "  killed %d pool container(s)\n" "$killed"
      printf "  (backend will rewarm to poolSize over the next ~6s)\n"
    '
    ;;
  refresh)
    log_step "refreshing pool"
    log_info "draining current pool..."
    on_vps 'docker ps --filter "label=session=pool" -q | xargs -r docker rm -f >/dev/null 2>&1 || true'
    log_info "restarting backend..."
    on_vps_deploy 'docker compose restart backend 2>&1 | tail -3'
    log_info "waiting for rewarm..."
    sleep 6
    on_vps "docker logs --tail=20 term-backend 2>&1 | grep -i 'Pool:' | tail -5"
    log_ok "pool refreshed"
    ;;
  -h|--help)
    sed -n '2,/^$/p' "$0" | sed 's/^# \{0,1\}//'
    exit 0
    ;;
  *)
    die "unknown subcommand: ${cmd}  (status | drain | refresh)"
    ;;
esac
