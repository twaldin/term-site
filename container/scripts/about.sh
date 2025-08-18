#!/bin/bash

# Source shared functions
source "$(dirname "$0")/shared-functions.sh"

# Use ANSI escape to preserve scrollback in web terminal
printf '\033[H\033[J'

# Top separator
animated_separator "═" 139

# ASCII header with progressive typewriter display
ascii_typewriter "about me" "Univers" "${BOLD}${CYAN}"

echo ""
echo ""

# About me paragraph - placeholder for now
typewriter "${WHITE}[Your about me paragraph goes here. This is a placeholder for your personal introduction,${RESET}"
typewriter "${WHITE}background, interests, and whatever else you'd like to share with visitors. You can update${RESET}"
typewriter "${WHITE}this section with your actual content later. Consider including your professional background,${RESET}"
typewriter "${WHITE}technical interests, hobbies, or anything that helps visitors get to know you better.]${RESET}"

echo ""
echo ""

# Bottom separator
animated_separator "═" 139

echo ""

# Add navigation hint
create_box "Navigation" "Type 'welcome' to return to the main dashboard" "$GREEN" 80