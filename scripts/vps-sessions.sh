#!/bin/bash
# List current portfolio session containers on the VPS with age and memory
# use. Useful for spotting session leaks or idle zombies.
#
# Usage:
#   scripts/vps-sessions.sh              list active sessions
#   scripts/vps-sessions.sh --pool       include pool-warm containers too
#   scripts/vps-sessions.sh --all        include everything labeled terminal-portfolio

set -euo pipefail
source "$(dirname "$0")/lib/common.sh"

require_cmd ssh
require_vps_reachable

mode="active"
for arg in "$@"; do
  case "$arg" in
    --pool) mode="pool" ;;
    --all)  mode="all" ;;
    -h|--help)
      sed -n '2,/^$/p' "$0" | sed 's/^# \{0,1\}//'
      exit 0 ;;
    *) die "unknown flag: ${arg}" ;;
  esac
done

log_step "portfolio session containers (${mode})"

case "${mode}" in
  active)
    # Anything with the app label but NOT session=pool
    on_vps '
      docker ps --filter "label=app=terminal-portfolio" --format "{{.ID}}" \
        | while read id; do
            label=$(docker inspect --format "{{.Config.Labels.session}}" "$id")
            [ "$label" = "pool" ] && continue
            docker ps --filter "id=$id" --format "{{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Command}}" 2>/dev/null
          done
    '
    ;;
  pool)
    on_vps "docker ps --filter 'label=session=pool' --format 'table {{.ID}}\t{{.Names}}\t{{.Status}}'"
    ;;
  all)
    on_vps "docker ps --filter 'label=app=terminal-portfolio' --format 'table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Labels}}' | head -50"
    ;;
esac

log_step "counts"
on_vps '
  total=$(docker ps --filter "label=app=terminal-portfolio" -q | wc -l)
  pool=$(docker ps --filter "label=session=pool" -q | wc -l)
  active=$((total - pool))
  printf "  active sessions:   %s\n" "$active"
  printf "  pool (warm ready): %s\n" "$pool"
  printf "  total:             %s\n" "$total"
'
