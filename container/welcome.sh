#!/bin/bash

# Welcome Dashboard for Timothy Waldin
# Colors matching oh-my-posh stelbent-compact.minimal theme

# Color codes matching your terminal theme
CYAN='\033[38;5;117m'    # Light blue like path segment (#91ddff)
GREEN='\033[38;5;121m'   # Green like git clean (#95ffa4)
YELLOW='\033[38;5;227m'  # Yellow like terraform (#ffee58)
BLUE='\033[38;5;111m'    # Blue like ahead (#89d1dc)
MAGENTA='\033[38;5;177m' # Magenta accent
RED='\033[38;5;210m'     # Soft red for accents
WHITE='\033[38;5;255m'   # Pure white
GRAY='\033[38;5;245m'    # Gray for secondary text
RESET='\033[0m'          # Reset color
BOLD='\033[1m'           # Bold text
DIM='\033[2m'            # Dim text

# Terminal dimensions - use environment variable or fallback
COLS=${COLUMNS:-$(tput cols 2>/dev/null || echo 120)}

# Get the actual ASCII art width for reference
ASCII_WIDTH=123

# Center text function
center_text() {
  local text="$1"
  local color="$2"
  local length=${#text}
  local padding=$(((COLS - length) / 2))
  printf "%*s" $padding ""
  echo -e "${color}${text}${RESET}"
}

# Print separator line that spans the full terminal width
separator() {
  local char="${1:-═}"
  local color="${2:-$GRAY}"

  # Get current terminal width dynamically
  local current_cols=$(tput cols 2>/dev/null || echo $COLS)

  printf "${color}"
  printf "${char}%.0s" $(seq 1 $current_cols)
  printf "${RESET}\n"
}

# Function to print ASCII art
print_ascii() {
  echo -e "${BOLD}${CYAN}"
  echo "         88                                                         88           88  88                                                     "
  echo "  ,d     \"\"                                                         88           88  \"\"                                               ,d    "
  echo "  88                                                                88           88                                                   88    "
  echo "MM88MMM  88  88,dPYba,,adPYba,      8b      db      d8  ,adPPYYba,  88   ,adPPYb,88  88  8b,dPPYba,        8b,dPPYba,    ,adPPYba,  MM88MMM "
  echo "  88     88  88P'   \"88\"    \"8a     \`8b    d88b    d8'  \"\"     \`Y8  88  a8\"    \`Y88  88  88P'   \`\"8a       88P'   \`\"8a  a8P_____88    88    "
  echo "  88     88  88      88      88      \`8b  d8'\`8b  d8'   ,adPPPPP88  88  8b       88  88  88       88       88       88  8PP\"\"\"\"\"\"\"    88    "
  echo "  88,    88  88      88      88  888  \`8bd8'  \`8bd8'    88,    ,88  88  \"8a,   ,d88  88  88       88  888  88       88  \"8b,   ,aa    88,   "
  echo "  \"Y888  88  88      88      88  888    YP      YP      \`\"8bbdP\"Y8  88   \`\"8bbdP\"Y8  88  88       88  888  88       88   \`\"Ybbd8\"'    \"Y888 "
  echo -e "${RESET}"
}

# Clear screen and start
clear

# Top border
separator "═" "$CYAN"

# ASCII Art Header
print_ascii
echo -e "\n${CYAN}󰇮 tim@waldin.net${RESET}    ${MAGENTA} https://studyspot.us${RESEST}   ${YELLOW} https://github.com/twaldin${RESET}   ${GREEN}󰋾 https://instagram.com/timn.w${RESET}"
separator "═" "$CYAN"

center_text "Welcome to my portfolio terminal! You can explore with familiar cmd line tools like cd, ls, etc." "$WHITE$DIM"
center_text "Type 'help' for available commands" "$GRAY"

separator "═" "$CYAN"
