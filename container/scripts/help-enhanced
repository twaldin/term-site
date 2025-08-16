#!/bin/bash

# Enhanced Help Script with new features
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

# Dynamic ASCII header
gradient_ascii "HELP" "accent" "Univers"
echo ""
animated_separator 80 "═" "accent"

echo ""
typewriter "⌨️  Terminal Portfolio Commands" "primary"
echo ""

# Portfolio Commands
typewriter "📁 Portfolio Commands:" "secondary"
echo ""

run_node_util "
const { chalk, theme } = require('./utils.js');
console.log(chalk.hex(theme.yellow)('  welcome     ') + chalk.hex(theme.white)('Show the enhanced welcome dashboard'));
console.log(chalk.hex(theme.yellow)('  projects    ') + chalk.hex(theme.white)('View detailed project information'));
console.log(chalk.hex(theme.yellow)('  blog        ') + chalk.hex(theme.white)('📚 Access the markdown blog system'));
console.log(chalk.hex(theme.yellow)('  contact     ') + chalk.hex(theme.white)('Get contact and collaboration info'));
console.log(chalk.hex(theme.yellow)('  help        ') + chalk.hex(theme.white)('Show this help message'));
"
echo ""

# Blog Commands
typewriter "📝 Blog Commands:" "secondary"
echo ""

run_node_util "
const { chalk, theme } = require('./utils.js');
console.log(chalk.hex(theme.yellow)('  blog        ') + chalk.hex(theme.white)('List all blog posts'));
console.log(chalk.hex(theme.yellow)('  blog read N ') + chalk.hex(theme.white)('Read post by number (e.g., blog read 001)'));
console.log(chalk.hex(theme.yellow)('  blog search ') + chalk.hex(theme.white)('Search posts (e.g., blog search terminal)'));
"
echo ""

# System Commands
typewriter "🖥️  System Commands:" "secondary"
echo ""

run_node_util "
const { chalk, theme } = require('./utils.js');
console.log(chalk.hex(theme.yellow)('  ls, ll, la  ') + chalk.hex(theme.white)('List files and directories'));
console.log(chalk.hex(theme.yellow)('  cat FILE    ') + chalk.hex(theme.white)('View file contents'));
console.log(chalk.hex(theme.yellow)('  bat FILE    ') + chalk.hex(theme.white)('View file contents with syntax highlighting'));
console.log(chalk.hex(theme.yellow)('  nvim FILE   ') + chalk.hex(theme.white)('Edit file with neovim'));
console.log(chalk.hex(theme.yellow)('  tree        ') + chalk.hex(theme.white)('Show directory structure'));
console.log(chalk.hex(theme.yellow)('  htop        ') + chalk.hex(theme.white)('System monitor'));
console.log(chalk.hex(theme.yellow)('  clear       ') + chalk.hex(theme.white)('Clear the terminal screen'));
"
echo ""

# Enhanced Features
typewriter "✨ Enhanced Features:" "secondary"
echo ""

run_node_util "
const { chalk, theme } = require('./utils.js');
console.log(chalk.hex(theme.yellow)('  🎨 ') + chalk.hex(theme.white)('Dynamic ASCII art with Univers font'));
console.log(chalk.hex(theme.yellow)('  🌈 ') + chalk.hex(theme.white)('Gradient borders and animations'));
console.log(chalk.hex(theme.yellow)('  ⌨️  ') + chalk.hex(theme.white)('Typewriter effects on all text'));
console.log(chalk.hex(theme.yellow)('  📝 ') + chalk.hex(theme.white)('Markdown blog with syntax highlighting'));
console.log(chalk.hex(theme.yellow)('  🎯 ') + chalk.hex(theme.white)('Tokyo Night color theme'));
"
echo ""

# Fun Commands
typewriter "🎪 Fun Commands:" "secondary"
echo ""

run_node_util "
const { chalk, theme } = require('./utils.js');
console.log(chalk.hex(theme.yellow)('  whoami      ') + chalk.hex(theme.white)('Show current user'));
console.log(chalk.hex(theme.yellow)('  figlet TEXT ') + chalk.hex(theme.white)('ASCII art text generation'));
console.log(chalk.hex(theme.yellow)('  fortune     ') + chalk.hex(theme.white)('Random fortune (if available)'));
"
echo ""

animated_separator 80 "═" "accent"

echo ""
run_node_util "
const { gradientBox } = require('./utils.js');
const content = \`🔒 This is a secure containerized environment
Try destructive commands - they only affect this container!
Examples: rm -rf /, :(){ :|:& };:

Type 'welcome' to return to the enhanced main dashboard\`;

console.log(gradientBox(content, { 
  gradientName: 'fire',
  title: '⚠️  Experiment Freely'
}));
"