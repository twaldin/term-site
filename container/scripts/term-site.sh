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
echo "                                                                         88                     "
echo "  ,d                                                                     \"\"    ,d               "
echo "  88                                                                           88               "
echo "MM88MMM  ,adPPYba,  8b,dPPYba,  88,dPYba,,adPYba,             ,adPPYba,  88  MM88MMM  ,adPPYba, "
echo "  88    a8P_____88  88P'   \"Y8  88P'   \"88\"    \"8a  aaaaaaaa  I8[    \"\"  88    88    a8P_____88 "
echo "  88    8PP\"\"\"\"\"\"\"  88          88      88      88  \"\"\"\"\"\"\"\"   \`\"Y8ba,   88    88    8PP\"\"\"\"\"\"\" "
echo "  88,   \"8b,   ,aa  88          88      88      88            aa    ]8I  88    88,   \"8b,   ,aa "
echo "  \"Y888  \`\"Ybbd8\"'  88          88      88      88            \`\"YbbdP\"'  88    \"Y888  \`\"Ybbd8\"' "
echo -e "${RESET}\n"

echo -e "${GREEN}Info:${RESET}"
echo -e "   ${WHITE}A web-based terminal portfolio that provides visitors with a real Linux${RESET}"
echo -e "   ${WHITE}terminal experience running in isolated Docker containers.${RESET}"
echo

echo -e "${GREEN}Tech Stack:${RESET}"
echo -e "   ${YELLOW}Frontend:${RESET} Next.js 15, React 19, TypeScript, Docker"
echo -e "   ${YELLOW}Backend:${RESET} Node.js to spawn docker containers, Express, Socket.IO WebSockets"
echo -e "   ${YELLOW}Terminal:${RESET} xterm.js for frontend, node-pty for execution, Ubuntu Linux docker containers for filesystem"
echo

echo -e "   ${YELLOW}You are now in the projects/term-site directory${RESET}"
echo -e "   ${DIM}Use ls, cat, nvim, or other commands to explore${RESET}"
echo

echo -e "${GREEN}Commands:${RESET}"
echo -e "   ${YELLOW}ls${RESET}                         - List project files"
echo -e "   ${YELLOW}cat README.md${RESET}              - View project documentation"
echo -e "   ${YELLOW}cd frontend && ls${RESET}          - Explore Next.js frontend"
echo -e "   ${YELLOW}cd backend && cat server.js${RESET} - View WebSocket server"
echo -e "   ${YELLOW}cd container && ls${RESET}         - View Docker container setup"
echo -e "   ${YELLOW}tree -L 2${RESET}                  - Show project structure"
echo -e "   ${YELLOW}cd ..${RESET}                      - Go back to portfolio directory"
echo -e "   ${YELLOW}projects${RESET}                   - Return to projects overview"
echo -e "   ${YELLOW}home${RESET}                       - Return to main dashboard"
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

