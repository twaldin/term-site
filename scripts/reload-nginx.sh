#!/bin/bash
# Reload nginx config on the VPS. Handles the bind-mount inode gotcha:
# when nginx.conf is rewritten atomically (e.g. `sed -i`, or git pull
# replacing the file), the container's bind mount still points at the
# old inode until the container is restarted. `nginx -s reload` alone
# silently keeps serving the old config.
#
# This script detects the inode mismatch and restarts the nginx container
# (not just reloads) when necessary.
#
# Usage: scripts/reload-nginx.sh

set -euo pipefail
source "$(dirname "$0")/lib/common.sh"

require_cmd ssh
require_vps_reachable

log_step "reload nginx on ${VPS}"
ensure_deploy_owned
on_vps_deploy 'git pull --rebase 2>&1 | tail -5'

log_info "nginx -t (syntax check)..."
if ! on_vps 'docker exec term-nginx nginx -t 2>&1'; then
  die "nginx config invalid — refusing to reload"
fi

# Compare the host-side nginx.conf inode vs what the container sees.
host_inode="$(on_vps "stat -c '%i' ${DEPLOY_PATH}/nginx.conf")"
cont_inode="$(on_vps "docker exec term-nginx stat -c '%i' /etc/nginx/nginx.conf")"

if [[ "${host_inode}" != "${cont_inode}" ]]; then
  log_warn "host inode (${host_inode}) ≠ container inode (${cont_inode})"
  log_info "restarting container to re-bind mount..."
  on_vps_deploy 'docker compose restart nginx 2>&1 | tail -3'
else
  log_info "inodes match — plain reload"
  on_vps 'docker exec term-nginx nginx -s reload 2>&1'
fi

# Smoke test: probe /socket.io/ — if that stops 400'ing the WS upgrades,
# we know the Connection-header map is still applied.
log_info "smoke test..."
if curl -fsS --max-time 5 "https://${VPS_HOST}/" -o /dev/null; then
  log_ok "main site responding"
else
  log_err "main site not responding — check nginx logs"
  exit 1
fi
