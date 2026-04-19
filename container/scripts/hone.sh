#!/bin/bash
source "$(dirname "$0")/shared-functions.sh"
emit_url "projects/hone"

clear
echo ""
ascii_typewriter "hone" "DOS_Rebel" "${MAGENTA}"

echo ""

create_box "Description" "GEPA-based prompt optimizer for AI coding CLIs. Evolves a system
prompt through pareto-style mutation + selection, scoring each variant
against real github bug-fix challenges via the agentelo grader. Lifted
claude haiku 4.5 from 65% to 85% solve rate on 9 unseen bugs." "${MAGENTA}"

echo ""

typewriter "${MAGENTA}Tech Stack:${RESET}"
animated_separator "~" 10 "${MAGENTA}"
typewriter "   ${MAGENTA}•${RESET} Python (GEPA + dspy integration)"
typewriter "   ${MAGENTA}•${RESET} harness library for CLI-agnostic execution"
typewriter "   ${MAGENTA}•${RESET} agentelo as the grader / challenge runner"
typewriter "   ${MAGENTA}•${RESET} ~300-line coordinator glueing the three together"

echo ""

typewriter "${MAGENTA}Key Results:${RESET}"
animated_separator "~" 10 "${MAGENTA}"
typewriter "   ${MAGENTA}•${RESET} +20pp holdout lift on claude haiku (see blog)"
typewriter "   ${MAGENTA}•${RESET} Narrow goldilocks band — weak models can't execute the"
typewriter "     methodology, strong models already saturate"
typewriter "   ${MAGENTA}•${RESET} Uses existing CLI subscription as the mutator (no API keys)"

echo ""
typewriter "${MAGENTA}Recent Git Activity:${RESET}"
if [ -d ".git" ]; then
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

echo ""

typewriter "${YELLOW}You are now in the projects/hone directory${RESET}"
typewriter "${DIM}Read writeup/ for the results, blog for the story, or type home to go back${RESET}"
echo ""
