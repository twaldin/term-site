#!/bin/bash

# Enhanced Projects Script with dynamic ASCII and effects
cd /home/portfolio/scripts

# Function to run node utilities
run_node_util() {
    node -e "$1"
}

# Function for typewriter effect
typewriter() {
    local text="$1"
    local color="${2:-white}"
    run_node_util "
    const { typewriter } = require('./utils.js');
    typewriter('$text', undefined, '$color');
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

# Function for animated separator
animated_separator() {
    local width="${1:-80}"
    local char="${2:-═}"
    local gradient="${3:-tokyo}"
    run_node_util "
    const { animatedSeparator } = require('./utils.js');
    animatedSeparator($width, '$char', '$gradient');
    "
}

clear

# Dynamic ASCII header with animation
gradient_ascii "PROJECTS" "rainbow" "Univers"
echo ""
animated_separator 80 "═" "primary"

echo ""

# Project 1 - STM32 Games
typewriter "🎮 1. STM32 Games" "secondary"
typewriter "   Handheld game console with STM32 microcontroller" "white"

run_node_util "
const { chalk, theme } = require('./utils.js');
console.log(chalk.hex(theme.yellow)('   Tech: ') + chalk.hex(theme.white)('C, STM32F103C8, ST7789 LCD, libopencm3'));
console.log(chalk.hex(theme.blue)('   Navigate: ') + chalk.hex(theme.white).bold('stm32-games') + chalk.hex(theme.white)(' to view info and navigate'));
"
echo ""

# Project 2 - Terminal Site  
typewriter "🖥️  2. Terminal Site" "secondary"
typewriter "   Web-based terminal portfolio in Docker containers" "white"

run_node_util "
const { chalk, theme } = require('./utils.js');
console.log(chalk.hex(theme.yellow)('   Tech: ') + chalk.hex(theme.white)('Next.js, Node.js, Socket.IO, Docker, TypeScript'));
console.log(chalk.hex(theme.blue)('   Navigate: ') + chalk.hex(theme.white).bold('term-site') + chalk.hex(theme.white)(' to view info and navigate'));
"
echo ""

# Project 3 - Sulfur Recipes
typewriter "🍳 3. Sulfur Recipes" "secondary" 
typewriter "   Recipe database web app for Sulfur game" "white"

run_node_util "
const { chalk, theme } = require('./utils.js');
console.log(chalk.hex(theme.yellow)('   Tech: ') + chalk.hex(theme.white)('Next.js, React, Tailwind CSS, shadcn/ui'));
console.log(chalk.hex(theme.blue)('   Navigate: ') + chalk.hex(theme.white).bold('sulfur-recipies') + chalk.hex(theme.white)(' to view info and navigate'));
"
echo ""

# Project 4 - Dotfiles
typewriter "⚙️  4. Dotfiles" "secondary"
typewriter "   Development environment configuration files" "white"

run_node_util "
const { chalk, theme } = require('./utils.js');
console.log(chalk.hex(theme.yellow)('   Tech: ') + chalk.hex(theme.white)('Zsh, LazyVim, Neovim, Lua, Ghostty'));
console.log(chalk.hex(theme.blue)('   Navigate: ') + chalk.hex(theme.white).bold('dotfiles') + chalk.hex(theme.white)(' to view info and navigate'));
"
echo ""

animated_separator 80 "═" "accent"

echo ""
run_node_util "
const { gradientBox } = require('./utils.js');
const content = \`You are now in the projects directory. Commands will navigate to each project.

Available: ls, stm32-games, term-site, sulfur-recipies, dotfiles
Type 'home' to return to main dashboard\`;

console.log(gradientBox(content, { 
  gradientName: 'tokyo',
  title: '📁 Projects Navigation'
}));
"