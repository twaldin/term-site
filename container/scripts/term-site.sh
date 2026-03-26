#!/bin/bash
source "$(dirname "$0")/shared-functions.sh"

clear
echo ""
ascii_typewriter "term site" "DOS_Rebel" "${CYAN}"

echo ""

create_box "Description" "My portfolio website that looks like a terminal. Users get an xterm.js frontend that connects to Docker containers where they can explore my projects."

echo ""

typewriter "${CYAN}Tech Stack:${RESET}"
typewriter "   ${YELLOW}Frontend:${RESET} Next.js app with xterm.js terminal"
typewriter "   ${YELLOW}Backend:${RESET} Node.js server that spawns Docker containers via Socket.IO"
typewriter "   ${YELLOW}Terminal:${RESET} Each user gets their own Ubuntu container with portfolio content"

echo ""
animated_separator "~" 70


git_activity "${CYAN}"

echo ""

typewriter "${YELLOW}You're now in the projects/term-site directory${RESET}"
typewriter "${DIM}Use ls, cat, vim, etc. to explore this project, or type 'home' to go back${RESET}"

echo ""
