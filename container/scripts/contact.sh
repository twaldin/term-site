#!/bin/bash
source "$(dirname "$0")/shared-functions.sh"

# Use ANSI escape to preserve scrollback in web terminal
printf '\033[H\033[J'

echo ""

# ASCII header with progressive typewriter display
ascii_typewriter "contact" "Univers" "${BOLD}${CYAN}"

# Build links line with proper hyperlinks using the new hyperlink function
links_line="${CYAN}󰇮 $(email_link "tim@waldin.net" "tim@waldin.net" "$CYAN")${RESET}    "
links_line+="${YELLOW} $(hyperlink "github" "https://github.com/twaldin" "$YELLOW")${RESET}    "
links_line+="${BLUE} $(hyperlink "linkedin" "https://linkedin.com/in/twaldin" "$BLUE")${RESET}    "
links_line+="${MAGENTA}󰋾 $(hyperlink "instagram" "https://instagram.com/timn.w" "$MAGENTA")${RESET}    "
links_line+="${CYAN} $(hyperlink "twitter" "https://x.com/timhotty1" "$CYAN")${RESET}    "
echo -e "$links_line${RESET}"
echo -e "${DIM}type 'email', 'github', 'linkedin', 'instagram', or 'twitter' to open links.${RESET}"
echo -e "${DIM}you can click them, but that would be unoptimal${RESET}"

echo ""
typewriter "${DIM}Type \"help\" for a list of available commands.${RESET}"
echo ""

animated_separator "═" 139
