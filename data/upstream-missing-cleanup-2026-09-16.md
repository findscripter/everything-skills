# Upstream missing cleanup · 2026-09-16

Main tip: `46970fc`. Audit list size: **171**.

| Class | Count |
|---|---:|
| alias_found | 140 |
| ambiguous | 15 |
| truly_gone (deprecated) | 16 |
| **sum** | **171** |

Actions:
- High-confidence aliases → `data/upstream-aliases.jsonl` + `INDEX/upstream-aliases.md`
- Truly gone → `status: deprecated` + short EN body note (folders kept)
- No Chinese body rewrites
- Ambiguous left untouched for human pick

See `INDEX/upstream-aliases.md` for full tables.
