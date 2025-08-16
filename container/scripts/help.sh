#!/bin/bash

# Colors
CYAN='\033[38;5;117m'
GREEN='\033[38;5;121m'
WHITE='\033[38;5;255m'
YELLOW='\033[38;5;227m'
BLUE='\033[38;5;111m'
RED='\033[38;5;210m'
RESET='\033[0m'
BOLD='\033[1m'
DIM='\033[2m'

# Simple typewriter function with echo -e support
typewriter() {
  local text="$1"
  local delay=0.001 # Ultra fast delay

  # Use echo -e to process escape sequences, then extract character by character
  local processed_text=$(echo -e "$text")

  for ((i = 0; i < ${#processed_text}; i++)); do
    printf "%s" "${processed_text:$i:1}"
    sleep $delay
  done
}

# Simple animated separator
animated_separator() {
  local char="$1"
  local width="$2"
  local delay=0.001

  for ((i = 0; i < width; i++)); do
    printf "\033[38;5;117m%s\033[0m" "$char"
    sleep $delay
  done
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
ascii_typewriter "HELP" "Univers" "${BOLD}${CYAN}"
animated_separator "═" 80

typewriter "${GREEN}⌨️  Terminal Portfolio Commands${RESET}"

# Portfolio Commands
typewriter "${BLUE}📁 Portfolio Commands:${RESET}"

typewriter "${YELLOW}  welcome     ${WHITE}Show the enhanced welcome dashboard${RESET}"
typewriter "${YELLOW}  projects    ${WHITE}View detailed project information${RESET}"
typewriter "${YELLOW}  blog        ${WHITE}📚 Access the markdown blog system${RESET}"
typewriter "${YELLOW}  contact     ${WHITE}Get contact and collaboration info${RESET}"
typewriter "${YELLOW}  help        ${WHITE}Show this help message${RESET}"

# Blog Commands
typewriter "${BLUE}📝 Blog Commands:${RESET}"

typewriter "${YELLOW}  blog        ${WHITE}List all blog posts${RESET}"
typewriter "${YELLOW}  blog read N ${WHITE}Read post by number (e.g., blog read 001)${RESET}"
typewriter "${YELLOW}  blog search ${WHITE}Search posts (e.g., blog search terminal)${RESET}"

# System Commands
typewriter "${BLUE}🖥️  System Commands:${RESET}"

typewriter "${YELLOW}  ls, ll, la  ${WHITE}List files and directories${RESET}"
typewriter "${YELLOW}  cat FILE    ${WHITE}View file contents${RESET}"
typewriter "${YELLOW}  bat FILE    ${WHITE}View file contents with syntax highlighting${RESET}"
typewriter "${YELLOW}  nvim FILE   ${WHITE}Edit file with neovim${RESET}"
typewriter "${YELLOW}  tree        ${WHITE}Show directory structure${RESET}"
typewriter "${YELLOW}  htop        ${WHITE}System monitor${RESET}"
typewriter "${YELLOW}  clear       ${WHITE}Clear the terminal screen${RESET}"

# Enhanced Features
typewriter "${BLUE}✨ Enhanced Features:${RESET}"

typewriter "${YELLOW}  🎨 ${WHITE}Dynamic ASCII art with Univers font${RESET}"
typewriter "${YELLOW}  🌈 ${WHITE}Gradient borders and animations${RESET}"
typewriter "${YELLOW}  ⌨️  ${WHITE}Typewriter effects on all text${RESET}"
typewriter "${YELLOW}  📝 ${WHITE}Markdown blog with syntax highlighting${RESET}"
typewriter "${YELLOW}  🎯 ${WHITE}Tokyo Night color theme${RESET}"

# Fun Commands
typewriter "${BLUE}🎪 Fun Commands:${RESET}"

typewriter "${YELLOW}  whoami      ${WHITE}Show current user${RESET}"
typewriter "${YELLOW}  figlet TEXT ${WHITE}ASCII art text generation${RESET}"
typewriter "${YELLOW}  fortune     ${WHITE}Random fortune (if available)${RESET}"

animated_separator "═" 80

echo -e "${RED}┌─ ${BOLD}⚠️  Experiment Freely${RESET}${RED} ──────────────────────────────────────────────┐${RESET}"
echo -e "${RED}│${RESET} ${WHITE}🔒 This is a secure containerized environment${RESET}                        ${RED}│${RESET}"
echo -e "${RED}│${RESET} ${WHITE}Try destructive commands - they only affect this container!${RESET}          ${RED}│${RESET}"
echo -e "${RED}│${RESET} ${WHITE}Examples: rm -rf /, :(){ :|:& };:${RESET}                                    ${RED}│${RESET}"
echo -e "${RED}│${RESET}                                                                      ${RED}│${RESET}"
echo -e "${RED}│${RESET} ${WHITE}Type 'welcome' to return to the enhanced main dashboard${RESET}              ${RED}│${RESET}"
echo -e "${RED}└──────────────────────────────────────────────────────────────────────┘${RESET}"

