#!/bin/bash
source "$(dirname "$0")/shared-functions.sh"

emit_url "welcome"
clear
echo ""

COLS=$(tput cols 2>/dev/null || echo 80)
if (( COLS >= 80 )); then
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
