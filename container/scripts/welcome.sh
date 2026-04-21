#!/bin/bash
source "$(dirname "$0")/shared-functions.sh"
emit_url "welcome"

clear
echo ""
# Skip figlet on narrow terminals (mobile) — DOS_Rebel "twaldin" is ~70 cols.
cols=$(tput cols 2>/dev/null || echo 80)
if (( cols >= 80 )); then
  ascii_typewriter "twaldin" "DOS_Rebel" "${RED}"
else
  typewriter "${BOLD}${RED}twaldin${RESET}"
fi
echo ""
create_box "portfolio terminal" "  about       learn about me

  contact     email + socials

  resume      view my resume

  projects    explore my projects

  blog        posts i've written

  help        all available commands" "${RED}"
echo ""
