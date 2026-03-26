#!/bin/bash
source "$(dirname "$0")/shared-functions.sh"

clear
echo ""
ascii_typewriter "stm32 games" "DOS_Rebel" "${BLUE}"

echo ""
create_box "Description" "Game console using the stm32 blue pill and an lcd display, written in C.
Currently only plays snake game but tetris and more coming soon" "${BLUE}"

echo ""
typewriter "${BLUE}Tech Stack:${RESET}"
animated_separator "~" 10 "${BLUE}"
typewriter "   ${BLUE}•${RESET} C with Makefile and ARM GCC"
typewriter "   ${BLUE}•${RESET} STM32F103C8 (Blue Pill) microcontroller"
typewriter "   ${BLUE}•${RESET} Custom C ST7789 SPI LCD display driver"
typewriter "   ${BLUE}•${RESET} libopencm3 library"

git_activity "${BLUE}"

echo ""

typewriter "${YELLOW}You are now in the projects/stm32-games directory${RESET}"
typewriter "${DIM}Use ls, tree, cat, nvim, or other commands to explore the actual git repository of this project,${RESET}"
typewriter "${DIM}or type home to go back to the home page ${RESET}"
echo ""
