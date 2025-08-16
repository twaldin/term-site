#!/bin/bash

# Source shared functions
source "$(dirname "$0")/shared-functions.sh"

echo ""
typewriter "${GREEN}commands${RESET}"

typewriter "${YELLOW}  home        ${WHITE}back to the main page!${RESET}"
typewriter "${YELLOW}  projects    ${WHITE}explore my projects (you can use vim!)${RESET}"
typewriter "${YELLOW}  blog        ${WHITE}view my blog${RESET}"
typewriter "${YELLOW}  help        ${WHITE}you already used it once...${RESET}"
typewriter "${YELLOW}  about       ${WHITE}learn about me${RESET}"

typewriter "${DIM}you can use most commands you are familiar with inside the terminal like cd, ls, etc.${RESET}"
typewriter "${DIM}tools like ${CYAN}nvim${RESET}${DIM}, ${CYAN}git${RESET}${DIM}, ${CYAN}grep${RESET}${DIM}, ${CYAN}figlet${RESET}${DIM} and many more are available!${RESET}"
echo ""
