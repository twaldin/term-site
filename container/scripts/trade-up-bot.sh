#!/bin/bash
source "$(dirname "$0")/shared-functions.sh"

clear
echo ""
ascii_typewriter "trade-up-bot" "DOS_Rebel" "${GREEN}" 80

echo ""

create_box "Description" "Full-stack market arbitrage platform analyzing profitable CS2
trade-up contracts across 3 marketplaces in real time." "${GREEN}"

echo ""

typewriter "${GREEN}Tech Stack:${RESET}"
animated_separator "~" 10 "${GREEN}"
typewriter "   ${GREEN}•${RESET} TypeScript, React, Express"
typewriter "   ${GREEN}•${RESET} SQLite and Redis"
typewriter "   ${GREEN}•${RESET} Steam OpenID auth, Stripe payments"
typewriter "   ${GREEN}•${RESET} Real-time WebSocket market feeds"
typewriter "   ${GREEN}•${RESET} Discord bot with role-based tier management"

echo ""
typewriter "${GREEN}Recent Git Activity:${RESET}"
if [ -d ".git" ]; then
  branch=$(git branch --show-current 2>/dev/null || echo "main")
  typewriter "   ${BLUE}Branch:${RESET} ${YELLOW}${branch}${RESET}"
  typewriter "   ${BLUE}Recent commits:${RESET}"
  git log --oneline --decorate --color=always | head -5 | while IFS= read -r line; do
    git_typewriter "     $line"
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

typewriter "${YELLOW}You are now in the projects/trade-up-bot directory${RESET}"
typewriter "${DIM}Use ls, tree, cat, nvim, or other commands to explore the actual git repository of this project,${RESET}"
typewriter "${DIM}or type home to go back to the home page ${RESET}"
echo ""
