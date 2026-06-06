---
name: vendor-evaluation
title: Vendor Evaluation
description: Evaluate a vendor with structured cost, risk, performance, and fit analysis — use when reviewing a new vendor proposal, deciding whether to renew or replace a contract, comparing two vendors side-by-side, or building a TCO breakdown and negotiation points before procurement sign-
domain: 协作/knowledge
triggers: [vendor review, vendor evaluation, vendor comparison, renew or replace, TCO total cost of ownership, procurement review, RFP comparison, negotiation leverage]
tags: [procurement, vendor-management, cost-analysis, risk-assessment, decision]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [tech-stack-evaluator, competitive-analysis, ma-playbook, contract-playbook-review]
combines_with: [contract-proposal-writer, contract-playbook-review]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## When to use

Use this skill to run a structured evaluation of a vendor and deliver a clear recommendation before procurement sign-off:

- Evaluating a new vendor proposal and deciding whether to onboard it.
- A contract is up for renewal — decide whether to renew, renegotiate, or replace.
- Comparing two (or more) vendors side-by-side and needing a comparison matrix.
- Needing a clean TCO (total cost of ownership) breakdown plus negotiation leverage before sign-off.

When **not** to use:

- Contract execution, ordering, payment, or day-to-day reconciliation after a vendor is already chosen — that is procurement operations, out of scope here.
- Pure legal clause review or single-point compliance audits — this skill assesses overall risk posture only; route deep legal review to the dedicated process.
- Simple price quoting/comparison with no evaluation decision — just compare quotes directly, no full framework needed.

## Steps

1. **Gather inputs**: (1) vendor name; (2) context — new vendor evaluation, renewal decision, or comparison; (3) details — contract terms, pricing, proposal document, or current performance data. For renewals, always include current spend so price changes can be evaluated.
2. **Check connectors if available** (see below): search for existing vendor evaluations, contracts, performance reviews, procurement policies, approval thresholds, and price baselines for comparable vendors.
3. **Analyze against the four-part framework** (below). You can parse an uploaded proposal document to extract pricing, terms, and SLAs.
4. **For comparisons**: additionally produce a side-by-side matrix covering pricing, features, integrations, security, support, contract terms, and references.
5. **Assemble the report**: summary recommendation + cost table + risk matrix + strengths/concerns + recommendation + negotiation points.

## Evaluation Framework

### Cost Analysis (Total Cost of Ownership)
- Total cost of ownership (not just license fees)
- Implementation and migration costs
- Training and onboarding costs
- Ongoing support and maintenance
- Exit costs (data migration, contract termination)

### Risk Assessment
- Vendor financial stability
- Security and compliance posture
- Concentration risk (single vendor dependency)
- Contract lock-in and exit terms
- Business continuity and disaster recovery

### Performance Metrics
- SLA compliance
- Support response times
- Uptime and reliability
- Feature delivery cadence
- Customer satisfaction

### Comparison Matrix
When comparing vendors, produce a side-by-side matrix covering: pricing, features, integrations, security, support, contract terms, and references.

## Output Template

```markdown
## Vendor Review: [Vendor Name]
**Date:** [Date] | **Type:** [New / Renewal / Comparison]

### Summary
[2-3 sentence recommendation]

### Cost Analysis
| Component | Annual Cost | Notes |
|-----------|-------------|-------|
| License/subscription | $[X] | [Per seat, flat, usage-based] |
| Implementation | $[X] | [One-time] |
| Support/maintenance | $[X] | [Included or add-on] |
| **Total Year 1** | **$[X]** | |
| **Total 3-Year** | **$[X]** | |

### Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| [Risk] | High/Med/Low | High/Med/Low | [Mitigation] |

### Strengths
- [Strength 1]
- [Strength 2]

### Concerns
- [Concern 1]
- [Concern 2]

### Recommendation
[Proceed / Negotiate / Pass] — [Reasoning]

### Negotiation Points
- [Leverage point 1]
- [Leverage point 2]
```

## Example

Input: "Compare Vendor A vs Vendor B for CRM. A quotes $800K/year including implementation; B quotes $600K/year with implementation billed separately at $250K."

Process: Extract both quotes → normalize B's implementation into a true first-year TCO (A $800K vs B $850K) → build the comparison matrix → note that B is more expensive in year 1 but cheaper from year 2 onward, while A has a 3-year lock-in with high exit costs → risk matrix flags concentration and lock-in risk → recommendation: "Negotiate — use B's quote as leverage to push down A's implementation fee, or require A to shorten the lock-in period."

## Notes

- **TCO first**: always fold in implementation, training, support, and exit costs. Looking at license fees alone badly understates the real cost.
- **Renewals require current spend**: without knowing what you pay today, you cannot judge whether a price increase is reasonable.
- **Exit cost is negotiation leverage**: lock-in periods and data-migration difficulty are both a risk and a bargaining point — quantify them.
- **Comparisons must be side-by-side**: describing vendors separately makes it impossible to align on decision dimensions.
- **Upload the proposal**: pricing, terms, and SLAs can be auto-extracted from vendor documents — encourage users to share original materials rather than second-hand summaries.

### If Connectors Available

If a **knowledge base** is connected:
- Search for existing vendor evaluations, contracts, and performance reviews.
- Pull procurement policies and approval thresholds.

If a **procurement** system is connected:
- Pull current contract terms, spend history, and renewal dates.
- Compare pricing against existing vendor agreements.

## See also

- Procurement operations / contract execution skills (ordering and payment flows once a vendor passes evaluation).
- Cost/budget analysis skills (when rolling TCO into the annual budget).
- Risk and compliance review skills (when deep legal review or a security audit is required).
- Related: tech-stack-evaluator, competitive-analysis, contract-playbook-review, contract-proposal-writer.

---
Adapted from anthropics/knowledge-work-plugins (Apache-2.0).
