#!/bin/bash
source "$(dirname "$0")/shared-functions.sh"

clear
echo ""
ascii_typewriter "flt" "DOS_Rebel" "${GREEN}"

echo ""

create_box "Description" "CLI tool that spawns and orchestrates AI coding agents across
6 harnesses (Claude Code, Codex, Gemini CLI, Aider, OpenCode, SWE-agent)
in tmux. Agents can message each other, spawn children, and report back." "${GREEN}"

echo ""

typewriter "${GREEN}Tech Stack:${RESET}"
animated_separator "~" 10 "${GREEN}"
typewriter "   ${GREEN}•${RESET} TypeScript, Bun (runtime)"
typewriter "   ${GREEN}•${RESET} tmux (session management)"
typewriter "   ${GREEN}•${RESET} Raw ANSI TUI with damage-tracked screen buffer"
typewriter "   ${GREEN}•${RESET} Custom CLI adapters for 6 AI harnesses"
typewriter "   ${GREEN}•${RESET} Git worktrees for agent isolation"

echo ""

typewriter "${GREEN}Key Features:${RESET}"
animated_separator "~" 10 "${GREEN}"
typewriter "   ${GREEN}•${RESET} 3-command API: spawn, send, kill"
typewriter "   ${GREEN}•${RESET} Inter-agent messaging and inbox"
typewriter "   ${GREEN}•${RESET} Auto-approval of permission prompts"
typewriter "   ${GREEN}•${RESET} Spinner/idle detection per harness"
typewriter "   ${GREEN}•${RESET} TUI with vim keybinds, themes, live logs"
typewriter "   ${GREEN}•${RESET} Cron integration for persistent agents"

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

typewriter "${YELLOW}You are now in the projects/flt directory${RESET}"
typewriter "${DIM}Use ls, tree, cat, nvim, or other commands to explore the actual git repository of this project,${RESET}"
typewriter "${DIM}or type home to go back to the home page ${RESET}"
echo ""
