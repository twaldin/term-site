#!/bin/bash
source "$(dirname "$0")/shared-functions.sh"

clear
echo ""

# ASCII header with progressive typewriter display
ascii_typewriter "contact" "Univers" "${BOLD}${CYAN}"

# Display links directly to avoid escape sequence processing issues  
printf "${CYAN}󰇮 "
email_link "tim@waldin.net" "tim@waldin.net" "$CYAN"
printf "${RESET}    ${YELLOW} "
hyperlink "github" "https://github.com/twaldin" "$YELLOW"  
printf "${RESET}    ${BLUE} "
hyperlink "linkedin" "https://linkedin.com/in/twaldin" "$BLUE"
printf "${RESET}    ${MAGENTA}󰋾 "
hyperlink "instagram" "https://instagram.com/timn.w" "$MAGENTA"
printf "${RESET}    ${CYAN} "
hyperlink "twitter" "https://x.com/timhotty1" "$CYAN"
printf "${RESET}\n"
echo -e "${DIM}type 'email', 'github', 'linkedin', 'instagram', or 'twitter' to open links.${RESET}"
echo -e "${DIM}you can click them, but that would be unoptimal${RESET}"

echo ""
typewriter "${DIM}Type \"help\" for a list of available commands.${RESET}"
echo ""

animated_separator "═" 139
