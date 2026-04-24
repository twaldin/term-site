#!/bin/bash
source "$(dirname "$0")/shared-functions.sh"

# Check cache — if we've already rendered welcome at this column count,
# dump it instantly instead of re-running figlet + animations.
COLS=$(tput cols 2>/dev/null || echo 80)
CACHE_DIR="/tmp/cmd-cache"
CACHE_FILE="${CACHE_DIR}/welcome-${COLS}.ans"

if [[ -f "$CACHE_FILE" ]]; then
  cat "$CACHE_FILE"
  exit 0
fi

mkdir -p "$CACHE_DIR"

# Render and cache simultaneously. First visitor at each width pays the
# animation cost; everyone after gets the instant cat above.
render_welcome() {
  emit_url "welcome"

  clear
  echo ""
  # Skip figlet on narrow terminals (mobile) — DOS_Rebel "twaldin" is ~70 cols.
  cols=$(tput cols 2>/dev/null || echo 80)
  if (( cols >= 80 )); then
    ascii_typewriter "twaldin" "DOS_Rebel" "${PURPLE}"
  else
    typewriter "${BOLD}${PURPLE}twaldin${RESET}"
  fi
  echo ""
  create_box "portfolio terminal" "  about       learn about me

  contact     email + socials

  resume      view my resume

  projects    explore my projects

  blog        posts i've written

  help        all available commands" "${PURPLE}"
  echo ""
}

render_welcome | tee "$CACHE_FILE"
