#!/bin/bash
source "$(dirname "$0")/shared-functions.sh"

clear
echo ""
ascii_typewriter "trade-up-bot" "DOS_Rebel" "${GREEN}"

echo ""
animated_separator "+" 60
echo ""

typewriter "${GREEN}CS2 trade-up bot${RESET}"
animated_separator "-" 15 "$GREEN"
typewriter "   ${WHITE}full-stack market arbitrage platform analyzing profitable CS2${RESET}"
typewriter "   ${WHITE}trade-up contracts across 3 marketplaces in real time.${RESET}"
echo ""
typewriter "   ${YELLOW}tech stack:${RESET} TypeScript, React, Express, SQLite, Redis"
typewriter "   ${YELLOW}features:${RESET} Steam OpenID auth, Stripe payments, real-time WebSocket"
typewriter "            market feeds, Discord bot with role-based tier management"
echo ""
typewriter "   ${DIM}explore the source code with ${CYAN}ls${RESET}${DIM}, ${CYAN}nvim${RESET}${DIM}, or ${CYAN}cat${RESET}"
typewriter "   ${DIM}type ${BOLD}\"projects\"${RESET}${DIM} to go back to the project list${RESET}"
typewriter "   ${DIM}type ${BOLD}\"home\"${RESET}${DIM} to go back to the home page${RESET}"
echo ""
