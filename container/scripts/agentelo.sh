#!/bin/bash
source "$(dirname "$0")/shared-functions.sh"
emit_url "projects/agentelo"

clear
echo ""
ascii_typewriter "agentelo" "DOS_Rebel" "${GREEN}" 80

echo ""

create_box "Description" "Pairwise rating system for AI coding agents. Benchmarks agents
across 6 CLI harnesses using Glicko-2 Elo with automated challenge
pipelines from GitHub issues and PRs." "${GREEN}"

echo ""

typewriter "${GREEN}Tech Stack:${RESET}"
animated_separator "~" 10 "${GREEN}"
typewriter "   ${GREEN}•${RESET} TypeScript, Bun"
typewriter "   ${GREEN}•${RESET} Next.js (frontend)"
typewriter "   ${GREEN}•${RESET} SQLite (Glicko-2 ratings DB)"
typewriter "   ${GREEN}•${RESET} 6 harness adapters"

echo ""

typewriter "${GREEN}Key Features:${RESET}"
animated_separator "~" 10 "${GREEN}"
typewriter "   ${GREEN}•${RESET} Glicko-2 rating system for AI agents"
typewriter "   ${GREEN}•${RESET} 3 seeding pools (Claude, GPT, OpenRouter)"
typewriter "   ${GREEN}•${RESET} Automated challenge creation from GH issues/PRs"
typewriter "   ${GREEN}•${RESET} Scoring rubrics with automated evaluation"
typewriter "   ${GREEN}•${RESET} Leaderboard with per-harness breakdowns"

echo ""
typewriter "${GREEN}Recent Git Activity:${RESET}"
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

typewriter "${YELLOW}You are now in the projects/agentelo directory${RESET}"
typewriter "${DIM}Use ls, tree, cat, nvim, or other commands to explore the actual git repository of this project,${RESET}"
typewriter "${DIM}or type home to go back to the home page ${RESET}"
echo ""
