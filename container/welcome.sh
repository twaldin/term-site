#!/bin/bash

# Welcome Dashboard for Timothy Waldin
# Colors matching oh-my-posh stelbent-compact.minimal theme

# Color codes matching your terminal theme
CYAN='\033[38;5;117m'      # Light blue like path segment (#91ddff)
GREEN='\033[38;5;121m'     # Green like git clean (#95ffa4) 
YELLOW='\033[38;5;227m'    # Yellow like terraform (#ffee58)
BLUE='\033[38;5;111m'      # Blue like ahead (#89d1dc)
MAGENTA='\033[38;5;177m'   # Magenta accent
RED='\033[38;5;210m'       # Soft red for accents
WHITE='\033[38;5;255m'     # Pure white
GRAY='\033[38;5;245m'      # Gray for secondary text
RESET='\033[0m'            # Reset color
BOLD='\033[1m'             # Bold text
DIM='\033[2m'              # Dim text

# Terminal dimensions
COLS=$(tput cols 2>/dev/null || echo 80)

# Center text function
center_text() {
    local text="$1"
    local color="$2"
    local length=${#text}
    local padding=$(((COLS - length) / 2))
    printf "%*s" $padding ""
    echo -e "${color}${text}${RESET}"
}

# Print separator line
separator() {
    local char="${1:-═}"
    local color="${2:-$GRAY}"
    printf "${color}"
    printf "${char}%.0s" $(seq 1 $COLS)
    printf "${RESET}\n"
}

# Function to print ASCII art
print_ascii() {
    echo -e "${BOLD}${CYAN}"
    echo "    .    o8o                                                   oooo        .o8  o8o                                            .   "
    echo "  .o8    \`\"'                                                   \`888       \"888  \`\"'                                          .o8   "
    echo ".o888oo oooo  ooo. .oo.  .oo.       oooo oooo    ooo  .oooo.    888   .oooo888 oooo  ooo. .oo.       ooo. .oo.    .ooooo.  .o888oo "
    echo "  888   \`888  \`888P\"Y88bP\"Y88b       \`88. \`88.  .8'  \`P  )88b   888  d88' \`888 \`888  \`888P\"Y88b      \`888P\"Y88b  d88' \`88b   888   "
    echo "  888    888   888   888   888        \`88..]88..8'    .oP\"888   888  888   888  888   888   888       888   888  888ooo888   888   "
    echo "  888 .  888   888   888   888  .o.    \`888'\`888'    d8(  888   888  888   888  888   888   888  .o.  888   888  888    .o   888 . "
    echo "  \"888\" o888o o888o o888o o888o Y8P     \`8'  \`8'     \`Y888\"\"8o o888o \`Y8bod88P\" o888o o888o o888o Y8P o888o o888o \`Y8bod8P'   \"888\" "
    echo -e "${RESET}"
}

# Clear screen and start
clear

# Top border
separator "═" "$CYAN"

# ASCII Art Header
print_ascii
echo

# Main Info Section
separator "─" "$BLUE"

echo -e "\n${BOLD}${WHITE}  👨‍💻 Timothy Waldin${RESET}"
echo -e "${CYAN}     Computer Engineering Major @ Purdue University${RESET}"
echo -e "${GREEN}     Chief Technology Officer @ StudySpot${RESET}"
echo

# Links Section
separator "─" "$YELLOW"
echo -e "\n${BOLD}${WHITE}  🔗 Connect With Me${RESET}"

echo -e "\n${CYAN}  📧 Email:${RESET}      ${MAGENTA}timothy@example.com${RESET} ${DIM}(click to email)${RESET}"
echo -e "${CYAN}  🐙 GitHub:${RESET}     ${MAGENTA}https://github.com/twaldin${RESET} ${DIM}(click to open)${RESET}"
echo -e "${CYAN}  💼 LinkedIn:${RESET}   ${MAGENTA}https://linkedin.com/in/twaldin${RESET} ${DIM}(click to open)${RESET}"
echo -e "${CYAN}  📸 Instagram:${RESET}  ${MAGENTA}https://instagram.com/twaldin${RESET} ${DIM}(click to open)${RESET}"
echo -e "${CYAN}  🏢 StudySpot:${RESET}  ${MAGENTA}https://studyspot.io${RESET} ${DIM}(click to open)${RESET}"

# Projects Section
separator "─" "$GREEN"
echo -e "\n${BOLD}${WHITE}  🚀 Featured Projects${RESET}"

echo -e "\n${GREEN}  TerminalSite:${RESET}   ${WHITE}Interactive web-based terminal portfolio${RESET}"
echo -e "${DIM}                    Built with Docker, Node.js, and React${RESET}"

echo -e "\n${GREEN}  StudySpot:${RESET}      ${WHITE}Collaborative study platform for students${RESET}"
echo -e "${DIM}                    Real-time collaboration tools & study rooms${RESET}"

echo -e "\n${GREEN}  dotfiles:${RESET}       ${WHITE}Personal development environment configuration${RESET}"
echo -e "${DIM}                    Neovim, Zsh, Oh-my-posh setup${RESET}"

# Skills Section
separator "─" "$MAGENTA"
echo -e "\n${BOLD}${WHITE}  💻 Technical Skills${RESET}"

echo -e "\n${YELLOW}  Languages:${RESET}  ${WHITE}JavaScript/TypeScript, Python, C/C++, Go, Rust${RESET}"
echo -e "${YELLOW}  Frontend:${RESET}   ${WHITE}React, Next.js, Vue.js, HTML/CSS, Tailwind${RESET}"
echo -e "${YELLOW}  Backend:${RESET}    ${WHITE}Node.js, Express, FastAPI, PostgreSQL, MongoDB${RESET}"
echo -e "${YELLOW}  DevOps:${RESET}     ${WHITE}Docker, Kubernetes, AWS, GCP, CI/CD, Terraform${RESET}"
echo -e "${YELLOW}  Tools:${RESET}      ${WHITE}Git, Linux, Vim/Neovim, VS Code, Figma${RESET}"

# Commands Section
separator "─" "$RED"
echo -e "\n${BOLD}${WHITE}  ⌨️  Available Commands${RESET}"

echo -e "\n${RED}  help${RESET}        Show available commands and features"
echo -e "${RED}  projects${RESET}    View detailed project information"
echo -e "${RED}  skills${RESET}      Deep dive into technical expertise"
echo -e "${RED}  contact${RESET}     Get in touch and collaboration info"
echo -e "${RED}  clear${RESET}       Clear the terminal screen"
echo -e "${RED}  exit${RESET}        End terminal session"

# Fun Commands
echo -e "\n${DIM}${GRAY}  Fun commands: ${WHITE}whoami, fortune, cowsay, figlet, htop${RESET}"

# Current Status
separator "─" "$CYAN"
echo -e "\n${BOLD}${WHITE}  📊 Current Status${RESET}"

echo -e "\n${CYAN}  🎓 Education:${RESET}   ${WHITE}Pursuing Computer Engineering at Purdue${RESET}"
echo -e "${CYAN}  💼 Work:${RESET}        ${WHITE}Building the future of collaborative studying${RESET}"
echo -e "${CYAN}  🌱 Learning:${RESET}    ${WHITE}Advanced systems programming & cloud architecture${RESET}"
echo -e "${CYAN}  📍 Location:${RESET}    ${WHITE}West Lafayette, IN${RESET}"

# Footer
echo
separator "═" "$CYAN"

center_text "Welcome to my terminal portfolio! Feel free to explore." "$WHITE$DIM"
center_text "Type 'help' for available commands or just start exploring!" "$GRAY"

separator "═" "$CYAN"

echo -e "\n${BOLD}${GREEN}portfolio@twaldin:~$ ${RESET}"
