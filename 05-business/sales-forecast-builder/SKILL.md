---
name: sales-forecast-builder
title: sales-forecast-builder
description: Generate a weighted sales forecast from pipeline data — best/likely/worst scenarios, commit vs. upside breakdown, risk flags, and gap-to-quota analysis. Use when prepping a quarterly forecast call, sizing gap-to-quota from a CRM CSV, deciding which deals to commit vs. call upside
domain: 商业/copy
triggers: [build a quarterly sales forecast, assess gap to quota, decide which deals to commit vs. upside, check pipeline coverage ratio, weighted forecast from a CRM CSV export, prep for a forecast call, best/likely/worst case forecast]
tags: [sales, forecast, pipeline, commit-upside, business-analysis, misc]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [deal-pipeline-tracker, cro-revenue-advisor, deal-desk-reviewer, sales-prospecting]
combines_with: [deal-pipeline-tracker, startup-financial-modeler]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## When to use

- Preparing a quarterly/period forecast call and you need a projection with risk analysis and commit recommendations.
- You have a pipeline CSV exported from your CRM (or a pasted/dictated deal list) and want a weighted forecast and gap-to-quota.
- You need to decide which deals go into **commit** vs. which to call **upside**.
- You want to check whether pipeline **coverage** (multiple of remaining gap) is healthy.

Out of scope:

- No closed-books accounting, revenue recognition, or cash-flow projection — that is the finance side.
- Not a replacement for your CRM as the single source of truth; this skill assists analysis and decisions, it does not write data back to the CRM.
- If the minimum fields (amount / stage / close date) are missing, fill the data in first — do not invent probabilities.

## Steps

### Step 1: Gather pipeline data (pick one)

**Option A — Upload a CSV.** Export your pipeline from your CRM (e.g. Salesforce, HubSpot). At minimum:
- Deal/Opportunity name
- Amount
- Stage
- Close date

Helpful if you have them: Owner (for a team forecast), Last activity date, Created date, Account name.

**Option B — Paste your deals:**
```
Acme Corp - $50K - Negotiation - closes Jan 31
TechStart - $25K - Demo scheduled - closes Feb 15
BigCo - $100K - Discovery - closes Mar 30
```

**Option C — Describe your territory:**
> "I have 8 deals in pipeline totaling $400K. Two are in negotiation ($120K), three in evaluation ($180K), three in discovery ($100K)."

### Step 2: Confirm targets

- **Quota** — your number this period (e.g., "$500K this quarter").
- **Timeline** — when the period ends (e.g., "Q1 ends March 31").
- **Already closed** — how much you have already booked this period.

### Step 3: Apply stage probabilities and compute weighted value

If the user does not provide custom probabilities, use these defaults. Stage names vary by team — confirm the user's actual stage naming before applying the table.

| Stage | Default Probability |
|-------|---------------------|
| Closed Won | 100% |
| Negotiation / Contract | 80% |
| Proposal / Quote | 60% |
| Evaluation / Demo | 40% |
| Discovery / Qualification | 20% |
| Prospecting / Lead | 10% |

Weighted value per deal = **Amount × Stage probability**.

### Step 4: Build the three scenarios

- **Best Case** — all deals close as expected (≈ open pipeline total + already closed).
- **Likely Case** — stage-weighted probabilities (the weighted forecast).
- **Worst Case** — only commit deals close.

### Step 5: Split commit vs. upside, flag risks, run gap analysis, then output using the template below.

Key formulas and rules:

- **Gap to Quota** = Quota − (Closed to date + Weighted forecast).
- **Coverage Ratio** = Open pipeline total ÷ remaining gap (or ÷ quota). 3x is healthy; below 2x is risky.
- Put only high-confidence deals you'd stake your forecast on into **commit**; everything else is **upside** — don't inflate.
- Auto-flag risk signals: close date has passed; no activity in 14+ days; close date is this week but the deal is still in discovery.

**If a CRM is connected:** pull the pipeline automatically, use actual historical win rates by stage/segment/deal size, factor in activity recency for risk scoring, and track/compare against the previous forecast over time.

## Example

Output structure (Markdown):

```markdown
# Sales Forecast: [Period]

**Generated:** [Date]   **Data Source:** [CSV upload / Manual input / CRM]

## Summary
| Metric | Value |
|--------|-------|
| **Quota** | $[X] |
| **Closed to Date** | $[X] ([X]% of quota) |
| **Open Pipeline** | $[X] |
| **Weighted Forecast** | $[X] |
| **Gap to Quota** | $[X] |
| **Coverage Ratio** | [X]x |

## Forecast Scenarios
| Scenario | Amount | % of Quota | Assumptions |
|----------|--------|------------|-------------|
| **Best Case** | $[X] | [X]% | All deals close as expected |
| **Likely Case** | $[X] | [X]% | Stage-weighted probabilities |
| **Worst Case** | $[X] | [X]% | Only commit deals close |

## Pipeline by Stage
| Stage | # Deals | Total Value | Probability | Weighted Value |
|-------|---------|-------------|-------------|----------------|
| Negotiation | [X] | $[X] | 80% | $[X] |
| Proposal | [X] | $[X] | 60% | $[X] |
| Evaluation | [X] | $[X] | 40% | $[X] |
| Discovery | [X] | $[X] | 20% | $[X] |
| **Total** | [X] | $[X] | — | $[X] |

## Commit vs. Upside
### Commit (High Confidence) — deals you'd stake your forecast on
| Deal | Amount | Stage | Close Date | Why Commit |
|------|--------|-------|------------|------------|
| [Deal] | $[X] | [Stage] | [Date] | [Reason] |

**Total Commit:** $[X]

### Upside (Lower Confidence) — could close but carry risk
| Deal | Amount | Stage | Close Date | Risk Factor |
|------|--------|-------|------------|-------------|
| [Deal] | $[X] | [Stage] | [Date] | [Risk] |

**Total Upside:** $[X]

## Risk Flags
| Deal | Amount | Risk | Recommendation |
|------|--------|------|----------------|
| [Deal] | $[X] | Close date passed | Update close date or move to lost |
| [Deal] | $[X] | No activity in 14+ days | Re-engage or downgrade stage |
| [Deal] | $[X] | Close date this week, still in discovery | Unlikely to close — push out |

## Gap Analysis
**To hit quota, you need:** $[X] more

**Options to close the gap:**
1. **Accelerate [Deal]** — currently [stage], worth $[X]. If you close by [date], you're at [X]% of quota.
2. **Revive [Stalled Deal]** — last active [date]. Worth $[X]. Reach out to [contact].
3. **New pipeline needed** — you need $[X] in new opportunities at [X]x coverage to be safe.

## Recommendations
1. [ ] [Specific action for highest-impact deal]
2. [ ] [Action for at-risk deal]
3. [ ] [Pipeline generation recommendation if a gap exists]
```

## Notes

1. **Be honest about commit** — only commit deals you'd bet on; upside is for everything else.
2. **Update close dates** — stale close dates kill forecast accuracy. Push out deals that won't close in time.
3. **Coverage matters** — 3x pipeline coverage is healthy; below 2x is risky.
4. **Activity = signal** — deals with no recent activity are at higher risk than their stage suggests.
5. Stage names and probabilities differ by team — always confirm the user's actual stage naming before applying the default table.

## See also

- Other skills in the same sales plugin (pipeline review, deal recap, etc.).
- When persisting forecast results to a Lark Base / spreadsheet for tracking, combine with `lark-base` / `lark-sheets`.

---

Adapted from anthropics/knowledge-work-plugins (Apache-2.0) — English original reused and reorganized, not a verbatim translation.
