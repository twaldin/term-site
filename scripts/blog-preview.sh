#!/bin/bash
# Render a blog post inside the portfolio container locally — same pipeline
# users see on the site. Useful for proofreading before deploy.
#
# Usage:
#   scripts/blog-preview.sh                       newest post
#   scripts/blog-preview.sh 1                     also newest (numeric index)
#   scripts/blog-preview.sh 2026-04-19-hone-..    by slug
#   scripts/blog-preview.sh haiku                 by fuzzy match

set -euo pipefail
source "$(dirname "$0")/lib/common.sh"

require_cmd docker
require_repo_root

posts_dir="${REPO_ROOT}/container/blog/posts"
[[ -d "${posts_dir}" ]] || die "no posts dir at ${posts_dir}"

# Ensure the image exists locally.
if ! docker image inspect "${IMAGE}" >/dev/null 2>&1; then
  log_warn "local image ${IMAGE} not found"
  log_info "pulling..."
  docker pull "${IMAGE}" 2>&1 | tail -3 || die "pull failed — try running scripts/deploy-container.sh"
fi

arg="${1:-latest}"

cols="${COLS:-140}"
rows="${ROWS:-40}"

log_step "rendering ${C_CYAN}${arg}${C_RESET} @ ${cols}×${rows}"

# Delegate the actual resolution (numeric, fuzzy, exact) to the container's
# blog.sh so local preview matches live exactly.
docker run --rm -t \
  -e COLUMNS="${cols}" \
  -e LINES="${rows}" \
  -e TERM=xterm-256color \
  --entrypoint /home/portfolio/scripts/blog.sh \
  "${IMAGE}" \
  "${arg}"
