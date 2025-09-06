#!/bin/bash
source "$(dirname "$0")/shared-functions.sh"

clear
echo ""
ascii_typewriter "term site" "DOS_Rebel" "${CYAN}"

echo ""

create_box "Description" "My portfolio website that looks like a terminal. Users get an xterm.js frontend that connects to Docker containers where they can explore my projects and blog."

echo ""

typewriter "${CYAN}Tech Stack:${RESET}"
typewriter "   ${YELLOW}Frontend:${RESET} Next.js app with xterm.js terminal"
typewriter "   ${YELLOW}Backend:${RESET} Node.js server that spawns Docker containers via Socket.IO"
typewriter "   ${YELLOW}Terminal:${RESET} Each user gets their own Ubuntu container with portfolio content"

echo ""
animated_separator "~" 70


typewriter "${CYAN}Recent Git Activity:${RESET}"
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

typewriter "${YELLOW}You're now in the projects/term-site directory${RESET}"
typewriter "${DIM}Use ls, cat, vim, etc. to explore this project, or type 'home' to go back${RESET}"

echo ""
