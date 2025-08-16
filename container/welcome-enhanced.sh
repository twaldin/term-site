#!/bin/bash

# Enhanced Welcome Dashboard for Timothy Waldin with dynamic features
# Uses Node.js utilities for advanced terminal effects

# Function to run node utilities
run_node_util() {
  cd /home/portfolio/scripts && node -e "$1"
}

# Function for typewriter effect via Node.js
typewriter() {
  local text="$1"
  local delay="${2:-50}"
  local color="${3:-white}"
  run_node_util "
    const { typewriter } = require('./utils.js');
    typewriter('$text', $delay, '$color');
    "
}

# Function for gradient ASCII
gradient_ascii() {
  local text="$1"
  local gradient="${2:-tokyo}"
  local font="${3:-Univers}"
  run_node_util "
    const { gradientAscii } = require('./utils.js');
    console.log(gradientAscii('$text', '$gradient', '$font'));
    "
}

# Function for gradient border
gradient_border() {
  local width="${1:-80}"
  local char="${2:-═}"
  local gradient="${3:-tokyo}"
  run_node_util "
    const { gradientBorder } = require('./utils.js');
    console.log(gradientBorder($width, '$char', '$gradient'));
    "
}

# Function for animated separator
animated_separator() {
  local width="${1:-80}"
  local char="${2:-═}"
  local gradient="${3:-tokyo}"
  local delay="${4:-10}"
  run_node_util "
    const { animatedSeparator } = require('./utils.js');
    animatedSeparator($width, '$char', '$gradient', $delay);
    "
}

# Function for gradient box
gradient_box() {
  local content="$1"
  local gradient="${2:-tokyo}"
  local title="${3:-}"
  local title_option=""
  if [ ! -z "$title" ]; then
    title_option=", title: \"$title\""
  fi
  run_node_util "
    const { gradientBox } = require('./utils.js');
    console.log(gradientBox('$content', { gradientName: '$gradient'$title_option }));
    "
}

# Clear screen and start
clear
animated_separator 139 "═" "primary" 2
gradient_ascii "twald.in" "ocean" "Univers"
echo ""
typewriter "󰇮 tim@waldin.net" 3 "cyan"
typewriter " https://github.com/twaldin" 3 "yellow"
typewriter " https://linkedin.com/in/twaldin" 3 "magenta"
typewriter "󰋾 https://instagram.com/timn.w" 3 "green"

echo ""
animated_separator 139 "═" "primary" 2

# Welcome message with typewriter
echo ""
typewriter "Welcome to twald.in portfolio! 🚀" 3 "primary"
typewriter "Explore with familiar cmd line tools like cd, ls, etc." 3 "white"
typewriter "Type help for available commands" 3 "muted"
echo ""

animated_separator 139 "═" "primary" 2

# Projects section with enhanced styling
echo ""
gradient_ascii "PROJECTS" "secondary" "Univers"
echo ""
typewriter "Type projects to explore my code repositories:" 3 "white"
echo ""

# Project items with typewriter delays
typewriter "  • STM32 Games - Handheld console with C/ARM" 3 "cyan"
typewriter "  • Terminal Site - This portfolio (Next.js/Docker)" 3 "cyan"
typewriter "  • Sulfur Recipes - Game recipe database (React)" 3 "cyan"
typewriter "  • Dotfiles - Dev environment configs (Zsh/LazyVim)" 3 "cyan"

echo ""
animated_separator 139 "═" "primary" 2

# Blog section
echo ""
gradient_ascii "BLOG" "accent" "Univers"
echo ""
typewriter "📚 Check out my terminal blog system:" 3 "white"
echo ""
typewriter "  • blog           - List all posts" 3 "cyan"
typewriter "  • blog read 001  - Read a specific post" 3 "cyan"
typewriter "  • blog search    - Search through posts" 3 "cyan"
echo ""

animated_separator 139 "═" "primary" 2

