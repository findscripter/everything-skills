---
name: buyer-persona-builder
title: Buyer Persona Builder
description: Turn real user/customer data (analytics, surveys, interviews, support tickets) into actionable, data-driven buyer personas for marketing and sales — archetype clustering, demographic/behavioral aggregation, frequency-counted pain points, marketing implications, and a confidence r
domain: 商业/marketing
triggers: [buyer persona, user persona, customer archetype, ICP persona, persona, data-driven persona, target customer segmentation, pain point extraction, customer segmentation, ideal customer profile]
tags: [business, marketing, buyer-persona, customer-segmentation, user-research, icp, data-driven]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [customer-research-synthesizer, competitive-analysis, market-sizing-analyst, content-strategy-planner]
combines_with: [customer-research-synthesizer, content-marketing-strategist, product-marketing-gtm-strategy]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## When to use

Use this skill when you **already have real user/customer data** (product analytics, survey responses, sales/CS interviews, support tickets, CRM fields) and need to distill it into buyer personas that **marketing and sales can act on directly**: ad targeting, sales talk tracks, content topics, ICP definition, and the audience model behind landing-page copy.

The original `usage_context=work` field is treated as a B2B/business-buyer signal — a core dimension for a marketing persona.

**Where NOT to use (important boundaries):**
- You have no data and just want to invent a persona from team opinion — this is an explicitly forbidden anti-pattern (see Notes).
- You are doing **UX/interaction design implementation** (design tokens, components, usability testing) — that is product/design scope, not this entry.
- You want **one persona to cover everyone** (25–55, simple yet advanced…) — split into multiple segment personas instead of stretching one.
- You only need single-metric quant analysis (retention, funnel) with no "humanized" customer archetype.

## Steps

1. **Prepare customer data** — a JSON array, one object per user. Key fields:
   ```json
   [
     {
       "user_id": "user_1",
       "age": 32,
       "usage_frequency": "daily",
       "features_used": ["dashboard", "reports", "export"],
       "primary_device": "desktop",
       "usage_context": "work",
       "tech_proficiency": 7,
       "pain_points": ["slow loading", "confusing UI"]
     }
   ]
   ```

2. **Run the persona generator** (the script ships with sample data; replace it with your own source):
   ```bash
   # Human-readable output
   python scripts/persona_generator.py

   # JSON output for CRM / BI / ad-targeting integration
   python scripts/persona_generator.py json > personas.json
   ```

3. **Review the generated components — confirm each one really comes from the data:**

   | Component | What to Check |
   |-----------|---------------|
   | Archetype | Does it match the data patterns? |
   | Demographics | Are they derived from actual data? |
   | Goals | Are they specific and actionable? |
   | Frustrations | Do they include frequency counts? |
   | Marketing implications | Can marketing/sales act on these? |

4. **Read the confidence rating** to decide whether the persona is safe to ship:

   | Sample Size | Confidence | Use Case |
   |-------------|------------|----------|
   | 5–10 users | Low | Exploratory hypothesis only |
   | 11–30 users | Medium | Directional reference |
   | 31+ users | High | Production / live targeting |

   Floor requirement: **≥ 20 users + ≥ 2 data sources (quant + qual)** — below that, treat it as a hypothesis only.

5. **Validate before you ship:** show the persona to 3–5 real customers ("Does this sound like you?"); cross-check against sales/CS and support tickets; reconcile against analytics. Only then use it for talk tracks and targeting.

## Steps (rules / instructions)

- **Archetype classification** (heuristic logic inside the script):

  | Archetype | Identifying Signals | Marketing / Design Focus |
  |-----------|---------------------|--------------------------|
  | Power User | Daily use, 10+ features, shortcuts | Efficiency, customization |
  | Casual User | Weekly use, 3–5 features, simple | Simplicity, guidance |
  | Business User | Work context, team features, ROI | Collaboration, reporting |
  | Mobile-First | Mobile primary, quick actions | Touch, offline, speed |

  In B2B contexts, prioritize the Business User's derived marketing angles — collaboration, reporting, ROI, integrations.
- **Frustrations must carry a frequency.** No generic "the interface is confusing"; write "Can't find export function (mentioned by 8/12 users)".
- **Keep demographics brief.** Write "Age 30–40, urban professional, graduate degree", not "34, Seattle, Stanford MBA".
- **Goals must be actionable.** Write "Needs to process 50+ items daily without repetitive tasks", not "wants to be productive".
- **Each persona must represent ≥ 15% of the user base.** Below that, consider merging — don't build a persona for an outlier.

## Example

```
============================================================
PERSONA: Taylor the Business Buyer
============================================================

📝 A daily user who primarily uses the product for work purposes

Archetype: Business User
Quote: "I need to prove clear value (ROI) to decision-makers"

👤 Demographics: Age 25–34 | Urban | Tech Proficiency: Advanced
🎯 Goals: Improve team efficiency | Track metrics | Integrate with existing tools
😤 Frustrations: Weak reporting (14/20) | Poor collaboration | Missing enterprise features
💡 Marketing / Product Implications:
  → Lead with professional visuals and enterprise trust (SSO, audit logs)
  → Focus content on ROI and team-collaboration scenarios
📈 Based on 30 users | Confidence: Medium
```

Marketing application: use the Quote as an ad headline, use "pain point + frequency" as the pain section of the landing page, and use the marketing implications to drive content topics and targeting.

## Notes

Avoid these anti-patterns that make a persona invalid:

- **The Elastic Persona** — one persona stretched to include everyone. Fix: create separate personas for distinct segments.
- **The Demographic Persona** — all demographics (age/income/education), no goals or frustrations. Fix: lead with goals and frustrations, keep demographics minimal.
- **The Ideal User Persona** — describes the customer you *want*, not the one you *have*. Fix: base on real user data, keep realistic limitations.
- **The Committee Persona** — each stakeholder bolts on an opinion (CEO adds "enterprise-focused", sales adds "loves demos"). Fix: single owner, data-driven only.
- **The Stale Persona** — built once, never updated. Fix: review quarterly and refresh with new data.

Red lines: treating assumptions as data, relying on a single data source, and zero-frequency pain points all make a persona untrustworthy.

Red flags to watch (from the methodology): an "Everyone" persona (too broad → split), contradicting data (forcing a narrative → re-cluster), no frustrations (sanitized → dig deeper), assumptions labeled as data (no real research → conduct it), and a single data source (fragile → add another type).

## See also

- UX user research and journey mapping (the original upstream skill, product/design oriented).
- Customer segmentation / ICP and sales lead scoring (downstream entries within the business domain).
- `customer-research-synthesizer`, `content-marketing-strategist`, `product-marketing-gtm-strategy` (combines well with these).
