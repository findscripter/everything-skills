# Upstream Aliases (missing-name cleanup)

> 2026-09-16 CST · tip `38c2460` + ambiguous-12 · **154** aliased locals (160 jsonl lines) / **0** ambiguous / **16** truly_gone / **1** orphan

Machine-readable map: [`data/upstream-aliases.jsonl`](../data/upstream-aliases.jsonl) (or concat `part1`+`part2`+`part3`+`part4`).

Decision log for the former ambiguous-12: [`data/ambiguous-12-resolved-2026-09-16.md`](../data/ambiguous-12-resolved-2026-09-16.md).

## Sample aliases

| Local | Upstream |
|---|---|
| `socratic-explainer` | `sickn33/agentic-awesome-skills` `explain-like-socrates` |
| `algorithm-first-discipline` | `lemmaly` |
| `plan-execution-checkpoints` | `executing-plans` |
| `pdf-processing-toolkit` | `pdf-official` |
| `adr-auto-capture` | `affaan-m/ECC` `architecture-decision-records` |
| `dataset-profiler` | `explore-data` |
| `false-positive-check` | `fp-check` |
| `structured-decision-framework` | `alirezarezvani/claude-skills` `decision-logger` |
| `claude-command-selector` | `affaan-m/ECC` `ecc-recipes` |
| `database-design-advisor` | `alirezarezvani/claude-skills` `database-designer` |
| `vp-engineering-advisor` | `alirezarezvani/claude-skills` `vpe-advisor` |
| `customer-health-scorer` | `alirezarezvani/claude-skills` `customer-success-manager` |
| `octagon-equity-research-analyst` | `OctagonAI/skills` `financial-analyst-master` |
| `pcb-fab-assembly` | `aklofas/kicad-happy` `jlcpcb` |
| `component-sourcing-search` | `aklofas/kicad-happy` `lcsc` |

## multi_alias (local umbrella → several upstream skills)

| Local | Upstream |
|---|---|
| `makepad-rust-ui` | `sickn33/agentic-awesome-skills` `makepad-basics`, `makepad-dsl`, `makepad-event-action`, `makepad-shaders`, `makepad-deployment` |
| `smb-quarterly-business-review` | `anthropics/knowledge-work-plugins` `business-pulse`, `growth-pulse`, `customer-health` |

## Orphans (keep_orphan — no upstream match; status stable)

- `product-margin-pricing-scenarios` — no product-margin / pricing-scenario skill in `anthropics/knowledge-work-plugins` (neither `content-strategy` nor `business-pulse` covers COGS×3-scenario pricing tables). Documented 2026-09-16; leave `status: stable`.

## Ambiguous (no auto-pick)

*(none — former 12 resolved 2026-09-16; see `data/ambiguous-12-resolved-2026-09-16.md`)*

## Truly gone (deprecated)

- `azure-container-apps-deploy` (sickn33/agentic-awesome-skills)
- `codetour-walkthrough-builder` (alirezarezvani/claude-skills)
- `data-strategy-review` (alirezarezvani/claude-skills)
- `defi-natural-language-agent` (sickn33/agentic-awesome-skills)
- `first-principles-assumption-auditor` (sickn33/agentic-awesome-skills)
- `hardware-doc-generator` (aklofas/kicad-happy)
- `imessage-claude-bridge` (sickn33/agentic-awesome-skills)
- `llm-coding-mistake-guardrails` (sickn33/agentic-awesome-skills)
- `mlops-model-productionizer` (alirezarezvani/claude-skills)
- `multi-framework-compliance-orchestrator` (alirezarezvani/claude-skills)
- `property-auction-legal-analysis` (sickn33/agentic-awesome-skills)
- `release-manager` (alirezarezvani/claude-skills)
- `security-antipattern-hook` (alirezarezvani/claude-skills)
- `seo-traffic-drop-forensics` (sickn33/agentic-awesome-skills)
- `tax-loss-harvesting` (anthropics/financial-services) — ambiguous-12; no upstream TLH skill remains
- `technical-change-tracker` (alirezarezvani/claude-skills)
