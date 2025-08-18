#!/bin/bash

# Source shared functions
source "$(dirname "$0")/shared-functions.sh"

clear
# ASCII header with progressive typewriter display
ascii_typewriter "term site" "Univers" "${BOLD}${CYAN}"

echo ""

# Create boxed content for main info
create_box "Description" "My portfolio/personal website, written in bash (not really). Consists of 
a web terminal interface using xterm.js connected to a node-pty instance to execute commands inside a docker container filesystem"

echo ""

# Tech Stack section
typewriter "${CYAN}Tech Stack:${RESET}"
typewriter "   ${YELLOW}Frontend:${RESET} Basically just xterm.js terminal component served with nextjs router"
typewriter "   ${YELLOW}Backend:${RESET} Node.js to spawn docker containers, Express, Socket.IO WebSockets"
typewriter "   ${YELLOW}Terminal:${RESET} xterm.js for frontend, node-pty for execution, Ubuntu Linux docker containers for filesystem"

echo ""
animated_separator "~" 70


# Git repository information
typewriter "${CYAN}Recent Git Activity:${RESET}"
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

typewriter "${yellow}you are now in the projects/term-site directory${reset}"
typewriter "${dim}use ls, tree, cat, nvim, or other commands to explore the actual git repository of this project,${reset}"
typewriter "${dim}or type home to go back to the home page ${reset}"

echo ""
