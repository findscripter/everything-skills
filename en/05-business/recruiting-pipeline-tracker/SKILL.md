---
name: recruiting-pipeline-tracker
title: Recruiting Pipeline
description: Track and manage recruiting pipeline stages. Trigger with "recruiting update", "candidate pipeline", "how many candidates", "hiring status", or when the user discusses sourcing, screening, interviewing, or extending offers.
domain: 商业/sales
triggers: [recruiting update, candidate pipeline, how many candidates, hiring status, time to fill]
tags: [pipeline, ats]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [interview-plan-builder, hr-partner-pro, interview-system-designer, deal-pipeline-tracker]
combines_with: [interview-plan-builder, offer-letter-drafter]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
# Recruiting Pipeline

Help manage the recruiting pipeline from sourcing through offer acceptance.

## Pipeline Stages

| Stage | Description | Key Actions |
|-------|-------------|-------------|
| Sourced | Identified and reached out | Personalized outreach |
| Screen | Phone/video screen | Evaluate basic fit |
| Interview | On-site or panel interviews | Structured evaluation |
| Debrief | Team decision | Calibrate feedback |
| Offer | Extending offer | Comp package, negotiation |
| Accepted | Offer accepted | Transition to onboarding |

## Metrics to Track

- **Pipeline velocity**: Days per stage
- **Conversion rates**: Stage-to-stage drop-off
- **Source effectiveness**: Which channels produce hires
- **Offer acceptance rate**: Offers extended vs. accepted
- **Time to fill**: Days from req open to offer accepted

## If ATS Connected

Pull candidate data automatically, update statuses, and track pipeline metrics in real time.
