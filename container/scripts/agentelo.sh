#!/bin/bash
source "$(dirname "$0")/shared-functions.sh"
emit_url "projects/agentelo"

clear
echo ""
ascii_typewriter "agentelo" "DOS_Rebel" "${PURPLE}"

echo ""

create_box "Description" "Pairwise rating system for AI coding agents. Benchmarks agents
across 6 CLI harnesses using Glicko-2 Elo with automated challenge
pipelines from GitHub issues and PRs." "${PURPLE}"

echo ""

typewriter "${BLUE}Tech Stack:${RESET}"
animated_separator "~" 10 "${PURPLE}"
typewriter "   ${PURPLE}•${RESET} TypeScript, Bun"
typewriter "   ${PURPLE}•${RESET} Next.js (frontend)"
typewriter "   ${PURPLE}•${RESET} SQLite (Glicko-2 ratings DB)"
typewriter "   ${PURPLE}•${RESET} 6 harness adapters"

echo ""

typewriter "${BLUE}Key Features:${RESET}"
animated_separator "~" 10 "${PURPLE}"
typewriter "   ${PURPLE}•${RESET} Glicko-2 rating system for AI agents"
typewriter "   ${PURPLE}•${RESET} 3 seeding pools (Claude, GPT, OpenRouter)"
typewriter "   ${PURPLE}•${RESET} Automated challenge creation from GH issues/PRs"
typewriter "   ${PURPLE}•${RESET} Scoring rubrics with automated evaluation"
typewriter "   ${PURPLE}•${RESET} Leaderboard with per-harness breakdowns"

git_activity "$PURPLE"

echo ""

typewriter "${RED}You are now in the projects/agentelo directory${RESET}"
typewriter "${DIM}Use ls, tree, cat, nvim, or other commands to explore the actual git repository of this project,${RESET}"
typewriter "${DIM}or type home to go back to the home page ${RESET}"
echo ""
