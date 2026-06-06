---
name: agent-architecture-audit
title: エージェントアーキテクチャ監査
description: エージェントおよび LLM アプリケーション向けのフルスタック診断。12 層のエージェントスタックにおけるラッパーリグレッション、メモリ汚染、ツール規律の失敗、隠れた修復ループ、レンダリング破損を監査します。重要度順の発見事項とコードファーストの修正を生成します。エージェントアプリケーション、自律ループ、または LLM を活用した機能を構築する開発者に必須です。
domain: 智能/eval
triggers: []
tags: [eval, agent]
level: advanced
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [ai-engineering-toolkit, agent-tool-design, agent-memory-architecture, skill-optimizer]
combines_with: [langfuse-llm-observability, llm-agent-benchmarking, coding-agent-headtohead-eval]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
# Agent Architecture Audit

A diagnostic workflow for agent systems that hide failures behind wrapper layers, stale memory, retry loops, and transport/rendering mutations.

## When to Use

**Required when:**
- Before shipping an agent or LLM-powered application to production
- Before releasing a feature that involves tool calls, memory, or multi-step workflows
- When agent behavior degrades after a wrapper layer is added
- When users report that "the agent is getting worse" or "the tools are flaky"
- When the same model works in the playground but breaks inside the wrapper
- When you have spent more than 15 minutes debugging agent behavior without finding the root cause

**Especially important when:**
- A new prompt layer, tool definition, or memory system has been added
- Different agents in the system behave inconsistently
- A model that worked yesterday is hallucinating today
- You suspect a hidden repair/retry loop that silently mutates responses

**Do not use when:**
- General code debugging — use `agent-introspection-debugging`
- Code review — use a language-specific review agent
- Security scanning — use `security-review` or `security-review/scan`
- Benchmarking agent performance — use `agent-eval`
- Building a new feature — use the appropriate workflow skill

## The 12-Layer Stack

Every agent system has these layers. Any of them can break the answer:

| # | Layer | What can go wrong |
|---|-------|----------------|
| 1 | System prompt | Contradictory instructions, instruction bloat |
| 2 | Session history | Stale context injected from previous turns |
| 3 | Long-term memory | Cross-session contamination; old topics bleed into new conversations |
| 4 | Distillation | Compressed artifacts re-injected as pseudo-facts |
| 5 | Active recall | Redundant re-summarization layers that waste context |
| 6 | Tool selection | Wrong tool routing; the model skips a required tool |
| 7 | Tool execution | Hallucinated execution — the model claims it called a tool but never did |
| 8 | Tool interpretation | Tool output misread or ignored |
| 9 | Answer formatting | Format corruption in the final response |
| 10 | Platform rendering | Transport-layer mutation (UI, API, or CLI mutates a valid answer) |
| 11 | Hidden repair loop | A silent fallback/retry agent runs a second LLM pass |
| 12 | Persistence | Expired state or cached artifacts reused as live evidence |

## Common Failure Patterns

### 1. Wrapper Regression

The base model produces the correct answer, but a wrapper layer makes it worse.

**Symptoms:**
- Works fine in the playground or via direct API calls, but breaks inside the agent
- Adding a new prompt layer degraded existing behavior
- The agent is confident — but confidently wrong
- "It was working before the last update"

### 2. Memory Contamination

Old topics leak into new conversations through history, memory retrieval, or distillation.

**Symptoms:**
- The agent brings up unrelated past topics
- User corrections do not stick (old memory overwrites the new one)
- Artifacts from the same session are re-injected as pseudo-facts
- Memory grows unbounded and response quality degrades over time

### 3. Tool Discipline Failure

Tools are declared in the prompt but not enforced in code. The model skips them or hallucinates execution.

**Symptoms:**
- The prompt says "always use tool X," but the model answers without calling it
- Tool results look correct but were never actually executed
- Different tools compete over the same responsibility
- The model uses a tool when it shouldn't, or skips it when it should

### 4. Rendering / Transport Corruption

The agent's internal answer is correct, but a platform layer mutates it in transit.

**Symptoms:**
- Logs show the correct answer, but the user sees broken output
- Markdown rendering, JSON parsing, or streaming fragments corrupt a valid response
- A hidden fallback agent silently replaces the answer before delivery
- Output differs between the terminal and the UI

### 5. Hidden Agent Layers

Silent repair, retry, summarization, or recall agents run without an explicit contract.

**Symptoms:**
- Output changes between internal generation and user delivery
- An "auto-correct" loop runs a second LLM pass the user never sees
- Multiple agents modify the same output without coordination
- Answers are "smoothed" or "corrected" by an invisible layer

## Audit Workflow

### Phase 1: Scope

Define what is being audited:

- **Target system** — Which agent application?
- **Entry points** — How do users interact with it?
- **Model stack** — Which LLMs and providers?
- **Symptoms** — What are users reporting?
- **Time window** — When did it start?
- **Layers to audit** — Which of the 12 layers apply?

### Phase 2: Evidence Collection

Gather evidence from the codebase:

- **Source code** — agent loop, tool router, memory admission, prompt assembly
- **Logs** — past session traces, tool call records
- **Configuration** — prompt templates, tool schemas, provider settings
- **Memory files** — SOPs, knowledge base, session archives

Use `rg` to search for anti-patterns:

```bash
# Tool requirements expressed only in prompt text (not in code)
rg "must.*tool|必须.*工具|required.*call" --type md

# Tool execution without validation
rg "tool_call|toolCall|tool_use" --type py --type ts

# Hidden LLM calls outside the main agent loop
rg "completion|chat\.create|messages\.create|llm\.invoke"

# Memory admission without user-correction priority
rg "memory.*admit|long.*term.*update|persist.*memory" --type py --type ts

# Fallback loops that fire an extra LLM call
rg "fallback|retry.*llm|repair.*prompt|re-?prompt" --type py --type ts

# Silent output mutation
rg "mutate|rewrite.*response|transform.*output|shap" --type py --type ts
```

### Phase 3: Failure Mapping

For each finding, document:

- **Symptom** — what the user sees
- **Mechanism** — how the wrapper causes it
- **Source layer** — which of the 12 layers
- **Root cause** — the deepest cause
- **Evidence** — file:line or log:line reference
- **Confidence** — 0.0 to 1.0

### Phase 4: Fix Strategy

Default fix order (code-first, not prompt-first):

1. **Code-gate tool requirements** — enforce in code, not just prompt text
2. **Remove or shrink hidden repair agents** — make fallbacks explicit via a contract
3. **Reduce context duplication** — the same information carried through prompt, history, memory, and distillation
4. **Tighten memory admission** — user corrections > agent assertions
5. **Tighten distillation triggers** — don't compress what shouldn't be compressed
6. **Reduce rendering mutation** — pass through, don't transform
7. **Convert to typed JSON envelopes** — structured internal flow, not free-form prose

## Severity Model

| Level | Meaning | Action |
|-------|---------|--------|
| `critical` | The agent can confidently produce wrong operational behavior | Fix before the next release |
| `high` | The agent frequently degrades accuracy or stability | Fix this sprint |
| `medium` | Accuracy is usually preserved, but output is fragile or wasteful | Plan for the next cycle |
| `low` | Mostly cosmetic or maintainability issues | Backlog |

## Output Format

Present findings to the user in this order:

1. **Findings by severity** (most critical first)
2. **Architecture diagnosis** (which layer breaks what, and why)
3. **Prioritized fix plan** (code-first, not prompt-first)

Do not open with flattery or a summary. If the system is broken, say so directly.

## Quick Diagnostic Questions

When auditing an agent system, answer these:

| # | Question | If yes → |
|---|----------|----------|
| 1 | Can the model answer while skipping a required tool? | Tools are not code-gated |
| 2 | Does old conversation content appear in new turns? | Memory contamination |
| 3 | Is the same information in the system prompt, memory, and history? | Context duplication |
| 4 | Does the platform run a second LLM pass before delivery? | Hidden repair loop |
| 5 | Does output differ between internal generation and user delivery? | Rendering corruption |
| 6 | Is the "always use tool X" rule only in prompt text? | Tool discipline failure |
| 7 | Can the agent's own monologue become persistent memory? | Memory poisoning |

## Anti-Patterns to Avoid

- Avoid blaming the model before ruling out a wrapper-layer regression.
- Avoid blaming memory without showing the contamination path.
- Don't let a currently clean state erase what happened in a dirty past.
- Don't treat Markdown prose as a reliable internal protocol.
- Don't accept "always use the tool" prompt text when code doesn't enforce it.
- Keep findings direct, evidence-based, and ordered by severity.

## Report Schema

The audit should produce a structured report following this shape:

```json
{
  "schema_version": "ecc.agent-architecture-audit.report.v1",
  "executive_verdict": {
    "overall_health": "high_risk",
    "primary_failure_mode": "string",
    "most_urgent_fix": "string"
  },
  "scope": {
    "target_name": "string",
    "model_stack": ["string"],
    "layers_to_audit": ["string"]
  },
  "findings": [
    {
      "severity": "critical|high|medium|low",
      "title": "string",
      "mechanism": "string",
      "source_layer": "string",
      "root_cause": "string",
      "evidence_refs": ["file:line"],
      "confidence": 0.0,
      "recommended_fix": "string"
    }
  ],
  "ordered_fix_plan": [
    { "order": 1, "goal": "string", "why_now": "string", "expected_effect": "string" }
  ]
}
```

## Related Skills

- `agent-introspection-debugging` — debug agent runtime failures (loops, timeouts, state errors)
- `agent-eval` — head-to-head benchmarking of agent performance
- `security-review` — security audit of code and configuration
- `autonomous-agent-harness` — set up autonomous agent operation
- `agent-harness-construction` — build an agent harness from scratch
