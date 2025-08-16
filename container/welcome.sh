#!/bin/bash

# Welcome Dashboard for Timothy Waldin
# Colors matching oh-my-posh stelbent-compact.minimal theme

# Color codes matching your terminal theme
CYAN='\033[38;5;117m'    # Light blue like path segment (#91ddff)
GREEN='\033[38;5;121m'   # Green like git clean (#95ffa4)
YELLOW='\033[38;5;227m'  # Yellow like terraform (#ffee58)
BLUE='\033[38;5;111m'    # Blue like ahead (#89d1dc)
MAGENTA='\033[38;5;177m' # Magenta accent
RED='\033[38;5;210m'     # Soft red for accents
WHITE='\033[38;5;255m'   # Pure white
GRAY='\033[38;5;245m'    # Gray for secondary text
RESET='\033[0m'          # Reset color
BOLD='\033[1m'           # Bold text
DIM='\033[2m'            # Dim text

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
  echo ".o888oo oooo  ooo. .oo.  .oo.       oooo oooo    ooo  .oooo.    888   .oooo888 oooo  ooo. .oo.       ooo. .oo.    .ooooo.   .o888oo "
  echo "  888   \`888  \`888P\"Y88bP\"Y88b       \`88. \`88.  .8'  \`P  )88b   888  d88' \`888 \`888  \`888P\"Y88b      \`888P\"Y88b   d88' \`88b   888   "
  echo "  888    888   888   888   888        \`88..]88..8'    .oP\"888   888  888   888  888   888   888       888   888  888ooo888    888   "
  echo "  888 .  888   888   888   888  .o.    \`888'\`888'    d8(  888   888  888   888  888   888   888  .o.  888   888  888    .o    888 . "
  echo "  \"888\" o888o o888o o888o o888o Y8P     \`8'  \`8'     \`Y888\"\"8o o888o \`Y8bod88P\" o888o o888o o888o Y8P o888o o888o \` Y8bod8P'   \"888\" "
  echo -e "${RESET}"
}

# Clear screen and start
clear

# Top border
separator "═" "$CYAN"

# ASCII Art Header
print_ascii
separator "─" "$BLUE"
echo -e "\n${CYAN}󰇮 tim@waldin.net${RESET}    ${MAGENTA} https://studyspot.us${RESEST}   ${YELLOW} https://github.com/twaldin${RESET}   ${GREEN}󰋾 https://instagram.com/timn.w${RESET}"
separator "─" "$GREEN"
echo -e "\n${BOLD}${WHITE}  Projects${RESET}"

echo -e "\n${GREEN}  term-site:${RESET}   ${WHITE}Interactive terminal portfolio website${RESET}"
echo -e "${DIM}                    Built with Docker, node-pty, xterm.js, and Next.js on typescript${RESET}"

echo -e "\n${GREEN}  StudySpot:${RESET}      ${WHITE}Collaborative AI study platform for students${RESET}"
echo -e "${DIM}                    Student community website with student group study/course material and a RAG assistant with tools${RESET}"
echo -e "${DIM}                    Built on Next.js with a Cloudflare Workers Node.js runtime Assistant API which serves the chat streaming${RESET}"
echo -e "${DIM}                    Provided experience working with llm native systems, such as vector dbs, tool call writing, conversation format, and more${RESET}"

echo -e "\n${GREEN}  dotfiles:${RESET}       ${WHITE}Personal development environment configuration${RESET}"
echo -e "${DIM}                    Neovim, Zsh, Oh-my-posh setup${RESET}"

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

# Footer
echo
separator "═" "$CYAN"

center_text "Welcome to my terminal portfolio! Feel free to explore." "$WHITE$DIM"
center_text "Type 'help' for available commands or just start exploring!" "$GRAY"

separator "═" "$CYAN"
