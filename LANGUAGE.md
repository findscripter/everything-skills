# Language policy

This repository uses a **split language model**:

| Surface | Language |
| --- | --- |
| Repository chrome on **`main`** — README prose, root docs, policy, CI-facing user copy, generated section headings | **English** |
| Each curated `SKILL.md` under `00-meta` … `10-platform` | **Native / original language** (do **not** maintain a second full English skill tree) |
| Chinese edition of chrome + the same native skills | Branch **[`zh`](https://github.com/findscripter/everything-skills/tree/zh)** (Chinese README/docs tip preserved) |
| External catalog (`data/skill-repos*.jsonl`) | README-only index; per-repo `summary` text may still be Chinese until gradually Englished (**follow-up**, not a mass rewrite) |

## Deprecated

- Branch **`en`** as a **full English skill mirror** is **deprecated**. Use **`main`** (English chrome + native-language skills). See the deprecation notice at the tip of [`en`](https://github.com/findscripter/everything-skills/tree/en).
- Dual skill trees (ZH `main` + EN full mirror of 1100+ `SKILL.md` bodies) are abandoned.

## Regenerating the skill-repos directory

```bash
# On main, English headings are the default:
node scripts/refresh-readme-skill-repos-directory.mjs
# Explicit:
node scripts/refresh-readme-skill-repos-directory.mjs --lang=en
# Chinese headings (e.g. for the zh edition):
node scripts/refresh-readme-skill-repos-directory.mjs --lang=zh
```

Bullet-line summaries are taken from jsonl as-is (often Chinese) until a separate catalog-English pass.
