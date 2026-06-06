---
name: strategic-alignment-cascader
title: Strategic Alignment Cascader
description: Cascade strategy from boardroom to IC and detect/fix misalignment (orphan goals, conflicting OKRs, coverage gaps, silos); produce an alignment score and realignment plan. Use when teams pull in different directions, OKRs don't connect, or departments optimize locally at company e
domain: 协作/pm
triggers: [strategic alignment, strategy cascade, OKR alignment, orphan OKRs, conflicting goals, silos, coverage gap, communication gap, cross-functional OKR, realignment, alignment score, department alignment]
tags: [pm, okr, strategic-alignment, collaboration, org-diagnostic]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [company-operating-system, coo-operations-advisor, org-health-diagnostic, cpo-product-advisor]
combines_with: [company-operating-system, coo-operations-advisor, org-change-management]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## When to use

Use when any of these signals appear: teams pulling in different directions, OKRs that don't connect to each other, a department hitting local metrics while dragging down company goals, or strategy being announced without changing anyone's behavior. Typical triggers: a CEO/COO sets a new strategy that needs to cascade down, pre-OKR-cycle cross-team conflict checks, a team consistently hitting targets while the company misses, or two strategies coexisting after an M&A.

Core premise: **The further a goal gets from the strategy that created it, the less likely it reflects the original intent.** This is the organizational telephone game — it degrades at every layer. This skill detects misalignment before it becomes dysfunction and builds systems that keep strategy connected from CEO to individual contributor.

**Do NOT use for:**
- Individual performance scoring or stack ranking (this targets goal *structure*, not people).
- Crafting the strategy itself — if the source strategy isn't clear (fails Step 1), clarify the strategy first, then cascade.
- Capability diagnosis: a team missing consistently may be an alignment problem *or* a capability problem. Distinguish first (alignment gap → COO; capability gap → CHRO).

## Steps

**Step 1: Strategy Articulation Test (check the source first).**
Ask five people from five different teams: *"What is the company's most important strategic priority right now?"*
- All five give the same answer → articulation is clear.
- 3–4 give similar answers → loose alignment; clarify and communicate.
- < 3 agree → strategy isn't clear enough to cascade. Fix this before fixing cascade.

Format test: the strategy must be statable in one sentence.
- Bad: "We focus on product-led growth while maintaining enterprise relationships and expanding internationally and investing in platform capabilities."
- Good: "Win the mid-market healthcare segment in DACH before Series B."

**Step 2: Cascade Mapping.**
Map the flow `Company strategy → Department → Team → Individual`. For each goal at every level, ask: Which company-level goal does this support? If this goal is 100% achieved, how much does it move the company goal? Is the connection direct or theoretical?

**Step 3: Alignment Detection (three failure patterns).**
- **Orphan goals** — team/individual goals that connect to no company goal. Symptom: "We've worked on this a quarter and nobody above us cares." Fix: connect or cut. Every goal needs a parent.
- **Conflicting goals** — two teams' goals that, when both succeed, create a worse outcome (classic: Sales commits to volume contracts and closes bad-fit customers; CS satisfaction scores tank). Fix: cross-functional OKR review before the quarter begins, plus shared metrics where teams interact.
- **Coverage gaps** — company has 3 OKRs; 5 teams support OKR-1, 2 support OKR-2, 0 support OKR-3 → OKR-3 is unowned and will be missed. Fix: explicit ownership assignment.

**Step 4: Silo Identification.**
Signals: a department consistently hits goals while the company misses; teams don't know what other teams are doing; "that's not our problem"; escalations flow up but coordination never flows sideways; dependent teams don't share data. Root causes: incentive misalignment / no shared goals / no shared language / geography or time-zone separation.

**Step 5: Communication Gap Analysis.**
What the CEO says ≠ what teams hear, and the gap grows with company size. Decay model: CEO communicates → managers filter through their lens → teams receive a modified version → individuals interpret further. Gap sources: ambiguity ("grow the business" lets each team fill in its own meaning), insufficient frequency (one all-hands per quarter won't change behavior — needs 7+ exposures), medium mismatch, trust deficit. Detection: re-run the Step 1 articulation test across all levels and compare what leadership *thinks* it communicated vs. what teams say they heard.

**Step 6: Realignment Protocol.**
- 6a: Don't start with "here's our misalignment" (creates defensiveness). Start with "here's where we're heading and I want to make sure we're connected."
- 6b: Re-cascade in a workshop, not a memo — get company-level OKR owners and department leads in a room; map connections and find gaps together.
- 6c: Fix incentives before fixing goals — if department heads are rewarded for local metrics that conflict with company goals, no amount of goal-setting helps.
- 6d: Install a quarterly alignment check to prevent recurrence.

## Example

The source skill ships a Python checker, `alignment_checker.py`, that detects orphans, conflicts, and coverage gaps in JSON-formatted OKRs and returns a 0–100 alignment score:

```bash
python alignment_checker.py                       # Run with built-in sample data
python alignment_checker.py --file my_okrs.json   # Run against your own OKR data
python alignment_checker.py --sample              # Print the expected JSON format
```

**JSON input structure (key constraints):** top level has `quarter`, `company.okrs[]` (each with `id`, `objective`, `key_results[]`), `teams[]` (each team has `okrs[]`; every team OKR carries `parent_company_okr_id` and an optional `potential_conflicts[]`), plus an optional top-level `known_conflicts[]`.

**Detection rules:**
- `parent_company_okr_id` is `null` or points to a non-existent company OKR → flagged as an **orphan**.
- A company OKR supported by 0 teams → **coverage gap** (it will be missed); supported by ≥ 4 teams → **over-indexed** (check that other OKRs aren't being neglected).
- Score penalties: `orphan_ratio × 30 + gap_ratio × 30 + min(conflicts × 10, 30)`, subtracted from 100. Bands: ≥ 85 Excellent, ≥ 70 Moderate misalignment, ≥ 50 Significant misalignment, < 50 Critical.

Sample company "Acme Corp", Q2, has three company OKRs: C1 win the mid-market DACH healthcare segment; C2 ship the platform API for partner integrations; C3 build a capital-efficient growth engine. The checker surfaces:
- Sales S2 "Expand into Austria market" has `parent_company_okr_id: null` → **orphan**; connect it to C1 or cut it.
- Sales S1 (volume close) and CS's CS2 (reduce ticket volume) are listed in `known_conflicts` → **conflict**: volume closing brings bad-fit customers that raise CS tickets.

**Cross-functional guardrail metric (to break conflicts):** with a Sales goal of 15 new logos and a CS goal of churn < 2%, add a shared guardrail "new-customer 90-day churn < 5%" — Sales can't close unqualified customers and CS can't blame Sales for churn.

**One-page strategy template (compress before cascading):** 6-word vision + this quarter's Top 3 priorities (each with an owner) + "What we're NOT doing" + 3 success metrics. The "What we're NOT doing" section matters as much as the priorities; without it, every team adds its own.

## Notes

- **Cascade the WHY, not just the WHAT.** "Achieve €800K ARR in DACH" with no context produces different behavior than "Achieve €800K ARR in DACH to demonstrate product-market fit before our Series B in Q4."
- **Repetition is the solution, not the problem.** One all-hands isn't enough; research suggests 7+ exposures before a message changes behavior. Repeat the same message across formats: written, verbal, visual, story, and example.
- **Test comprehension, not communication.** Ask random team members "What are our top 3 priorities right now?" — their answer tells you whether the cascade worked.
- **Reserve 20–30% bottom-up.** Not every goal should be handed down; leave room for team-defined goals that still connect to company direction.
- **Red flags:** teams consistently hit goals while the company misses; cross-functional projects take 3x longer (coordination failure); strategy updates quarterly but team priorities don't change; "that's a leadership problem, not ours"; new initiatives announced without connecting to existing OKRs; department heads optimizing for headcount or budget rather than company outcomes.
- **Apply patterns by company stage:** seed (< 20) — start documenting strategy at 10–12 people; early growth (20–60) — introduce shared quarterly planning; scaling (60–200) — cross-functional OKRs + run `alignment_checker.py` in quarterly planning; large (200+) — annual alignment summit and a dedicated alignment role (COO/Chief of Staff).

## See also

- Lark execution: use **lark-okr** to manage objectives/key results and view alignment relationships; **lark-base** to structure OKRs into a multi-dimensional table with cross-table derived metrics; **lark-calendar** for the quarterly alignment-workshop schedule and rooms; **lark-vc** / **lark-minutes** for the meeting recap.
- Role collaboration: new strategy set → partner with CEO + COO to cascade into quarterly rocks *before* announcing; OKR cycle starts → COO runs the cross-team conflict check; a team missing consistently → partner with CHRO to separate a capability gap from an alignment gap.

---
Adapted from alirezarezvani/claude-skills (MIT license).
