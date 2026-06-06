---
name: competitive-matrix-builder
title: Competitive Matrix Builder
description: Build a weighted competitive scoring matrix with gap analysis and market positioning from structured 1-10 competitor scores; use for battle cards, quarterly competitive reviews, and product-strategy prep when you have (or can produce) per-dimension scores — not for purely qualita
domain: 商业/marketing
triggers: [competitive analysis, competitive matrix, weighted scoring, competitor scoring, gap analysis, market positioning, competitor comparison, battle card, competitor ranking, competitive teardown, competitor benchmarking, product strategy review]
tags: [marketing, business, competitive-analysis, competitive-intelligence, product-strategy, market-positioning, weighted-scoring]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [competitive-analysis, competitive-intel-tracker, product-marketing-gtm-strategy, market-sizing-analyst]
combines_with: [competitive-analysis, product-marketing-gtm-strategy, sales-enablement]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## When to use

- Before a product strategy or roadmap session, when you need to quantify "us vs. competitors" relative position.
- When a competitor launches a major feature or pricing change and you need a fast benchmark.
- For a quarterly competitive review, before entering a new market segment, or to prepare battle card data for a sales pitch.
- When you already have (or can produce) 1-10 scores per dimension for each competitor and want to weight, rank, find gaps, and map positioning.

Out of scope / when NOT to use:
- When you only have scattered qualitative impressions and no structured per-dimension scores — do the data collection and scoring first, then return here (the script requires numeric `scores`).
- When evaluating a single product with no head-to-head comparison (the core of this skill is matrix comparison and ranking).
- When you need to scrape competitor data live — this skill only computes and presents "scores → matrix"; data collection is a separate step.

## Steps

1. **Define competitors** — List 2-4 competitors and confirm which is the primary focus. Determine the dimensions to compare on.
2. **Collect data and score** — Gather raw signals from at least 3 sources per competitor (website/pricing page, app store reviews, job postings, SEO, social). Score each dimension and attach at least one piece of supporting evidence. Suggested 12-dimension scorecard: features, pricing, ux, performance, docs, support, integrations, security, scalability, brand, community, innovation. Validation checkpoint: every dimension has a score and an evidence note.
3. **Assemble JSON** — Fill in `your_product`, `competitors`, `dimensions`; optionally `weights`, `pricing`, `strengths`, `weaknesses`.
4. **Run the matrix builder** — Generate weighted scores, ranking, tier classification, gap analysis, and positioning distribution.
5. **Interpret output** — Focus on BIGGEST OPPORTUNITIES (where you're behind, by high/medium/low priority) and COMPETITIVE ADVANTAGES (where you lead), then translate into action items (quick wins / medium-term / strategic).

## Example

Commands:

```bash
# Text report (default)
python competitive_matrix_builder.py competitors.json --format text

# JSON output (for downstream consumption)
python competitive_matrix_builder.py competitors.json --format json --output matrix.json

# Custom dimension weights (e.g., pricing weight 2, ux weight 1.5)
python competitive_matrix_builder.py competitors.json --format text --weights pricing=2,ux=1.5
```

Input JSON format (if `dimensions` is omitted, it is auto-detected from the first competitor's `scores`):

```json
{
  "your_product": { "name": "MyApp", "scores": {"ux": 8, "pricing": 7, "features": 9, "support": 6} },
  "competitors": [
    { "name": "Acme", "scores": {"ux": 5, "pricing": 9, "features": 7, "support": 8} },
    { "name": "Beta",  "scores": {"ux": 7, "pricing": 6, "features": 8, "support": 5} }
  ],
  "dimensions": ["ux", "pricing", "features", "support"]
}
```

Running `python competitive_matrix_builder.py competitors.json --format text --weights pricing=2` produces a text report with, in order: COMPETITIVE RANKING (with tier and a `← YOU` marker), DIMENSION BREAKDOWN, BIGGEST OPPORTUNITIES (dimensions where you're behind, with priority), COMPETITIVE ADVANTAGES (dimensions where you lead), and MARKET POSITIONING (market leaders, your rank, score range / mean / stdev).

Scoring rubric (1-5 anchors used to assign the 12 dimensions; the script normalizes input on a 1-10 scale, so pick one scale and stay consistent):

| # | Dimension | 1 (Weak) | 3 (Average) | 5 (Best-in-class) |
|---|-----------|----------|-------------|-------------------|
| 1 | Features | Core only, many gaps | Solid coverage | Comprehensive + unique |
| 2 | Pricing | Confusing / overpriced | Market-rate, clear | Transparent, flexible, fair |
| 3 | UX | Confusing, high friction | Functional | Delightful, minimal friction |
| 4 | Performance | Slow, unreliable | Acceptable | Fast, high uptime |
| 5 | Docs | Sparse, outdated | Decent coverage | Comprehensive, searchable |
| 6 | Support | Email only, slow | Chat + email | 24/7, great response |
| 7 | Integrations | 0-5 integrations | 6-25 | 26+ or deep ecosystem |
| 8 | Security | No mentions | SOC2 claimed | SOC2 Type II, ISO 27001 |
| 9 | Scalability | No enterprise tier | Mid-market ready | Enterprise-grade |
| 10 | Brand | Generic, unmemorable | Decent positioning | Strong, differentiated |
| 11 | Community | None | Forum / Slack | Active, vibrant community |
| 12 | Innovation | No recent releases | Quarterly | Frequent, meaningful |

Every score needs evidence, e.g. "Acme UX=2: App Store reviews cite 'confusing navigation' (38 mentions); onboarding requires 7 steps before TTFV; CC required at signup."

## Notes

Key computation constraints (match the script — do not alter):
- **Normalization:** raw scores are linearly mapped from 1-10 to 0-100 (`normalize_score`); a missing dimension counts as 0.
- **Overall score** = sum of weighted normalized scores / sum of weights; default weight is 1.0 per dimension.
- **Tier classification** (by overall 0-100): ≥80 Leader, ≥60 Strong Competitor, ≥40 Viable Alternative, ≥20 Niche Player, else Weak.
- **Gap analysis** (only emitted when `your_product` is provided): per dimension computes `gap_to_avg` and `gap_to_best`; status is ahead/behind/parity with a ±0.5 threshold; priority is high (behind best by > 2), medium (> 1), else low.
- **Ranking** is by overall score descending; `your_product` is automatically flagged, included in the ranking, and shown with `← YOU`.
- Keep one scoring scale (the script normalizes against 1-10); mixing 1-5 and 1-10 distorts results.
- `weights` can live in the JSON or be overridden with `--weights` (command line takes precedence), reflecting each dimension's strategic importance to you.
- Use 2-4 competitors; too many dilutes insight on the primary target.
- Standard deviation is only computed when there is more than one competitor; positioning distribution has limited meaning in a single-competitor case.

## See also

- Full competitor-research workflow (data collection / 12-dimension scorecard / SWOT / positioning map / UX audit / action items / stakeholder presentation) lives in the source skill `competitive-teardown`.
- Outputs feed: product strategy and OKR planning, landing-page positioning copy, and sales battle cards.

---

Adapted from alirezarezvani/claude-skills (MIT License).
