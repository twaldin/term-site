#!/bin/bash

# Source utilities
source "$(dirname "$0")/utils.js"

clear

# Generate ASCII with typewriter animation
gradient_ascii_typewriter "dotfiles" "pastel" "Univers"

echo ""

# Create boxed content for main info
echo "$(create_box "Info" "Personal development environment configuration files for Zsh shell
and Neovim editor using the LazyVim distribution." "primary")"

echo ""

# Animated separator
animated_separator "~" 60

echo ""

typewriter "You are now in the projects/dotfiles directory" "highlight"
typewriter "Use ls, cat, nvim, or other commands to explore" "dim"

echo ""

# Commands section
typewriter "Commands:" "primary"
typewriter "   ls                               - List dotfile directories" "info"
typewriter "   cat README.md                    - View setup documentation" "info"
typewriter "   cat zsh/zshrc                    - View Zsh configuration" "info"
typewriter "   cd nvim && ls                    - Explore Neovim setup" "info"
typewriter "   cat nvim/lua/config/options.lua  - View Neovim options" "info"
typewriter "   tree -L 3                        - Show detailed structure" "info"
typewriter "   cd ..                            - Go back to portfolio directory" "info"
typewriter "   projects                         - Return to projects overview" "info"
typewriter "   home                             - Return to main dashboard" "info"

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
animated_separator "=" 60