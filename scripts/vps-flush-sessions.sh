#!/bin/bash
# Kill all active portfolio session containers. Use this to hard-reset after
# a deploy so users reconnect with fresh JS bundles (drops lingering sessions
# running old client code). Spares pool containers by default.
#
# Usage:
#   scripts/vps-flush-sessions.sh              prompt + kill actives
#   FORCE=1 scripts/vps-flush-sessions.sh      no prompt
#   scripts/vps-flush-sessions.sh --all        kill pool too (forces rewarm)

set -euo pipefail
source "$(dirname "$0")/lib/common.sh"

require_cmd ssh
require_vps_reachable

KILL_POOL=0
for arg in "$@"; do
  case "$arg" in
    --all) KILL_POOL=1 ;;
    *)     die "unknown flag: ${arg}" ;;
  esac
done

log_step "current state"
on_vps '
  total=$(docker ps --filter "label=app=terminal-portfolio" -q | wc -l)
  pool=$(docker ps --filter "label=session=pool" -q | wc -l)
  printf "  %s active + %s pool = %s total\n" "$((total - pool))" "$pool" "$total"
'

if (( KILL_POOL )); then
  msg="kill ALL terminal-portfolio containers (active + pool)?"
else
  msg="kill all ACTIVE session containers (leaves pool intact)?"
fi

confirm "$msg" || die "aborted"

log_step "killing..."
if (( KILL_POOL )); then
  on_vps '
    killed=$(docker ps --filter "label=app=terminal-portfolio" -q | xargs -r docker rm -f | wc -l)
    printf "  killed %d container(s)\n" "$killed"
  '
else
  # Iterate and skip pool labels explicitly.
  on_vps '
    killed=0
    for id in $(docker ps --filter "label=app=terminal-portfolio" -q); do
      label=$(docker inspect --format "{{.Config.Labels.session}}" "$id")
      [ "$label" = "pool" ] && continue
      docker rm -f "$id" >/dev/null 2>&1 && killed=$((killed + 1))
    done
    printf "  killed %d container(s)\n" "$killed"
  '
fi

log_ok "flush complete"
