#!/bin/bash
source "$(dirname "$0")/shared-functions.sh"

clear
ascii_typewriter "projects" "Univers" "${BOLD}${GREEN}"

echo ""
animated_separator "+" 60
echo""
typewriter "${GREEN}1. stm32 games${RESET}"
typewriter "   ${WHITE}play the classic snake game in c on a microcontroller with lcd screen.${RESET}"
typewriter "   ${YELLOW}tech stack:${RESET} C, stm32f103c8 microcontroller, st7789 lcd screen, libopencm3 library & custom display driver"
typewriter "   ${DIM}type ${BOLD}\"stm32-games\" to view info and navigate${RESET}"
echo ""

typewriter "${GREEN}2. term site${RESET}"
typewriter "   ${WHITE}web terminal portfolio in docker containers (you are in it right now)${RESET}"
typewriter "   ${YELLOW}tech stack:${RESET} next.js, node.js, socket.IO, docker, typescript"
typewriter "   ${DIM}type ${BOLD}\"term-site\" to view info and navigate${RESET}"
echo ""

typewriter "${GREEN}3. sulfur recipes${RESET}"
typewriter "   ${WHITE}cooking recipe web cookbook/optimizer for sulfur game${RESET}"
typewriter "   ${YELLOW}tech stack:${RESET} next.js, react, tailwind css, shadcn/ui"
typewriter "   ${DIM}type ${BOLD}\"sulfur-recipies\" to view info and navigate${RESET}"
echo ""

typewriter "${GREEN}4. dotfiles${RESET}"
typewriter "   ${WHITE}development environment configuration files${RESET}"
typewriter "   ${YELLOW}tools:${RESET}zsh, lazyvim, tmux, ghostty, etc"
typewriter "   ${DIM}type ${BOLD}\"dotfiles\"to view info and navigate${RESET}"

echo ""
typewriter "${YELLOW}You are now in the projects/ directory${RESET}"
typewriter "${DIM}Use ls, cd, nvim, or your other favorite commands to explore my projects, ${RESET}"
typewriter "${DIM}or type the project name to see info and navigate to the project repo. ${RESET}"
typewriter "${DIM}or type home to go back to the home page. ${RESET}"
echo""
