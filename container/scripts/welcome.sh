#!/bin/bash

# Source shared functions
source "$(dirname "$0")/shared-functions.sh"

clear

# ASCII header with progressive typewriter display
ascii_typewriter "timothy waldin" "Univers" "${BOLD}${CYAN}"
typewriter "${DIM}Type 'help' for a list of available commands.${RESET}"

echo ""
