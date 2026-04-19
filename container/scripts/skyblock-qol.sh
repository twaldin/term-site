#!/bin/bash
source "$(dirname "$0")/shared-functions.sh"
emit_url "projects/skyblock-qol"

clear
echo ""
ascii_typewriter "skyblock-qol" "DOS_Rebel" "${GREEN}" 80

echo ""

create_box "Description" "Quality of life Minecraft mod for Hypixel Skyblock.
Adds HUD overlays, automation helpers, and gameplay enhancements." "${GREEN}"

echo ""

typewriter "${GREEN}Tech Stack:${RESET}"
animated_separator "~" 10 "${GREEN}"
typewriter "   ${GREEN}•${RESET} Java"
typewriter "   ${GREEN}•${RESET} Minecraft Forge"
typewriter "   ${GREEN}•${RESET} Gradle build system"

git_activity "${GREEN}"

echo ""

typewriter "${YELLOW}You are now in the projects/SkyblockQOLmod directory${RESET}"
typewriter "${DIM}Use ls, tree, cat, nvim, or other commands to explore the actual git repository of this project,${RESET}"
typewriter "${DIM}or type home to go back to the home page ${RESET}"
echo ""
