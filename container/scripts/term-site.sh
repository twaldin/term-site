#!/bin/bash

# Source utilities
source "$(dirname "$0")/utils.js"

clear

# Generate ASCII with typewriter animation
gradient_ascii_typewriter "term-site" "ocean" "Univers"

echo ""

# Create boxed content for main info
echo "$(create_box "Info" "A web-based terminal portfolio that provides visitors with a real Linux
terminal experience running in isolated Docker containers." "primary")"

echo ""

# Tech Stack section
typewriter "Tech Stack:" "primary"
typewriter "   Frontend: Next.js 15, React 19, TypeScript, Docker" "info"
typewriter "   Backend: Node.js to spawn docker containers, Express, Socket.IO WebSockets" "info"
typewriter "   Terminal: xterm.js for frontend, node-pty for execution, Ubuntu Linux docker containers for filesystem" "info"

echo ""

# Animated separator
animated_separator "~" 70

echo ""

typewriter "You are now in the projects/term-site directory" "highlight"
typewriter "Use ls, cat, nvim, or other commands to explore" "dim"

echo ""

# Commands section
typewriter "Commands:" "primary"
typewriter "   ls                         - List project files" "info"
typewriter "   cat README.md              - View project documentation" "info"
typewriter "   cd frontend && ls          - Explore Next.js frontend" "info"
typewriter "   cd backend && cat server.js - View WebSocket server" "info"
typewriter "   cd container && ls         - View Docker container setup" "info"
typewriter "   tree -L 2                  - Show project structure" "info"
typewriter "   cd ..                      - Go back to portfolio directory" "info"
typewriter "   projects                   - Return to projects overview" "info"
typewriter "   home                       - Return to main dashboard" "info"

echo ""

# Animated separator
animated_separator "-" 50

echo ""

# Git repository information
typewriter "Git:" "primary"
if [ -d ".git" ]; then
  # Show current branch
  branch=$(git branch --show-current 2>/dev/null || echo "main")
  typewriter "   Branch: ${branch}" "highlight"

  # Show recent commits with nice formatting
  typewriter "   Recent commits:" "secondary"
  git log --oneline --decorate --color=always | head -5 | while IFS= read -r line; do
    typewriter "     • $line" "dim"
  done

  # Show repository status
  if git status --porcelain | grep -q .; then
    typewriter "   Status: Modified files present" "warning"
  else
    typewriter "   Status: Clean working directory" "success"
  fi
else
  typewriter "   Not a git repository" "dim"
fi

echo ""

# Animated separator
animated_separator "=" 70