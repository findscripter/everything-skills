---
name: headcount-org-planner
title: Org Planning
description: Headcount planning, org design, and team structure optimization. Trigger with "org planning", "headcount plan", "team structure", "reorg", "who should we hire next", or when the user is thinking about team size, reporting structure, or organizational design.
domain: 商业/finance
triggers: [headcount, headcount plan, reorg, team structure, span of control]
tags: [finance]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [people-analytics-report, compensation-analysis, ops-capacity-planner, startup-financial-modeler]
combines_with: [cfo-financial-advisor, resource-capacity-planner]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
# Org Planning

Help plan organizational structure, headcount, and team design.

## Planning Dimensions

- **Headcount**: How many people do we need, in what roles, by when?
- **Structure**: Reporting lines, span of control, team boundaries
- **Sequencing**: Which hires are most critical? What's the right order?
- **Budget**: Headcount cost modeling and trade-offs

## Healthy Org Benchmarks

| Metric | Healthy Range | Warning Sign |
|--------|---------------|--------------|
| Span of control | 5-8 direct reports | < 3 or > 12 |
| Management layers | 4-6 for 500 people | Too many = slow decisions |
| IC-to-manager ratio | 6:1 to 10:1 | < 4:1 = top-heavy |
| Team size | 5-9 people | < 4 = lonely, > 12 = hard to manage |

## Output

Produce org charts (text-based), headcount plans with cost modeling, and sequenced hiring roadmaps. Flag structural issues like single points of failure or excessive management overhead.
