#!/bin/bash

# Source shared functions
source "$(dirname "$0")/shared-functions.sh"

clear

# ASCII header with progressive typewriter display
ascii_typewriter "projects" "Univers" "${BOLD}${CYAN}"

echo ""
animated_separator "+" 60
echo ""

# Project 1 - STM32 Games
typewriter "${GREEN}1. STM32 Games${RESET}"
typewriter "   ${WHITE}Handheld game console with STM32 microcontroller${RESET}"
typewriter "   ${YELLOW}Tech:${RESET} C, STM32F103C8, ST7789 LCD, libopencm3"
typewriter "   ${BLUE}Navigate:${RESET} Type ${BOLD}stm32-games${RESET} to view info and navigate"

echo ""

# Project 2 - Terminal Site  
typewriter "${GREEN}2. Terminal Site${RESET}"
typewriter "   ${WHITE}Web-based terminal portfolio in Docker containers${RESET}"
typewriter "   ${YELLOW}Tech:${RESET} Next.js, Node.js, Socket.IO, Docker, TypeScript"
typewriter "   ${BLUE}Navigate:${RESET} Type ${BOLD}term-site${RESET} to view info and navigate"

echo ""

# Project 3 - Sulfur Recipes
typewriter "${GREEN}3. Sulfur Recipes${RESET}"
typewriter "   ${WHITE}Recipe database web app for Sulfur game${RESET}"
typewriter "   ${YELLOW}Tech:${RESET} Next.js, React, Tailwind CSS, shadcn/ui"
typewriter "   ${BLUE}Navigate:${RESET} Type ${BOLD}sulfur-recipies${RESET} to view info and navigate"

echo ""

# Project 4 - Dotfiles
typewriter "${GREEN}4. Dotfiles${RESET}"
typewriter "   ${WHITE}Development environment configuration files${RESET}"
typewriter "   ${YELLOW}Tech:${RESET} Zsh, LazyVim, Neovim, Lua, Ghostty"
typewriter "   ${BLUE}Navigate:${RESET} Type ${BOLD}dotfiles${RESET} to view info and navigate"

echo ""
animated_separator "=" 60
echo ""

# Footer information
typewriter "${DIM}${WHITE}You are now in the projects directory. Commands will navigate to each project.${RESET}"
typewriter "${YELLOW}Available:${RESET} ls, stm32-games, term-site, sulfur-recipies, dotfiles"
typewriter "${CYAN}Type 'home' to return to main dashboard${RESET}"