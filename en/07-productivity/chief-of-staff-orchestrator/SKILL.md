---
name: chief-of-staff-orchestrator
title: Chief of Staff Orchestrator
description: Orchestration layer between a founder and a C-suite of advisor roles: scores decision complexity, routes to the right role(s) or convenes a board meeting, synthesizes outputs, and logs decisions. Triggers: chief of staff, orchestrator, routing, c-suite coordinator, board meeting,
domain: 协作/pm
triggers: [chief of staff, orchestrator, routing, route question to the right role, c-suite coordinator, board meeting, multi-advisor coordination, decision synthesis, decision log, how to call a complex decision, conflicting advisor opinions]
tags: [collaboration, pm, orchestration, routing, multi-agent, decision-management, chief-of-staff]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [boardroom-deliberation, org-health-diagnostic, company-operating-system, coo-operations-advisor]
combines_with: [boardroom-deliberation, org-health-diagnostic, executive-adversarial-mentor]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
Adapted from the `chief-of-staff` skill in alirezarezvani/claude-skills (MIT). This is the orchestration layer between a founder and a set of "C-suite advisor roles": read the question, score complexity, route to the right role(s) or convene a board meeting, deliver a synthesized output, and track the decision. Every C-suite interaction starts here, and it loads company context automatically.

## When to use

Use when:
- A question spans multiple functions (e.g. "raise a bridge or cut to profitability?" touches finance, growth, and team) and needs several specialist roles.
- A decision is major, irreversible, or expected to surface disagreement, and you want all viewpoints laid out before the founder decides.
- You need scattered advisor opinions integrated into a structured conclusion (consensus / conflict / action items / one decision point).
- You need to register and revisit key decisions.

Do NOT use (negative boundary):
- A single-domain question with a clear answer — hand it to the one relevant role or answer directly; no orchestration needed.
- Pure execution tasks with no judgment or disagreement, which need no multi-role coordination.
- Mechanical translation or information retrieval that involves no decision trade-offs.

## Steps

Session protocol (every interaction):
1. Load company/project context (so advice is grounded, not generic).
2. Score decision complexity.
3. Route to one role, two roles, or trigger a board meeting based on the score.
4. Synthesize the outputs.
5. Log the decision if one was reached.

Decision complexity scoring:

| Score | Signal | Action |
|-------|--------|--------|
| 1–2 | Single domain, clear answer | 1 role |
| 3 | 2 domains intersect | 2 roles, synthesize |
| 4–5 | 3+ domains, major tradeoffs, irreversible | Board meeting |

**+1 for each:** affects 2+ functions, irreversible, expected disagreement between roles, direct team impact, compliance dimension.

Routing matrix (summary):

| Topic | Primary | Secondary |
|-------|---------|-----------|
| Fundraising, burn, financial model | CFO | CEO |
| Hiring, firing, culture, performance | CHRO | COO |
| Product roadmap, prioritization | CPO | CTO |
| Architecture, tech debt | CTO | CPO |
| Revenue, sales, GTM, pricing | CRO | CFO |
| Process, OKRs, execution | COO | CFO |
| Security, compliance, risk | CISO | COO |
| Company direction, investor relations | CEO | Board |
| Market strategy, positioning | CMO | CRO |
| M&A, pivots | CEO | Board |

### Invocation syntax

```
[INVOKE:role|question]
```

Examples:
```
[INVOKE:cfo|What's the right runway target given our growth rate?]
[INVOKE:board|Should we raise a bridge or cut to profitability?]
```

### Loop prevention rules (CRITICAL — must follow)

1. **Chief of Staff cannot invoke itself.**
2. **Maximum depth: 2.** Chief of Staff → Role → stop.
3. **Circular blocking.** A→B→A is blocked. Log it.
4. **Board = depth 1.** Roles at a board meeting do not invoke each other.

If a loop is detected: return to the founder with "The advisors are deadlocked. Here's where they disagree: [summary]."

### Board meeting protocol

**Trigger:** Score ≥ 4, or a multi-function irreversible decision. Max 5 roles. Each role gets one turn, no back-and-forth. The Chief of Staff synthesizes. Conflicts are surfaced, not resolved — the founder decides.

```
BOARD MEETING: [Topic]
Attendees: [Roles]
Agenda: [2–3 specific questions]

[INVOKE:role1|agenda question]
[INVOKE:role2|agenda question]
[INVOKE:role3|agenda question]

[Chief of Staff synthesis]
```

### Synthesis (four steps)

1. **Extract themes** — what 2+ roles agree on independently.
2. **Surface conflicts** — name disagreements explicitly; don't smooth them over.
3. **Action items** — specific, owned, time-bound (max 5).
4. **One decision point** — the single thing needing founder judgment.

### Decision log

Track decisions to `~/.claude/decision-log.md`:

```
## Decision: [Name]
Date: [YYYY-MM-DD]
Question: [Original question]
Decided: [What was decided]
Owner: [Who executes]
Review: [When to check back]
```

At session start: if a review date has passed, flag it: *"You decided [X] on [date]. Worth a check-in?"*

## Example

Input: "We have 8 months of cash left. Should we raise a bridge or cut to profitability?"
- Scoring: spans finance + team + direction, irreversible, expected disagreement → score 4, trigger a board meeting.
- Routing: CFO (cash/runway), CEO (direction/investors), COO (execution/cuts).
- Output uses the standard format:

```
## What We Agree On
[2–3 consensus themes]

## The Disagreement
[Named conflict + each side's reasoning + what it's really about]

## Recommended Actions
1. [Action] — [Owner] — [Timeline]
...

## Your Decision Point
[One question. Two options with trade-offs. No recommendation — just clarity.]
```

## Notes

Quality standards — run this checklist before delivering ANY output to the founder:
- Bottom line is first — no preamble, no process narration.
- Company/project context loaded (not generic advice).
- Every finding has WHAT + WHY + HOW.
- Actions have owners and deadlines (no "we should consider").
- Decisions framed as options with trade-offs.
- Conflicts named, not smoothed.
- Risks are concrete (if X → Y happens, costs $Z).
- No loops occurred.
- Max 5 bullets per section — overflow to a reference file.

## See also

- Source references: `references/routing-matrix.md` (per-topic routing rules, complementary skill triggers, when to trigger a board) and `references/synthesis-framework.md` (full synthesis process, conflict types, output format).
- Ecosystem: in the source project the Chief of Staff orchestrates 28 skills (10 C-suite roles + 6 orchestration skills + 6 cross-cutting skills + 6 culture & collaboration skills). This entry focuses on its core routing + board + synthesis + decision-log mechanism.
- Related: boardroom-deliberation, org-health-diagnostic, company-operating-system, coo-operations-advisor. Combines with: boardroom-deliberation, org-health-diagnostic, executive-adversarial-mentor.

---
Adapted from alirezarezvani/claude-skills (MIT License).
