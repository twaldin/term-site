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
    local delay=0.001  # Ultra fast delay
    
    # Use echo -e to process escape sequences, then extract character by character
    local processed_text=$(echo -e "$text")
    
    for ((i=0; i<${#processed_text}; i++)); do
        printf "%s" "${processed_text:$i:1}"
        sleep $delay
    done
    echo
}

# Simple animated separator
animated_separator() {
    local char="$1"
    local width="$2"
    local delay=0.001
    
    for ((i=0; i<width; i++)); do
        printf "${YELLOW}%s${RESET}" "$char"
        sleep $delay
    done
    echo
}

# Simple box function
create_box() {
    local title="$1"
    local content="$2"
    echo -e "${YELLOW}┌─ ${BOLD}${title}${RESET}${YELLOW} ───────────────────────────────────────────────────────────┐${RESET}"
    echo -e "${YELLOW}│${RESET} ${WHITE}A comprehensive recipe database web application for the Sulfur game,${RESET}     ${YELLOW}│${RESET}"
    echo -e "${YELLOW}│${RESET} ${WHITE}featuring automated data scraping with advanced filtering and search.${RESET}   ${YELLOW}│${RESET}"
    echo -e "${YELLOW}│${RESET} ${WHITE}Allows for filtering by HP, HP/s, and sorting by ingredient and variation.${RESET} ${YELLOW}│${RESET}"
    echo -e "${YELLOW}└─────────────────────────────────────────────────────────────────────┘${RESET}"
}

clear

# ASCII header with figlet and color
echo -e "${BOLD}${YELLOW}"
figlet -f Univers "sulfur recipies" 2>/dev/null || figlet "sulfur recipies"
echo -e "${RESET}"

echo ""

# Create boxed content for main info
create_box "Info" "Recipe database for Sulfur game"

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
animated_separator "*" 60
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
animated_separator "~" 50
echo ""

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

echo ""
animated_separator "=" 60