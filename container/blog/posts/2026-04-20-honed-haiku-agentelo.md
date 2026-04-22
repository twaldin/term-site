---
title: gepa-honed claude haiku 4.5 climbs 7 ranks and 31 elo on my public coding-agent leaderboard
date: 2026-04-20
slug: 2026-04-20-honed-haiku-agentelo
---

Yesterday i wrote about [gepa](https://github.com/gepa-ai/gepa) optimizing the system prompt for claude haiku 4.5: 55% → 92% on a 20-bug training set, 65% → 85% on a 9-bug holdout. That was all same-model, same-cli, internal benchmark. Tonight i pushed the same honed prompt through [agentelo](https://tim.waldin.net/agentelo/leaderboard) — the public leaderboard — and had it fight the full field on 40 real github bugs, 2323 pairwise games. Final rating: ELO 1676, rank #18. Baseline `claude-code + haiku 4.5` sits at rank #25, ELO 1645.

The only thing that changed from the baseline haiku run is the CLAUDE.md GEPA produced. Same model (claude-haiku-4-5-20251001), same `claude` cli, 40 of the 42 active challenges (2 were zero-diff runs where the agent wrote nothing, not retriable). The honed prompt itself is the [6-step methodology in full here](https://github.com/twaldin/hone/blob/main/writeup/2026-04-18-haiku-20train-9holdout.md); the seed it evolved from was 14 words.

| rank | agent | ELO | notes |
| ---- | ----- | --- | ----- |
| #17 | claude-code + opus 4.6 | 1679 | — |
| **#18** | **claude-code + haiku 4.5 (honed)** | **1676** | **tonight's run** |
| #19 | opencode + qwen3.6-plus | 1676 | — |
| ... | | | |
| #22 | codex + gpt-5.4 | 1667 | — |
| #25 | claude-code + haiku 4.5 (baseline) | 1645 | — |
| #29 | aider + deepseek-r1 | 1625 | — |

Honed haiku is 3 elo behind claude-code + opus 4.6 on the same harness. Opus 4.6 costs around 18x more than haiku at list pricing ($15/$75 per Mtok vs $0.80/$4). A prompt-honed haiku is now basically within noise of opus 4.6 at an 18th of the cost.

More interesting to me: it also outranks seven agents using ostensibly stronger models. codex + gpt-5.4, multiple aider runs, a bunch of the opencode midweights. Same pattern from the [original 155-combo writeup](/blog/2026-04-20-agentelo-155-combos) keeps showing: the harness and the prompt matter more than the raw model you pair them with, by a huge margin.

The pipeline end-to-end: [harness](https://github.com/twaldin/harness) wraps the 6 coding CLIs (claude code, codex, opencode, gemini, aider, swe-agent) behind one python + typescript api. [hone](https://github.com/twaldin/hone) drives GEPA's pareto-frontier prompt evolution against a harness-powered mutator + grader loop. [agentelo](https://github.com/twaldin/agentelo) seeds each candidate across 40 real github PRs and scores against the fix pr's test suite. All three are on github; the entire thing costs approximately zero when you run haiku on a claude max subscription.

Earlier post with the internal benchmark (55 → 92% / 65 → 85%): [+20pp on untrained bugs](/blog/2026-04-19-hone-haiku-20pp). The full leaderboard with diffs for every agent's attempt: [tim.waldin.net/agentelo/leaderboard](https://tim.waldin.net/agentelo/leaderboard).
