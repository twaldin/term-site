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

# Ultra-fast typewriter function with batch printing
typewriter() {
  local text="$1"
  local batch_size=5  # Print 5 characters at a time
  local delay=0.0001  # Tiny delay between batches

  # Use echo -e to process escape sequences
  local processed_text=$(echo -e "$text")
  local length=${#processed_text}

  for ((i = 0; i < length; i += batch_size)); do
    printf "%s" "${processed_text:$i:$batch_size}"
    sleep $delay
  done
  echo
}

# Ultra-fast animated separator with batch printing
animated_separator() {
  local char="$1"
  local width="$2"
  local batch_size=10  # Print 10 characters at a time
  local delay=0.0001

  for ((i = 0; i < width; i += batch_size)); do
    local batch=""
    for ((j = 0; j < batch_size && (i + j) < width; j++)); do
      batch+="\033[38;5;117m${char}\033[0m"
    done
    printf "%b" "$batch"
    sleep $delay
  done
  echo
}

# ASCII typewriter function - displays figlet output line by line
ascii_typewriter() {
  local text="$1"
  local font="${2:-Univers}"
  local color="${3:-${BOLD}${CYAN}}"

  # Generate ASCII art and capture in variable
  local ascii_output
  ascii_output=$(figlet -f "$font" "$text" 2>/dev/null || figlet "$text")

  # Split into lines and display each with typewriter effect
  while IFS= read -r line; do
    typewriter "${color}${line}${RESET}"
  done <<<"$ascii_output"
}

clear

# Top separator
animated_separator "═" 139

# ASCII header with progressive typewriter display
ascii_typewriter "twald.in" "Univers" "${BOLD}${CYAN}"

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
