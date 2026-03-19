#!/bin/bash
source "$(dirname "$0")/shared-functions.sh"

clear
echo ""
ascii_typewriter "skyblock-qol" "DOS_Rebel" "${GREEN}"

echo ""
animated_separator "+" 60
echo ""

typewriter "${GREEN}skyblock QOL mod${RESET}"
animated_separator "-" 15 "$GREEN"
typewriter "   ${WHITE}quality of life minecraft mod for hypixel skyblock.${RESET}"
typewriter "   ${WHITE}adds HUD overlays, automation helpers, and gameplay enhancements.${RESET}"
echo ""
typewriter "   ${YELLOW}tech stack:${RESET} Java, Minecraft Forge, Gradle"
echo ""
typewriter "   ${DIM}explore the source code with ${CYAN}ls${RESET}${DIM}, ${CYAN}nvim${RESET}${DIM}, or ${CYAN}cat${RESET}"
typewriter "   ${DIM}type ${BOLD}\"projects\"${RESET}${DIM} to go back to the project list${RESET}"
typewriter "   ${DIM}type ${BOLD}\"home\"${RESET}${DIM} to go back to the home page${RESET}"
echo ""
