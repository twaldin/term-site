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

# emit_url <path>
# Emits OSC 9999 — frontend Terminal.tsx intercepts via
# xterm.parser.registerOscHandler(9999), strips the sequence, and calls
# history.pushState so the browser URL tracks the active command.
# Usage:
#   emit_url "blog/2026-04-19-hone-haiku-20pp"
#   emit_url ""           # map to "/" — the home page
emit_url() {
  printf '\033]9999;%s\033\\' "${1-}"
}

# emit_scroll_top
# Emits OSC 9998 — frontend handler calls xterm.scrollToTop() so the viewport
# parks at the first line of the most recent output. Use after long renders
# (blog posts, help pages) where the default xterm auto-scroll-to-cursor
# leaves the user staring at the bottom.
emit_scroll_top() {
  printf '\033]9998;\033\\'
}

# emit_navigate <path>
# Emits OSC 9997 — frontend handler calls window.location.assign(path),
# triggering a full page navigation. Use when the shell wants to hand off
# to an HTML page (e.g. `blog <slug>` opens /blog/<slug>). Contrast with
# emit_url (OSC 9999) which only updates the URL bar via pushState.
emit_navigate() {
  printf '\033]9997;%s\033\\' "${1-}"
}

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
  local wrap_width="${4:-}"  # optional figlet output width (columns) for wrapping long text

  local ascii_output
  if [ -n "$wrap_width" ]; then
    # Replace hyphens with spaces so figlet can find word boundaries for wrapping
    local wrap_text="${text//-/ }"
    ascii_output=$(figlet -f "$font" -w "$wrap_width" "$wrap_text" 2>/dev/null || figlet -w "$wrap_width" "$wrap_text")
  else
    ascii_output=$(figlet -f "$font" "$text" 2>/dev/null || figlet "$text")
  fi

  # Detect terminal width. If the figlet output is wider than the terminal
  # (e.g. narrow mobile session), fall back to a plain styled title rather
  # than let it wrap into illegible ANSI confetti.
  local cols=0 t
  t="$(tput cols 2>/dev/null)";                       [[ "$t" =~ ^[0-9]+$ ]] && (( t > cols )) && cols=$t
  t="$(stty size 2>/dev/null | awk '{print $2}')";    [[ "$t" =~ ^[0-9]+$ ]] && (( t > cols )) && cols=$t
  [[ "$COLUMNS" =~ ^[0-9]+$ ]]                     && (( COLUMNS > cols )) && cols=$COLUMNS
  (( cols < 10 )) && cols=80

  # Max actual visible width of the figlet output, counted in CHARACTERS
  # (not bytes — figlet output uses UTF-8 box-drawing chars that take 3
  # bytes each but occupy 1 column). Python is reliable here; if it fails
  # for any reason, fall back to a conservative byte-length / 3 estimate.
  local max_width
  max_width=$(printf '%s' "$ascii_output" | python3 -c 'import sys
lines = sys.stdin.read().split("\n")
print(max((len(l) for l in lines if l.strip()), default=0))' 2>/dev/null) || max_width=""

  if ! [[ "$max_width" =~ ^[0-9]+$ ]]; then
    local max_bytes
    max_bytes=$(awk '{ if (length > m) m = length } END { print m+0 }' <<< "$ascii_output")
    max_width=$((max_bytes / 3))
  fi

  if (( max_width > cols )); then
    typewriter "${BOLD}${color}${text}${RESET}"
    return
  fi

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
  local box_width="${4:-auto}"

  # Live PTY width via tput first (query TIOCGWINSZ — doesn't get stale in
  # subshells). Fall back to stty, then $COLUMNS, then 80.
  local term_width
  term_width="$(tput cols 2>/dev/null)"
  [[ -z "$term_width" ]] && term_width="$(stty size 2>/dev/null | awk '{print $2}')"
  [[ -z "$term_width" ]] && term_width="${COLUMNS:-80}"

  if [[ "$box_width" == "auto" ]]; then
    # Size to content width (longest line + borders/padding), capped at
    # terminal width. Avoids a 70-char box wrapping on mobile when content
    # is only ~35 chars wide.
    local max_line=0
    if [ -n "$content" ]; then
      while IFS= read -r line; do
        local line_clean=$(echo "$line" | sed 's/\x1b\[[0-9;]*m//g')
        local len=${#line_clean}
        (( len > max_line )) && max_line=$len
      done <<< "$content"
    fi
    local title_len=${#title_clean}
    local content_based=$(( (max_line > title_len ? max_line : title_len) + 8 ))
    local term_max=$((term_width - 2))
    box_width=$(( content_based < term_max ? content_based : term_max ))
  elif [ "$term_width" -lt "$box_width" ]; then
    box_width=$((term_width - 2))
  fi
  (( box_width < 40 )) && box_width=40

  local title_clean=$(echo "$title" | sed 's/\x1b\[[0-9;]*m//g')
  local title_length=${#title_clean}

  local dash_count=$((box_width - title_length - 5))  # ┌(1) ─(1) ' '(1) title ' '(1) ┐(1) = 5 fixed
  if [ $dash_count -lt 1 ]; then
    dash_count=1
  fi

  local top_border="${color}┌─ ${BOLD}${title}${RESET}${color} "
  for ((i=0; i<dash_count; i++)); do
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

# cache_output <command_name> -- wraps a script's output in a width-keyed cache.
# First run at a given column count generates and caches the output (including
# ANSI codes). Subsequent runs at the same width cat the cache — instant display.
# Cache lives in /tmp which is a tmpfs inside the container (fast, ephemeral).
cache_output() {
  local cmd_name="$1"
  local cols
  cols=$(tput cols 2>/dev/null || echo 80)
  local cache_dir="/tmp/cmd-cache"
  local cache_file="${cache_dir}/${cmd_name}-${cols}.ans"

  if [[ -f "$cache_file" ]]; then
    cat "$cache_file"
    return
  fi

  mkdir -p "$cache_dir"
}

git_activity() {
  local color="${1:-$BLUE}"
  echo ""
  typewriter "${color}Recent Git Activity:${RESET}"
  if [ -d ".git" ]; then
    local branch
    branch=$(git branch --show-current 2>/dev/null || echo "main")
    typewriter "   ${BLUE}Branch:${RESET} ${YELLOW}${branch}${RESET}"
    typewriter "   ${BLUE}Recent commits:${RESET}"
    git log --oneline --decorate --color=always | head -5 | while IFS= read -r line; do
      git_typewriter "     $line"
    done
    if git status --porcelain | grep -q .; then
      typewriter "   ${YELLOW}Status:${RESET} ${RED}Modified files present${RESET}"
    else
      typewriter "   ${YELLOW}Status:${RESET} ${GREEN}Clean working directory${RESET}"
    fi
  else
    typewriter "   ${DIM}Not a git repository${RESET}"
  fi
}
