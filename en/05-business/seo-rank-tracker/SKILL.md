---
name: seo-rank-tracker
title: Rank Tracker
description: Use when the user asks to "track rankings"; monitors keyword/SERP changes from provided exports or connected tools, including AI response checks. 排名追踪/SERP监控
domain: 商业/seo
triggers: [track rankings, check keyword positions, ranking changes, position monitoring]
tags: [seo, geo, rank-tracking, serp, keyword-rankings, position-monitoring, ai-visibility]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [seo-performance-reporter, serp-feature-analysis, seo-traffic-drop-forensics, seo-keyword-research]
combines_with: [seo-performance-reporter, seo-content-refresher, seo-keyword-research]
license: Apache-2.0
source: aaron-he-zhu/seo-geo-claude-skills
source_license: Apache-2.0
---
# Rank Tracker

Tracks keyword positions, SERP feature ownership, and AI visibility over time.

## Quick Start

```
Set up rank tracking for [domain] targeting these keywords: [keyword list]
```

```
Analyze ranking changes for [domain] over the past [time period]
```

## Skill Contract

**Expected output**: a ranking report or delta summary plus the standard handoff summary for `memory/monitoring/`.

- **Reads**: current metrics, baselines, alert thresholds, and reporting context from [CLAUDE.md](https://github.com/aaron-he-zhu/seo-geo-claude-skills/blob/main/CLAUDE.md) and the shared [State Model](https://github.com/aaron-he-zhu/seo-geo-claude-skills/blob/main/references/state-model.md) when available.
- **Writes**: a user-facing monitoring deliverable and reusable summary.
- **Promotes**: significant changes, confirmed anomalies, follow-up actions, and pending decisions to `memory/open-loops.md`.
- **Primary next skill**: [alert-manager](https://github.com/aaron-he-zhu/seo-geo-claude-skills/blob/main/monitor/alert-manager/SKILL.md) when recurring monitoring should become automated.

### Handoff Summary

> Emit the standard shape from [skill-contract.md §Handoff Summary Format](https://github.com/aaron-he-zhu/seo-geo-claude-skills/blob/main/references/skill-contract.md).

## Data Sources

All integrations optional (see [CONNECTORS.md](https://github.com/aaron-he-zhu/seo-geo-claude-skills/blob/main/CONNECTORS.md)). With tools, pull rankings from ~~SEO tool, impressions from ~~search console, traffic from ~~analytics, and AI citations from ~~AI monitor. Without tools, ask for positions, volumes, competitor data, and SERP feature status.

## Instructions

When a user requests rank tracking or analysis:

1. **Set Up Keyword Tracking** — configure domain, market, device, language, update frequency, priorities, and competitor watchlist.
2. **Record Current Rankings** — summarize position ranges, detailed rankings, ranking URLs, feature ownership, and movement.
3. **Analyze Ranking Changes** — highlight biggest wins, declines, stable terms, new rankings, lost rankings, likely causes, and recovery ideas.
4. **Track SERP Features** — compare ownership of snippets, PAA, image/video packs, local packs, and related feature shifts.
5. **Track GEO / AI Visibility** — monitor AI Overview presence, citation rate, citation position, and trend.
6. **Compare Against Competitors** — report share of voice, head-to-head comparisons, and threat levels.
7. **Generate Ranking Report** — summarize overall trend, key wins, concerns, opportunities, SERP feature changes, GEO visibility, and recommendations.

> **Reference**: See [references/ranking-analysis-templates.md](https://github.com/aaron-he-zhu/seo-geo-claude-skills/blob/main/monitor/rank-tracker/references/ranking-analysis-templates.md) for the complete output templates for all seven steps.

## Example

Sample outcome: average position improves from 15.3 to 12.8, top-10 keywords rise from 12 to 17, and the report highlights the biggest winners, biggest drops, and next actions.

## Tips for Success

Track consistently, segment by intent, watch competitors, and include SERP feature plus GEO signals.

## Rank Change Quick Reference

### Response Protocol

| Change | Timeframe | Action |
|--------|-----------|--------|
| Drop 1-3 positions | Wait 1-2 weeks | Monitor — may be normal fluctuation |
| Drop 3-5 positions | Investigate within 1 week | Check technical issues and competitor changes |
| Drop 5-10 positions | Investigate immediately | Run a full diagnostic: technical, content, links |
| Drop off page 1 | Emergency response | Comprehensive audit + recovery plan |
| Position gained | Document and learn | Identify what worked and replicate |

> **Reference**: See [references/tracking-setup-guide.md](https://github.com/aaron-he-zhu/seo-geo-claude-skills/blob/main/monitor/rank-tracker/references/tracking-setup-guide.md) for tracking setup, root-cause taxonomy, CTR benchmarks, SERP feature impact, and algorithm-update assessment.

### Save Results

Ask "Save these results?" If yes, write `memory/monitoring/YYYY-MM-DD-<topic>.md` with headline finding, actions, and open loops.

## Reference Materials

- [Tracking Setup Guide](https://github.com/aaron-he-zhu/seo-geo-claude-skills/blob/main/monitor/rank-tracker/references/tracking-setup-guide.md) — Setup rules, feature tracking, and interpretation guidance

## Next Best Skill

Initial setup (no baseline) → [alert-manager](https://github.com/aaron-he-zhu/seo-geo-claude-skills/blob/main/monitor/alert-manager/SKILL.md). Subsequent runs (baseline exists) → Terminal. Visited-set rule applies per [skill-contract.md](https://github.com/aaron-he-zhu/seo-geo-claude-skills/blob/main/references/skill-contract.md).
