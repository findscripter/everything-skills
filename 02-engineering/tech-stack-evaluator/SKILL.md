---
name: tech-stack-evaluator
title: Technology Stack Evaluator (TCO & Comparison)
description: Use when comparing frameworks/cloud providers or evaluating migration paths; runs weighted scoring, 5-year TCO, ecosystem health, security/compliance, and migration-cost analysis to produce a data-driven comparison with confidence levels; not for trivial similar-tool picks, alrea
domain: 研发/architecture
triggers: [tech stack evaluation, framework comparison, TCO, total cost of ownership, migration assessment, technology selection, cloud provider comparison, ecosystem health, build vs buy]
tags: [architecture, technology-selection, tco, migration, cloud-provider, decision-evaluation]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: []
combines_with: []
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
Evaluate and compare technologies, frameworks, and cloud providers with data-driven analysis and actionable selection/migration recommendations.

## When to use

Use it when:
- Comparing frontend/backend frameworks for new projects (e.g. React vs Vue, PostgreSQL vs MongoDB).
- Evaluating cloud providers (AWS / Azure / GCP) for specific workloads.
- Planning technology migrations with risk and cost assessment (e.g. Angular.js → React).
- Making build vs. buy decisions backed by a 5-year TCO (including hidden costs).
- Assessing the long-term viability of open-source libraries (ecosystem health, community strength, security posture).

Do NOT use it for (negative boundaries):
- Trivial decisions between similar tools — just go with team preference.
- Mandated technology choices where the decision is already made.
- Emergency production issues — use monitoring/troubleshooting tools, not a selection evaluation.

### Capabilities

| Capability | Description |
|------------|-------------|
| Technology Comparison | Compare frameworks and libraries with weighted scoring |
| TCO Analysis | Calculate 5-year total cost including hidden costs |
| Ecosystem Health | Assess GitHub metrics, npm adoption, community strength |
| Security Assessment | Evaluate vulnerabilities and compliance readiness |
| Migration Analysis | Estimate effort, risks, and timeline for migrations |
| Cloud Comparison | Compare AWS, Azure, GCP for specific workloads |

## Steps

1. Define what is being compared, the use case, and the weighted dimensions (weights must sum to 100). Common dimensions: ecosystem, performance, developer experience, TCO, security/compliance.
2. Choose the analysis depth:
   - **Quick Comparison (200-300 tokens):** weighted scores + recommendation + top 3 decision factors + confidence level.
   - **Standard Analysis (500-800 tokens):** comparison matrix + TCO overview + security summary.
   - **Full Report (1200-1500 tokens):** all metrics and calculations + migration analysis + detailed recommendations.
3. Prepare input in one of three formats: natural-language **Text**, **YAML** (good for automation), or **JSON** (good for programmatic integration).
4. Run the relevant scripts to do weighted scoring, TCO projection, and ecosystem/security/migration analysis:

```bash
# Weighted multi-criteria technology comparison
python scripts/stack_comparator.py --help

# Multi-year total cost of ownership projection
python scripts/tco_calculator.py --input assets/sample_input_tco.json

# Ecosystem health (GitHub / npm / community)
python scripts/ecosystem_analyzer.py --technology react

# Security posture and compliance readiness
python scripts/security_assessor.py --technology express --compliance soc2,gdpr

# Migration complexity, effort, and risk estimation
python scripts/migration_analyzer.py --from angular-1.x --to react
```

5. Consolidate into a comparison matrix, annotate the confidence level, and give the recommendation plus key trade-offs.

**Confidence levels:**

| Level | Score | Interpretation |
|-------|-------|----------------|
| High | 80-100% | Clear winner, strong data |
| Medium | 50-79% | Trade-offs present, moderate uncertainty |
| Low | < 50% | Close call, limited data |

References (`references/`): `metrics.md` (scoring algorithms and calculation formulas), `examples.md` (input/output examples per analysis type), `workflows.md` (step-by-step evaluation workflows).

## Example

Text input (natural language):
```
Compare React vs Vue for a SaaS dashboard.
Priorities: developer productivity (40%), ecosystem (30%), performance (30%).
```

TCO calculation:
```
Calculate 5-year TCO for Next.js on Vercel.
Team: 8 developers. Hosting: $2500/month. Growth: 40%/year.
```

Migration assessment:
```
Evaluate migrating from Angular.js to React.
Codebase: 50,000 lines, 200 components. Team: 6 developers.
```

YAML structured input (good for automation):
```yaml
comparison:
  technologies: ["React", "Vue"]
  use_case: "SaaS dashboard"
  weights:
    ecosystem: 30
    performance: 25
    developer_experience: 45
```

## Notes

- Weights must be stated explicitly and sum to 100, otherwise scores are not comparable.
- TCO must fold in hidden costs (hiring/training, migration, lock-in, operations), not just hosting fees.
- When confidence is low (< 50%), do not force a single recommendation — present the trade-offs and suggest gathering more data or running a PoC.
- Match the analysis depth to the situation: use Quick Comparison for early screening and the Full Report for formal decisions.
- Security assessment needs concrete compliance requirements passed in (e.g. `soc2`, `gdpr`) for the conclusions to be meaningful.

## See also

- Migration-planning and build-vs-buy decision skills under the engineering/architecture domain.
- Cloud-provider workload comparison and cost-optimization skills.

---

Adapted from alirezarezvani/claude-skills (MIT License).
