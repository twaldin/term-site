#!/bin/bash

# Source shared functions
source "$(dirname "$0")/shared-functions.sh"

clear -x

# ASCII header with progressive typewriter display
ascii_typewriter "term-site" "Univers" "${BOLD}${CYAN}"

echo ""

# Create boxed content for main info
create_box "Info" "A web-based terminal portfolio that provides visitors with a real Linux
terminal experience running in isolated Docker containers."

echo ""

# Tech Stack section
typewriter "${GREEN}Tech Stack:${RESET}"
typewriter "   ${YELLOW}Frontend:${RESET} Next.js 15, React 19, TypeScript, Docker"
typewriter "   ${YELLOW}Backend:${RESET} Node.js to spawn docker containers, Express, Socket.IO WebSockets"
typewriter "   ${YELLOW}Terminal:${RESET} xterm.js for frontend, node-pty for execution, Ubuntu Linux docker containers for filesystem"

echo ""
animated_separator "~" 70
echo ""

typewriter "${YELLOW}You are now in the projects/term-site directory${RESET}"
typewriter "${DIM}Use ls, cat, nvim, or other commands to explore${RESET}"

echo ""

# Commands section
typewriter "${GREEN}Commands:${RESET}"
typewriter "   ${YELLOW}ls${RESET}                         - List project files"
typewriter "   ${YELLOW}cat README.md${RESET}              - View project documentation"
typewriter "   ${YELLOW}cd frontend && ls${RESET}          - Explore Next.js frontend"
typewriter "   ${YELLOW}cd backend && cat server.js${RESET} - View WebSocket server"
typewriter "   ${YELLOW}cd container && ls${RESET}         - View Docker container setup"
typewriter "   ${YELLOW}tree -L 2${RESET}                  - Show project structure"
typewriter "   ${YELLOW}cd ..${RESET}                      - Go back to portfolio directory"
typewriter "   ${YELLOW}projects${RESET}                   - Return to projects overview"
typewriter "   ${YELLOW}home${RESET}                       - Return to main dashboard"

echo ""
animated_separator "-" 50
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
animated_separator "=" 70