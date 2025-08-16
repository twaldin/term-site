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
  await gradientAsciiTypewriter('sulfur recipies', 'fire', 'Univers');
})();
"

echo ""

# Create boxed content for main info
echo "$(create_box "Info" "A comprehensive recipe database web application for the Sulfur game,
featuring automated data scraping with advanced filtering and search.
Allows for filtering by HP, HP/s, and sorting by ingredient and variation." "primary")"

echo ""

# Tech Stack section
typewriter "Tech Stack:" "primary"
typewriter "   • Next.js 15, React 19, TypeScript" "info"
typewriter "   • Tailwind CSS 3 with animations" "info"
typewriter "   • Radix UI component library" "info"
typewriter "   • shadcn/ui design system" "info"
typewriter "   • Next-themes for dark/light mode" "info"
typewriter "   • Lucide React icons" "info"

echo ""

# Animated separator
animated_separator "*" 60

echo ""

typewriter "You are now in the projects/sulfur-recipies directory" "highlight"
typewriter "Use ls, cat, nvim, or other commands to explore" "dim"

echo ""

# Commands section
typewriter "Commands:" "primary"
typewriter "   ls                              - List project files" "info"
typewriter "   cat README.md                   - View project documentation" "info"
typewriter "   cd app && ls                    - Explore Next.js app structure" "info"
typewriter "   cd components && ls             - View React components" "info"
typewriter "   cat data/recipes.json | head -20 - Preview recipe data" "info"
typewriter "   tree -L 2                       - Show project structure" "info"
typewriter "   cd ..                           - Go back to portfolio directory" "info"
typewriter "   projects                        - Return to projects overview" "info"
typewriter "   home                            - Return to main dashboard" "info"

echo ""

# Animated separator
animated_separator "~" 50

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
animated_separator "=" 60