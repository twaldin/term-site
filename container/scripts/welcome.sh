#!/bin/bash

# Enhanced Welcome Dashboard for Timothy Waldin with dynamic features
# Uses Node.js utilities for advanced terminal effects

# Function to run node utilities
run_node_util() {
  cd /home/portfolio/scripts && node -e "$1"
}

# Function for typewriter effect via Node.js
typewriter() {
  local text="$1"
  local color="${2:-white}"
  run_node_util "
    const { typewriter } = require('./utils.js');
    typewriter('$text', undefined, '$color');
    "
}

# Function for gradient ASCII
gradient_ascii() {
  local text="$1"
  local gradient="${2:-tokyo}"
  local font="${3:-Univers}"
  run_node_util "
    const { gradientAscii } = require('./utils.js');
    console.log(gradientAscii('$text', '$gradient', '$font'));
    "
}

# Function for gradient ASCII with horizontal typewriter
gradient_ascii_typewriter() {
  local text="$1"
  local gradient="${2:-tokyo}"
  local font="${3:-Univers}"
  run_node_util "
    const { gradientAsciiTypewriter } = require('./utils.js');
    await gradientAsciiTypewriter('$text', '$gradient', '$font');
    "
}

# Function for gradient border
gradient_border() {
  local width="${1:-80}"
  local char="${2:-═}"
  local gradient="${3:-tokyo}"
  run_node_util "
    const { gradientBorder } = require('./utils.js');
    console.log(gradientBorder($width, '$char', '$gradient'));
    "
}

# Function for animated separator
animated_separator() {
  local width="${1:-80}"
  local char="${2:-═}"
  local gradient="${3:-tokyo}"
  run_node_util "
    const { animatedSeparator } = require('./utils.js');
    animatedSeparator($width, '$char', '$gradient');
    "
}

# Function for gradient box
gradient_box() {
  local content="$1"
  local gradient="${2:-tokyo}"
  local title="${3:-}"
  local title_option=""
  if [ ! -z "$title" ]; then
    title_option=", title: \"$title\""
  fi
  run_node_util "
    const { gradientBox } = require('./utils.js');
    console.log(gradientBox('$content', { gradientName: '$gradient'$title_option }));
    "
}

# Clear screen and start
clear
animated_separator 139 "═" "primary"
gradient_ascii_typewriter "twald.in" "ocean" "Univers"
echo ""
typewriter "󰇮 tim@waldin.net" "cyan"
typewriter " https://github.com/twaldin" "yellow"
typewriter " https://linkedin.com/in/twaldin" "magenta"
typewriter "󰋾 https://instagram.com/timn.w" "green"

echo ""
animated_separator 139 "═" "primary"

# Welcome message with typewriter
echo ""
typewriter "Welcome to twald.in terminal portfolio" "primary"
typewriter "This is a fully interactive linux terminal e:wnviroment showcasing my projects and blog"
typewriter "You can explore my projects and this filesystem using all normal tools (eg. cd, ls, fzf, nvim, etc." "muted"
typewriter "Type projects to see my projects - Type blog to see my blog - Type help to see all commands." "muted"
echo ""

animated_separator 139 "═" "primary"
