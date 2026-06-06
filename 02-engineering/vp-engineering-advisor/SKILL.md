---
name: vp-engineering-advisor
title: VP of Engineering Advisor (DORA Delivery Throughput)
description: Diagnose startup engineering delivery operations — DORA 4 metrics + bottleneck location, hiring-funnel conversion/pipeline gaps, squad/chapter/tribe structure with manager-trigger thresholds, and production discipline. Use when sprint velocity drops, eng hiring is broken, team st
domain: 研发/architecture
triggers: [DORA 4 metrics, deployment frequency / lead time for changes / MTTR / change failure rate, sprint velocity dropping, shipping is slowing, engineering hiring funnel, time-to-fill, pipeline gap, squad/chapter/tribe structure, Spotify model, when to add a tech-lead / engineering manager (manager-trigger), on-call rotation, deployment cadence, blameless postmortem culture, cycle time and delivery bottleneck identification]
tags: [engineering-management, delivery-throughput, dora, engineering-hiring, team-structure, production-discipline, vp-engineering]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [coo-operations-advisor, cpo-product-advisor, org-health-diagnostic, developer-experience-optimizer]
combines_with: [deployment-engineer, enterprise-project-manager, developer-experience-optimizer]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## When to use

Strategic engineering operations leadership for startup VPEs — and for founders/CTOs who have no VPE yet and must own delivery operations themselves. This skill is scoped to **four decisions, not a generic engineering survey**:

1. **Are we delivering at the right throughput?** — DORA 4 metrics + bottleneck identification (where work waits).
2. **How do we scale the eng hiring funnel?** — funnel math + pipeline gap + time-to-fill discipline.
3. **What's our team structure — and when do we add a tech-lead manager?** — squad/chapter/tribe design + manager-trigger thresholds.
4. **What's our production discipline?** — on-call rotation, deployment cadence, postmortem culture.

**Where NOT to use:**

- **NOT a CTO skill.** CTO owns *what to build* (architecture, scaling cliffs, build-vs-buy). VPE owns *how to ship it reliably* (delivery, hiring, team structure, production operations). At early stage these are often the same person; at scale they're distinct roles.
- **NOT an engineering-lead replacement.** Engineering-lead owns day-to-day incident and on-call coordination. VPE owns the operating model that engineering-lead executes.

## Steps

### Decision A: Quarterly Delivery Health Review (~4 hours)
**Goal:** Diagnose throughput + identify the top bottleneck.
1. Pull sprint metrics: deployment frequency, lead time for changes, MTTR, change failure rate.
2. Run the analyzer to get a DORA verdict per metric and locate the longest wait stage (the bottleneck).
3. Cross-check with the CTO advisor on architectural causes.
4. Output: a 90-day fix plan with **one bottleneck owned by one engineer**.

### Decision B: Hiring Funnel Diagnosis (~1 day)
**Goal:** Identify funnel leakage + compute the pipeline gap for the hiring target.
1. Pull funnel data from the ATS for the last 90 days.
2. Run the calculator to compute conversion per stage, time-to-fill, and pipeline gap.
3. Identify the weakest conversion stage (the leakage is the answer).
4. Compute the top-of-funnel volume needed for next quarter's hiring target.
5. Cross-check with CHRO (comp/leveling competitiveness) and CFO (cost-per-hire envelope).
6. Output: top-3 fixes + a sourcing-channel diversification plan.

### Decision C: Team Structure Audit (~1 day)
**Goal:** Confirm team structure matches headcount + work streams.
1. Build `team.json`: headcount, work streams, manager count, IC distribution.
2. Run the designer to get a structure recommendation + manager-trigger verdict.
3. Check the manager-trigger thresholds (5-7 IC rule) and squad sizes (5-9 range).
4. Cross-check with the CTO advisor on Conway's Law alignment.
5. Output: structure recommendations + a manager hire plan.

### Decision D: Production Discipline Audit (~1 week)
**Goal:** Confirm the operating model can scale through current growth.
1. Inventory: on-call coverage, incident frequency by severity, MTTR trend.
2. Confirm every customer-facing service has documented SLOs + error budgets.
3. Review the last 5 postmortems — are they blameless? Are action items closed?
4. Cross-check deployment cadence against the DORA verdict.
5. Output: a production-discipline maturity score + a 90-day improvement plan.

## Example

Three analysis scripts. Each runs an embedded sample with zero arguments, or accepts your own JSON:

```bash
# Decision A: DORA 4 metrics + bottleneck identification
python scripts/delivery_throughput_analyzer.py                          # embedded sprint sample
python scripts/delivery_throughput_analyzer.py path/to/sprint_metrics.json

# Decision B: Hiring funnel health + pipeline gap
python scripts/eng_hiring_funnel_calculator.py                          # embedded 3-quarter sample
python scripts/eng_hiring_funnel_calculator.py path/to/funnel.json

# Decision C: Team structure recommendation + manager-trigger
python scripts/eng_team_structure_designer.py                           # embedded 25-engineer sample
python scripts/eng_team_structure_designer.py path/to/team.json
```

**Key questions to ask first:**

- **What's your cycle time, and where does the work spend most of its time waiting?** (If you don't know, you can't improve it.)
- **How long from commit to production?** (DORA "lead time for changes" — best single predictor of overall team health.)
- **What's the escape rate?** (Bugs found in production vs caught in CI/staging. > 15% = quality discipline broken.)
- **When did the eng manager last write code?** (If managers can't review code at all, the manager-IC ratio is wrong.)
- **What's the hiring funnel conversion at each stage?** (Applied → screen → onsite → offer → accept. The leakage is the answer.)
- **What's the on-call rotation, and who's on it?** (If the same 3 people are always paged, the operating model is broken.)

### DORA 4 metrics verdict table

| Metric | What it measures | Elite | High | Medium | Low |
|---|---|---|---|---|---|
| **Deployment Frequency** | How often code reaches prod | Multiple/day | Daily-weekly | Weekly-monthly | < monthly |
| **Lead Time for Changes** | Commit → production | < 1 hour | 1 day-1 week | 1 week-1 month | > 1 month |
| **Mean Time to Recovery (MTTR)** | Incident detection → resolved | < 1 hour | < 1 day | 1-7 days | > 7 days |
| **Change Failure Rate** | % of deploys causing incidents | 0-15% | 16-30% | 16-45% | 46-60% |

**Bottleneck identification.** Cycle time = (PR creation → first review) + (review → approval) + (approval → merge) + (merge → deploy). The longest segment is the bottleneck. Common bottlenecks and fixes: **PR review queue** (waiting for human reviewers) → reviewer rotation + SLA; **test flakiness** (intermittent CI, re-runs) → flaky-test budget + quarantine; **deploy gates** (manual approval, change-control board) → progressive delivery + feature flags; **database migrations** (locking, scheduled windows) → zero-downtime migration patterns.

### Hiring funnel and math

Standard 7-stage conversion benchmarks: Applied → Sourcer screen 30-50%; Sourcer → Recruiter screen 50-70%; Recruiter → Hiring manager 60-80%; Hiring manager → Technical interview 70-85%; Technical → Onsite (full loop) 30-50%; Onsite → Offer 25-40%; Offer → Accept 70-90%. **Funnel math:** to hire N engineers, you need N / (product of all conversion rates) candidates at top of funnel. Example: at ~0.7% end-to-end, 4 hires needs ~570 candidates at top of funnel. "Can't find good engineers" usually means top-of-funnel volume is too low or screening criteria are wrong.

### Team structure and evolution thresholds

Three-axis model (adapted from Spotify, refined by reality): **Squad** = small autonomous team (5-9 engineers) owning a service/product area end-to-end; **Chapter** = functional discipline cutting across squads (backend, frontend) for skill development, NOT ownership; **Tribe** = group of related squads working toward a shared goal.

| Stage | Structure |
|---|---|
| 1-5 engineers | One team. No structure. |
| 6-15 engineers | 2-3 informal pods; founder-CTO can still know everyone. |
| 16-40 engineers | 4-6 squads; first eng manager hires; chapters emerge. |
| 41-100 engineers | 2-3 tribes; director-of-engineering layer; chapters formal. |
| 100+ engineers | Multiple tribes + group EM/director per tribe; VPE + director(s) + EMs + tech leads. |

**Manager-trigger thresholds:** 5-7 ICs without a manager = first EM hire (or internal promote); 3+ EMs without a director = director hire; 8+ teams in one tribe = split the tribe.

### Production discipline — four pillars

On-call rotation (broad enough to avoid burnout — ≥ 6 people per rotation, primary + secondary); incident response (runbooks, severity definitions, blameless postmortems); deployment cadence (continuous deployment OR scheduled releases — both work, surprise releases don't); SLO discipline (every customer-facing service has documented SLOs + error budgets).

### Output format

```
**Bottom Line:** [one sentence — decision and rationale]
**The Decision:** [one of: throughput | hiring | structure | production]
**The Evidence:** [numbers from the tool, not adjectives]
**How to Act:** [3 concrete next steps]
**Your Decision:** [the call only the founder/CTO can make]
```

## Notes

- Speak in numbers, not adjectives. Every conclusion should trace back to a specific metric from the tool output.
- "Lead time for changes" is the best single predictor of overall team health — watch it first.
- Escape rate > 15% means quality discipline is broken; fix quality before piling on speed.
- A 90-day fix plan must be **one bottleneck, one owner** — don't spread the effort so wide that nobody is accountable.
- Fix the leakiest funnel stage first; don't touch every stage at once.
- Anchor squad size at 5-9 engineers; sizes outside that range are a structural signal. Don't split teams just to make the org chart look tidy.
- References to `/cs:decide`, ATS, etc. are upstream/downstream conventions from the original skill — substitute your team's tooling when you operationalize.

## See also

- **CTO advisor** — architecture, scaling cliffs, tech-debt strategy (CTO decides what to build; VPE decides how to ship).
- **CHRO advisor** — company-wide hiring systems (ladders, bands, leveling rubrics); VPE owns eng-specific funnel execution.
- **COO advisor** — company-wide operating cadence; VPE owns eng-specific cadence.
- **SLO architect** — SLO design (tactical); VPE owns the policy that SLOs are required.
- **Chaos engineering / feature-flags architect / Kubernetes operator** — tactical resilience, progressive delivery, and infra patterns.
- **Engineering-lead** — day-to-day incident + on-call coordination (VPE owns the operating model the engineering-lead executes).

---

Adapted from alirezarezvani/claude-skills (MIT license).
