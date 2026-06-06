---
name: parallel-agent-hub
title: AgentHub — Parallel Multi-Agent Competition Hub
description: Spawn N parallel subagents that compete on the same task in isolated git worktrees, then rank by metric or LLM judge and merge the winner; use for parallel optimization, content variations, A/B drafts, or strategy exploration in a git repo.
domain: 智能/agents
triggers: [try multiple approaches, have agents compete, parallel optimization, spawn N agents, compare different solutions, fan-out, tournament, generate content variations, compare different drafts, A/B test copy, explore multiple strategies]
tags: [multi-agent, parallel-competition, git-worktree, subagent-orchestration, solution-selection, dag, llm-judge, agent-coordination]
level: advanced
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [autoresearch-optimization-agent, multi-agent-system-designer, autonomous-coding-agent-patterns, crewai-multi-agent]
combines_with: [git-worktrees-workflow, llm-judge-evaluation, langgraph-agent-framework]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## When to use

Use AgentHub when a task has multiple viable paths and parallel exploration beats single-threaded iteration. The main Claude Code session acts as the **coordinator**: it spawns N subagents that compete on the **same** task, each in an isolated git worktree, then evaluates results and merges the winner.

Typical scenarios:

- Performance / latency / size optimization — let agents explore different optimization routes, keep the best.
- Code refactoring, test-writing, and bug-fixing with competing approaches.
- Content creation: generate multiple copy/draft variations, A/B compare, pick the winner.
- Research exploration: try multiple strategies or hypotheses in parallel.

**Requires:** a git repo. **Do NOT use when:**

- The repo is not git — AgentHub depends entirely on git worktree + branch isolation.
- The task is a single deterministic solution with nothing to compare (parallelism only adds cost).
- Agents need to communicate/collaborate in real time — AgentHub deliberately isolates agents; they only write to the board for the coordinator (one-way).
- Conflicting global refactors that cannot be done in parallel on independent branches.

## Steps

The coordinator follows the lifecycle: `INIT → DISPATCH → MONITOR → EVALUATE → MERGE`.

**1. Init** — run `/hub:init` to create a session. Generates:
- `.agenthub/sessions/{session-id}/config.yaml` — task config
- `.agenthub/sessions/{session-id}/state.json` — state machine
- `.agenthub/board/` — message board channels
- Session ID is timestamp-based: `YYYYMMDD-HHMMSS`.

**2. Dispatch** — run `/hub:spawn`. For each agent 1..N: post the task assignment to `.agenthub/board/dispatch/`, then spawn via the Agent tool with `isolation: "worktree"`. Launch **ALL agents in a single message** (multiple Agent tool calls) for true parallelism — otherwise it degrades to serial. Then update session state to `running`:
```bash
python {skill_path}/scripts/session_manager.py --update {session-id} --state running
```

**3. Monitor** — run `/hub:status`: `dag_analyzer.py --status --session {id}` shows branch state; the board `progress/` channel has agent updates.

**4. Evaluate** — run `/hub:eval` to rank results (metric / judge / hybrid — see below).

**5. Merge** — run `/hub:merge`: `git merge --no-ff` the winner into the base branch, tag losers (`git tag hub/archive/{session}/agent-{i}`), clean up worktrees, and post the merge summary to the board.

One-shot lifecycle: `/hub:run` (init → baseline → spawn → eval → merge).

### Slash commands

| Command | Description |
|---------|-------------|
| `/hub:init` | Create a new collaboration session — task, agent count, eval criteria |
| `/hub:spawn` | Launch N parallel subagents in isolated worktrees |
| `/hub:status` | Show DAG state, agent progress, branch status |
| `/hub:eval` | Rank agent results by metric or LLM judge |
| `/hub:merge` | Merge winning branch, archive losers |
| `/hub:board` | Read/write the agent message board |
| `/hub:run` | One-shot lifecycle: init → baseline → spawn → eval → merge |

### Agent templates (`--template`, defined in `references/agent-templates.md`)

| Template | Pattern | Use case |
|----------|---------|----------|
| `optimizer` | Edit → eval → keep/discard → repeat x10 | Performance, latency, size |
| `refactorer` | Restructure → test → iterate until green | Code quality, tech debt |
| `test-writer` | Write tests → measure coverage → repeat | Test coverage gaps |
| `bug-fixer` | Reproduce → diagnose → fix → verify | Bug fix approaches |

When using a template, replace all `{variables}` with values from the session config, and assign each agent a **different strategy** — diverse strategies maximize the value of parallel exploration.

### DAG model

Branch naming (append-only, immutable): `hub/{session-id}/agent-{N}/attempt-{M}` (attempt M increments on retry, usually 1).

Frontier = branch tips with no child branches (AgentHub's "leaves" query):
```bash
python scripts/dag_analyzer.py --frontier --session {id}
```

Immutability: never rebase or force-push agent branches; never delete commits (only branch refs after archival); every approach is preserved via git tags.

### Message board (`.agenthub/board/`)

| Channel | Writer | Reader | Purpose |
|---------|--------|--------|---------|
| `dispatch/` | Coordinator | Agents | Task assignments |
| `progress/` | Agents | Coordinator | Status updates |
| `results/` | Agents + Coordinator | All | Final results + merge summary |

Board rules: append-only (never edit or delete posts); unique filenames `{seq:03d}-{author}-{timestamp}.md`; YAML frontmatter required on all posts.

### Subagent prompt pattern

```
You are agent-{i} in hub session {session-id}.
Your task: {task description}

Instructions:
1. Read your assignment at .agenthub/board/dispatch/{seq}-agent-{i}.md
2. Work in your worktree — make changes, run tests, iterate
3. Commit all changes with descriptive messages
4. Write your result summary to .agenthub/board/results/agent-{i}-result.md
5. Exit when done
```

Agents do NOT see each other's work and do NOT communicate with each other — they only write to the board for the coordinator to read.

### Evaluation modes

- **Metric-based** (benchmarks, test pass rates, file sizes, response times) — the ranker runs the eval command in each agent's worktree and parses the metric from stdout:
  ```bash
  python scripts/result_ranker.py --session {id} \
    --eval-cmd "pytest bench.py --json" \
    --metric p50_ms --direction lower
  ```
- **LLM judge** (code quality, readability, architecture) — the coordinator reads each agent's diff (`git diff base...agent-branch`) and ranks by: 1) Correctness, 2) Simplicity (fewer lines changed preferred), 3) Quality.
- **Hybrid** — run metric first; if top agents are within 10% of each other, use the LLM judge to break ties.

### Session state machine (`session_manager.py`)

`init → running → evaluating → merged` (or `→ archived` when there is no winner).

### Core scripts

| Script | Purpose |
|--------|---------|
| `hub_init.py` | Initialize `.agenthub/` structure and session |
| `dag_analyzer.py` | Frontier detection, DAG graph, branch status |
| `board_manager.py` | Message board CRUD (channels, posts, threads) |
| `result_ranker.py` | Rank agents by metric or diff quality |
| `session_manager.py` | Session state machine and cleanup |

## Example

**Scenario: optimize an O(n²) sort to be faster.**

1. `/hub:init`: task = "optimize sort performance", agent-count = 3, eval metric = `p50_ms` (direction `lower`).
2. `/hub:spawn --template optimizer`: 3 agents each try in their own worktree (hash map / different algorithm / SIMD, etc.).
3. Each agent writes its result back to the board:
   ```markdown
   ---
   author: agent-1
   timestamp: 2026-03-17T14:30:22Z
   channel: results
   parent: null
   ---

   ## Result Summary

   - **Approach**: Replaced O(n²) sort with hash map
   - **Files changed**: 3
   - **Metric**: 142ms (baseline: 180ms, delta: -38ms)
   - **Confidence**: High — all tests pass
   ```
4. `/hub:eval`: `result_ranker` runs the benchmark in each worktree and ranks; the best wins (142ms).
5. `/hub:merge`: `git merge --no-ff` the winner into the base branch; archive losers with `git tag hub/archive/{session}/agent-{i}`; clean up worktrees.

## Notes

- **Requires a git repo** — cannot be used outside git.
- **Agents are isolated**: they do not see each other's work or communicate; they only write one-way to the board for the coordinator.
- **The DAG is append-only/immutable**: do not rebase / force-push agent branches; do not delete commits.
- Always **spawn all agents in ONE message** for true parallelism; `isolation: "worktree"` is mandatory (each agent needs its own filesystem); never modify session config after spawn.
- Proactive coordinator triggers:

  | Signal | Action |
  |--------|--------|
  | All agents crashed | Post failure summary, suggest retry with different constraints |
  | No improvement over baseline | Archive session, suggest different approaches |
  | Orphan worktrees detected | Run `session_manager.py --cleanup {id}` |
  | Session stuck in `running` | Check board for progress, consider timeout |
- Board posts must carry YAML frontmatter, have unique filenames, and never be edited or deleted.

## See also

- **autoresearch-agent** — single-agent optimization loop (use AgentHub when you want N agents competing).
- **self-improving-agent** — self-modifying agent (use AgentHub when you want external competition).
- **git-worktree-manager** — git worktree utilities (AgentHub uses worktrees internally).

---
Adapted from alirezarezvani/claude-skills (MIT license).
