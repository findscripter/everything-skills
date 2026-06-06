---
name: hard-call-advisor
title: Hard-Call Advisor: Framework for Decisions With No Good Options
description: Use for high-stakes, no-right-answer calls (layoffs, firing a co-founder, killing a product, pivoting, shutting down); runs a six-step framework (reversibility test → 10/10/10 → Andy Grove test → stakeholder mapping → pre-announcement test → communication plan) to force out the l
domain: 通用/thinking
triggers: [hard decision, decision with no good options, layoff decision, firing a co-founder, killing a product line, business pivot, shutting down company or business unit, a decision you keep delaying, irreversible decision, high-stakes call]
tags: [decision-framework, thinking-tool, leadership, executive, risk-assessment, stakeholders, communication-plan, general]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [structured-decision-framework, four-voice-decision-council, premortem-plan-challenger, decision-navigator]
combines_with: [boardroom-deliberation, executive-adversarial-mentor, decision-log-recorder]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## When to use

For the decisions that keep you up at 3am: firing a co-founder, laying off 20% of the team, killing a product that customers love, pivoting, shutting down. These decisions don't have a right answer — they have a *less wrong* answer. This framework helps you find it.

They're hard not because the data is unclear (it often is clear), but because:

1. **Real people are affected** — someone loses a job, a relationship ends, a team is hurt.
2. **You've been avoiding the decision** — which means the problem is already worse than it was.
3. **Irreversibility** — unlike most business decisions, you can't undo this easily.
4. **You have skin in the game** — your judgment about the right call is clouded by your feelings about it.

Core belief: **most hard decisions are late decisions.** The longer you wait, the worse the situation gets — the company that needed a 10% cut 6 months ago now needs a 25% cut; the co-founder conversation that should have happened at month 4 is happening at month 14.

**Do NOT use when:**
- The decision is reversible and low-risk → just try it, learn, and adjust. (Treating a reversible decision like it's irreversible is itself a form of avoidance.)
- It's a purely data-driven / routine operating decision (picking a vendor, adjusting price) → use ordinary decision methods.
- The step requires a definitive legal / financial / compliance conclusion → this framework helps you think it through, but does not replace your lawyer, CFO, or compliance expert.

## Steps

Run `/hard-call <decision>` and work through all six steps in order. Final output: (1) the "least wrong" option with reasoning, (2) the stakeholder impact map, (3) a ready-to-send communication / announcement plan.

### Step 1: The Reversibility Test (most important — do first)

The most important question first: **can you undo this?**

- **Reversible** — try it, learn, adjust (fire the vendor, kill the feature, change the strategy).
- **Partially reversible** — painful to undo but possible (restructure, change co-founder roles).
- **Irreversible** — cannot be undone (lay off a person, shut down a product with customer lock-in, close a legal entity).

For irreversible decisions, the bar for certainty is higher and you must do more due diligence before acting — not because you might be wrong, but because you can't take it back. **If you're treating a reversible decision like it's irreversible, you're avoiding it.**

### Step 2: The 10/10/10 Framework

Ask three questions about each option:

- **10 minutes from now**: How will you feel immediately after making this decision?
- **10 months from now**: What will the impact be? Will the problem be solved?
- **10 years from now**: When you look back, will this have been the right call?

The 10-minute feeling is usually the least reliable guide; the 10-year view usually clarifies what the right call actually is. **Most hard decisions look obvious at 10 years. The question is whether you can tolerate the 10-minute pain.**

### Step 3: The Andy Grove Test

Andy Grove's test for strategic decisions: *"If we got replaced tomorrow and a new CEO came in, what would they do?"*

A fresh set of eyes — no emotional investment in the current path, no sunk cost. What's the obvious right call from the outside? If the answer is clear to an outsider, the real question becomes: **why haven't you done it yet?**

### Step 4: Stakeholder Impact Mapping

For each option, map who's affected and how:

| Stakeholder | Option A Impact | Option B Impact | Their reaction |
|-------------|----------------|----------------|----------------|
| Affected employees | | | |
| Remaining team | | | |
| Customers | | | |
| Investors | | | |
| You | | | |

This isn't about finding the option that hurts nobody — there isn't one. It's about understanding the full picture before you decide.

### Step 5: The Pre-Announcement Test

Before making the decision, write the announcement: the email to the team, the message to the customer, the conversation you'll have.

**If you can't write that announcement, you're not ready to make the decision.**

Writing it forces you to confront the reality of what you're doing, and surfaces whether your reasoning holds under examination. "We're making this change because…" — does that sentence ring true?

### Step 6: The Communication Plan

Hard decisions almost always get harder if communication is bad. The decision itself is not the only thing that matters — *how* it's done matters enormously. For every hard call, plan:

- **Who needs to know first** — the person directly affected, before anyone else.
- **How you'll tell them** — in person when possible; never via email for personal impact.
- **What you'll say** — honest, direct, compassionate.
- **What they can ask** — be ready for every question.
- **What comes next** — give them a clear picture of what happens after.

## Example

**Scenario: whether to ask a co-founder to leave.**

First run the Avoiding-It Test (see Notes). If several signals hit, the rule is: **if you've been thinking about this for more than 3 months, you already know the answer — the question is *when*, not *whether*.** Then answer the key questions:

- Is this a *performance* problem or a *values/culture* problem? (Completely different conversations.)
- Have you been explicit — not hinted, but direct — about the problem?
- What does the cap table look like and what are the legal implications?
- Is there a role that works better for them, or is this a full exit?
- Who needs to know (board, team, investors) and in what order?

**"Iron rules" for other high-frequency hard calls:**

- **Layoffs** — Cut once, cut deep, cut with dignity. Uncertainty is worse than clarity; insufficient layoffs are worse than none (two rounds destroy trust). Is this a one-time reset or the start of a longer decline? Is severance fair? How do you keep the best people from leaving after?
- **Pivoting** — A pivot should be *pulled by evidence of new opportunity*, not *pushed by failure of the current path*. First distinguish a true pivot (new direction) from an optimization (same direction, different tactic). What are you keeping vs. abandoning, and how do you tell customers who bought the old vision?
- **Killing a product line** — First decide: what happens to current customers, what's the migration path, where do the people who built it go, and is "kill it" actually optimal (maybe "sell it" or "spin it out" is better)? What's the narrative, internally and externally?

## Notes

**The Avoiding-It Test** — you know you've been avoiding a hard call if:

- You've thought about it every week for more than a month.
- You're hoping the situation will "resolve itself."
- You're waiting for more data that you'll never feel is enough.
- You've had the conversation in your head many times but never in real life.
- Other people around you have noticed the problem.

**The cost of delay is almost always higher than the cost of the decision.** Every month you wait, the problem compounds: the co-founder who isn't working out becomes more entrenched, the product line that needs to die consumes more resources, the person who needs to be let go affects the people around them.

**Make the call. Make it clearly. Make it with dignity.**

## See also

- Before deciding, stress-test the plan with adversarial / pre-mortem skills (challenge assumptions, surface failure modes): `premortem-plan-challenger`, `executive-adversarial-mentor`.
- Structure the choice with `structured-decision-framework`, `four-voice-decision-council`, `decision-navigator`, or a `boardroom-deliberation`.
- After deciding, evaluate outcomes against your pre-set criteria with a retrospective, and log the call with `decision-log-recorder`.
- When board communication is involved, combine with board-preparation skills.
