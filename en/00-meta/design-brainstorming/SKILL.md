---
name: design-brainstorming
title: Brainstorming Ideas Into Validated Designs
description: Use before creative or constructive work (features, architecture, behavior changes) to turn vague ideas into clear, validated designs and specs via disciplined dialogue — not for already-specified work that only needs coding or for pure execution/debugging. Triggers: brainstorm, 
domain: 通用/thinking
triggers: [brainstorm, clarify requirements, design approach, design doc, feature design, architecture design, tech selection, validate idea before building]
tags: [design, requirements-analysis, brainstorming, decision, design-review, thinking, general]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [decision-navigator, first-principles-thinking, research-idea-generator]
combines_with: [spec-driven-workflow, tech-stack-evaluator, premortem-plan-challenger]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## When to use

Use this skill **before any creative or constructive work** (new features, architecture, behavior changes) to turn raw ideas into **clear, validated designs and specifications** through structured dialogue **before implementation begins**.

This skill exists to prevent: premature implementation, hidden assumptions, misaligned solutions, and fragile systems.

While this skill is active you are operating as a **design facilitator and senior reviewer**, not a builder. You are **not allowed** to implement, code, or modify behavior:

- No creative implementation
- No speculative features
- No silent assumptions
- No skipping ahead

Your job is to **slow the process down just enough to get it right**.

**When NOT to use:**

- Requirements are already clear and only coding or debugging remains — go straight to implementation.
- Pure execution tasks (fixing a bug, running a script, changing config).
- One-off trivial changes, where the full process would be wasteful overhead.

## Steps

### 1. Understand the current context (mandatory first step)

Before asking any questions, review the current project state (if available): files, documentation, plans, prior decisions. Identify what already exists vs. what is proposed, and note constraints that appear implicit but unconfirmed. **Do not design yet.**

### 2. Understand the idea (one question at a time)

Your goal here is **shared clarity**, not speed.

- Ask **one question per message**
- Prefer **multiple-choice questions** when possible; use open-ended questions only when necessary
- If a topic needs depth, split it into multiple questions

Focus on understanding: purpose, target users, constraints, success criteria, and explicit non-goals.

### 3. Non-functional requirements (mandatory)

You MUST explicitly clarify or propose assumptions for: performance expectations; scale (users, data, traffic); security or privacy constraints; reliability / availability needs; maintenance and ownership expectations. If the user is unsure, propose reasonable defaults and clearly mark them as **assumptions**.

### 4. Understanding lock (hard gate)

Before proposing **any design**, you MUST pause and produce:

- **Understanding Summary** — a concise 5–7 bullet summary covering: what is being built, why it exists, who it is for, key constraints, explicit non-goals.
- **Assumptions** — list all assumptions explicitly.
- **Open Questions** — list unresolved questions, if any.

Then ask, verbatim:

> "Does this accurately reflect your intent? Please confirm or correct anything before we move to design."

**Do NOT proceed until explicit confirmation is given.**

### 5. Explore design approaches

Once understanding is confirmed, propose **2–3 viable approaches**, lead with your **recommended option**, and explain trade-offs clearly (complexity, extensibility, risk, maintenance). Avoid premature optimization — **YAGNI ruthlessly**. This is still **not** final design.

### 6. Present the design (incrementally)

Break the design into sections of **200–300 words max**. After each section, ask:

> "Does this look right so far?"

Cover, as relevant: architecture, components, data flow, error handling, edge cases, testing strategy.

### 7. Decision log (mandatory)

Maintain a running **Decision Log** throughout the discussion. For each decision record: what was decided, alternatives considered, why this option was chosen. Preserve this log for documentation.

### After the design

- **Documentation** — once validated, write the final design to a durable, shared format (e.g. Markdown), including the understanding summary, assumptions, decision log, and final design. Persist according to the project's standard workflow.
- **Implementation handoff (optional)** — only after documentation is complete, ask: "Ready to set up for implementation?" If yes, create an explicit implementation plan, isolate work if the workflow supports it, and proceed incrementally.

## Example

User: "I want to add a report-export feature to the admin backend."

Correct approach (per this skill):

1. First review the existing project for related export/report code, data models, and the permission system (Step 1).
2. Clarify one multiple-choice question at a time, e.g. "How is export triggered? (A) user clicks manually (B) scheduled automatically (C) both" (Step 2).
3. Probe non-functional requirements: "Expected data volume per export? (A) under a thousand rows (B) tens of thousands (C) millions+" — the answer directly decides whether an async job is needed (Step 3).
4. Produce the Understanding Summary + Assumptions + Open Questions and ask the user to confirm (Step 4 hard gate).
5. After confirmation, propose 2–3 approaches, recommendation first: "Approach A synchronous generation (simple, fits small data); Approach B async queue + notification (scalable, higher complexity)…" (Step 5).
6. Present the design in sections, asking "Does this look right so far?" after each, while maintaining the Decision Log (Steps 6, 7).

Wrong approach: starting to write export code as soon as the user speaks — exactly the "premature implementation" this skill prevents.

## Notes

**Exit criteria (hard stop conditions).** You may exit brainstorming mode **only when all of the following are true**: Understanding Lock confirmed; at least one design approach explicitly accepted; major assumptions documented; key risks acknowledged; Decision Log complete. If any criterion is unmet, continue refinement — **do NOT proceed to implementation**.

**Key principles (non-negotiable):** one question at a time · assumptions must be explicit · explore alternatives · validate incrementally · prefer clarity over cleverness · be willing to go back and clarify · **YAGNI ruthlessly**.

- The mandatory first step (context review) cannot be skipped — asking without it reinvents existing constraints and wastes round-trips.
- Understanding Lock is a hard gate, not a courtesy check: without the user's explicit confirmation, do not move to design. Silent assumptions are explicitly forbidden.
- The output is design and specification; it is **not** a substitute for environment-specific validation, testing, or expert review.
- If required inputs, permissions, safety boundaries, or success criteria are missing, stop and ask for clarification rather than assuming.
- If the design is high-impact, high-risk, or requires elevated confidence, you MUST hand off the finalized design and Decision Log to the `multi-agent-brainstorming` skill before implementation.

## See also

- `multi-agent-brainstorming` — handoff target for high-risk / high-impact designs.
- Implementation-phase skills — only after this skill completes and the design is documented may you hand off to a concrete coding/implementation workflow.

---

Adapted from sickn33/antigravity-awesome-skills (MIT license).
