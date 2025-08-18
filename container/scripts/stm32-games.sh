#!/bin/bash

# Source shared functions
source "$(dirname "$0")/shared-functions.sh"

clear
# ASCII header with progressive typewriter display
ascii_typewriter "stm32 games" "Univers" "${BOLD}${BLUE}"

echo ""

# Create boxed content for main info
create_box "Info" "A handheld game console project built with STM32F103C8T6 microcontroller
featuring classic games like Snake with an ST7789 LCD display." "${BLUE}"

echo ""

# Tech Stack section
typewriter "${GREEN}Tech Stack:${RESET}"
typewriter "   ${YELLOW}•${RESET} C programming with ARM Cortex-M3"
typewriter "   ${YELLOW}•${RESET} STM32F103C8 (Blue Pill) microcontroller"
typewriter "   ${YELLOW}•${RESET} ST7789 SPI LCD display driver"
typewriter "   ${YELLOW}•${RESET} libopencm3 firmware library"
typewriter "   ${YELLOW}•${RESET} ARM GCC toolchain"

echo ""
animated_separator "~" 60 "${BLUE}"
echo ""

typewriter "${YELLOW}You are now in the projects/stm32-games directory${RESET}"
typewriter "${DIM}Use ls, cat, nvim, or other commands to explore${RESET}"

echo ""

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

echo ""
animated_separator "-" 50 "${BLUE}"
echo ""

# Git repository information
typewriter "${GREEN}Git:${RESET}"
if [ -d ".git" ]; then
  branch=$(git branch --show-current 2>/dev/null || echo "main")
  typewriter "   ${BLUE}Branch:${RESET} ${YELLOW}${branch}${RESET}"
  typewriter "   ${BLUE}Recent commits:${RESET}"
  git log --oneline --decorate --color=always | head -5 | while IFS= read -r line; do
    typewriter "     ${DIM}•${RESET} $line"
  done
  if git status --porcelain | grep -q .; then
    typewriter "   ${YELLOW}Status:${RESET} ${RED}Modified files present${RESET}"
  else
    typewriter "   ${YELLOW}Status:${RESET} ${GREEN}Clean working directory${RESET}"
  fi
else
  typewriter "   ${DIM}Not a git repository${RESET}"
fi

echo ""
animated_separator "=" 60 "${BLUE}"