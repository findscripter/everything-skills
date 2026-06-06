---
name: resource-capacity-planner
title: Resource Capacity Planner
description: Plan team/project resource capacity through workload analysis and utilization forecasting; use when heading into quarterly planning, when the team feels overallocated and you need the numbers, when deciding whether to hire or deprioritize, or when stress-testing whether upcoming 
domain: 协作/knowledge
triggers: [resource capacity planning, quarterly capacity/headcount planning, team feels overallocated and needs the numbers, hire vs. deprioritize decision, stress-test whether next quarter's projects fit current staff, utilization forecasting and target setting, workload analysis and headcount gap, convert PTO/meeting load into real available hours]
tags: [capacity-planning, utilization, headcount, workload-analysis, resource-allocation, quarterly-planning, forecasting]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [ops-capacity-planner, enterprise-project-manager, task-decomposition-planner, agile-product-owner]
combines_with: [enterprise-project-manager, status-report-generator]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## When to use

Plan capacity and resource allocation for a **team or project** — workload analysis plus utilization forecasting. Typical triggers:

- Heading into **quarterly planning** and you need to align next quarter's demand with the people you have.
- The team **feels overallocated** and you need the numbers (not a gut feeling) to prove it.
- Deciding **whether to hire or deprioritize**, and you need to quantify the consequences of each path.
- **Stress-testing** whether upcoming projects fit the people you have.

What I need from you:

- **Team size and roles**: Who do you have?
- **Current workload**: What are they working on? (Upload from a project tracker or describe.)
- **Upcoming work**: What's coming next quarter?
- **Constraints**: Budget, hiring timeline, skill requirements.

**Out of scope** (use a different skill):

- **Queue-based operational staffing** (support/CX/IT ops sized by ticket volume) → use Erlang-C queueing math, see `ops-capacity-planner`. Different work units, different math.
- **Large multi-project portfolio governance** (EMV / Monte Carlo / WSJF, board-level RAG) → see `enterprise-project-manager`.
- **Personal to-do / task management** → this skill is not needed.
- **1–5 year strategic workforce planning** (capability mix, talent supply, succession) → that's strategic HR; this skill covers only the 0–12 month horizon.

## Steps

Work across three planning dimensions and produce output in order.

1. **People**: Available headcount and skills, current allocation and utilization, planned hires and timeline, contractor and vendor capacity.
2. **Budget**: Operating budget by category, project-specific budgets, variance tracking, forecast vs. actual.
3. **Time**: Project timelines and dependencies, critical path analysis, buffer and contingency planning, deadline management.
4. **Convert to real available hours**: From nominal hours, subtract PTO, holidays, sick time, recurring meetings, and context-switching loss — people are never 100% available for project work.
5. **Compute utilization and flag overallocation**: Per person, utilization = allocated ÷ available capacity; find the staffing point against the target utilization (table below), and flag anyone above 100%.
6. **Map demand to gaps**: Align the FTEs each upcoming project needs against available capacity, marking each item Covered / Gap.
7. **Give recommendations and scenarios**: For each bottleneck, recommend Hire / Contract / Reprioritize / Delay, and lay out the consequences of three scenarios — do nothing / hire X / cut Y.

## Example

**Utilization targets** (leave buffer; don't plan to 100%):

| Role Type | Target Utilization | Notes |
|-----------|-------------------|-------|
| IC / Specialist | 75-80% | Leave room for reactive work and growth |
| Manager | 60-70% | Management overhead, meetings, 1:1s |
| On-call / Support | 50-60% | Interrupt-driven work is unpredictable |

**If connectors are available:**

- If a **project tracker** is connected → pull current workload and ticket assignments automatically; show upcoming sprint or quarter commitments per person.
- If a **calendar** is connected → factor in PTO, holidays, and recurring meeting load; calculate actual available hours per person.

**Output template (Markdown):**

```markdown
## Capacity Plan: [Team/Project]
**Period:** [Date range] | **Team Size:** [X]

### Current Utilization
| Person/Role | Capacity | Allocated | Available | Utilization |
|-------------|----------|-----------|-----------|-------------|
| [Name/Role] | [hrs/wk] | [hrs/wk] | [hrs/wk] | [X]% |

### Capacity Summary
- **Total capacity**: [X] hours/week
- **Currently allocated**: [X] hours/week ([X]%)
- **Available**: [X] hours/week ([X]%)
- **Overallocated**: [X people above 100%]

### Upcoming Demand
| Project/Initiative | Start | End | Resources Needed | Gap |
|--------------------|-------|-----|-----------------|-----|
| [Project] | [Date] | [Date] | [X FTEs] | [Covered/Gap] |

### Bottlenecks
- [Skill or role that's oversubscribed]
- [Time period with a crunch]

### Recommendations
1. [Hire / Contract / Reprioritize / Delay]
2. [Specific action]

### Scenarios
| Scenario | Outcome |
|----------|---------|
| Do nothing | [What happens] |
| Hire [X] | [What changes] |
| Deprioritize [Y] | [What frees up] |
```

## Notes

Common pitfalls (avoid these):

- **Planning to 100% utilization** — no buffer for surprises; target 80%.
- **Ignoring meeting load and context-switching costs.**
- **Not accounting for vacation, holidays, and sick time.**
- **Treating all hours as equal** (creative work ≠ admin work).

Practical tips:

- **Include all work** — BAU, projects, support, meetings. People aren't 100% available for project work.
- **Update regularly** — capacity plans go stale fast. Review monthly.

## See also

- related: `ops-capacity-planner` — queue-based operational teams (support/CX/IT) sized by ticket volume with Erlang-C; complements this project-style capacity skill, don't mix them up.
- related: `enterprise-project-manager` — quantitative risk and resource optimization at the multi-project portfolio layer, larger scale.
- combines_with: `task-decomposition-planner` — decompose the workload first, then feed it into this skill to compute capacity.
- combines_with: `enterprise-project-manager` — route this skill's capacity conclusions into portfolio-level governance and executive reporting.

---

Adapted from anthropics/knowledge-work-plugins (Apache-2.0 license).
