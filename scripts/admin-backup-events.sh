#!/bin/bash
# Back up the backend's session event log (events.jsonl) to local disk.
# The log lives inside a Docker volume on the VPS — losing the backend
# volume loses the history, so periodic backups matter.
#
# Usage:
#   scripts/admin-backup-events.sh                        save to ./backups/events-<date>.jsonl
#   scripts/admin-backup-events.sh /path/to/file.jsonl    specific path

set -euo pipefail
source "$(dirname "$0")/lib/common.sh"

require_cmd ssh
require_vps_reachable
require_repo_root

dest="${1:-}"
if [[ -z "${dest}" ]]; then
  dir="${REPO_ROOT}/backups"
  mkdir -p "${dir}"
  dest="${dir}/events-$(date +%Y%m%d-%H%M%S).jsonl"
fi

log_step "pulling events.jsonl from ${VPS}"

# Events file lives in the backend container's /app/data/ (backed by the
# backend_data volume). Copy via docker cp to a tmp path, then scp back.
on_vps 'docker cp term-backend:/app/data/events.jsonl /tmp/events.jsonl.tmp'
scp "${VPS}:/tmp/events.jsonl.tmp" "${dest}"
on_vps 'rm -f /tmp/events.jsonl.tmp'

# Sanity summary.
sessions=$(grep -c '"type":"session_start"' "${dest}" 2>/dev/null || echo 0)
commands=$(grep -c '"type":"command"' "${dest}" 2>/dev/null || echo 0)
size=$(stat -f%z "${dest}" 2>/dev/null || stat -c%s "${dest}")

log_ok "saved ${dest}"
log_dim "    $(human_bytes "${size}")  ·  ${sessions} sessions  ·  ${commands} commands"
