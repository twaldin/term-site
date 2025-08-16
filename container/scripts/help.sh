#!/bin/bash

# Colors
CYAN='\033[38;5;117m'
GREEN='\033[38;5;121m'
WHITE='\033[38;5;255m'
YELLOW='\033[38;5;227m'
BLUE='\033[38;5;111m'
RED='\033[38;5;210m'
RESET='\033[0m'
BOLD='\033[1m'
DIM='\033[2m'

# Simple typewriter function
typewriter() {
    local text="$1"
    local delay=0.001  # Ultra fast delay
    
    for ((i=0; i<${#text}; i++)); do
        printf "%s" "${text:$i:1}"
        sleep $delay
    done
    echo
}

# Simple animated separator
animated_separator() {
    local char="$1"
    local width="$2"
    local delay=0.001
    
    for ((i=0; i<width; i++)); do
        printf "${CYAN}%s${RESET}" "$char"
        sleep $delay
    done
    echo
}

clear

# Dynamic ASCII header
echo -e "${BOLD}${CYAN}"
figlet -f Univers "HELP" 2>/dev/null || figlet "HELP"
echo -e "${RESET}"
echo ""
animated_separator "═" 80

echo ""
typewriter "${GREEN}⌨️  Terminal Portfolio Commands${RESET}"
echo ""

# Portfolio Commands
typewriter "${BLUE}📁 Portfolio Commands:${RESET}"
echo ""

typewriter "${YELLOW}  welcome     ${WHITE}Show the enhanced welcome dashboard${RESET}"
typewriter "${YELLOW}  projects    ${WHITE}View detailed project information${RESET}"
typewriter "${YELLOW}  blog        ${WHITE}📚 Access the markdown blog system${RESET}"
typewriter "${YELLOW}  contact     ${WHITE}Get contact and collaboration info${RESET}"
typewriter "${YELLOW}  help        ${WHITE}Show this help message${RESET}"
echo ""

# Blog Commands
typewriter "${BLUE}📝 Blog Commands:${RESET}"
echo ""

typewriter "${YELLOW}  blog        ${WHITE}List all blog posts${RESET}"
typewriter "${YELLOW}  blog read N ${WHITE}Read post by number (e.g., blog read 001)${RESET}"
typewriter "${YELLOW}  blog search ${WHITE}Search posts (e.g., blog search terminal)${RESET}"
echo ""

# System Commands
typewriter "${BLUE}🖥️  System Commands:${RESET}"
echo ""

typewriter "${YELLOW}  ls, ll, la  ${WHITE}List files and directories${RESET}"
typewriter "${YELLOW}  cat FILE    ${WHITE}View file contents${RESET}"
typewriter "${YELLOW}  bat FILE    ${WHITE}View file contents with syntax highlighting${RESET}"
typewriter "${YELLOW}  nvim FILE   ${WHITE}Edit file with neovim${RESET}"
typewriter "${YELLOW}  tree        ${WHITE}Show directory structure${RESET}"
typewriter "${YELLOW}  htop        ${WHITE}System monitor${RESET}"
typewriter "${YELLOW}  clear       ${WHITE}Clear the terminal screen${RESET}"
echo ""

# Enhanced Features
typewriter "${BLUE}✨ Enhanced Features:${RESET}"
echo ""

typewriter "${YELLOW}  🎨 ${WHITE}Dynamic ASCII art with Univers font${RESET}"
typewriter "${YELLOW}  🌈 ${WHITE}Gradient borders and animations${RESET}"
typewriter "${YELLOW}  ⌨️  ${WHITE}Typewriter effects on all text${RESET}"
typewriter "${YELLOW}  📝 ${WHITE}Markdown blog with syntax highlighting${RESET}"
typewriter "${YELLOW}  🎯 ${WHITE}Tokyo Night color theme${RESET}"
echo ""

# Fun Commands
typewriter "${BLUE}🎪 Fun Commands:${RESET}"
echo ""

typewriter "${YELLOW}  whoami      ${WHITE}Show current user${RESET}"
typewriter "${YELLOW}  figlet TEXT ${WHITE}ASCII art text generation${RESET}"
typewriter "${YELLOW}  fortune     ${WHITE}Random fortune (if available)${RESET}"
echo ""

animated_separator "═" 80

echo ""
echo -e "${RED}┌─ ${BOLD}⚠️  Experiment Freely${RESET}${RED} ──────────────────────────────────────────────┐${RESET}"
echo -e "${RED}│${RESET} ${WHITE}🔒 This is a secure containerized environment${RESET}                        ${RED}│${RESET}"
echo -e "${RED}│${RESET} ${WHITE}Try destructive commands - they only affect this container!${RESET}          ${RED}│${RESET}"
echo -e "${RED}│${RESET} ${WHITE}Examples: rm -rf /, :(){ :|:& };:${RESET}                                    ${RED}│${RESET}"
echo -e "${RED}│${RESET}                                                                      ${RED}│${RESET}"
echo -e "${RED}│${RESET} ${WHITE}Type 'welcome' to return to the enhanced main dashboard${RESET}              ${RED}│${RESET}"
echo -e "${RED}└──────────────────────────────────────────────────────────────────────┘${RESET}"