# Upstream missing cleanup · 2026-09-16

Main tip (PR #26): `38c2460`. Audit list size: **171**.

| Class | Count (after #26) | After ambiguous-12 |
|---|---:|---:|
| alias_found (unique locals) | 144 | **154** |
| multi_alias locals | 0 | **2** (included in 154) |
| ambiguous | 12 | **0** |
| keep_orphan | 0 | **1** |
| truly_gone (deprecated) | 15 | **16** |
| **sum** | **171** | **171** |

Actions:
- High-confidence aliases → `data/upstream-aliases.jsonl` + `INDEX/upstream-aliases.md` (`part1`–`part4`)
- Truly gone → `status: deprecated` + short EN body note (folders kept)
- No Chinese body rewrites
- Ambiguous-12 resolved 2026-09-16 — see `data/ambiguous-12-resolved-2026-09-16.md`

Sample aliases: `socratic-explainer`→`explain-like-socrates`, `algorithm-first-discipline`→`lemmaly`, `pdf-processing-toolkit`→`pdf-official`, `adr-auto-capture`→`architecture-decision-records`, `claude-command-selector`→`ecc-recipes`, `vp-engineering-advisor`→`vpe-advisor`.

Sample truly_gone (deprecated): `imessage-claude-bridge`, `azure-container-apps-deploy`, `hardware-doc-generator`, `mlops-model-productionizer`, `tax-loss-harvesting`.

Orphan (stable): `product-margin-pricing-scenarios`.

See `INDEX/upstream-aliases.md` for full tables.
