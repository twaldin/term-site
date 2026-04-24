#!/bin/bash
source "$(dirname "$0")/shared-functions.sh"

emit_url "welcome"
clear
echo ""

ascii_typewriter "twaldin" "DOS_Rebel" "${PURPLE}"

echo ""
create_box "portfolio terminal" "  about       learn about me

  contact     email + socials

  resume      view my resume

  projects    explore my projects

  blog        posts i've written

  help        all available commands" "${PURPLE}"
echo ""
typewriter "${DIM}real shell · isolated docker container · type ${RESET}${CYAN}exit${RESET}${DIM} to reset${RESET}"
echo ""
