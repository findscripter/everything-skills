# Upstream missing cleanup · 2026-09-16

Main tip: `46970fc`. Audit list size: **171**.

| Class | Count |
|---|---:|
| alias_found | 144 |
| ambiguous | 12 |
| truly_gone (deprecated) | 15 |
| **sum** | **171** |

Actions:
- High-confidence aliases → `data/upstream-aliases.jsonl` + `INDEX/upstream-aliases.md`
- Truly gone → `status: deprecated` + short EN body note (folders kept)
- No Chinese body rewrites
- Ambiguous left untouched for human pick

Sample aliases: `socratic-explainer`→`explain-like-socrates`, `algorithm-first-discipline`→`lemmaly`, `pdf-processing-toolkit`→`pdf-official`, `adr-auto-capture`→`architecture-decision-records`.

Sample truly_gone (deprecated): `imessage-claude-bridge`, `azure-container-apps-deploy`, `hardware-doc-generator`, `mlops-model-productionizer`.

See `INDEX/upstream-aliases.md` for full tables.
