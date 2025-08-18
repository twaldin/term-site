#!/bin/bash

# Source shared functions
source "$(dirname "$0")/shared-functions.sh"

# Use ANSI escape to move cursor home and erase screen (preserves scrollback in most terminals)
printf '\033[H\033[J'

# ASCII header with progressive typewriter display
ascii_typewriter "projects" "Univers" "${BOLD}${CYAN}"

echo ""
animated_separator "+" 60
echo ""

# Project 1 - STM32 Games
typewriter "${GREEN}1. stm32 games${RESET}"
typewriter "   ${WHITE}play the classic snake game in c on a microcontroller with lcd screen.${RESET}"
typewriter "   ${YELLOW}tech stack:${RESET} C, stm32f103c8 microcontroller, st7789 lcd screen, libopencm3 library & custom display driver"
typewriter "   ${DIM}type ${BOLD}\"stm32-games\"to view info and navigate${RESET}"

echo ""

# Project 2 - Terminal Site
typewriter "${GREEN}2. term site${RESET}"
typewriter "   ${WHITE}web terminal portfolio in docker containers (you are in it right now)${RESET}"
typewriter "   ${YELLOW}tech stack:${RESET} next.js, node.js, socket.IO, docker, typescript"
typewriter "   ${DIM}type ${BOLD}\"term-site\"to view info and navigate${RESET}"

echo ""

# Project 3 - Sulfur Recipes
typewriter "${GREEN}3. sulfur recipes${RESET}"
typewriter "   ${WHITE}cooking recipe web cookbook/optimizer for sulfur game${RESET}"
typewriter "   ${YELLOW}tech stack:${RESET} next.js, react, tailwind css, shadcn/ui"
typewriter "   ${DIM}rype ${BOLD}\"sulfur-recipies\"to view info and navigate${RESET}"

echo ""

# Project 4 - Dotfiles
typewriter "${GREEN}4. dotfiles${RESET}"
typewriter "   ${WHITE}development environment configuration files${RESET}"
typewriter "   ${YELLOW}tools:${RESET}zsh, lazyvim, ghostty, etc"
typewriter "   ${DIM}Type ${BOLD}\"dotfiles\"to view info and navigate${RESET}"

echo ""
animated_separator "=" 60
echo ""

# Footer information
typewriter "${DIM}${WHITE}You are now in the projects directory. Commands will navigate to each project.${RESET}"
typewriter "${YELLOW}Available:${RESET} ls, stm32-games, term-site, sulfur-recipies, dotfiles"
typewriter "${CYAN}Type 'home' to return to main dashboard${RESET}"

