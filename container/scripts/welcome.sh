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
typewriter "${CYAN}󰇮 \033]8;;mailto:tim@waldin.net\033\\tim@waldin.net\033]8;;\033\\${RESET}   ${YELLOW} \033]8;;https://github.com/twaldin\033\\github\033]8;;\033\\${RESET}   ${MAGENTA} \033]8;;https://linkedin.com/in/twaldin\033\\linkedin\033]8;;\033\\${RESET}    ${GREEN}󰋾 \033]8;;https://instagram.com/timn.w\033\\instagram\033]8;;\033\\${RESET}"

typewriter "${DIM}Type \"help\" for a list of available commands.${RESET}"
typewriter "${DIM}Type \"blog\" to see my blog${RESET}"
typewriter "${DIM}Type \"projects\" to see my projects.${RESET}"
echo ""

animated_separator "═" 139
