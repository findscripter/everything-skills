---
name: premortem-plan-challenger
title: Pre-Mortem Plan Challenger
description: Stress-test a plan before committing irreversible resources by imagining it failed 12 months out and working backwards to surface risky assumptions, dependency chains, and reversibility — producing a vulnerability map with assumption ratings, kill switches, and hardening actions.
domain: 通用/thinking
triggers: [premortem, pre-mortem, plan challenge, bear case, assumption review, vulnerability map, kill switch, reversibility test, before the board, before investor review, stress test the plan, challenge report]
tags: [thinking, risk-assessment, decision-support, strategy, critical-thinking, general]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [executive-adversarial-mentor, boardroom-deliberation, business-assumption-stress-test, first-principles-assumption-auditor]
combines_with: [executive-adversarial-mentor, boardroom-deliberation, business-assumption-stress-test]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## When to use

Use this **before a plan absorbs irreversible resources** to find its weaknesses before reality does. The goal is not to kill the plan — it is to make it survive contact with reality.

Run a challenge:
- Before committing significant resources to a plan
- Before presenting to the board or investors
- When you notice you're only hearing positive feedback about the plan
- When the plan requires multiple external dependencies to align
- When there's pressure to move fast and "figure it out later"
- When you feel excited about the plan (excitement is a signal to scrutinize harder)

**Boundaries — don't use it when:**
- There is no concrete, readable plan yet, only a vague idea → write the plan down first, then challenge it
- The work has moved into pure execution with no room left to adjust
- What's actually needed is encouragement, emotional alignment, or team mobilization rather than risk-hunting
- You want to treat it as a "veto tool" to kill plans — it only produces a vulnerability map; the decision still belongs to people

## Steps

The core idea: most plans fail for predictable reasons — not bad luck, but bad assumptions (overestimated demand, underestimated complexity, dependencies nobody questioned, timing that made sense in a spreadsheet but not in the real world). The pre-mortem technique: **imagine it's 12 months from now and this plan failed spectacularly. Now work backwards. Why?** That's not pessimism — it's how you build something that doesn't collapse.

### Step 1: Extract core assumptions
Before you can test a plan, surface everything it assumes to be true. For each section, ask: What has to be true for this to work? What are we assuming about customer behavior, competitor response, and our own execution capability? What external factors does this depend on?

Common assumption categories:
- **Market assumptions** — size, growth rate, customer willingness to pay, buying cycle
- **Execution assumptions** — team capacity, velocity, no major hires needed
- **Customer assumptions** — they have the problem, they know they have it, they'll pay to solve it
- **Competitive assumptions** — incumbents won't respond, no new entrant, moat holds
- **Financial assumptions** — burn rate, revenue timing, CAC, LTV ratios
- **Dependency assumptions** — partner will deliver, API won't change, regulations won't shift

### Step 2: Rate each assumption
Rate every assumption on two dimensions.

**Confidence level (how sure you are it's true):** High (verified with data, customer conversations, market research) | Medium (directionally right but not validated) | Low (plausible but untested) | Unknown (we simply don't know)

**Impact if wrong (what happens if the assumption fails):** Critical (plan fails entirely) | High (major delay or cost overrun) | Medium (significant rework required) | Low (manageable adjustment)

### Step 3: Map vulnerabilities
**Vulnerability = Low/Unknown confidence × Critical/High impact.** These are not problems to ignore — they're the bets you're making. The question is whether you are making them **consciously**.

### Step 4: Find the dependency chain
Many plans fail not because any single assumption is wrong, but because multiple assumptions have to be right **simultaneously**. Map the chain: Does assumption B depend on assumption A being true first? If the first thing goes wrong, how many downstream things break? What's the critical path? What has zero slack?

### Step 5: Test the reversibility
For each critical vulnerability: if this assumption turns out wrong at month 3, what do you do? Can you pivot? Can you cut scope? Is money already spent? Are commitments already made? **The less reversible, the more rigorously you need to validate before committing.**

## Example

Produce a **Challenge Report: [Plan Name]** in this structure:

```
CORE ASSUMPTIONS (extracted)
1. [Assumption] — Confidence: [H/M/L/?] — Impact if wrong: [Critical/High/Medium/Low]
2. ...

VULNERABILITY MAP
Critical risks (act before proceeding):
• [#N] [Assumption] — WHY it might be wrong — WHAT breaks if it is

High risks (validate before scaling):
• ...

DEPENDENCY CHAIN
[Assumption A] → depends on → [Assumption B] → which enables → [Assumption C]
Weakest link: [X] — if this breaks, [Y] and [Z] also fail

REVERSIBILITY ASSESSMENT
• Reversible bets: [list]
• Irreversible commitments: [list — treat with extreme care]

KILL SWITCHES
What would have to be true at [30/60/90 days] to continue vs. kill/pivot?
• Continue if: ...
• Kill/pivot if: ...

HARDENING ACTIONS
1. [Specific validation to do before proceeding]
2. [Alternative approach to consider]
3. [Contingency to build into the plan]
```

**Worked example.** Input: a plan to "hire 5 engineers in 6 months and ship a new product line in Q3," with broadly optimistic feedback.

- Core assumption #3 "key engineers onboard within 6 weeks" — Confidence: Low — Impact: Critical
- Vulnerability: the hiring-cycle assumption is too optimistic and ignores a 3–6 month ramp; if a key role takes 4 months to fill, the Q3 dependency chain (hire → capacity → launch) shifts as a whole.
- Weakest link in the dependency chain: time-to-onboard → once it breaks, capacity and launch timing fail together.
- Kill switch: at day 30, if < 2 onboarded, cut launch scope; at day 60, if < 4, push launch to Q4.
- Hardening actions: start hiring early and lock 2 offers; prepare a "cut-scope MVP launch" alternative path.

**Challenge patterns by plan type (pick what's relevant):**
- **Product roadmap** — Are we building what customers will pay for, or what they said they wanted? Does the velocity estimate use real team capacity, not theoretical? What if the anchor feature takes 3× longer? Who owns decisions when requirements conflict?
- **Go-to-market** — What's the actual ICP conversion rate, not the hoped-for one? How many touches to close, and do you have the sales capacity? What if the first 10 deals take 3 months instead of 1? Is "land and expand" a real motion or a hope?
- **Hiring plan** — What if the key hire takes 4 months, not 6 weeks? Is the plan dependent on retaining specific people who might leave? Does it account for 3–6 months of ramp? What's the burn impact if headcount leads revenue by 6 months?
- **Fundraising plan** — What's your fallback if the lead investor passes? Have you modeled the timeline at 6 months, not 3? What's your runway at current burn if the round closes at the low end? What assumptions break if you raise 50% of the target?

**The hardest questions — the ones people skip:**
- "What's the bear case, not the base case?"
- "If this exact plan was run by a team we don't trust, would it work?"
- "What are we not saying out loud because it's uncomfortable?"
- "Who has incentives to make this plan sound better than it is?"
- "What would an enemy of this plan attack first?"

## Notes

- The output is **not permission to stop** — it's a vulnerability map. Now you can make conscious decisions: validate the risky assumptions, hedge the critical ones, or accept the bets you're making knowingly.
- Core stance: **unknown risks are dangerous; known risks are manageable.**
- Don't let it degrade into a line-by-line restatement of the plan or nitpicking complaints. Every vulnerability must land on "why it might be wrong + what breaks if it is + how to harden it."
- Prioritize the "Low confidence × High impact" quadrant and the zero-slack critical path; don't get distracted by a pile of low-impact minor issues.

## See also

- Pair with **assumption-validation / experiment-design** skills: turn the high-risk assumptions from the vulnerability map into testable experiments.
- Pair with **decision-review / investment-review** skills: fold the kill switches and hardening actions into a formal decision gate.
- Related: `executive-adversarial-mentor`, `boardroom-deliberation`, `business-assumption-stress-test`, `first-principles-assumption-auditor`.

---

Adapted from alirezarezvani/claude-skills (MIT license).
