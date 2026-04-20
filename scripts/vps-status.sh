#!/bin/bash
# Dump current state of the VPS: containers, pool, sessions, memory, disk.
# Handy when debugging traffic spikes or session-cap problems.
#
# Usage: scripts/vps-status.sh

set -euo pipefail
source "$(dirname "$0")/lib/common.sh"

require_cmd ssh
require_vps_reachable

log_step "containers"
on_vps "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Image}}' | head -30"

log_step "active sessions + pool"
# Split the portfolio containers by label: session= (active) vs session=pool (warm)
on_vps '
  active=$(docker ps --filter "label=app=terminal-portfolio" --format "{{.ID}}" \
             | xargs -r docker inspect --format "{{.Config.Labels.session}} {{.Name}}" \
             | grep -v "^pool " | wc -l || echo 0)
  pool=$(docker ps --filter "label=session=pool" -q | wc -l)
  printf "  active sessions:   %s\n" "$active"
  printf "  pool (warm ready): %s\n" "$pool"
'

log_step "memory"
on_vps "free -h | head -2"

log_step "disk"
on_vps "df -h / | tail -1"

log_step "top-memory containers"
on_vps "docker stats --no-stream --format 'table {{.Name}}\t{{.MemUsage}}\t{{.CPUPerc}}' | sort -k2 -h -r | head -10"

log_step "backend health"
if on_vps 'docker exec term-backend wget -qO- http://localhost:3001/stats 2>/dev/null'; then
  :
else
  log_err "backend /stats unreachable"
fi
