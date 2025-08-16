#!/bin/bash

# Source utilities
source "$(dirname "$0")/utils.js"

clear

# Generate ASCII with typewriter animation
gradient_ascii_typewriter "projects" "rainbow" "Univers"

echo ""

# Animated separator
animated_separator "+" 60

echo ""

# Project 1 - STM32 Games
typewriter "1. STM32 Games" "primary"
typewriter "   Handheld game console with STM32 microcontroller" "secondary"
typewriter "   Tech: C, STM32F103C8, ST7789 LCD, libopencm3" "info"
typewriter "   Navigate: Type 'stm32-games' to view info and navigate" "highlight"

echo ""

# Project 2 - Terminal Site  
typewriter "2. Terminal Site" "primary"
typewriter "   Web-based terminal portfolio in Docker containers" "secondary"
typewriter "   Tech: Next.js, Node.js, Socket.IO, Docker, TypeScript" "info"
typewriter "   Navigate: Type 'term-site' to view info and navigate" "highlight"

echo ""

# Project 3 - Sulfur Recipes
typewriter "3. Sulfur Recipes" "primary"
typewriter "   Recipe database web app for Sulfur game" "secondary"
typewriter "   Tech: Next.js, React, Tailwind CSS, shadcn/ui" "info"
typewriter "   Navigate: Type 'sulfur-recipies' to view info and navigate" "highlight"

echo ""

# Project 4 - Dotfiles
typewriter "4. Dotfiles" "primary"
typewriter "   Development environment configuration files" "secondary"
typewriter "   Tech: Zsh, LazyVim, Neovim, Lua, Ghostty" "info"
typewriter "   Navigate: Type 'dotfiles' to view info and navigate" "highlight"

echo ""

# Animated separator
animated_separator "=" 60

echo ""

# Footer information
typewriter "You are now in the projects directory. Commands will navigate to each project." "dim"
typewriter "Available: ls, stm32-games, term-site, sulfur-recipies, dotfiles" "info"
typewriter "Type 'home' to return to main dashboard" "highlight"