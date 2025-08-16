#!/bin/bash

# Source shared functions
source "$(dirname "$0")/shared-functions.sh"

# Top separator
# ASCII header with progressive typewriter display
ascii_typewriter "tim waldin" "Univers" "${BOLD}${CYAN}"
animated_separator "═" 20
typewriter "${DIM}Type \"help\" for a list of available commands.${RESET}"
typewriter "${DIM}Type \"blog\" to see my blog${RESET}"
typewriter "${DIM}Type \"projects\" to see my projects.${RESET}"
