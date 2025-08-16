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
  local batch_size=5  # Print 5 characters at a time
  local delay=0.0001  # Tiny delay between batches

  # Use echo -e to process escape sequences, then extract character by character
  local processed_text=$(echo -e "$text")

  local length=${#processed_text}

  for ((i = 0; i < length; i += batch_size)); do
    printf "%s" "${processed_text:$i:$batch_size}"
    sleep $delay
  done
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
      batch+="\033[38;5;111m${char}\033[0m"
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
  local color="${3:-${BOLD}${BLUE}}"

  # Generate ASCII art and capture in variable
  local ascii_output
  ascii_output=$(figlet -f "$font" "$text" 2>/dev/null || figlet "$text")

  # Split into lines and display each with typewriter effect
  while IFS= read -r line; do
    typewriter "${color}${line}${RESET}"
  done <<<"$ascii_output"
}

# Simple box function
create_box() {
  local title="$1"
  local content="$2"
  echo -e "${BLUE}┌─ ${BOLD}${title}${RESET}${BLUE} ───────────────────────────────────────────────────────────┐${RESET}"
  echo -e "${BLUE}│${RESET} ${WHITE}A handheld game console project built with STM32F103C8T6 microcontroller${RESET} ${BLUE}│${RESET}"
  echo -e "${BLUE}│${RESET} ${WHITE}featuring classic games like Snake with an ST7789 LCD display.${RESET}          ${BLUE}│${RESET}"
  echo -e "${BLUE}└─────────────────────────────────────────────────────────────────────┘${RESET}"
}

clear

# ASCII header with progressive typewriter display
ascii_typewriter "stm32 games" "Univers" "${BOLD}${BLUE}"

# Create boxed content for main info
create_box "Info" "STM32 handheld game console"

# Tech Stack section
typewriter "${GREEN}Tech Stack:${RESET}"
typewriter "   ${YELLOW}•${RESET} C programming with ARM Cortex-M3"
typewriter "   ${YELLOW}•${RESET} STM32F103C8 (Blue Pill) microcontroller"
typewriter "   ${YELLOW}•${RESET} ST7789 SPI LCD display driver"
typewriter "   ${YELLOW}•${RESET} libopencm3 firmware library"
typewriter "   ${YELLOW}•${RESET} ARM GCC toolchain"

animated_separator "~" 60

typewriter "${YELLOW}You are now in the projects/stm32-games directory${RESET}"
typewriter "${DIM}Use ls, cat, nvim, or other commands to explore${RESET}"

# Commands section
typewriter "${GREEN}Commands:${RESET}"
typewriter "   ${YELLOW}ls${RESET}                    - List project files"
typewriter "   ${YELLOW}cat README.md${RESET}         - View project documentation"
typewriter "   ${YELLOW}cat main.c${RESET}            - View main application code"
typewriter "   ${YELLOW}cat snake.c${RESET}           - View Snake game implementation"
typewriter "   ${YELLOW}tree${RESET}                  - Show complete file structure"
typewriter "   ${YELLOW}cd ..${RESET}                 - Go back to portfolio directory"
typewriter "   ${YELLOW}projects${RESET}              - Return to projects overview"
typewriter "   ${YELLOW}home${RESET}                  - Return to main dashboard"

animated_separator "-" 50

# Git repository information
typewriter "${GREEN}Git:${RESET}"
if [ -d ".git" ]; then
  # Show current branch
  branch=$(git branch --show-current 2>/dev/null || echo "main")
  typewriter "   ${BLUE}Branch:${RESET} ${YELLOW}${branch}${RESET}"

  # Show recent commits with nice formatting
  typewriter "   ${BLUE}Recent commits:${RESET}"
  git log --oneline --decorate --color=always | head -5 | while IFS= read -r line; do
    typewriter "     ${DIM}•${RESET} $line"
  done

  # Show repository status
  if git status --porcelain | grep -q .; then
    typewriter "   ${YELLOW}Status:${RESET} ${RED}Modified files present${RESET}"
  else
    typewriter "   ${YELLOW}Status:${RESET} ${GREEN}Clean working directory${RESET}"
  fi
else
  typewriter "   ${DIM}Not a git repository${RESET}"
fi

animated_separator "=" 60

