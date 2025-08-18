#!/bin/bash

# Source shared functions
source "$(dirname "$0")/shared-functions.sh"

# Clear with scroll history preserved
# Use ANSI escape to preserve scrollback in web terminal
printf '\033[H\033[J'

# ASCII header with progressive typewriter display
ascii_typewriter "timothy waldin" "Univers" "${BOLD}${CYAN}"
animated_separator "═" 20
typewriter "${DIM}Type \"help\" for a list of available commands.${RESET}"
typewriter "${DIM}Type \"blog\" to see my blog${RESET}"
typewriter "${DIM}Type \"projects\" to see my projects.${RESET}"
