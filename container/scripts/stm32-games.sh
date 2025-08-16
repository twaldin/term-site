#!/bin/bash

# Function to run node utilities
run_node_util() {
  cd /home/portfolio/scripts && node -e "$1"
}

# Function for typewriter effect
typewriter() {
  local text="$1"
  local color="${2:-white}"
  run_node_util "
    const { typewriter } = require('./utils.js');
    (async () => {
      await typewriter('$text', undefined, '$color');
    })();
    "
}

# Function for animated separator
animated_separator() {
  local width="${1:-80}"
  local char="${2:-═}"
  local gradient="${3:-tokyo}"
  run_node_util "
    const { animatedSeparator } = require('./utils.js');
    (async () => {
      await animatedSeparator($width, '$char', '$gradient');
    })();
    "
}

# Function for create box
create_box() {
  local title="$1"
  local content="$2"
  local gradient="${3:-tokyo}"
  run_node_util "
    const { gradientBox } = require('./utils.js');
    console.log(gradientBox('$content', { gradientName: '$gradient', title: '$title' }));
    "
}

clear

# Generate ASCII with typewriter animation
gradient_ascii_typewriter "stm32 games" "cyber" "Univers"

echo ""

# Create boxed content for main info
echo "$(create_box "Info" "A handheld game console project built with STM32F103C8T6 microcontroller
featuring classic games like Snake with an ST7789 LCD display." "primary")"

echo ""

# Tech Stack section
typewriter "Tech Stack:" "primary"
typewriter "   • C programming with ARM Cortex-M3" "info"
typewriter "   • STM32F103C8 (Blue Pill) microcontroller" "info"
typewriter "   • ST7789 SPI LCD display driver" "info"
typewriter "   • libopencm3 firmware library" "info"
typewriter "   • ARM GCC toolchain" "info"

echo ""

# Animated separator
animated_separator "~" 60

echo ""

typewriter "You are now in the projects/stm32-games directory" "highlight"
typewriter "Use ls, cat, nvim, or other commands to explore" "dim"

echo ""

# Commands section
typewriter "Commands:" "primary"
typewriter "   ls                    - List project files" "info"
typewriter "   cat README.md         - View project documentation" "info"
typewriter "   cat main.c            - View main application code" "info"
typewriter "   cat snake.c           - View Snake game implementation" "info"
typewriter "   tree                  - Show complete file structure" "info"
typewriter "   cd ..                 - Go back to portfolio directory" "info"
typewriter "   projects              - Return to projects overview" "info"
typewriter "   home                  - Return to main dashboard" "info"

echo ""

# Animated separator
animated_separator "-" 50

echo ""

# Git repository information
typewriter "Git:" "primary"
if [ -d ".git" ]; then
  # Show current branch
  branch=$(git branch --show-current 2>/dev/null || echo "main")
  typewriter "   Branch: ${branch}" "highlight"

  # Show recent commits with nice formatting
  typewriter "   Recent commits:" "secondary"
  git log --oneline --decorate --color=always | head -5 | while IFS= read -r line; do
    typewriter "     • $line" "dim"
  done

  # Show repository status
  if git status --porcelain | grep -q .; then
    typewriter "   Status: Modified files present" "warning"
  else
    typewriter "   Status: Clean working directory" "success"
  fi
else
  typewriter "   Not a git repository" "dim"
fi

echo ""

# Animated separator
animated_separator "=" 60