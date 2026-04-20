#!/bin/bash
# Quick SSH shortcut to the VPS — drops you into $DEPLOY_PATH as the
# deploy user by default, or root if you pass --root.
#
# Usage:
#   scripts/vps-ssh.sh                 ssh as deploy user, cd to repo
#   scripts/vps-ssh.sh --root          ssh as root
#   scripts/vps-ssh.sh -- 'free -h'    one-shot command

set -euo pipefail
source "$(dirname "$0")/lib/common.sh"

require_cmd ssh
require_vps_reachable

as_root=0
while (( $# )); do
  case "$1" in
    --root) as_root=1; shift ;;
    --)     shift; break ;;
    -h|--help)
      sed -n '2,/^$/p' "$0" | sed 's/^# \{0,1\}//'
      exit 0 ;;
    *) break ;;
  esac
done

if (( as_root )); then
  target="${VPS}"
  cmd="cd ${DEPLOY_PATH} && exec bash -l"
else
  target="${VPS}"
  cmd="sudo -u ${DEPLOY_USER} -i bash -c 'cd ${DEPLOY_PATH} && exec bash -l'"
fi

if (( $# > 0 )); then
  on_vps "$*"
else
  ssh -t "${target}" "${cmd}"
fi
