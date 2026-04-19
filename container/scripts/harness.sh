#!/bin/bash
source "$(dirname "$0")/shared-functions.sh"
emit_url "projects/harness"

clear
echo ""
ascii_typewriter "harness" "DOS_Rebel" "${CYAN}"

echo ""

create_box "Description" "Unified python interface for invoking 6 AI coding CLIs as subprocesses
— claude-code, opencode, codex, gemini, aider, swe-agent — behind one
\`RunSpec -> RunResult\` contract. Each CLI's quirks (env setup, flag
munging, cost/token parsing) lives in exactly one adapter file." "${CYAN}"

echo ""

typewriter "${CYAN}Tech Stack:${RESET}"
animated_separator "~" 10 "${CYAN}"
typewriter "   ${CYAN}•${RESET} Python (subprocess + per-CLI adapters)"
typewriter "   ${CYAN}•${RESET} \`harness run\` CLI with --json output"
typewriter "   ${CYAN}•${RESET} Pluggable registry — add a CLI by subclassing Adapter"
typewriter "   ${CYAN}•${RESET} Uniform token + cost reporting across providers"

echo ""

typewriter "${CYAN}Consumers:${RESET}"
animated_separator "~" 10 "${CYAN}"
typewriter "   ${CYAN}•${RESET} ${GREEN}hone${RESET} — mutator via \`harness:<cli>:<model>\` spec"
typewriter "   ${CYAN}•${RESET} ${GREEN}agentelo${RESET} — grader subprocess runner"
typewriter "   ${CYAN}•${RESET} ${GREEN}flt${RESET} — post-exit cost/token extraction (TS shell-out)"

echo ""
typewriter "${CYAN}Recent Git Activity:${RESET}"
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

typewriter "${YELLOW}You are now in the projects/harness directory${RESET}"
typewriter "${DIM}Read README.md for the full API + integration sketches, or type home to go back${RESET}"
echo ""
