---
name: ai-disruption-moat-analyzer
title: AI Disruption Moat Analyzer
description: Use to assess a business's AI disruption risk and moat strength: a 10-vector pressure map (0-10 scoring), an AI-native competitor takeover storyboard, and a 90-day defensive action plan. Not audit-grade market research or investment advice. Triggers: AI disruption risk, moat asse
domain: 商业/growth
triggers: [Is my business at risk from AI and where am I most exposed, How would an AI-native startup take over my market, What should I do in the next 90 days to defend against AI disruption, Run AI displacement due diligence on this company, Does my competitive moat hold up under AI pressure, Analyze AI disruption and moat strength]
tags: [business analysis, moat, ai disruption, competitive strategy, due diligence, growth, risk assessment]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [competitive-analysis, andreessen-vc-lens, business-assumption-stress-test, tech-stack-evaluator]
combines_with: [competitive-analysis, market-sizing-analyst, premortem-plan-challenger]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## When to use

Use this skill to answer questions like:

- "Is my business at risk from AI? Where am I most exposed?"
- "How would an AI-native startup take over my market?"
- "What should I do in the next 90 days to defend against AI disruption?"
- "I'm doing due diligence on [company] — what's their AI displacement risk?"
- "Where does my competitive moat actually hold against AI pressure?"

**Out of scope / limitations:**

- Produces **strategic risk analysis**, not audited market research or investment advice. Do not make investment decisions on its output alone.
- Conclusions depend on current company, market, regulatory, and competitive context supplied by the user or gathered from reliable sources. Bad inputs produce distorted conclusions.
- Treats disruption scenarios as planning tools; scores shift as new evidence appears and should be revisited periodically, not taken as a one-time verdict.

## Steps

### Step 1 — Gather inputs

Ask if not provided:

- **Industry** (e.g., "real estate", "community banking", "retail pharmacy", "law firm")
- **Entity type** (e.g., "independent broker", "solo practitioner", "regional franchise")
- **Target name** (optional — a specific organization for named analysis)

### Step 2 — 10-vector pressure map

Score AI disruption pressure across **exactly these 10 vectors** (0–10). Do not stop at the most obvious ones:

| # | Vector | What to measure |
|---|--------|----------------|
| 1 | **labor_substitution** | Which roles/functions are directly automatable |
| 2 | **customer_interface** | How AI changes how customers reach this entity |
| 3 | **knowledge_commoditization** | Does AI commoditize the expertise this entity sells |
| 4 | **pricing_pressure** | Does AI enable lower-cost competitors to undercut |
| 5 | **supply_chain_automation** | Does AI change input costs or supplier relationships |
| 6 | **data_moat** | Does this entity have proprietary data AI can't replicate |
| 7 | **trust_relationship_moat** | How much does customer loyalty protect against displacement |
| 8 | **distribution_channel_disruption** | Does AI create new channels that bypass this entity |
| 9 | **regulatory_compliance_exposure** | Does AI alter the regulatory or liability landscape |
| 10 | **decision_speed_gap** | Does AI accelerate decisions in ways that disadvantage this entity |

For each vector produce: **score**, **headline** (one line), **near_term** (12 months), **far_term** (3 years).

**Aggregate risk score:** mean of all 10 vectors. Flag any vector **≥ 7** as critical.

### Step 3 — AI front-door takeover storyboard

A 6-step narrative of how an AI-native competitor displaces this entity (keep it specific to the industry/entity, not a generic disruption narrative):

1. The entry point
2. The wedge (first 10% of market)
3. The acceleration (what makes it compound)
4. The tipping point (when the incumbent can't recover)
5. The aftermath
6. The survivor profile

### Step 4 — 90-day counterstrike plan

- **Track A (Days 0–30): Immediate defense** — what to stop, what to protect
- **Track B (Days 31–60): Intelligence-layer build** — data/relationships to fortify
- **Track C (Days 61–90): Offensive positioning** — use AI pressure as a competitive weapon

## Example

Input: industry = community banking, entity type = regional independent bank, target = (unnamed).

Expected output skeleton:

1. **10-vector pressure map** — e.g., `customer_interface=8` (AI assistants compare rates directly and bypass branches), `trust_relationship_moat=6` (local long-standing relationships still create stickiness), `data_moat=4` (transaction data exists but can't outmatch national-scale models)... give each vector a headline / near_term / far_term; aggregate = mean; list vectors ≥ 7 as critical.
2. **Takeover storyboard** — an AI-native "digital bank" enters via micro-lending (entry point) → wins underserved segments with second-level approvals (wedge) → a data flywheel lowers underwriting cost (acceleration) → superior rates plus experience make deposit outflow irreversible (tipping point) → the regional bank is reduced to a conduit (aftermath) → those with deep local relationships plus compliance licensing survive (survivor profile).
3. **90-day plan** — Track A: pause low-ROI branch expansion, lock in high-value customer relationships; Track B: connect local credit data, build digital touchpoints; Track C: package "local trust + compliance" into a selling point AI competitors can't easily replicate.

## Notes

Best practices:

- ✅ Score all 10 vectors before calculating the aggregate — resist stopping at the obvious ones.
- ✅ Keep the storyboard specific to industry/entity, not a generic disruption narrative.
- ✅ Track C should be actionable within 90 days, not an aspirational 3-year strategy.
- ❌ Don't conflate `data_moat` with `trust_relationship_moat` — they protect differently: a data moat relies on non-replicable proprietary data, while a trust moat relies on customer loyalty and relationship stickiness.

Other notes:

- This is a planning and decision-support tool. It does not replace due diligence, legal, or investment advice.
- Scores are subjective — always record the basis for each headline so others can review and re-run later.
- Fresher context is more accurate; regulation, competitors, and technology move fast, so recompute about once a quarter.

## See also

- Same-domain growth / competitive-strategy skills (market entry, positioning analysis) pair well: use this skill to locate risk first, then drill down into specific tactics.
- Related: competitive-analysis, andreessen-vc-lens, business-assumption-stress-test, tech-stack-evaluator.
- Combines with: competitive-analysis, market-sizing-analyst, premortem-plan-challenger.
- Adapted from [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills) `moatmri` (original author IntuiTek¹, MIT License). Full BYOK tool and source: [thebrierfox/moatmri-skill](https://github.com/thebrierfox/moatmri-skill).
