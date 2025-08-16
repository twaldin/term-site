#!/bin/bash

# Colors
CYAN='\033[38;5;117m'
GREEN='\033[38;5;121m'
WHITE='\033[38;5;255m'
YELLOW='\033[38;5;227m'
BLUE='\033[38;5;111m'
RESET='\033[0m'
BOLD='\033[1m'
DIM='\033[2m'

# Ultra-fast typewriter function with batch printing
typewriter() {
  local text="$1"
  local batch_size=5  # Print 5 characters at a time
  local delay=0.0001  # Tiny delay between batches

  # Use echo -e to process escape sequences
  local processed_text=$(echo -e "$text")
  local length=${#processed_text}

  for ((i = 0; i < length; i += batch_size)); do
    printf "%s" "${processed_text:$i:$batch_size}"
    sleep $delay
  done
  echo
}

# Ultra-fast animated separator with batch printing
animated_separator() {
  local char="$1"
  local width="$2"
  local batch_size=10  # Print 10 characters at a time
  local delay=0.0001

  for ((i = 0; i < width; i += batch_size)); do
    local batch=""
    for ((j = 0; j < batch_size && (i + j) < width; j++)); do
      batch+="\033[38;5;117m${char}\033[0m"
    done
    printf "%b" "$batch"
    sleep $delay
  done
  echo
}

# ASCII typewriter function - displays figlet output line by line
ascii_typewriter() {
  local text="$1"
  local font="${2:-Univers}"
  local color="${3:-${BOLD}${CYAN}}"

  # Generate ASCII art and capture in variable
  local ascii_output
  ascii_output=$(figlet -f "$font" "$text" 2>/dev/null || figlet "$text")

  # Split into lines and display each with typewriter effect
  while IFS= read -r line; do
    typewriter "${color}${line}${RESET}"
  done <<<"$ascii_output"
}

clear

# ASCII header with progressive typewriter display
ascii_typewriter "projects" "Univers" "${BOLD}${CYAN}"

animated_separator "+" 60

# Project 1 - STM32 Games
typewriter "${GREEN}1. STM32 Games${RESET}"
typewriter "   ${WHITE}Handheld game console with STM32 microcontroller${RESET}"
typewriter "   ${YELLOW}Tech:${RESET} C, STM32F103C8, ST7789 LCD, libopencm3"
typewriter "   ${BLUE}Navigate:${RESET} Type ${BOLD}stm32-games${RESET} to view info and navigate"

# Project 2 - Terminal Site
typewriter "${GREEN}2. Terminal Site${RESET}"
typewriter "   ${WHITE}Web-based terminal portfolio in Docker containers${RESET}"
typewriter "   ${YELLOW}Tech:${RESET} Next.js, Node.js, Socket.IO, Docker, TypeScript"
typewriter "   ${BLUE}Navigate:${RESET} Type ${BOLD}term-site${RESET} to view info and navigate"

# Project 3 - Sulfur Recipes
typewriter "${GREEN}3. Sulfur Recipes${RESET}"
typewriter "   ${WHITE}Recipe database web app for Sulfur game${RESET}"
typewriter "   ${YELLOW}Tech:${RESET} Next.js, React, Tailwind CSS, shadcn/ui"
typewriter "   ${BLUE}Navigate:${RESET} Type ${BOLD}sulfur-recipies${RESET} to view info and navigate"

# Project 4 - Dotfiles
typewriter "${GREEN}4. Dotfiles${RESET}"
typewriter "   ${WHITE}Development environment configuration files${RESET}"
typewriter "   ${YELLOW}Tech:${RESET} Zsh, LazyVim, Neovim, Lua, Ghostty"
typewriter "   ${BLUE}Navigate:${RESET} Type ${BOLD}dotfiles${RESET} to view info and navigate"

animated_separator "=" 60

# Footer information
typewriter "${DIM}${WHITE}You are now in the projects directory. Commands will navigate to each project.${RESET}"
typewriter "${YELLOW}Available:${RESET} ls, stm32-games, term-site, sulfur-recipies, dotfiles"
typewriter "${CYAN}Type 'home' to return to main dashboard${RESET}"

