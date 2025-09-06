#!/bin/bash
CYAN='\033[38;2;142;192;124m'      # Cyan #8ec07c
GREEN='\033[38;2;184;187;38m'      # Green #b8bb26
WHITE='\033[38;2;235;219;178m'     # White #ebdbb2
YELLOW='\033[38;2;250;189;47m'     # Yellow #fabd2f
BLUE='\033[38;2;69;133;136m'       # Blue #458588
RED='\033[38;2;204;36;29m'         # Red #cc241d
MAGENTA='\033[38;2;177;98;134m'    # Magenta #b16286
ORANGE='\033[38;2;254;128;25m'     # Orange #fe8019
GRAY='\033[38;2;146;131;116m'      # Gray #928374
BG='\033[48;2;29;32;33m'           # Background #1d2021
FG='\033[38;2;251;241;199m'        # Foreground #fbf1c7
RESET='\033[0m'
BOLD='\033[1m'
DIM='\033[2m'

typewriter() {
  local text="$1"
  local batch_size=1
  local delay=0.0005

  local processed_text=$(echo -e "$text")
  local length=${#processed_text}

  for ((i = 0; i < length; i += batch_size)); do
    printf "%s" "${processed_text:$i:$batch_size}"
    sleep $delay
  done
  echo
}

animated_separator() {
  local char="$1"
  local width="$2"
  local color="${3:-$CYAN}"
  local batch_size=1
  local delay=0.001

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

ascii_typewriter() {
  local text="$1"
  local font="${2:-DOS_Rebel}"
  local color="${3:-${BOLD}${CYAN}}"

  local ascii_output
  # Use DOS_Rebel font from figlet directory (no locale override needed)
  ascii_output=$(figlet -f DOS_Rebel "$text" 2>/dev/null || figlet "$text")

  # Strip trailing blank lines using a safer method
  ascii_output=$(echo "$ascii_output" | awk '/^[[:space:]]*$/ {emptylines=emptylines"\n"; next} {if(emptylines) printf "%s",emptylines; emptylines=""; print}')

  # Line-by-line animation - preserves UTF-8 box-drawing characters
  while IFS= read -r line; do
    # Print entire colored line at once to avoid breaking UTF-8 sequences
    printf '%b%s%b\n' "${color}" "$line" "${RESET}"
    sleep 0.02  # Small delay between lines for animation effect
  done <<< "$ascii_output"
}

# Special typewriter for git output that preserves ANSI colors
git_typewriter() {
  local line="$1"
  # Display git output immediately to preserve ANSI color sequences
  printf '%s\n' "$line"
  sleep 0.02  # Small delay for animation effect
}

create_box() {
  local title="$1"
  local content="$2"
  local color="${3:-$CYAN}"
  local box_width="${4:-80}"

  if [ -n "$COLUMNS" ]; then
    box_width=$((COLUMNS > box_width ? box_width : COLUMNS - 2))
  fi

  local title_clean=$(echo "$title" | sed 's/\x1b\[[0-9;]*m//g')
  local title_length=${#title_clean}

  local dash_count=$((box_width - title_length - 6))  # 6 accounts for "┌─ " and " ┐"
  if [ $dash_count -lt 1 ]; then
    dash_count=1
  fi

  local top_border="${color}┌─ ${BOLD}${title}${RESET}${color} "
  for ((i=0; i<=dash_count; i++)); do
    top_border+="─"
  done
  top_border+="┐${RESET}"

  echo -e "$top_border"

  if [ -z "$content" ]; then
    local content_width=$((box_width - 4))
    local spaces=""
    for ((i=0; i<content_width; i++)); do
      spaces+=" "
    done
    echo -e "${color}│${RESET} ${spaces} ${color}│${RESET}"
  else
    while IFS= read -r line; do
      local line_clean=$(echo "$line" | sed 's/\x1b\[[0-9;]*m//g')
      local line_length=${#line_clean}
      local content_width=$((box_width - 4))

      if [ $line_length -le $content_width ]; then
        local padding=$((content_width - line_length))
        local spaces=""
        for ((i=0; i<padding; i++)); do
          spaces+=" "
        done
        echo -e "${color}│${RESET} ${WHITE}${line}${RESET}${spaces} ${color}│${RESET}"
      else
        local start=0
        while [ $start -lt $line_length ]; do
          local chunk="${line_clean:$start:$content_width}"
          local chunk_length=${#chunk}
          local padding=$((content_width - chunk_length))
          local spaces=""
          for ((i=0; i<padding; i++)); do
            spaces+=" "
          done
          echo -e "${color}│${RESET} ${WHITE}${chunk}${RESET}${spaces} ${color}│${RESET}"
          start=$((start + content_width))
        done
      fi
    done <<< "$content"
  fi

  local bottom_border="${color}└"
  for ((i=0; i<box_width-2; i++)); do
    bottom_border+="─"
  done
  bottom_border+="┘${RESET}"

  echo -e "$bottom_border"
}

hyperlink() {
  local text="$1"
  local url="$2"
  local color="${3:-$CYAN}"

  echo -en "${color}\033]8;;${url}\033\\ ${text}\033]8;;\033\\${RESET}"
}

email_link() {
  local text="$1"
  local email="$2"
  local color="${3:-$CYAN}"

  echo -en "${color}\033]8;;mailto:${email}\033\\ ${text}\033]8;;\033\\${RESET}"
}
