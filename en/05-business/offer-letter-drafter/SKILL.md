---
name: offer-letter-drafter
title: Offer Letter Drafter
description: Draft a complete, ready-to-send offer letter with a total comp package (base, equity, signing bonus, target bonus), terms, benefits, and negotiation guidance for the hiring manager. Use when a candidate is approved and an offer is decided; triggers: offer, offer letter, draft off
domain: 商业/copy
triggers: [offer, offer letter, draft offer, total comp package, signing bonus, equity vesting, negotiation guidance, hiring manager talking points]
tags: [business, human-resources, recruiting, compensation, offer, negotiation, equity]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [compensation-analysis, interview-plan-builder, performance-review-builder, hr-partner-pro]
combines_with: [compensation-analysis, new-hire-onboarding-plan, hr-partner-pro]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## When to use

Use this when a candidate has passed interviews and **the decision to extend an offer has already been made**, and you need to turn a verbal agreement into a complete, ready-to-send offer letter. Typical actions: assemble the total comp package (base, equity, signing bonus, target bonus), write the offer letter text itself, and prep negotiation / counter-offer guidance for the hiring manager.

**Not for:**
- Candidate screening, interview evaluation, or the hire/no-hire decision — that happens before an offer; this skill assumes "do we extend?" is already settled.
- Writing the JD / opening the requisition or headcount approval itself.
- Onboarding (background checks, contract signing flow) — that happens after the offer.
- Designing the company-wide compensation bands — this skill *consumes* a band to price a single candidate, it does not build the band.

## Steps

Source command: `/draft-offer <role and level>`.

Fill in the six essentials in order; if anything is missing, backfill it first rather than sending a letter with blanks:

1. **Role and title** — the specific position.
2. **Level** — Junior, Mid, Senior, Staff, etc. (determines where you land in the comp band).
3. **Location** — Office / Remote / Hybrid (affects comp and benefits).
4. **Compensation** — base salary, equity (share count + valuation method + vesting schedule), signing bonus (if any), target bonus (if any).
5. **Start date**.
6. **Hiring manager** (who they report to).

If details are incomplete, actively ask for each one and help the requester think them through — do not stamp out a template with gaps.

Once complete, produce the fixed five-block structure shown under **Example**: compensation package table → terms → benefits summary → offer letter text → notes for the hiring manager.

### If connectors are available

If an **HRIS** is connected (e.g. Workday, BambooHR, Rippling, Gusto):
- Pull comp band data for the level/role.
- Verify headcount approval.
- Auto-populate benefits details.

If an **ATS** is connected (e.g. Greenhouse, Lever, Ashby, Workable):
- Pull candidate details from the application.
- Update offer status in the pipeline.

Without connectors, the above data is supplied manually or gathered by asking.

## Example

Output the following fixed structure (Markdown):

```markdown
## Offer Letter Draft: [Role] — [Level]

### Compensation Package
| Component | Details |
|-----------|---------|
| **Base Salary** | $[X]/year |
| **Equity** | [X shares/units], [vesting schedule] |
| **Signing Bonus** | $[X] (if applicable) |
| **Target Bonus** | [X]% of base (if applicable) |
| **Total First-Year Comp** | $[X] |

### Terms
- **Start Date**: [Date]
- **Reports To**: [Manager]
- **Location**: [Office / Remote / Hybrid]
- **Employment Type**: [Full-time, Exempt]

### Benefits Summary
[Key benefits highlights relevant to the candidate]

### Offer Letter Text

Dear [Candidate Name],

We are pleased to offer you the position of [Title] at [Company]...

[Complete offer letter text]

### Notes for Hiring Manager
- [Negotiation guidance if needed]
- [Comp band context]
- [Any flags or considerations]
```

## Notes

- **Include total comp, not just base** — candidates compare total compensation; an isolated base number reads as low.
- **Be specific about equity** — share count, current valuation method, and vesting schedule, all three. A vague "you'll get options" carries no weight.
- **Personalize** — reference something from the interview process in the letter body to make it warm rather than a cold template.
- Verify the numbers against the source system (comp band, approval status) before they go out — never ship from a stale export.
- Keep the "Notes for Hiring Manager" block separate from the offer letter text: it is internal negotiation ammunition and must not be sent to the candidate.

## See also

- related: comp-analysis / compensation band design, interview-plan-builder, performance-review-builder, hr-partner-pro.
- combines_with: compensation-analysis and negotiation-talking-points skills for pricing and counter-offers; new-hire-onboarding-plan for the post-acceptance handoff.

---

Adapted from anthropics/knowledge-work-plugins (Apache-2.0 license).
