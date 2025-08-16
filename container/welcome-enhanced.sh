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
    local font="${3:-univers}"
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
        title_option=", title: '$title'"
    fi
    run_node_util "
    const { gradientBox } = require('./utils.js');
    console.log(gradientBox('$content', { gradientName: '$gradient'$title_option }));
    "
}

# Clear screen and start
clear

# Animated top border
echo "Loading terminal portfolio..."
sleep 0.5
clear

# Top border with animation
animated_separator 139 "═" "primary" 5

# Dynamic ASCII Art Header with gradient
gradient_ascii "tim@waldin.net" "rainbow" "univers"

# Contact links with typewriter effect
echo ""
typewriter "󰇮 tim@waldin.net" 30 "cyan" &
sleep 0.5
typewriter " https://studyspot.us" 30 "magenta" &
sleep 0.5  
typewriter " https://github.com/twaldin" 30 "yellow" &
sleep 0.5
typewriter "󰋾 https://instagram.com/timn.w" 30 "green" &
wait

echo ""
animated_separator 139 "═" "primary" 8

# Welcome message with typewriter
echo ""
typewriter "Welcome to my enhanced terminal portfolio! 🚀" 40 "primary"
typewriter "Explore with familiar cmd line tools like cd, ls, etc." 35 "white"
typewriter "Type 'help' for available commands" 35 "muted"
echo ""

animated_separator 139 "═" "primary" 8

# Projects section with enhanced styling
echo ""
gradient_ascii "PROJECTS" "secondary" "univers"
echo ""
typewriter "Type 'projects' to explore my code repositories:" 35 "white"
echo ""

# Project items with typewriter delays
typewriter "  • STM32 Games - Handheld console with C/ARM" 25 "cyan" &
sleep 0.3
typewriter "  • Terminal Site - This portfolio (Next.js/Docker)" 25 "cyan" &
sleep 0.3
typewriter "  • Sulfur Recipes - Game recipe database (React)" 25 "cyan" &
sleep 0.3
typewriter "  • Dotfiles - Dev environment configs (Zsh/LazyVim)" 25 "cyan" &
wait

echo ""
animated_separator 139 "═" "primary" 8

# Blog section 
echo ""
gradient_ascii "BLOG" "accent" "univers"
echo ""
typewriter "📚 Check out my terminal blog system:" 35 "white"
echo ""
typewriter "  • blog           - List all posts" 25 "cyan"
typewriter "  • blog read 001  - Read a specific post" 25 "cyan"  
typewriter "  • blog search    - Search through posts" 25 "cyan"
echo ""

animated_separator 139 "═" "primary" 8

# Enhanced features showcase
echo ""
run_node_util "
const { gradientBox, theme, chalk } = require('./utils.js');
const content = \`✨ Enhanced Terminal Features:

🎨 Dynamic ASCII art with Univers font
🌈 Gradient borders and animations  
⌨️  Typewriter effects on all text
📝 Markdown blog with syntax highlighting
🎯 Tokyo Night color theme
🚀 Advanced CLI utilities

Type 'blog' to see the markdown blog in action!\`;

console.log(gradientBox(content, { 
  gradientName: 'tokyo',
  title: '🎪 New Features'
}));
"

echo ""
animated_separator 139 "═" "primary" 8
echo ""