#!/bin/bash

# Source shared functions
source "$(dirname "$0")/shared-functions.sh"

# Clear with scroll history preserved
clear
# ASCII header with progressive typewriter display
ascii_typewriter "timothy waldin" "Univers" "${BOLD}${CYAN}"
typewriter "${DIM}Type \"help\" for a list of available commands.${RESET}"
typewriter "${DIM}Type \"blog\" to see my blog${RESET}"
typewriter "${DIM}Type \"projects\" to see my projects.${RESET}"
echo""
