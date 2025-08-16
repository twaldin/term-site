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
typewriter "${BOLD}${WHITE} links${RESET}"

# Build links line with proper hyperlinks using the new hyperlink function
links_line="${CYAN}󰇮 $(email_link "tim@waldin.net" "tim@waldin.net" "$CYAN")${RESET}    "
links_line+="${YELLOW} $(hyperlink "github.com   /twaldin" "https://github.com/twaldin" "$YELLOW")${RESET}    "
links_line+="${BLUE} $(hyperlink "linkedin" "https://linkedin.com/in/twaldin" "$MAGENTA")${RESET}    "
links_line+="${MAGENTA}󰋾 $(hyperlink "instagram" "https://instagram.com/timn.w" "$GREEN")${RESET}    "
links_line+="${CYAN} $(hyperlink "twitter" "https://x.com/timhotty1" "$CYAN")${RESET}    "
echo -e "$links_line${RESET}"

echo ""
typewriter "${DIM}Type \"help\" for a list of available commands.${RESET}"
typewriter "${DIM}Type \"blog\" to see my blog${RESET}"
typewriter "${DIM}Type \"projects\" to see my projects.${RESET}"
echo ""

animated_separator "═" 139

