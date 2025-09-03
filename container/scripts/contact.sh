#!/bin/bash
source "$(dirname "$0")/shared-functions.sh"

# ASCII header with progressive typewriter display
# Build links line with proper hyperlinks using the new hyperlink function
links_line="${CYAN}󰇮$(email_link "tim@waldin.net" "tim@waldin.net" "$CYAN")${RESET}    "
links_line+="${YELLOW}$(hyperlink "github" "https://github.com/twaldin" "$YELLOW")${RESET}    "
links_line+="${BLUE}$(hyperlink "linkedin" "https://linkedin.com/in/twaldin" "$BLUE")${RESET}    "
links_line+="${MAGENTA}󰋾$(hyperlink "instagram" "https://instagram.com/timn.w" "$MAGENTA")${RESET}    "
links_line+="${CYAN}$(hyperlink "twitter" "https://x.com/timhotty1" "$CYAN")${RESET}    "

echo -e "$links_line${RESET}"
typewriter "${DIM}Type \"help\" for a list of available commands.${RESET}"
echo ""

