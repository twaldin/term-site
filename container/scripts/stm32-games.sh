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

clear
echo -e "${BOLD}${CYAN}"
echo "                                         ad888888b,   ad888888b,                                                                           "
echo "             ,d                         d8\"     \"88  d8\"     \"88                                                                           "
echo "             88                                 a8P          a8P                                                                           "
echo ",adPPYba,  MM88MMM  88,dPYba,,adPYba,        aad8\"        ,d8P\"          ,adPPYb,d8  ,adPPYYba,  88,dPYba,,adPYba,    ,adPPYba,  ,adPPYba, "
echo "I8[    \"\"    88     88P'   \"88\"    \"8a       \"\"Y8,      a8P\"  aaaaaaaa  a8\"    \`Y88  \"\"     \`Y8  88P'   \"88\"    \"8a  a8P_____88  I8[    \"\" "
echo " \`\"Y8ba,     88     88      88      88          \"8b   a8P'    \"\"\"\"\"\"\"\"  8b       88  ,adPPPPP88  88      88      88  8PP\"\"\"\"\"\"\"   \`\"Y8ba,  "
echo "aa    ]8I    88,    88      88      88  Y8,     a88  d8\"                \"8a,   ,d88  88,    ,88  88      88      88  \"8b,   ,aa  aa    ]8I "
echo "\`\"YbbdP\"'    \"Y888  88      88      88   \"Y888888P'  88888888888         \`\"YbbdP\"Y8  \`\"8bbdP\"Y8  88      88      88   \`\"Ybbd8\"'  \`\"YbbdP\"' "
echo "                                                                         aa,    ,88                                                        "
echo "                                                                          \"Y8bbdP\"                                                         "

echo -e "${GREEN}Info:${RESET}"
echo -e "   ${WHITE}A handheld game console project built with STM32F103C8T6 microcontroller${RESET}"
echo -e "   ${WHITE}featuring classic games like Snake with an ST7789 LCD display.${RESET}"
echo
echo -e "${GREEN}Tech Stack:${RESET}"
echo -e "   ${YELLOW}•${RESET} C programming with ARM Cortex-M3"
echo -e "   ${YELLOW}•${RESET} STM32F103C8 (Blue Pill) microcontroller"
echo -e "   ${YELLOW}•${RESET} ST7789 SPI LCD display driver"
echo -e "   ${YELLOW}•${RESET} libopencm3 firmware library"
echo -e "   ${YELLOW}•${RESET} ARM GCC toolchain"
echo
echo -e "   ${YELLOW}You are now in the projects/stm32-games directory${RESET}"
echo -e "   ${DIM}Use ls, cat, nvim, or other commands to explore${RESET}"
echo

echo -e "${GREEN}Commands:${RESET}"
echo -e "   ${YELLOW}ls${RESET}                    - List project files"
echo -e "   ${YELLOW}cat README.md${RESET}         - View project documentation"
echo -e "   ${YELLOW}cat main.c${RESET}            - View main application code"
echo -e "   ${YELLOW}cat snake.c${RESET}           - View Snake game implementation"
echo -e "   ${YELLOW}tree${RESET}                  - Show complete file structure"
echo -e "   ${YELLOW}cd ..${RESET}                 - Go back to portfolio directory"
echo -e "   ${YELLOW}projects${RESET}              - Return to projects overview"
echo -e "   ${YELLOW}home${RESET}                  - Return to main dashboard"
echo

# Git repository information
echo -e "${GREEN}Git:${RESET}"
if [ -d ".git" ]; then
  # Show current branch
  branch=$(git branch --show-current 2>/dev/null || echo "main")
  echo -e "   ${BLUE}Branch:${RESET} ${YELLOW}${branch}${RESET}"

  # Show recent commits with nice formatting
  echo -e "   ${BLUE}Recent commits:${RESET}"
  git log --oneline --decorate --color=always | head -5 | while IFS= read -r line; do
    echo -e "     ${DIM}•${RESET} $line"
  done

  # Show repository status
  if git status --porcelain | grep -q .; then
    echo -e "   ${YELLOW}Status:${RESET} ${RED}Modified files present${RESET}"
  else
    echo -e "   ${YELLOW}Status:${RESET} ${GREEN}Clean working directory${RESET}"
  fi
else
  echo -e "   ${DIM}Not a git repository${RESET}"
fi

