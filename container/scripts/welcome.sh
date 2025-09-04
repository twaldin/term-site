#!/bin/bash
source "$(dirname "$0")/shared-functions.sh"

clear

ascii_typewriter "timothy waldin" "Univers" "${BOLD}${CYAN}"
typewriter "${DIM}Type 'contact' for contact info.${RESET}"
typewriter "${DIM}Type 'about' for info about me.${RESET}"
typewriter "${DIM}Type 'help' for all available commands.${RESET}"

echo ""
