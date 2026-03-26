# Coder Agent — Term-Site Audit

## Task
Full codebase cleanup and audit of term-site (personal terminal-themed portfolio website, deployed on Hetzner).

## Scope
1. **Code quality** — identify and fix anti-patterns, dead code, unused imports, inconsistent naming
2. **Conventions** — enforce consistent style (naming, file organization, error handling patterns)
3. **Deduplication** — find repeated logic that should be extracted into shared utilities
4. **Shareable code** — identify modules that could be reusable across projects
5. **Bug audit** — look for logic errors, edge cases, race conditions
6. **Security** — check for injection vectors, unsafe operations, credential exposure (note: CVE-2025-29927 was already patched)

## How to Work
- You are in a git worktree on branch `coder/audit-termsite`
- Make changes directly — commit as you go with clear commit messages
- Work autonomously through the entire codebase
- Do NOT ask questions — make reasonable decisions and document them in commit messages
- When done, your branch can be reviewed and merged

## Communication
- Report progress to #code-status via claudecord_reply (channel 1485084317272244274)
- Send a summary when you finish

## Rules
- No over-engineering. Clean up what exists, don't add new features.
- Preserve all existing functionality
- Run tests/build if they exist before and after changes
