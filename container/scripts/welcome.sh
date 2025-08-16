#!/bin/bash

# Source shared functions
source "$(dirname "$0")/shared-functions.sh"

clear

# Top separator
animated_separator "═" 139

# ASCII header with progressive typewriter display
ascii_typewriter "twald.in" "Univers" "${BOLD}${CYAN}"

echo ""
typewriter "${CYAN}󰇮 tim@waldin.net${RESET}"
typewriter "${YELLOW} https://github.com/twaldin${RESET}"
typewriter "${MAGENTA} https://linkedin.com/in/twaldin${RESET}"
typewriter "${GREEN}󰋾 https://instagram.com/timn.w${RESET}"

echo ""
animated_separator "═" 139

# Welcome message with typewriter
echo ""
typewriter "${GREEN}Welcome to twald.in terminal portfolio${RESET}"
typewriter "${WHITE}This is a fully interactive ubuntu linux terminal hosting my projects and blog${RESET}"
typewriter "${DIM}You can explore my projects and this filesystem using all normal tools (eg. cd, ls, fzf, nvim, etc.${RESET}"
typewriter "${DIM}Type projects to see my projects - Type blog to see my blog - Type help to see all commands.${RESET}"
echo ""

animated_separator "═" 139