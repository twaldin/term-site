#!/bin/bash

# Source shared functions
source "$(dirname "$0")/shared-functions.sh"

clear
# ASCII header with progressive typewriter display
ascii_typewriter "sulfur recipies" "Univers" "${BOLD}${YELLOW}"

echo ""

# Create boxed content for main info
create_box "Info" "Using data scraped from wiki.sulfur.gg, a full database of cooking recipies 
from the game sulfur. Most important features are sorting and filtering by 
multiple ingredients or stats." "${YELLOW}"

echo ""

# Tech Stack section
typewriter "${YELLOW}Tech Stack:${RESET}"
typewriter "   ${YELLOW}•${RESET} Next.js 15, React 19, TypeScript"
typewriter "   ${YELLOW}•${RESET} Tailwind CSS 3 with animations"
typewriter "   ${YELLOW}•${RESET} shadcn/ui design system"

echo ""
animated_separator "*" 60 "${YELLOW}"


# Git repository information (same as other scripts)
typewriter "${YELLOW}Recent Git Activity:${RESET}"
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

typewriter "${YELLOW}You are now in the projects/sulfur-recipies directory${RESET}"
typewriter "${DIM}Use ls, tree, cat, nvim, or other commands to explore the actual git repository of this project,${RESET}"
typewriter "${DIM}or type home to go back to the home page ${RESET}"
echo ""
