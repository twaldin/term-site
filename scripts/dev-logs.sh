#!/bin/bash
# Follow logs from the local dev stack.
#
# Usage:
#   scripts/dev-logs.sh                     all services, last 50
#   scripts/dev-logs.sh backend             only backend
#   scripts/dev-logs.sh frontend 200        only frontend, last 200

set -euo pipefail
source "$(dirname "$0")/lib/common.sh"

require_cmd docker
require_repo_root

compose_file="${REPO_ROOT}/docker-compose.local.yml"
[[ -f "${compose_file}" ]] || die "no ${compose_file}"

service="${1:-}"
lines="${2:-50}"

cd "${REPO_ROOT}"
if [[ -z "${service}" ]]; then
  docker compose -f docker-compose.local.yml logs -f --tail="${lines}"
else
  docker compose -f docker-compose.local.yml logs -f --tail="${lines}" "${service}"
fi
