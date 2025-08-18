#!/bin/bash

# Shared Terminal Animation Functions
# Source this file in other scripts with: source "$(dirname "$0")/shared-functions.sh"

# Gruvbox Dark Colors (exact hex from ghostty/iTerm2-Color-Schemes)
# Using true color escape sequences for exact color matching
CYAN='\033[38;2;142;192;124m'      # Bright Cyan #8ec07c
GREEN='\033[38;2;184;187;38m'      # Bright Green #b8bb26  
WHITE='\033[38;2;235;219;178m'     # Foreground #ebdbb2
YELLOW='\033[38;2;250;189;47m'     # Bright Yellow #fabd2f
BLUE='\033[38;2;131;165;152m'      # Bright Blue #83a598
RED='\033[38;2;251;73;52m'         # Bright Red #fb4934
MAGENTA='\033[38;2;211;134;155m'   # Bright Magenta #d3869b
ORANGE='\033[38;2;254;128;25m'     # Orange (custom)
GRAY='\033[38;2;146;131;116m'      # Bright Black/Gray #928374
BG='\033[48;2;40;40;40m'           # Background #282828
FG='\033[38;2;235;219;178m'        # Foreground #ebdbb2 
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

# ASCII typewriter function - displays figlet output line by line with no extra spacing
ascii_typewriter() {
  local text="$1"
  local font="${2:-Univers}"
  local color="${3:-${BOLD}${CYAN}}"
  
  # Generate ASCII art and capture in variable
  local ascii_output
  ascii_output=$(figlet -f "$font" "$text" 2>/dev/null || figlet "$text")
  
  # Split into lines and display each with typewriter effect, no echo after
  while IFS= read -r line; do
    # Use printf instead of typewriter to avoid extra newline
    local processed_text=$(echo -e "${color}${line}${RESET}")
    local length=${#processed_text}
    
    for ((i = 0; i < length; i += 5)); do
      printf "%s" "${processed_text:$i:5}"
      sleep 0.0001
    done
    printf "\n"
  done <<< "$ascii_output"
}

# Robust box function with dynamic sizing and multi-line support
create_box() {
  local title="$1"
  local content="$2"
  local color="${3:-$CYAN}"
  local box_width="${4:-80}"  # Default width if not specified
  
  # Calculate the actual terminal width if available
  if [ -n "$COLUMNS" ]; then
    box_width=$((COLUMNS > box_width ? box_width : COLUMNS - 2))
  fi
  
  # Calculate title length without color codes
  local title_clean=$(echo "$title" | sed 's/\x1b\[[0-9;]*m//g')
  local title_length=${#title_clean}
  
  # Calculate how many dashes we need after the title
  local dash_count=$((box_width - title_length - 6))  # 6 accounts for "┌─ " and " ┐"
  if [ $dash_count -lt 1 ]; then
    dash_count=1
  fi
  
  # Build the top border
  local top_border="${color}┌─ ${BOLD}${title}${RESET}${color} "
  for ((i=0; i<dash_count; i++)); do
    top_border+="─"
  done
  top_border+="┐${RESET}"
  
  echo -e "$top_border"
  
  # Process content line by line, wrapping if necessary
  # Handle empty content case
  if [ -z "$content" ]; then
    # Empty box, just show one empty line
    local content_width=$((box_width - 4))
    local spaces=""
    for ((i=0; i<content_width; i++)); do
      spaces+=" "
    done
    echo -e "${color}│${RESET} ${spaces} ${color}│${RESET}"
  else
    while IFS= read -r line; do
      # Remove color codes to get actual length
      local line_clean=$(echo "$line" | sed 's/\x1b\[[0-9;]*m//g')
      local line_length=${#line_clean}
      local content_width=$((box_width - 4))  # Account for "│ " and " │"
      
      if [ $line_length -le $content_width ]; then
        # Line fits, pad with spaces
        local padding=$((content_width - line_length))
        local spaces=""
        for ((i=0; i<padding; i++)); do
          spaces+=" "
        done
        echo -e "${color}│${RESET} ${WHITE}${line}${RESET}${spaces} ${color}│${RESET}"
      else
        # Line needs wrapping
        local start=0
        while [ $start -lt $line_length ]; do
          local chunk="${line_clean:$start:$content_width}"
          local chunk_length=${#chunk}
          local padding=$((content_width - chunk_length))
          local spaces=""
          for ((i=0; i<padding; i++)); do
            spaces+=" "
          done
          # For wrapped lines, we lose color formatting (simplified approach)
          echo -e "${color}│${RESET} ${WHITE}${chunk}${RESET}${spaces} ${color}│${RESET}"
          start=$((start + content_width))
        done
      fi
    done <<< "$content"
  fi
  
  # Build the bottom border
  local bottom_border="${color}└"
  for ((i=0; i<box_width-2; i++)); do
    bottom_border+="─"
  done
  bottom_border+="┘${RESET}"
  
  echo -e "$bottom_border"
}

# Create a clickable hyperlink with color
# Usage: hyperlink "display_text" "url" "color_code"
# Example: hyperlink "GitHub" "https://github.com/username" "$YELLOW"
hyperlink() {
  local text="$1"
  local url="$2"
  local color="${3:-$CYAN}"  # Default to cyan if no color specified
  
  # Terminal hyperlink format: ESC]8;;URL\ESC\TEXT\ESC]8;;\ESC\
  # Use echo -e with properly escaped sequences
  echo -en "${color}\033]8;;${url}\033\\${text}\033]8;;\033\\${RESET}"
}

# Create an email link
# Usage: email_link "display_text" "email_address" "color_code"
email_link() {
  local text="$1"
  local email="$2"
  local color="${3:-$CYAN}"
  
  # Use same format as hyperlink but with mailto:
  echo -en "${color}\033]8;;mailto:${email}\033\\${text}\033]8;;\033\\${RESET}"
}