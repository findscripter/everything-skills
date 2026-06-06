---
name: git-worktrees-workflow
title: Git Worktrees Parallel Workspace
description: Set up an isolated git worktree to work on multiple branches in parallel without stashing or switching: pick a directory (existing > CLAUDE.md > ask), verify it is gitignored, create the worktree, run project setup, and confirm a clean test baseline. Triggers: git worktree, paral
domain: 研发/devops
triggers: [git worktree add, work on multiple branches simultaneously, isolated workspace, don't want to switch branches, where to put worktree directory, verify worktree is gitignored, git check-ignore, separate working directory for a new branch, parallel feature development]
tags: [devops, git, worktree, parallel-development, branch-management, workspace-isolation, developer-productivity]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## When to use

Git worktrees create isolated workspaces that share the same repository, letting you work on multiple branches simultaneously without switching.

Use this skill when:

- You need to work on **several branches at the same time** (e.g. fixing a production bug while advancing a feature) and don't want `git stash` or branch-switching to disrupt the current state.
- You want a **physically isolated working directory** for a new branch that shares the same `.git` (avoiding the size and fetch cost of a fresh clone).
- You want long-running tasks (builds, tests, AI code generation) to run in a separate directory without polluting the main workspace.

Do **not** use it when:

- Development is single-branch and sequential and switching is free — just `git switch`.
- You only need to shelve a few lines of changes temporarily — `git stash` is lighter.
- You need a **fully independent** copy of the repo (separate `.git`, separate remote) — that is `git clone`, not a worktree.

**Core principle:** systematic directory selection + safety verification (ensure it is gitignored) = reliable isolation.

**Announce at start:** "I'm using the git-worktrees skill to set up an isolated workspace."

## Steps

### 1. Select the worktree directory (priority order, stop on first hit)

```bash
# Check in priority order
ls -d .worktrees 2>/dev/null     # Preferred (hidden)
ls -d worktrees 2>/dev/null      # Alternative
```

**If found:** use that directory. If both exist, `.worktrees` wins.

```bash
# No existing directory -> check CLAUDE.md preference; use it without asking if present
grep -i "worktree.*director" CLAUDE.md 2>/dev/null
```

If still undecided, ask the user:

```
No worktree directory found. Where should I create worktrees?

1. .worktrees/ (project-local, hidden)
2. ~/.config/<tool>/worktrees/<project-name>/ (global location)

Which would you prefer?
```

| Situation | Action |
|-----------|--------|
| `.worktrees/` exists | Use it (verify ignored) |
| `worktrees/` exists | Use it (verify ignored) |
| Both exist | Use `.worktrees/` |
| Neither exists | Check CLAUDE.md -> ask user |

### 2. Safety verification (project-local directories only)

**MUST verify the directory is ignored before creating the worktree**, otherwise worktree contents get tracked:

```bash
# Respects local, global, and system gitignore
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```

**If NOT ignored:** fix it immediately — add the appropriate line to `.gitignore`, commit the change, then proceed with creation.

For a global directory (outside the project), no `.gitignore` verification is needed.

### 3. Detect project name and create the worktree

```bash
project=$(basename "$(git rev-parse --show-toplevel)")

# Determine full path
case $LOCATION in
  .worktrees|worktrees)
    path="$LOCATION/$BRANCH_NAME"
    ;;
  ~/.config/<tool>/worktrees/*)
    path="~/.config/<tool>/worktrees/$project/$BRANCH_NAME"
    ;;
esac

# Create worktree with new branch and enter it
git worktree add "$path" -b "$BRANCH_NAME"
cd "$path"
```

### 4. Auto-detect and run project setup

Pick the command by which manifest file exists:

```bash
# Node.js
if [ -f package.json ]; then npm install; fi

# Rust
if [ -f Cargo.toml ]; then cargo build; fi

# Python
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
if [ -f pyproject.toml ]; then poetry install; fi

# Go
if [ -f go.mod ]; then go mod download; fi
```

### 5. Verify a clean baseline

Run the project-appropriate test command:

```bash
npm test
cargo test
pytest
go test ./...
```

- **If tests pass:** report ready.
- **If tests fail:** do **not** proceed on your own — report the failures and ask whether to investigate first or continue.

### 6. Report

Output the full worktree path, the number of passing tests, and the feature name ready to implement.

```
Worktree ready at <full-path>
Tests passing (<N> tests, 0 failures)
Ready to implement <feature-name>
```

Cleanup (after work is done): `git worktree remove <path>`, then delete the branch if needed. Use `git worktree list` to see all worktrees and `git worktree prune` to clear stale records.

## Example

```
You: I'm using the git-worktrees skill to set up an isolated workspace.

[Check .worktrees/ - exists]
[Verify ignored - git check-ignore confirms .worktrees/ is ignored]
[Create worktree: git worktree add .worktrees/auth -b feature/auth]
[Run npm install]
[Run npm test - 47 passing]

Worktree ready at /Users/me/myproject/.worktrees/auth
Tests passing (47 tests, 0 failures)
Ready to implement auth feature
```

## Notes

Common mistakes / red flags:

- **Never** create a project-local worktree without verifying it is ignored — the most common and dangerous mistake; worktree contents get tracked and pollute `git status`. Always run `git check-ignore` first.
- **Never** skip baseline test verification. Without a green baseline you can't distinguish newly introduced bugs from pre-existing ones — report failures and get explicit permission to proceed.
- **Never** assume a directory location when it is ambiguous. Strictly follow the priority: existing > CLAUDE.md > ask. Skipping the CLAUDE.md check violates project conventions.
- **Never** hardcode setup commands — auto-detect from project files (`package.json`, `Cargo.toml`, etc.); toolchains differ per project.
- The same branch cannot be checked out by two worktrees at once. Worktrees share the same object store and remote configuration.

## See also

- related: `git-advanced-workflows` — advanced Git flows (rebase/merge) that pair well with parallel worktrees
- related: `git-hooks-automation` — install commit/push hooks inside a worktree
- combines_with: `ci-cd-pipeline-builder` — validate pipeline baselines inside an isolated worktree without interference
- Pairs with cleanup skills (e.g. finishing-a-development-branch) after the work is complete
