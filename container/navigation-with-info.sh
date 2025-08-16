#!/bin/bash
# Navigation functions and aliases with embedded project info

# Color definitions
CYAN='\033[38;5;117m'
GREEN='\033[38;5;121m'
WHITE='\033[38;5;255m'
YELLOW='\033[38;5;227m'
BLUE='\033[38;5;111m'
RED='\033[38;5;210m'
RESET='\033[0m'
BOLD='\033[1m'
DIM='\033[2m'

# Projects overview - cd and show info
projects() {
    cd projects
    /home/portfolio/scripts/projects
}

# STM32 Games - cd and show info
stm32-games() {
    cd projects/stm32-games && {
        clear
        echo -e "${BOLD}${CYAN}"
        echo "                                         ad888888b,   ad888888b,                                                                           "
        echo "             ,d                         d8\"     \"88  d8\"     \"88                                                                           "
        echo "             88                                 a8P          a8P                                                                           "
        echo ",adPPYba,  MM88MMM  88,dPYba,,adPYba,        aad8\"        ,d8P\"          ,adPPYb,d8  ,adPPYYba,  88,dPYba,,adPYba,    ,adPPYba,  ,adPPYba, "
        echo "I8[    \"\"    88     88P'   \"88\"    \"8a       \"\"Y8,      a8P\"  aaaaaaaa  a8\"    \`Y88  \"\"     \`Y8  88P'   \"88\"    \"8a  a8P_____88  I8[    \"\" "
        echo " \`\"Y8ba,     88     88      88      88          \"8b   a8P'    \"\"\"\"\"\"\"\"  8b       88  ,adPPPPP88  88      88      88  8PP\"\"\"\"\"\"\"   \`\"Y8ba,  "
        echo "aa    ]8I    88,    88      88      88  Y8,     a88  d8\"                \"8a,   ,d88  88,    ,88  88      88      88  \"8b,   ,aa  aa    ]8I "
        echo "\`\"YbbdP\"'    \"Y888  88      88      88   \"Y888888P'  88888888888         \`\"YbbdP\"Y8  \`\"8bbdP\"Y8  88      88      88   \`\"Ybbd8\"'  \`\"YbbdP\"' "
        echo "                                                                         aa,    ,88                                                        "
        echo "                                                                          \"Y8bbdP\"                                                         "
        echo -e "${RESET}\n"

        echo -e "${GREEN}Description:${RESET}"
        echo -e "   ${WHITE}A handheld game console project built with STM32F103C8T6 microcontroller${RESET}"
        echo -e "   ${WHITE}featuring classic games like Snake with an ST7789 LCD display.${RESET}"
        echo

        echo -e "${GREEN}Key Technologies:${RESET}"
        echo -e "   ${YELLOW}•${RESET} C programming with ARM Cortex-M3"
        echo -e "   ${YELLOW}•${RESET} STM32F103C8 (Blue Pill) microcontroller"
        echo -e "   ${YELLOW}•${RESET} ST7789 SPI LCD display driver"
        echo -e "   ${YELLOW}•${RESET} libopencm3 firmware library"
        echo -e "   ${YELLOW}•${RESET} ARM GCC toolchain"
        echo

        echo -e "${GREEN}Main Features:${RESET}"
        echo -e "   ${YELLOW}•${RESET} Snake game implementation"
        echo -e "   ${YELLOW}•${RESET} ST7789 2-inch IPS LCD display support"
        echo -e "   ${YELLOW}•${RESET} Tactile button input controls (UP/DOWN/LEFT/RIGHT)"
        echo -e "   ${YELLOW}•${RESET} 80MHz overclocked operation"
        echo -e "   ${YELLOW}•${RESET} Font rendering system"
        echo

        echo -e "${GREEN}Navigation:${RESET}"
        echo -e "   ${YELLOW}You are now in the projects/stm32-games directory${RESET}"
        echo -e "   ${DIM}Use ls, cat, nvim, or other commands to explore${RESET}"
        echo

        echo -e "${GREEN}Quick Commands (available in project directory):${RESET}"
        echo -e "   ${YELLOW}ls${RESET}                    - List project files"
        echo -e "   ${YELLOW}cat README.md${RESET}         - View project documentation"
        echo -e "   ${YELLOW}cat main.c${RESET}            - View main application code"
        echo -e "   ${YELLOW}cat snake.c${RESET}           - View Snake game implementation"
        echo -e "   ${YELLOW}tree${RESET}                  - Show complete file structure"
        echo -e "   ${YELLOW}cd ..${RESET}                 - Go back to portfolio directory"
        echo -e "   ${YELLOW}projects${RESET}              - Return to projects overview"
        echo -e "   ${YELLOW}home${RESET}                  - Return to main dashboard"
        echo

        # Git repository information
        echo -e "${GREEN}Git Repository:${RESET}"
        if [ -d ".git" ]; then
            branch=$(git branch --show-current 2>/dev/null || echo "main")
            echo -e "   ${BLUE}Branch:${RESET} ${YELLOW}${branch}${RESET}"
            echo -e "   ${BLUE}Recent commits:${RESET}"
            git log --oneline --decorate --color=always | head -5 | while IFS= read -r line; do
                echo -e "     ${DIM}•${RESET} $line"
            done
            if git status --porcelain | grep -q .; then
                echo -e "   ${YELLOW}Status:${RESET} ${RED}Modified files present${RESET}"
            else
                echo -e "   ${YELLOW}Status:${RESET} ${GREEN}Clean working directory${RESET}"
            fi
        else
            echo -e "   ${DIM}Not a git repository${RESET}"
        fi
    }
}

# Term Site - cd and show info  
term-site() {
    cd projects/term-site && {
        clear
        echo -e "${BOLD}${CYAN}"
        echo "                                                                         88                     "
        echo "  ,d                                                                     \"\"    ,d               "
        echo "  88                                                                           88               "
        echo "MM88MMM  ,adPPYba,  8b,dPPYba,  88,dPYba,,adPYba,             ,adPPYba,  88  MM88MMM  ,adPPYba, "
        echo "  88    a8P_____88  88P'   \"Y8  88P'   \"88\"    \"8a  aaaaaaaa  I8[    \"\"  88    88    a8P_____88 "
        echo "  88    8PP\"\"\"\"\"\"\"  88          88      88      88  \"\"\"\"\"\"\"\"   \`\"Y8ba,   88    88    8PP\"\"\"\"\"\"\" "
        echo "  88,   \"8b,   ,aa  88          88      88      88            aa    ]8I  88    88,   \"8b,   ,aa "
        echo "  \"Y888  \`\"Ybbd8\"'  88          88      88      88            \`\"YbbdP\"'  88    \"Y888  \`\"Ybbd8\"' "
        echo -e "${RESET}\n"

        echo -e "${GREEN}Description:${RESET}"
        echo -e "   ${WHITE}A web-based terminal portfolio that provides visitors with a real Linux${RESET}"
        echo -e "   ${WHITE}terminal experience running in isolated Docker containers.${RESET}"
        echo

        echo -e "${GREEN}Key Technologies:${RESET}"
        echo -e "   ${YELLOW}Frontend:${RESET} Next.js 15, React 19, TypeScript, Tailwind CSS"
        echo -e "   ${YELLOW}Backend:${RESET} Node.js, Express, Socket.IO WebSockets"
        echo -e "   ${YELLOW}Terminal:${RESET} xterm.js, node-pty, Alpine Linux containers"
        echo -e "   ${YELLOW}Deployment:${RESET} Docker, gVisor runtime, Vercel + Hetzner VPS"
        echo -e "   ${YELLOW}Security:${RESET} Container isolation, read-only filesystems"
        echo

        echo -e "${GREEN}Main Features:${RESET}"
        echo -e "   ${YELLOW}•${RESET} Real terminal emulation with xterm.js"
        echo -e "   ${YELLOW}•${RESET} Docker container isolation per user session"
        echo -e "   ${YELLOW}•${RESET} WebSocket communication for real-time terminal I/O"
        echo -e "   ${YELLOW}•${RESET} Security through gVisor runtime and resource limits"
        echo -e "   ${YELLOW}•${RESET} Custom terminal commands and portfolio navigation"
        echo -e "   ${YELLOW}•${RESET} Auto-scaling container management"
        echo

        echo -e "${GREEN}Navigation:${RESET}"
        echo -e "   ${YELLOW}You are now in the projects/term-site directory${RESET}"
        echo -e "   ${DIM}Use ls, cat, nvim, or other commands to explore${RESET}"
        echo

        echo -e "${GREEN}Quick Commands (available in project directory):${RESET}"
        echo -e "   ${YELLOW}ls${RESET}                         - List project files"
        echo -e "   ${YELLOW}cat README.md${RESET}              - View project documentation"
        echo -e "   ${YELLOW}cd frontend && ls${RESET}          - Explore Next.js frontend"
        echo -e "   ${YELLOW}cd backend && cat server.js${RESET} - View WebSocket server"
        echo -e "   ${YELLOW}cd container && ls${RESET}         - View Docker container setup"
        echo -e "   ${YELLOW}tree -L 2${RESET}                  - Show project structure"
        echo -e "   ${YELLOW}cd ..${RESET}                      - Go back to portfolio directory"
        echo -e "   ${YELLOW}projects${RESET}                   - Return to projects overview"
        echo -e "   ${YELLOW}home${RESET}                       - Return to main dashboard"
        echo

        # Git repository information
        echo -e "${GREEN}Git Repository:${RESET}"
        if [ -d ".git" ]; then
            branch=$(git branch --show-current 2>/dev/null || echo "main")
            echo -e "   ${BLUE}Branch:${RESET} ${YELLOW}${branch}${RESET}"
            echo -e "   ${BLUE}Recent commits:${RESET}"
            git log --oneline --decorate --color=always | head -5 | while IFS= read -r line; do
                echo -e "     ${DIM}•${RESET} $line"
            done
            if git status --porcelain | grep -q .; then
                echo -e "   ${YELLOW}Status:${RESET} ${RED}Modified files present${RESET}"
            else
                echo -e "   ${YELLOW}Status:${RESET} ${GREEN}Clean working directory${RESET}"
            fi
        else
            echo -e "   ${DIM}Not a git repository${RESET}"
        fi
    }
}

# Home navigation function
home() {
    cd /home/portfolio
    /home/portfolio/scripts/welcome.sh
}

# Welcome alias for home
welcome() {
    home
}

# Create shorter versions for remaining projects
sulfur-recipies() {
    cd projects/sulfur-recipies && echo -e "${GREEN}Sulfur Recipes${RESET} - Recipe database loaded! Use ${YELLOW}ls${RESET} to explore."
}

dotfiles() {
    cd projects/dotfiles && echo -e "${GREEN}Dotfiles${RESET} - Development configs loaded! Use ${YELLOW}ls${RESET} to explore."
}

# Export functions so they're available in the shell
export -f projects stm32-games term-site sulfur-recipies dotfiles home welcome