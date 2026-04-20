#!/bin/bash
source "$(dirname "$0")/shared-functions.sh"
emit_url "welcome"

clear
echo ""

# DOS_Rebel figlet for "twaldin" is ~50 cols wide — on narrow mobile terminals
# it wraps into a garbled mess. Fall back to a simple colored title so the
# welcome still looks clean. Check all three width sources like blog.sh does.
_cols=0
_t="$(tput cols 2>/dev/null)";                  [[ "$_t" =~ ^[0-9]+$ ]] && (( _t > _cols )) && _cols=$_t
_t="$(stty size 2>/dev/null | awk '{print $2}')"; [[ "$_t" =~ ^[0-9]+$ ]] && (( _t > _cols )) && _cols=$_t
[[ "$COLUMNS" =~ ^[0-9]+$ ]]                  && (( COLUMNS > _cols )) && _cols=$COLUMNS
(( _cols < 10 )) && _cols=80

if (( _cols >= 55 )); then
  ascii_typewriter "twaldin" "DOS_Rebel" "${RED}"
else
  typewriter "${BOLD}${RED}twaldin${RESET}"
fi
echo ""
create_box "portfolio terminal" "  about       learn about me

  contact     email + socials

  resume      view my resume

  projects    explore my projects

  blog        posts i've written

  help        all available commands" "${RED}"
echo ""
