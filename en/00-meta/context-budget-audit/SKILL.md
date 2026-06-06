---
name: context-budget-audit
title: コンテキストバジェット
description: エージェント、スキル、MCPサーバー、ルールにわたってClaude Codeのコンテキストウィンドウ消費を監査します。肥大化、冗長なコンポーネントを特定し、優先順位付けされたトークン節約の推奨事項を生成します。
domain: 通用/thinking
triggers: [context budget, /context-budget, context overhead]
tags: []
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [context-window-management, context-compression, skill-optimizer, agent-architecture-audit]
combines_with: [skill-optimizer, cost-aware-llm-pipeline, agent-architecture-audit]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
# Context Budget

Analyzes the token overhead of every component loaded in a Claude Code session and shows actionable optimizations for reclaiming context space.

## When to use

- When session performance is degrading or output quality is dropping
- After adding many skills, agents, or MCP servers
- When you want to know how much context headroom you actually have
- When you plan to add components and want to check whether there is room
- When running the `/context-budget` command (this skill backs it)

## How it works

### Phase 1: Inventory

Scan every component directory to estimate token consumption:

**Agents** (`agents/*.md`)
- Count lines and tokens per file (word count × 1.3)
- Extract the length of the `description` frontmatter
- Flag: files over 200 lines (heavy), descriptions over 30 words (bloated frontmatter)

**Skills** (`skills/*/SKILL.md`)
- Count tokens per SKILL.md
- Flag: files over 400 lines
- Check for duplicate copies under `.agents/skills/` — skip identical copies to avoid double-counting

**Rules** (`rules/**/*.md`)
- Count tokens per file
- Flag: files over 100 lines
- Detect content overlap between rule files within the same language module

**MCP servers** (`.mcp.json` or the active MCP config)
- Count the number of configured servers and the total tool count
- Estimate schema overhead at roughly 500 tokens per tool
- Flag: servers with 20+ tools, and servers that wrap simple CLI commands (`gh`, `git`, `npm`, `supabase`, `vercel`)

**CLAUDE.md** (project + user level)
- Count tokens per file across the CLAUDE.md chain
- Flag: a combined total over 300 lines

### Phase 2: Classification

Sort every component into buckets:

| Bucket | Criteria | Action |
|--------|----------|--------|
| **Always needed** | Referenced in CLAUDE.md, backs an active command, or matches the current project type | Keep |
| **Sometimes needed** | Domain-specific (e.g., language patterns), not referenced in CLAUDE.md | Consider on-demand activation |
| **Rarely needed** | No command reference, content overlap, or no obvious project match | Remove or lazy-load |

### Phase 3: Problem detection

Identify the following problem patterns:

- **Bloated agent descriptions** — a description over 30 words in the frontmatter is loaded on every Task tool call
- **Heavy agents** — files over 200 lines inflate the Task tool context on every spawn
- **Redundant components** — skills that duplicate agent logic, rules that duplicate CLAUDE.md
- **MCP over-subscription** — 10+ servers, or servers that wrap CLI tools available for free
- **CLAUDE.md bloat** — redundant explanations, stale sections, instructions that should be rules

### Phase 4: Report

Generate a context budget report:

```
Context Budget Report
═══════════════════════════════════════

Total estimated overhead: ~XX,XXX tokens
Context model: Claude Sonnet (200K window)
Effective available context: ~XXX,XXX tokens (XX%)

Component Breakdown:
┌─────────────────┬────────┬───────────┐
│ Component       │ Count  │ Tokens    │
├─────────────────┼────────┼───────────┤
│ Agents          │ N      │ ~X,XXX    │
│ Skills          │ N      │ ~X,XXX    │
│ Rules           │ N      │ ~X,XXX    │
│ MCP tools       │ N      │ ~XX,XXX   │
│ CLAUDE.md       │ N      │ ~X,XXX    │
└─────────────────┴────────┴───────────┘

WARNING: Issues Found (N):
[ranked by token savings]

Top 3 Optimizations:
1. [action] → save ~X,XXX tokens
2. [action] → save ~X,XXX tokens
3. [action] → save ~X,XXX tokens

Potential savings: ~XX,XXX tokens (XX% of current overhead)
```

In verbose mode, it also outputs the token count per file, a line-by-line breakdown of the heaviest files, the specific redundant lines between overlapping components, and an MCP tool list with per-tool schema size estimates.

## Examples

**Basic audit**
```
User: /context-budget
Skill: Scans setup → 16 agents (12,400 tokens), 28 skills (6,200), 87 MCP tools (43,500), 2 CLAUDE.md (1,200)
       Flags: 3 heavy agents, 14 MCP servers (3 CLI-replaceable)
       Top saving: remove 3 MCP servers → -27,500 tokens (47% overhead reduction)
```

**Verbose mode**
```
User: /context-budget --verbose
Skill: Full report + per-file breakdown showing planner.md (213 lines, 1,840 tokens),
       MCP tool list with per-tool sizes, duplicated rule lines side by side
```

**Pre-expansion check**
```
User: I want to add 5 more MCP servers, do I have room?
Skill: Current overhead 33% → adding 5 servers (~50 tools) would add ~25,000 tokens → pushes to 45% overhead
       Recommendation: remove 2 CLI-replaceable servers first to stay under 40%
```

## Best practices

- **Token estimation**: use `word count × 1.3` for prose and `character count / 4` for code-heavy files
- **MCP is the biggest lever**: each tool schema costs roughly 500 tokens. A 30-tool server costs more than all your skills combined
- **Agent descriptions are always loaded**: even if an agent is never invoked, its description field lives in every Task tool's context
- **Verbose mode is for debugging**: use it when you need to pinpoint exactly which file is driving overhead, not for routine audits
- **Audit after changes**: run it after adding agents, skills, or MCP servers to catch creep early
