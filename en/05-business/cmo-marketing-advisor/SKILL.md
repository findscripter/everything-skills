---
name: cmo-marketing-advisor
title: CMO Advisor (Brand & Growth)
description: Strategic marketing leadership for scaling companies — brand positioning, growth model selection, budget allocation backed out from revenue, and marketing org design. Use for CMO-level decisions, not campaign execution. Triggers: CMO, brand positioning, growth model, PLG, CAC, LT
domain: 商业/marketing
triggers: [CMO, chief marketing officer, brand positioning, brand strategy, growth model, PLG, product-led growth, sales-led growth, community-led growth, marketing budget, CAC, customer acquisition cost, LTV, lifetime value, channel mix, marketing ROI, pipeline contribution, marketing org, category design, competitive positioning, growth loops, payback period, MQL, pipeline coverage, build marketing team]
tags: [business, marketing, cmo, brand-positioning, growth-model, marketing-budget, unit-economics, marketing-org, c-level]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [cro-revenue-advisor, cfo-financial-advisor, product-marketing-gtm-strategy, content-marketing-strategist]
combines_with: [pricing-strategy, product-marketing-gtm-strategy, paid-ads-strategist]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## When to use

Use this skill for **strategic** marketing leadership decisions from a CMO's seat. Typical scenarios:

- Design or revise **brand positioning**, category design, and messaging architecture.
- Select a **growth model** (PLG / sales-led SLG / community-led CLG / hybrid).
- Back out a **marketing budget** from the revenue target and allocate it across channels.
- Design the **marketing org** and hiring sequence.
- Prepare **board reporting** narratives (pipeline contribution, CAC by channel, payback period, LTV:CAC).

**Do NOT use (negative boundary):** campaign execution, content creation, ad buying, and landing-page production — those belong to their own dedicated skills. This skill is the *engine*: it sets direction and defines what "working" means; it does not execute line by line.

### The Four CMO Questions

Every CMO must own answers to these — no one else in the C-suite can:

1. **Who are we for?** — ICP, positioning, category.
2. **Why do they choose us?** — Differentiation, messaging, brand.
3. **How do they find us?** — Growth model, channel mix, demand gen.
4. **Is it working?** — CAC, LTV:CAC, pipeline contribution, payback period.

## Steps

1. **Read context first.** If `company-context.md` exists, read it before responding.
2. **Run the diagnostic (ask before any recommendation):**
   - What's your CAC **by channel** (not blended)?
   - What's the payback period on your largest channel? What's your LTV:CAC ratio?
   - What % of pipeline is marketing-sourced vs. sales-sourced?
   - Where do your **best customers** (highest LTV, lowest churn) come from?
   - What's your MQL → Opportunity conversion rate? (proxy for lead quality)
   - Is this brand work or performance marketing? (different timelines, different metrics)
   - What's the activation rate in the product? (PLG signal)
   - If a prospect doesn't buy, why not? (win/loss data)
3. **Run the models** (as needed):

```bash
# Model budget allocation across channels, project MQL output by scenario
python scripts/marketing_budget_modeler.py

# Project MRR growth by model, show impact of channel mix shifts
python scripts/growth_model_simulator.py
```

4. **Back the budget out from the revenue target:** new customers needed → conversion rates by stage → MQLs needed → spend by channel based on CAC.
5. **Let the org follow the growth model:** hire in sequence — generalist first → specialist in the working channel → PMM → marketing ops.
6. **Audit channels quarterly:** MQLs, cost, CAC, payback, trend. Scale what's improving, cut what's worsening, and don't optimize a channel that isn't in the strategy.
7. **Report on board terms:** pipeline contribution, CAC by channel, payback period, LTV:CAC — not impressions or MQLs in isolation.

**Reference docs (load when needed, from source `references/`):**
- `brand_positioning.md` — category design, messaging architecture, battlecards, rebrand framework
- `growth_frameworks.md` — PLG/SLG/CLG playbooks, growth loops, switching models
- `marketing_org.md` — team structure by stage, hiring sequence, agency vs. in-house

**Reasoning technique (Recursion of Thought):** Draft a marketing strategy, critique it from the customer's perspective, refine based on the critique, and repeat until the strategy survives scrutiny.

**Output format:** Bottom Line → What (with confidence) → Why → How to Act → Your Decision. Tag every finding: 🟢 verified, 🟡 medium, 🔴 assumed. You can request input from other roles via `[INVOKE:role|question]`.

## Example

| Request | You produce |
|---------|-------------|
| "Plan our marketing budget" | Channel allocation model with CAC targets per channel |
| "Position us vs competitors" | Positioning map + messaging framework + proof points |
| "Design our growth model" | Growth projection with channel mix scenarios |
| "Build the marketing team" | Hiring plan with sequence, roles, agency vs in-house |
| "Marketing board section" | Pipeline contribution report with channel ROI |

**CMO Metrics Dashboard (healthy targets):**

| Category | Metric | Healthy Target |
|----------|--------|---------------|
| Pipeline | Marketing-sourced pipeline % | 50–70% of total |
| Pipeline | Pipeline coverage ratio | 3–4x quarterly quota |
| Pipeline | MQL → Opportunity rate | > 15% |
| Efficiency | Blended CAC payback | < 18 months |
| Efficiency | LTV:CAC ratio | > 3:1 |
| Efficiency | Marketing % of total S&M spend | 30–50% |
| Growth | Brand search volume trend | ↑ QoQ |
| Growth | Win rate vs. primary competitor | > 50% |
| Retention | NPS (marketing-sourced cohort) | > 40 |

## Notes

**Red flags:**

- No defined ICP — "companies with 50–1000 employees" is not an ICP.
- Marketing and sales disagree on what an MQL is — this is always a system problem, not a people problem.
- CAC tracked only as a blended number — channel-level CAC is non-negotiable.
- Pipeline attribution is self-reported by sales reps, not CRM-timestamped.
- CMO can't answer "what's our payback period?" without a 48-hour research project.
- Brand work and performance marketing have no shared narrative — they're contradicting each other.
- Marketing team is producing content with no documented positioning to anchor it.
- Growth model was chosen because a competitor uses it, not because the product/ACV/ICP fits.

**Proactive triggers (surface without being asked when detected in company context):**

- CAC rising quarter over quarter → channel efficiency declining, investigate.
- No brand positioning documented → messaging inconsistent across channels.
- Marketing budget allocation hasn't changed in 6+ months → market changed, budget didn't.
- Competitor launched major campaign → flag for competitive response.
- Pipeline contribution from marketing unclear → measurement gap, fix before spending more.

## See also

- **Cross C-suite integration:** Pricing changes → CFO + CEO (margin impact on positioning/messaging); Product launch → CPO + CTO (launch tier, GTM motion, messaging); Pipeline miss → CFO + CRO (volume vs. quality vs. velocity); Category design → CEO (multi-year organizational narrative commitment); New market entry → CEO + CFO (validate ICP, budget, localization); Sales misalignment → CRO (align MQL definition, SLA, pipeline ownership); Hiring plan → CHRO; Retention insights → CCO; Competitive threat → CEO + CRO (battlecards, win/loss, repositioning).
- Companion role skills: CFO, CRO, CPO, CTO, CEO, CHRO, CCO advisors.

---

Adapted from alirezarezvani/claude-skills (MIT License).
