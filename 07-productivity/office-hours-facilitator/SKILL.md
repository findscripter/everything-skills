---
name: office-hours-facilitator
title: Office Hours Facilitator (Six-Question Founder Interrogation)
description: Run a YC-style six-question written interrogation (problem/customer/distribution/defensibility/capital/founder fit) before any major decision, producing a one-page GREEN/YELLOW/RED brief and routing recommendation; use before launching a major initiative, fundraising, or a strate
domain: 协作/pm
triggers: [office hours, six-question interrogation, think before deciding, pre-initiative review, pre-fundraise self-check, strategic pivot assessment, is the problem framed, who is the ICP, why are you the one to do this, avoid solutionism, one-page brief]
tags: [collaboration, pm, decision-framework, founder-interrogation, yc office hours, forced-clarity, initiative-review, brief]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [boardroom-deliberation, business-assumption-stress-test, premortem-plan-challenger, executive-adversarial-mentor]
combines_with: [hard-call-advisor, andreessen-vc-lens]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
Adapted from `office-hours` (the `/cs:office-hours` command) in alirezarezvani/claude-skills. The core mechanism is a cognitive forcing function: before any analysis or advice, the founder/owner must answer six concrete questions **in writing**. Modeled on YC office hours — no analysis until the founder has done the thinking. Forcing clarity is itself the value: the goal is not to answer the questions, but to be caught out by them. This is what prevents drift into solutionism.

## When to use

Use it:
- Before starting any major initiative — a new project, fundraising, or a strategic pivot.
- When the owner is excited (excitement is a tell — pressure-test it).
- When the answer is "obvious" (the obvious answer is usually wrong).
- When a vague idea needs to converge into a single, routable, structured brief.

Do NOT use it (negative boundary):
- Small, single-domain questions whose answer is already clear — just answer or hand off to the right role; don't spin up all six questions.
- Pure execution tasks (no judgment in dispute) — no interrogation needed.
- Mechanical translation or information retrieval that involves no framing trade-offs.

## Steps

1. State the topic and require the owner to answer **all six questions in writing**, one by one (none may be skipped; no C-role or reviewer weighs in until all six are answered).
2. Check each answer against its kill-line (see each question's rejection criterion below). An answer that misses its line counts as unanswered.
3. Compile the answers into a one-page brief and assign a GREEN / YELLOW / RED assessment.
4. Route by assessment: GREEN → proceed to the next step (single-role review, or convene the boardroom); YELLOW → name which question(s) must be sharpened; RED → kill or redefine — do not proceed.

## Example

**The Six Questions** (each with its kill-line — miss it and the question counts as unanswered):

1. **Problem** — *Whose problem is this, and how do they describe it in their own words?* Not your framing — their words. If you can't quote a customer, you don't have a problem worth solving.
2. **Customer** — *Who is the ICP? Name one real person who would buy this today.* Real human, real company, real seat. If you can't name one, the ICP isn't ready.
3. **Distribution** — *How does the customer first hear your name?* Channel, intent, search query, friend, conference — name it. If the answer is "we'll figure out marketing later," the answer is no.
4. **Defensibility** — *If this works, what stops a competitor from copying it in 6 months?* Network effects, switching costs, data moat, regulatory moat, brand — pick one. "We'll execute better" is not a defense.
5. **Capital** — *What does this cost, when does it pay back, and what's the alternative use of the money?* Total spend, payback months, opportunity cost. If you don't know, don't approve it.
6. **Founder Fit** — *Why are you the right person to do this — and why does this matter enough to spend the next 3 years on it?* Founder-market fit is the strongest predictor of survival. If the answer is mercenary, the company will be too.

**One-page brief output format** (keep the source convention):

```markdown
# Office Hours Brief: <topic>
**Date:** YYYY-MM-DD
**Founder:** <name>

## 1. Problem
> [founder's verbatim answer]
## 2. Customer
> [founder's verbatim answer]
## 3. Distribution
> [founder's verbatim answer]
## 4. Defensibility
> [founder's verbatim answer]
## 5. Capital
> [founder's verbatim answer]
## 6. Founder Fit
> [founder's verbatim answer]

---
**Assessment** (one of):
- 🟢 GREEN — brief passes; proceed to the next step
- 🟡 YELLOW — sharpen Q[N] before proceeding
- 🔴 RED — kill or redefine; do not proceed
```

**Worked example** — Topic: "Should we build an internal data dashboard?"

- Q1 can't quote a customer; Q3 answers "once we build it, people will just use it" → Q1 and Q3 fail their kill-lines.
- Assessment: 🟡 YELLOW. Output: "Sharpen Q1 and Q3 first — get at least one verbatim pain quote from a target user, and spell out how they would first reach for it — then proceed."
- The owner fills both gaps and re-runs; it now passes → 🟢 GREEN, routed to a single-role product/data review.

**Routing (after GREEN):** single-function question → the corresponding single-role review; cross-functional question → produce the brief first, then convene the boardroom for multi-role deliberation.

## Notes

- Most bad decisions don't fail at execution — they fail at **framing**. Six concrete answers surface the framing weaknesses before anyone burns time on analysis.
- Answers must be **in writing** and in the owner's own words. Verbal hand-waving counts as unanswered.
- The assessment has exactly three levels — there is no "good enough." A YELLOW must name which question is weak and what is missing.
- This is an interrogation, not a questionnaire: the owner either fills the gaps or realizes the question wasn't ready.

## See also

- `chief-of-staff-orchestrator` (collaboration/pm): the chief of staff triggers this six-question interrogation when intake is unclear, then routes to a C-role or the boardroom once the brief passes.
- `executive-adversarial-mentor` (general/thinking): the sibling adversarial-interrogation mechanism; can further stress-test the argument after the six questions.
- `org-health-diagnostic`, `prd-spec-writer`, `task-decomposition-planner` (collaboration/pm): a GREEN brief feeds these downstream (org diagnosis, PRD, decomposition into execution).
