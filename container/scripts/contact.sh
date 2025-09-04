#!/bin/bash
source "$(dirname "$0")/shared-functions.sh"

links_line="${RED}󰇮$(email_link "tim@waldin.net" "tim@waldin.net""$RED")${RESET}    "
links_line+="${YELLOW}$(hyperlink "github" "https://github.com/twaldin""$YELLOW")${RESET}    "
links_line+="${BLUE}$(hyperlink "linkedin" "https://linkedin.com/in/twaldin""$BLUE")${RESET}    "
links_line+="${MAGENTA}$(hyperlink "instagram" "https://instagram.com/timn.w""$MAGENTA")${RESET}    "
links_line+="${BLUE}$(hyperlink "twitter" "https://x.com/timhotty1""$BLUE")${RESET}    "

echo ""
echo -e "$links_line${RESET}"
echo ""

