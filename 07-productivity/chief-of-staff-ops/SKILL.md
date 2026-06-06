---
name: chief-of-staff-ops
title: Chief of Staff Ops
description: Use for cross-functional, multi-role founder/leader decisions: triage the question, score complexity, route to a single advisor role or convene a board meeting, synthesize outputs, and log the decision; not for single-domain questions with a clear answer, pure execution, or when 
domain: 协作/pm
triggers: [chief of staff, orchestrator, routing matrix, board meeting, multi-role coordination, complexity scoring, decision log, who should I ask, cross-functional decision, c-suite coordinator, advisor coordination, synthesis]
tags: [productivity, pm, orchestration, decision, c-suite, routing, multi-agent]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [chief-of-staff-orchestrator, boardroom-deliberation, multi-agent-orchestrator, office-hours-facilitator]
combines_with: [decision-log-recorder, task-decomposition-planner]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## When to use

The orchestration layer between a founder/leader and a set of expert "roles" (CFO, CTO, CPO, etc.). It reads the question, scores complexity, routes to the right role(s) or convenes a board meeting, synthesizes the inputs, and tracks decisions. Load company context for every interaction so you never give generic advice.

Use it when:
- It's unclear "who should answer" — you need to triage before delegating.
- A decision spans 2+ functions, carries major trade-offs or is irreversible, and needs multiple roles to weigh in before a roll-up.
- Roles may conflict and you need the disagreement surfaced explicitly so a human can decide.
- A reached decision must be logged and proactively re-flagged when its review date arrives.

Do NOT use it (negative boundaries):
- Single-domain questions with a clear answer — answer directly; don't run the orchestration flow.
- Pure execution / hands-on work (writing code, building a model) — that's what a routed-to role does, not this layer.
- No multi-role coordination needed, you just want deep advice from one specialty — invoke that role's skill directly.

## Steps

Session protocol (fixed flow for every interaction):

1. Load company context (no generic advice).
2. Score decision complexity.
3. Route to role(s), or trigger a board meeting.
4. Synthesize the outputs.
5. Log the decision if one was reached.

**Invocation syntax:**
```
[INVOKE:role|question]
```
Examples:
```
[INVOKE:cfo|What's the right runway target given our growth rate?]
[INVOKE:board|Should we raise a bridge or cut to profitability?]
```

**Loop Prevention Rules (CRITICAL):**
1. Chief of Staff cannot invoke itself.
2. Maximum depth: 2. Chief of Staff → Role → stop.
3. Circular blocking. A→B→A is blocked. Log it.
4. Board = depth 1. Roles at a board meeting do not invoke each other.
- If a loop is detected: return to the founder with "The advisors are deadlocked. Here's where they disagree: [summary]."

**Decision complexity scoring:**

| Score | Signal | Action |
|-------|--------|--------|
| 1–2 | Single domain, clear answer | 1 role |
| 3 | 2 domains intersect | 2 roles, synthesize |
| 4–5 | 3+ domains, major trade-offs, irreversible | Board meeting |

+1 for each: affects 2+ functions, irreversible, expected disagreement between roles, direct team impact, compliance dimension.

**Routing Matrix (summary — full rules in source `references/routing-matrix.md`):**

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

**Board Meeting Protocol:**
- Trigger: Score ≥ 4, or a multi-function irreversible decision.
- Rules: Max 5 roles. Each role gets one turn, no back-and-forth. Chief of Staff synthesizes. Conflicts are surfaced, not resolved — the founder decides.

**Synthesis (quick reference — full framework in source `references/synthesis-framework.md`):**
1. Extract themes — what 2+ roles agree on independently.
2. Surface conflicts — name disagreements explicitly; don't smooth them over.
3. Action items — specific, owned, time-bound (max 5).
4. One decision point — the single thing needing founder judgment.

**Decision log** — write to `~/.claude/decision-log.md`:
```
## Decision: [Name]
Date: [YYYY-MM-DD]
Question: [Original question]
Decided: [What was decided]
Owner: [Who executes]
Review: [When to check back]
```
At session start: if a review date has passed, flag it: "You decided [X] on [date]. Worth a check-in?"

## Example

**Input:** "Growth is slowing — should we raise a bridge or cut to profitability?"

1. Load context: current cash, burn rate, growth rate.
2. Score: spans finance + strategy + team, irreversible, expected role disagreement → 4–5.
3. Trigger a board meeting:
```
BOARD MEETING: Bridge vs. cut to profitability
Attendees: CFO, CEO, COO
Agenda: How many months of runway remain? Dilution/risk of bridge terms? What does cut-to-profitability require?

[INVOKE:cfo|At current burn, how many months of runway remain? Cash impact of each path?]
[INVOKE:ceo|From an investor-relations and direction standpoint, which path costs less?]
[INVOKE:coo|If we cut to profitability, which functions get cut and how much is saved?]
```
4. Synthesized output:
```
## What We Agree On
Less than 6 months of runway; both paths require immediate action.

## The Disagreement
CFO leans toward cutting (high certainty); CEO leans toward a bridge (preserve the growth narrative). At its core it's "certainty vs. optionality."

## Recommended Actions
1. Produce two financial models this week — CFO — 3 days
2. Sound out existing investors on bridge appetite — CEO — this week
...

## Your Decision Point
Certainty or optionality? Bridge = preserve growth but dilution + risk; cut = survive but the narrative takes a hit. No recommendation — just clear trade-offs.
```
5. Once decided, write to the decision log and set a review date.

## Notes

Quality checklist before delivering ANY output to the founder:
- Bottom line first — no preamble, no process narration.
- Company context loaded (not generic advice).
- Every finding has WHAT + WHY + HOW.
- Actions have owners and deadlines (no "we should consider").
- Decisions framed as options with trade-offs and a recommendation; conflicts named, not smoothed.
- Risks are concrete (if X → Y happens, costs $Z).
- No loops occurred; max 5 bullets per section — overflow goes to a reference doc.

Ecosystem awareness: the source skill positions itself as a routing layer over 28 skills (10 C-suite roles + 6 orchestration + 6 cross-cutting + 6 culture & collaboration). When you adopt this, map "roles" to your own team's functions or sub-skills — you don't need to copy the specific role roster.

## See also

- Source reference: `references/routing-matrix.md` — per-topic routing rules, complementary skill triggers, when to trigger a board.
- Source reference: `references/synthesis-framework.md` — full synthesis process, conflict types, output format.
- Companion upstream capabilities: cs-onboard (founder interview → company context), context-engine, board-meeting (multi-role deliberation), decision-logger (two-tier memory), agent-protocol (cross-role invocation and loop prevention).
- Related skills: chief-of-staff-orchestrator, boardroom-deliberation, multi-agent-orchestrator, office-hours-facilitator. Combines with: decision-log-recorder, task-decomposition-planner.
