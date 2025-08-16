#!/bin/bash
# Navigation functions for project exploration

# Projects overview function
projects() {
  # Navigate to projects directory first
  cd ~/projects
  # Run the projects script to show overview
  /home/portfolio/scripts/projects
}

# STM32 Games navigation function
stm32-games() {
  # Show project info
  /home/portfolio/scripts/stm32-games
  echo
  echo -e "\033[38;5;227mNavigating to ~/projects/stm32-games...\033[0m"
  
  if [ -d ~/projects/stm32-games ]; then
    cd ~/projects/stm32-games
    echo -e "\033[38;5;121mSuccessfully navigated to: $(pwd)\033[0m"
  else
    echo -e "\033[38;5;210mError: Directory ~/projects/stm32-games not found\033[0m"
    echo -e "\033[38;5;117mAvailable directories:\033[0m"
    ls -la ~/projects/ 2>/dev/null || echo -e "\033[38;5;210mProjects directory not found\033[0m"
    return 1
  fi
}

# Term Site navigation function
term-site() {
  # Show project info
  /home/portfolio/scripts/term-site
  echo
  echo -e "\033[38;5;227mNavigating to ~/projects/term-site...\033[0m"
  cd ~/projects/term-site 2>/dev/null || {
    echo -e "\033[38;5;210mError: Could not navigate to ~/projects/term-site\033[0m"
    echo -e "\033[38;5;117mTry: ls ~/projects/\033[0m"
    return 1
  }
}

# Sulfur Recipes navigation function
sulfur-recipies() {
  # Show project info
  /home/portfolio/scripts/sulfur-recipies
  echo
  echo -e "\033[38;5;227mNavigating to ~/projects/sulfur-recipies...\033[0m"
  cd ~/projects/sulfur-recipies 2>/dev/null || {
    echo -e "\033[38;5;210mError: Could not navigate to ~/projects/sulfur-recipies\033[0m"
    echo -e "\033[38;5;117mTry: ls ~/projects/\033[0m"
    return 1
  }
}

# Dotfiles navigation function
dotfiles() {
  # Show project info
  /home/portfolio/scripts/dotfiles
  echo
  echo -e "\033[38;5;227mNavigating to ~/projects/dotfiles...\033[0m"
  cd ~/projects/dotfiles 2>/dev/null || {
    echo -e "\033[38;5;210mError: Could not navigate to ~/projects/dotfiles\033[0m"
    echo -e "\033[38;5;117mTry: ls ~/projects/\033[0m"
    return 1
  }
}

# Home navigation function
home() {
  echo -e "\033[38;5;227mNavigating to home directory...\033[0m"
  cd ~
  /home/portfolio/scripts/welcome.sh
}

# Welcome alias for home
welcome() {
  home
}

# Export functions so they're available in the shell
export -f projects stm32-games term-site sulfur-recipies dotfiles home welcome

