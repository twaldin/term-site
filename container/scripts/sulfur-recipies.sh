#!/bin/bash

# Source shared functions
source "$(dirname "$0")/shared-functions.sh"

clear
# ASCII header with progressive typewriter display
ascii_typewriter "sulfur recipies" "Univers" "${BOLD}${YELLOW}"

echo ""

# Create boxed content for main info
create_box "Info" "A comprehensive recipe database web application for the Sulfur game,
featuring automated data scraping with advanced filtering and search.
Allows for filtering by HP, HP/s, and sorting by ingredient and variation." "${YELLOW}"

echo ""

# Tech Stack section
typewriter "${GREEN}Tech Stack:${RESET}"
typewriter "   ${YELLOW}•${RESET} Next.js 15, React 19, TypeScript"
typewriter "   ${YELLOW}•${RESET} Tailwind CSS 3 with animations"
typewriter "   ${YELLOW}•${RESET} Radix UI component library"
typewriter "   ${YELLOW}•${RESET} shadcn/ui design system"
typewriter "   ${YELLOW}•${RESET} Next-themes for dark/light mode"
typewriter "   ${YELLOW}•${RESET} Lucide React icons"

echo ""
animated_separator "*" 60 "${YELLOW}"
echo ""

typewriter "${YELLOW}You are now in the projects/sulfur-recipies directory${RESET}"
typewriter "${DIM}Use ls, cat, nvim, or other commands to explore${RESET}"

echo ""

# Commands section
typewriter "${GREEN}Commands:${RESET}"
typewriter "   ${YELLOW}ls${RESET}                              - List project files"
typewriter "   ${YELLOW}cat README.md${RESET}                   - View project documentation"
typewriter "   ${YELLOW}cd app && ls${RESET}                    - Explore Next.js app structure"
typewriter "   ${YELLOW}cd components && ls${RESET}             - View React components"
typewriter "   ${YELLOW}cat data/recipes.json | head -20${RESET} - Preview recipe data"
typewriter "   ${YELLOW}tree -L 2${RESET}                       - Show project structure"
typewriter "   ${YELLOW}cd ..${RESET}                           - Go back to portfolio directory"
typewriter "   ${YELLOW}projects${RESET}                        - Return to projects overview"
typewriter "   ${YELLOW}home${RESET}                            - Return to main dashboard"

echo ""
animated_separator "~" 50 "${YELLOW}"
echo ""

# Git repository information (same as other scripts)
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
animated_separator "=" 60 "${YELLOW}"