#!/bin/bash
source "$(dirname "$0")/shared-functions.sh"
emit_url "projects/skyblock-qol"

clear
echo ""
ascii_typewriter "skyblock-qol" "DOS_Rebel" "${PURPLE}"

echo ""

create_box "Description" "Quality of life Minecraft mod for Hypixel Skyblock.
Adds HUD overlays, automation helpers, and gameplay enhancements." "${PURPLE}"

echo ""

typewriter "${BLUE}Tech Stack:${RESET}"
animated_separator "~" 10 "${PURPLE}"
typewriter "   ${PURPLE}•${RESET} Java"
typewriter "   ${PURPLE}•${RESET} Minecraft Forge"
typewriter "   ${PURPLE}•${RESET} Gradle build system"

git_activity "${PURPLE}"

echo ""

typewriter "${RED}You are now in the projects/SkyblockQOLmod directory${RESET}"
typewriter "${DIM}Use ls, tree, cat, nvim, or other commands to explore the actual git repository of this project,${RESET}"
typewriter "${DIM}or type home to go back to the home page ${RESET}"
echo ""
