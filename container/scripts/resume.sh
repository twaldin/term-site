#!/bin/bash
source "$(dirname "$0")/shared-functions.sh"
emit_url "resume"

clear
echo ""
ascii_typewriter "resume" "DOS_Rebel" "${CYAN}"

echo ""

create_box "Resume" "Click the link below to view my resume in your browser." "${CYAN}"

echo ""
typewriter "   $(hyperlink "tim.waldin.net/resume.pdf" "https://tim.waldin.net/resume.pdf" "${CYAN}")"
echo ""
typewriter "   ${DIM}type ${BOLD}\"home\"${RESET}${DIM} to go back to the home page${RESET}"
echo ""
