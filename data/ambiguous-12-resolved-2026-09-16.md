# Ambiguous-12 resolved · 2026-09-16

Main tip at decision time: `38c2460` (after PR #26). Sofia accepted **all** recommendations as proposed.

| local | action | chosen upstream(s) or — | notes |
|---|---|---|---|
| `structured-decision-framework` | alias | `alirezarezvani/claude-skills` → `c-level-advisor/skills/decision-logger/SKILL.md` | 2:1 OK with `decision-log-recorder` |
| `claude-command-selector` | alias + source fix | `affaan-m/ECC` → `skills/ecc-recipes/SKILL.md` | local `source:` patched alirezarezvani → `affaan-m/ECC` (`source_license: MIT`) |
| `database-design-advisor` | alias | `alirezarezvani/claude-skills` → `engineering/skills/database-designer/SKILL.md` | |
| `vp-engineering-advisor` | alias | `alirezarezvani/claude-skills` → `c-level-advisor/skills/vpe-advisor/SKILL.md` | not hivemind |
| `makepad-rust-ui` | multi_alias | `sickn33/agentic-awesome-skills` → `makepad-basics`, `makepad-dsl`, `makepad-event-action`, `makepad-shaders`, `makepad-deployment` | keep local umbrella |
| `smb-quarterly-business-review` | multi_alias | `anthropics/knowledge-work-plugins` → `small-business/skills/business-pulse`, `growth-pulse`, `sales/skills/customer-health` | keep local QBR composer |
| `customer-health-scorer` | alias | `alirezarezvani/claude-skills` → `business-growth/skills/customer-success-manager/SKILL.md` | not org-health-diagnostic |
| `product-margin-pricing-scenarios` | keep_orphan | — | status remains `stable`; noted under Orphans in INDEX |
| `octagon-equity-research-analyst` | alias | `OctagonAI/skills` → `skills/financial-analyst-master/SKILL.md` | |
| `tax-loss-harvesting` | truly_gone | — | `status: deprecated` + EN note; folder kept; no CN body rewrite |
| `pcb-fab-assembly` | alias | `aklofas/kicad-happy` → `skills/jlcpcb/SKILL.md` | not PCBWay |
| `component-sourcing-search` | alias | `aklofas/kicad-happy` → `skills/lcsc/SKILL.md` | |

## Counts

| action | n |
|---|---:|
| alias | 8 |
| multi_alias | 2 |
| keep_orphan | 1 |
| truly_gone | 1 |
| **sum** | **12** |

Aliases appended in `data/upstream-aliases.part4.jsonl`. Ambiguous list cleared from `INDEX/upstream-aliases.md`.
