#!/bin/bash

# Colors
CYAN='\033[38;5;117m'
GREEN='\033[38;5;121m'
WHITE='\033[38;5;255m'
YELLOW='\033[38;5;227m'
BLUE='\033[38;5;111m'
MAGENTA='\033[38;5;219m'
RESET='\033[0m'
BOLD='\033[1m'
DIM='\033[2m'

# Simple typewriter function with echo -e support
typewriter() {
    local text="$1"
    local delay=0.001  # Ultra fast delay
    
    # Use echo -e to process escape sequences, then extract character by character
    local processed_text=$(echo -e "$text")
    
    for ((i=0; i<${#processed_text}; i++)); do
        printf "%s" "${processed_text:$i:1}"
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
        printf "\033[38;5;117m%s\033[0m" "$char"
        sleep $delay
    done
    echo
}

clear

# Top separator
animated_separator "═" 139

# ASCII header with figlet and color
echo -e "${BOLD}${CYAN}"
figlet -f Univers "twald.in" 2>/dev/null || figlet "twald.in"
echo -e "${RESET}"

echo ""
typewriter "${CYAN}󰇮 tim@waldin.net${RESET}"
typewriter "${YELLOW} https://github.com/twaldin${RESET}"
typewriter "${MAGENTA} https://linkedin.com/in/twaldin${RESET}"
typewriter "${GREEN}󰋾 https://instagram.com/timn.w${RESET}"

echo ""
animated_separator "═" 139

# Welcome message with typewriter
echo ""
typewriter "${GREEN}Welcome to twald.in terminal portfolio${RESET}"
typewriter "${WHITE}This is a fully interactive ubuntu linux terminal hosting my projects and blog${RESET}"
typewriter "${DIM}You can explore my projects and this filesystem using all normal tools (eg. cd, ls, fzf, nvim, etc.${RESET}"
typewriter "${DIM}Type projects to see my projects - Type blog to see my blog - Type help to see all commands.${RESET}"
echo ""

animated_separator "═" 139