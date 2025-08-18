#!/bin/bash

# Source shared functions
source "$(dirname "$0")/shared-functions.sh"

clear
# ASCII header with progressive typewriter display
ascii_typewriter "dotfiles" "Univers" "${BOLD}${GREEN}"

echo ""

# Create boxed content for main info
create_box "Info" "Personal development environment configuration files for Zsh shell
and Neovim editor using the LazyVim distribution." "${GREEN}"

echo ""
animated_separator "~" 60 "${GREEN}"
echo ""

typewriter "${YELLOW}You are now in the projects/dotfiles directory${RESET}"
typewriter "${DIM}Use ls, cat, nvim, or other commands to explore${RESET}"

echo ""

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

echo ""
animated_separator "-" 50 "${GREEN}"
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
animated_separator "=" 60 "${GREEN}"