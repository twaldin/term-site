#!/bin/bash
# Check that local tooling matches what the repo scripts + docker compose
# expect. Exits non-zero if anything critical is missing or out of version.
#
# Usage: scripts/check-dependencies.sh

set -euo pipefail
source "$(dirname "$0")/lib/common.sh"

fail=0

check_version() {
  local cmd="$1" min_major="$2" version_arg="${3:---version}"
  if ! command -v "${cmd}" >/dev/null 2>&1; then
    log_err "${cmd}: not installed"
    fail=$((fail + 1))
    return
  fi

  local ver
  ver="$("${cmd}" "${version_arg}" 2>&1 | head -1)"
  local num
  num="$(grep -oE '[0-9]+\.[0-9]+(\.[0-9]+)?' <<<"${ver}" | head -1 || echo '0')"
  local major="${num%%.*}"

  if (( major >= min_major )); then
    log_ok "${cmd} ${num}  (≥ ${min_major})"
  else
    log_err "${cmd} ${num}  (need ≥ ${min_major})"
    fail=$((fail + 1))
  fi
}

log_step "local tooling"

check_version git    2   --version
check_version node   18  --version
check_version npm    9   --version
check_version docker 24  --version
check_version python3 3   --version

log_step "optional"

if command -v jq >/dev/null 2>&1; then
  log_ok "jq installed"
else
  log_warn "jq missing (needed for admin-stats.sh / admin-top-ips.sh)"
fi

if command -v brew >/dev/null 2>&1; then
  log_ok "brew available"
elif command -v apt-get >/dev/null 2>&1; then
  log_ok "apt-get available"
fi

log_step "docker daemon"
if docker info >/dev/null 2>&1; then
  log_ok "docker daemon reachable"
else
  log_err "docker daemon not reachable — is Docker Desktop / dockerd running?"
  fail=$((fail + 1))
fi

log_step "node_modules"
for d in frontend backend; do
  if [[ -d "${REPO_ROOT}/${d}/node_modules" ]]; then
    log_ok "${d}/node_modules present"
  else
    log_warn "${d}/node_modules missing  —  cd ${d} && npm ci"
  fi
done

if (( fail > 0 )); then
  log_err "${fail} dependency issue(s)"
  exit 1
fi
log_ok "all required dependencies satisfied"
