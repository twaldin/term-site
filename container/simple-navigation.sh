#!/bin/bash
# Navigation aliases that cd and show info

# Projects overview - cd and show info
projects() {
    cd projects
    /home/portfolio/scripts/projects
}

# STM32 Games - cd and show info
alias stm32-games='cd projects/stm32-games && /home/portfolio/scripts/stm32-games.sh'

# Term Site - cd and show info  
alias term-site='cd projects/term-site && /home/portfolio/scripts/term-site.sh'

# Sulfur Recipes - cd and show info
alias sulfur-recipies='cd projects/sulfur-recipies && /home/portfolio/scripts/sulfur-recipies.sh'

# Dotfiles - cd and show info
alias dotfiles='cd projects/dotfiles && /home/portfolio/scripts/dotfiles.sh'

# Home navigation function
home() {
    cd /home/portfolio
    /home/portfolio/scripts/welcome.sh
}

# Welcome alias for home
welcome() {
    home
}

# Export functions so they're available in the shell
export -f projects home welcome