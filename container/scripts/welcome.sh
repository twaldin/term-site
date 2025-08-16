#!/bin/bash

# Source shared functions
source "$(dirname "$0")/shared-functions.sh"

# Don't clear - keep the typed "welcome" command visible
echo "" # Just add a newline after the command

# Top separator
animated_separator "═" 139

# ASCII header with progressive typewriter display
ascii_typewriter "tim waldin" "Univers" "${BOLD}${CYAN}"

echo ""
typewriter "${BOLD}${WHITE} links${RESET}"
typewriter "${CYAN}󰇮 \e]8;;mailto:tim@waldin.net\e\\tim@waldin.net\e]8;;\e\\${RESET}   ${YELLOW} \e]8;;https://github.com/twaldin\e\\github\e]8;;\e\\${RESET}   ${MAGENTA} \e]8;;https://linkedin.com/in/twaldin\e\\linkedin\e]8;;\e\\${RESET}    ${GREEN}󰋾 \e]8;;https://instagram.com/timn.w\e\\instagram\e]8;;\e\\${RESET}"

typewriter "${DIM}Type \"help\" for a lit of available commands.${RESET}"
typewriter "${DIM}Type \"blog\" to see my blog${RESET}"
typewritter "${DIM}Type \"projects\" to see my projects.${RESET}"
echo ""

animated_separator "═" 139
