---
name: seo-keyword-research
title: Keyword Research
description: Use when the user asks to "find keywords"; prioritizes volume, difficulty, intent, and clusters from provided or connected data. 关键词研究/内容选题
domain: 商业/seo
triggers: [topic cluster, keyword research, Semrush keyword magic]
tags: [seo, keyword-research, search-volume, keyword-difficulty, topic-clusters, search-intent, long-tail, geo, marketing]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [seo-content-gap-analysis, serp-feature-analysis, seo-content-writer, ai-search-seo]
combines_with: [content-strategy-planner, seo-content-writer]
license: Apache-2.0
source: aaron-he-zhu/seo-geo-claude-skills
source_license: Apache-2.0
---
# Keyword Research

Discovers, scores, and clusters keywords for SEO and GEO planning.

## Quick Start

```
Research keywords for [topic/product/service]
```

```
What keywords is [competitor URL] ranking for that I should target?
```

## Skill Contract

**Expected output**: a prioritized keyword brief plus the standard handoff summary for `memory/research/`.

- **Reads**: goals, market inputs, tool data, and prior strategy from [CLAUDE.md](https://github.com/aaron-he-zhu/seo-geo-claude-skills/blob/main/CLAUDE.md) and the shared [State Model](https://github.com/aaron-he-zhu/seo-geo-claude-skills/blob/main/references/state-model.md) when available.
- **Writes**: a user-facing research deliverable and reusable summary.
- **Promotes**: durable keyword priorities, competitor facts, and pending strategy decisions to `memory/hot-cache.md`, `memory/open-loops.md`, and `memory/research/`.
- **Primary next skill**: [competitor-analysis](https://github.com/aaron-he-zhu/seo-geo-claude-skills/blob/main/research/competitor-analysis/SKILL.md) when the keyword set is ready for market comparison.

### Handoff Summary

> Emit the standard shape from [skill-contract.md §Handoff Summary Format](https://github.com/aaron-he-zhu/seo-geo-claude-skills/blob/main/references/skill-contract.md).

## Data Sources

Optional integrations: ~~SEO tool, ~~search console. Without tools, ask for seed keywords, audience, goals, and any known metrics. See [CONNECTORS.md](https://github.com/aaron-he-zhu/seo-geo-claude-skills/blob/main/CONNECTORS.md).

## Instructions

When a user requests keyword research, run eight phases and announce each as `[Phase X/8: Name]`:

1. **Scope** — clarify product, audience, business goal, DR, geography, and language.
2. **Discover** — seed from core, problem, solution, audience, and industry terms.
3. **Variations** — expand with modifiers and long-tail patterns.
4. **Classify** — tag by intent (informational, navigational, commercial, transactional).
5. **Score** — assign difficulty (1-100) and compute `Opportunity = (Volume × Intent Value) / Difficulty`, with Intent Value `1 / 1 / 2 / 3`.
6. **GEO-Check** — flag AI-answer-friendly queries such as questions, definitions, comparisons, lists, and how-tos.
7. **Cluster** — group keywords into pillar + cluster topic hubs.
8. **Deliver** — output an Executive Summary, Quick Wins / Growth / GEO opportunities, Topic Clusters, Content Calendar, and Next Steps.

**Quality bar**: every recommendation includes at least one specific number. Rewrite generic advice into a concrete keyword + volume + difficulty + reason.

> **Reference**: See [references/instructions-detail.md](https://github.com/aaron-he-zhu/seo-geo-claude-skills/blob/main/research/keyword-research/references/instructions-detail.md) for the full 8-phase templates, expansion patterns, intent table, difficulty tiers, opportunity matrix, GEO indicators, cluster template, actionable-vs-generic examples, and advanced usage.

## Example

Example outcome: 150+ keywords analyzed, 23 high-priority opportunities, ~45K/month traffic potential across 3 focus areas. See the full sample in [references/example-report.md](https://github.com/aaron-he-zhu/seo-geo-claude-skills/blob/main/research/keyword-research/references/example-report.md).

### Advanced Usage

Intent mapping, seasonal analysis, competitor gaps, and local keyword workflows live in [references/instructions-detail.md](https://github.com/aaron-he-zhu/seo-geo-claude-skills/blob/main/research/keyword-research/references/instructions-detail.md#advanced-usage).

## Tips for Success

Start with seeds, respect intent, cluster tightly, prioritize quick wins, and review quarterly. Full notes live in [references/instructions-detail.md](https://github.com/aaron-he-zhu/seo-geo-claude-skills/blob/main/research/keyword-research/references/instructions-detail.md#tips-for-success).

### Save Results

After delivering, offer to save `memory/research/keyword-research/YYYY-MM-DD-<topic>.md` and promote durable conclusions to `memory/hot-cache.md`.

## Reference Materials

- [Instructions Detail](https://github.com/aaron-he-zhu/seo-geo-claude-skills/blob/main/research/keyword-research/references/instructions-detail.md) — Workflow, scoring, cluster template, advanced usage
- [Keyword Intent Taxonomy](https://github.com/aaron-he-zhu/seo-geo-claude-skills/blob/main/research/keyword-research/references/keyword-intent-taxonomy.md) — Intent signals and content mapping
- [Topic Cluster Templates](https://github.com/aaron-he-zhu/seo-geo-claude-skills/blob/main/research/keyword-research/references/topic-cluster-templates.md) — Pillar and cluster patterns
- [Keyword Prioritization Framework](https://github.com/aaron-he-zhu/seo-geo-claude-skills/blob/main/research/keyword-research/references/keyword-prioritization-framework.md) — Scoring and prioritization rules
- [Example Report](https://github.com/aaron-he-zhu/seo-geo-claude-skills/blob/main/research/keyword-research/references/example-report.md) — Worked sample

## Next Best Skill

Primary: [competitor-analysis](https://github.com/aaron-he-zhu/seo-geo-claude-skills/blob/main/research/competitor-analysis/SKILL.md). Also: [content-gap-analysis](https://github.com/aaron-he-zhu/seo-geo-claude-skills/blob/main/research/content-gap-analysis/SKILL.md) and [serp-analysis](https://github.com/aaron-he-zhu/seo-geo-claude-skills/blob/main/research/serp-analysis/SKILL.md).
