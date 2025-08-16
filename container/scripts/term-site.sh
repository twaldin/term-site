#!/bin/bash

# Function to run node utilities
run_node_util() {
  cd /home/portfolio/scripts && node -e "$1"
}

# Function for typewriter effect
typewriter() {
  local text="$1"
  local color="${2:-white}"
  run_node_util "
    const { typewriter } = require('./utils.js');
    (async () => {
      await typewriter('$text', undefined, '$color');
    })();
    "
}

# Function for animated separator
animated_separator() {
  local width="${1:-80}"
  local char="${2:-═}"
  local gradient="${3:-tokyo}"
  run_node_util "
    const { animatedSeparator } = require('./utils.js');
    (async () => {
      await animatedSeparator($width, '$char', '$gradient');
    })();
    "
}

# Function for create box
create_box() {
  local title="$1"
  local content="$2"
  local gradient="${3:-tokyo}"
  run_node_util "
    const { gradientBox } = require('./utils.js');
    console.log(gradientBox('$content', { gradientName: '$gradient', title: '$title' }));
    "
}

clear

# Generate ASCII with typewriter animation
# Generate ASCII with typewriter animation
node -e "
const { gradientAsciiTypewriter } = require('./utils.js');
(async () => {
  await gradientAsciiTypewriter('term-site', 'ocean', 'Univers');
})();
"

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