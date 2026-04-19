---
title: hone lifted Claude Haiku by 20 points on real GitHub bugs
date: 2026-04-19
slug: 2026-04-19-hone-haiku-20pp
---

I built a thing called [hone](https://github.com/twaldin/hone). It takes a
system prompt and a grader and evolves the prompt via GEPA, using whatever
AI coding CLI you already pay for (Claude Code, Codex, OpenCode) as the
mutation engine. No API keys needed.

Last night I ran it on Claude Haiku 4.5. The grader: fix 20 real GitHub
bugs (click, qs, marshmallow, jinja, koa, and friends — graded by
[agentelo](https://tim.waldin.net/agentelo/)). The starting prompt was
one sentence.

Then I held out 9 different bugs — challenges GEPA never saw — and ran
seed vs honed three times each to beat noise.

## the numbers

|                          | bare seed | honed  |
|--------------------------|-----------|--------|
| 20-bug training          | 55%       | **92%**|
| 9 unseen bugs × 3 samples| 65%       | **85%**|

+20 percentage points absolute, +30% relative, on bugs GEPA never
trained on. All 3 hold-out samples improved. Zero regressions.

Cost: roughly $1 in Sonnet mutator tokens on top of my Claude Max
subscription. Three GEPA iterations (plus the rejected mutations in
between). About seven hours wall time.

## what GEPA actually learned

Seed:

```
You are an AI coding agent fixing a bug in an open-source project.
Approach each task carefully and produce a minimal, correct fix.
```

Winner (candidate 2 of 4 after 3 iterations):

> 1. **Read ALL the failing tests first.** … note every failing test
>    case, not just the first one. Group the failures by type.
> 2. **Find the root cause.** … If multiple tests fail, check whether
>    they share a single root cause or require separate fixes.
> 3. **Fix the root cause, not the symptom.** … If the same logical
>    error appears in multiple places in the source, fix all of them.
> 4. **Handle edge cases.** (encoding, array notation, option flags)
> 5. **Verify all tests pass.** … Keep iterating until every
>    originally-failing test passes.
> 6. **Persist through partial fixes.** … Partial progress is not
>    success.

Every delta from iteration 1 to 2 targets one specific haiku failure
mode: stopping after the first failing test passes. Haiku sees one bug
fixed, declares victory, and leaves three more broken. Candidate 2
explicitly counters that, and the lift generalizes because the failure
mode isn't bug-specific — it's how haiku handles multi-failure scope
in general.

## what it does and doesn't prove

Proves:
- Prompt engineering on frontier-adjacent models (Haiku 4.5) still
  produces meaningful lifts on complex, multi-step agent tasks, not
  just toy benchmarks.
- GEPA finds nonobvious prompts. "Read ALL the failing tests first" is
  the kind of thing you'd write on your tenth iteration, not your
  first.
- The lift generalizes — a proper held-out set with multiple samples
  per challenge, not just training scores.

Doesn't prove:
- That bigger models benefit. GPT-5.4 in an earlier run stayed flat
  (seed 0.67, couldn't beat it) — the methodology was already priced
  in. Hone's value lives on weaker executors.
- That one prompt is universal. I only tested haiku. The weaker-model
  slate (gpt-5.4-mini, gemini-flash-lite, gpt-oss-120b, qwen3-coder)
  is the next experiment.
- That this replaces API-based optimizers. Hone is a thin CLI wrapper
  around GEPA. What it saves you is API billing, not algorithm
  research.

## try it

```
pip install hone

hone run prompt.md \
  --grader ./grader.sh \
  --mutator claude-code:sonnet \
  --budget 20
```

Honed prompt for claude haiku, full writeup, and raw GEPA state:
[github.com/twaldin/hone/writeup](https://github.com/twaldin/hone/tree/main/writeup)

Haiku's leaderboard entry with this prompt will appear on
[tim.waldin.net/agentelo](https://tim.waldin.net/agentelo/) as
`claude-code-haiku-honed` once I register it.
