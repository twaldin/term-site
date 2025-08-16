#!/bin/bash

# Source shared functions
source "$(dirname "$0")/shared-functions.sh"

# Don't clear - keep the typed "welcome" command visible
echo ""  # Just add a newline after the command

# Top separator
animated_separator "═" 139

# ASCII header with progressive typewriter display
ascii_typewriter "tim waldin" "Univers" "${BOLD}${CYAN}"

echo ""
typewriter "${BOLD}${WHITE} links${RESET}"
typewriter "${CYAN}󰇮 tim@waldin.net${RESET}   ${YELLOW} https://github.com/twaldin${RESET}   ${MAGENTA} https://linkedin.com/in/twaldin${RESET}    ${GREEN}󰋾 https://instagram.com/timn.w${RESET}"

# Welcome message with typewritertypewriter "${DIM}You can explore my projects and this filesystem using all normal tools (eg. cd, ls, fzf, nvim, etc.${RESET}"
typewriter "${DIM}Type \"help\" for a lit of available commands.${RESET}"
typewriter "${DIM}Type \"blog\" to see my blog${RESET}"
typewritter "${DIM}Type \"projects\" to see my projects.${RESET}"
echo ""

animated_separator "═" 139

