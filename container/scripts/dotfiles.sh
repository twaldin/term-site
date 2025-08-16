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
    printf "\033[38;5;121m%s\033[0m" "$char"
    sleep $delay
  done
}

# ASCII typewriter function - displays figlet output line by line
ascii_typewriter() {
  local text="$1"
  local font="${2:-Univers}"
  local color="${3:-${BOLD}${GREEN}}"

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
  echo -e "${GREEN}┌─ ${BOLD}${title}${RESET}${GREEN} ───────────────────────────────────────────────────────────┐${RESET}"
  echo -e "${GREEN}│${RESET} ${WHITE}Personal development environment configuration files for Zsh shell${RESET}   ${GREEN}│${RESET}"
  echo -e "${GREEN}│${RESET} ${WHITE}and Neovim editor using the LazyVim distribution.${RESET}                   ${GREEN}│${RESET}"
  echo -e "${GREEN}└─────────────────────────────────────────────────────────────────────┘${RESET}"
}

clear

# ASCII header with progressive typewriter display
ascii_typewriter "dotfiles" "Univers" "${BOLD}${GREEN}"

# Create boxed content for main info
create_box "Info" "Development environment configuration"

animated_separator "~" 60

typewriter "${YELLOW}You are now in the projects/dotfiles directory${RESET}"
typewriter "${DIM}Use ls, cat, nvim, or other commands to explore${RESET}"

# Commands section
typewriter "${GREEN}Commands:${RESET}"
typewriter "   ${YELLOW}ls${RESET}                               - List dotfile directories"
typewriter "   ${YELLOW}cat README.md${RESET}                    - View setup documentation"
typewriter "   ${YELLOW}cat zsh/zshrc${RESET}                    - View Zsh configuration"
typewriter "   ${YELLOW}cd nvim && ls${RESET}                    - Explore Neovim setup"
typewriter "   ${YELLOW}cat nvim/lua/config/options.lua${RESET}  - View Neovim options"
typewriter "   ${YELLOW}tree -L 3${RESET}                        - Show detailed structure"
typewriter "   ${YELLOW}cd ..${RESET}                            - Go back to portfolio directory"
typewriter "   ${YELLOW}projects${RESET}                         - Return to projects overview"
typewriter "   ${YELLOW}home${RESET}                             - Return to main dashboard"

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

