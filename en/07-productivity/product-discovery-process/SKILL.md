---
name: product-discovery-process
title: Product Discovery Process
description: Use when validating product opportunities, mapping assumptions, and testing problem-solution fit before committing delivery resources; runs an Opportunity Solution Tree + assumption mapping + problem/solution validation discovery sprint that ends in a proceed/pivot/stop decision.
domain: 协作/pm
triggers: [product discovery, opportunity validation, assumption mapping, problem validation, solution validation, discovery sprint, opportunity solution tree, OST, de-risk product decision]
tags: [collaboration, pm, product-discovery, opportunity-solution-tree, assumption-validation, user-research, de-risk]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [product-manager-toolkit, prd-spec-writer, agile-product-owner, customer-research-synthesizer]
combines_with: [prd-spec-writer, product-manager-toolkit]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## When to use

Run structured discovery to identify high-value opportunities and de-risk product bets **before committing delivery resources**. Use this skill for:

- Opportunity Solution Tree (OST) facilitation
- Assumption mapping and test planning
- Problem validation interviews and evidence synthesis
- Solution validation with prototypes/experiments
- Discovery sprint planning and outputs

**Stop and use a different skill when:**

- The opportunity is already decided and you only need to prioritize or schedule → use a RICE prioritization skill
- The work is greenlit and you only lack a spec → use a PRD / code-to-prd skill
- It is pure delivery work (bug fixes, refactors) with no "should we build this?" question
- You have no reachable users or evidence source — fix data access first, or the OST degrades into internal guesswork

## Steps

1. **Define the desired outcome** — Set one measurable outcome to improve. Establish a baseline and a target horizon.

2. **Build the Opportunity Solution Tree (OST, Teresa Torres)** — Outcome → opportunities → solution ideas → experiments. Keep opportunities grounded in user evidence, not internal opinions.
   - Outcome: metric you want to move
   - Opportunities: unmet customer needs/pains
   - Solutions: candidate interventions
   - Experiments: fastest learning actions

3. **Map assumptions** — Identify desirability, viability, feasibility, and usability assumptions, then score each by risk and certainty.
   - Desirability: users want this
   - Viability: business value exists
   - Feasibility: team can build/operate it
   - Usability: users can successfully use it
   - **Prioritization rule:** high risk + low certainty assumptions are tested first.

4. **Validate the problem** — Conduct interviews and behavior analysis. Confirm frequency, severity, and willingness to solve. Reject weak opportunities early.

5. **Validate the solution** — Prototype before building. Run concept, usability, and value tests. **Measure behavior, not only stated preference.**

6. **Plan the discovery sprint** — A 1-2 week cycle with explicit hypotheses and daily evidence reviews, ending with a decision: **proceed, pivot, or stop.**

## Example

Score assumptions by risk/certainty and emit a prioritized test plan:

```bash
python3 scripts/assumption_mapper.py assumptions.csv
# JSON output
python3 scripts/assumption_mapper.py assumptions.csv --json
```

The CLI reads assumptions from CSV (or inline input), scores risk/certainty priority, and emits a prioritized test plan with suggested test types.

**Suggested 10-day sprint structure:**

- Day 1-2: Outcome + opportunity framing
- Day 3-4: Assumption mapping + test design
- Day 5-7: Problem and solution tests
- Day 8-9: Evidence synthesis + decision options
- Day 10: Stakeholder decision review

**Problem validation techniques:** problem interviews focused on current behavior, journey friction mapping, support-ticket and sales-call synthesis, behavioral analytics triangulation.

Evidence threshold examples: the same pain repeated across multiple target users; observable workaround behavior; a measurable cost of the current pain.

**Solution validation techniques:** concept tests (value-proposition comprehension), prototype usability tests (task success / time-to-complete), fake-door or concierge tests (demand signal), limited beta cohorts (retention/activation signals).

## Notes

- **OST quality gates:** at least 3 distinct opportunities before converging; at least 2 experiments per top opportunity; tie every branch to an evidence source.
- Opportunities come from **user evidence**, not internal opinion — every OST branch must be traceable.
- When validating solutions, prioritize **real behavior**; a stated "I would use it" does not count.
- Reject weak opportunities early; do not let them survive to the solution stage before cutting losses.
- Cover all four assumption categories (desirability / viability / feasibility / usability) — skipping one leaves a blind spot.
- Always end the sprint with an explicit decision to avoid finishing discovery without knowing whether to build.

## See also

- Framework details: `references/discovery-frameworks.md`
- Downstream: RICE prioritization, user stories / sprint planning (agile-product-owner), PRD (code-to-prd)
- Upstream / parallel: UX user research, product analytics (retention/funnel), experiment design (A/B sample size)

---

*Adapted from alirezarezvani/claude-skills (MIT). The Opportunity Solution Tree framework is credited to Teresa Torres.*
