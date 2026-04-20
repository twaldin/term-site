#!/bin/bash
# Probe the public site + backend health endpoint + pool. Quick all-green
# check; returns non-zero if anything looks wrong.
#
# Usage: scripts/vps-health.sh

set -euo pipefail
source "$(dirname "$0")/lib/common.sh"

require_cmd curl ssh

failures=0

probe_http() {
  local url="$1" expected="${2:-200}" label="$3"
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "${url}" || echo '000')"
  if [[ "${code}" == "${expected}" ]]; then
    log_ok "${label} → ${code}"
  else
    log_err "${label} → ${code} (expected ${expected})"
    failures=$((failures + 1))
  fi
}

log_step "public endpoints"
probe_http "https://${VPS_HOST}/"                                   200 "main"
probe_http "https://${VPS_HOST}/blog/2026-04-19-hone-haiku-20pp"    200 "blog page"
probe_http "https://${VPS_HOST}/admin"                              401 "admin (auth-gated)"
probe_http "https://${VPS_HOST}/health"                             403 "health (lan-only)"

log_step "websocket upgrade"
# Quick sanity: socket.io polling GET should return a handshake
if curl -fsS --max-time 5 "https://${VPS_HOST}/socket.io/?EIO=4&transport=polling" >/dev/null; then
  log_ok "/socket.io/ responds"
else
  log_err "/socket.io/ unreachable"
  failures=$((failures + 1))
fi

log_step "backend internal"
if require_vps_reachable 2>/dev/null; then
  if on_vps 'docker exec term-backend wget -qO- http://localhost:3001/stats 2>/dev/null'; then
    :
  else
    log_err "backend /stats failed"
    failures=$((failures + 1))
  fi
fi

if (( failures > 0 )); then
  log_err "${failures} probe(s) failed"
  exit 1
fi
log_ok "all systems nominal"
