#!/bin/bash
source "$(dirname "$0")/shared-functions.sh"
emit_url "about"

echo ""
create_box "About Me" "Hi, I'm Tim. I'm based in San Francisco, CA, and I work on AI agent tooling.
Recent projects include agentelo (a multi-model agent leaderboard), hone
(prompt-honing harness), and harness/harness-bench (agent benchmarking).

In my spare time I tinker with side projects like the one you're reading.

type projects to see what I'm working on
type contact to get in touch" "$PURPLE" 80
echo ""
