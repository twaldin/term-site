#!/bin/bash

# Shared Terminal Animation Functions
# Source this file in other scripts with: source "$(dirname "$0")/shared-functions.sh"

# Colors
CYAN='\033[38;5;117m'
GREEN='\033[38;5;121m'
WHITE='\033[38;5;255m'
YELLOW='\033[38;5;227m'
BLUE='\033[38;5;111m'
RED='\033[38;5;210m'
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
  local color="${3:-$CYAN}"  # Default to cyan, allow custom colors
  local batch_size=10  # Print 10 characters at a time
  local delay=0.0001

  for ((i = 0; i < width; i += batch_size)); do
    local batch=""
    for ((j = 0; j < batch_size && (i + j) < width; j++)); do
      batch+="${color}${char}${RESET}"
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
  done <<< "$ascii_output"
}

# Simple box function with customizable colors
create_box() {
  local title="$1"
  local content="$2"
  local color="${3:-$CYAN}"
  
  echo -e "${color}┌─ ${BOLD}${title}${RESET}${color} ───────────────────────────────────────────────────────────┐${RESET}"
  echo -e "${color}│${RESET} ${WHITE}${content}${RESET}"
  echo -e "${color}└─────────────────────────────────────────────────────────────────────┘${RESET}"
}