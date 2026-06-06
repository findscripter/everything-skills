# Everything Skills (English)

> English counterpart of the Chinese 技能大典 · Everything Skills.
> An **encyclopedic, cross-linked skill library for AI agents** — **1108 `SKILL.md` skills** organized into 11 functional volumes.

Where an English original exists upstream, this tree **reuses the original wording** rather than translating back from Chinese — skills are traceable to their `source`. Only first-party originals are authored directly in English.

## Why this exists

Most skill collections are flat lists. This one is a *leishu* (encyclopedia): every skill has one job, a controlled `domain`, and explicit `requires` / `related` / `combines_with` cross-references, so agents can discover and compose them — not just look them up.

## The 11 volumes

| Vol | Dir | Focus |
|----:|-----|-------|
| 0 | `00-meta/` | Meta & thinking — reasoning, workflow discipline, self-review |
| 1 | `01-documents/` | Documents — pdf/docx/xlsx/pptx, forms, writing |
| 2 | `02-engineering/` | Engineering — backend, frontend, devops, testing, review |
| 3 | `03-data/` | Data — pipelines, SQL, analytics, viz |
| 4 | `04-ai/` | AI — prompting, RAG, agents, evals |
| 5 | `05-business/` | Business — product, marketing, ops, finance |
| 6 | `06-creative/` | Creative — design, video, audio, brand |
| 7 | `07-productivity/` | Productivity — collaboration, notes, automation |
| 8 | `08-security/` | Security — appsec, offensive, defensive, CTF |
| 9 | `09-verticals/` | Verticals — domain-specific (legal, health, erp, …) |
| 10 | `10-platform/` | Platform — browser, cloud, APIs, integrations |

## How agents discover skills

- Agents match each skill's frontmatter `description` to decide loading — they don't browse directories.
- Human browse: [`INDEX/catalog.md`](INDEX/catalog.md) (by volume/class), [`INDEX/tags.md`](INDEX/tags.md), [`INDEX/graph.md`](INDEX/graph.md) (cross-reference graph).
- Machine recall: [`INDEX/search.json`](INDEX/search.json) — flat `name/description/triggers/domain` records for two-stage discovery (coarse filter by domain/tags, then rank by description).

## How to use a skill

Enter the skill folder, read its `SKILL.md`, follow the **## Steps**. Each skill is single-purpose and self-contained.

## Install (Claude Code marketplace)

> This English library lives on the **`en` branch** (the repo's default branch `main` is the Chinese version). Point your client at the `en` branch of `findscripter/everything-skills`.

```
/plugin marketplace add findscripter/everything-skills
```

The 11 volumes map to 11 plugins; install everything or per-volume. Multi-harness context files (`CLAUDE.md` / `AGENTS.md` / `GEMINI.md` + `gemini-extension.json`) let Claude Code, Codex, Cursor, and Gemini CLI all discover this tree.

## Relations & provenance

Cross-references live in frontmatter (`requires` / `related` / `combines_with`) and are summarized in [`INDEX/graph.md`](INDEX/graph.md). Per-skill provenance and original license are in each `SKILL.md` (`source` / `source_license`) and aggregated in [`INDEX/sources.md`](INDEX/sources.md).

## License

A curated, adapted collection. Per-skill licenses vary — see each `SKILL.md` `source_license` and `INDEX/sources.md`; overall terms in [`LICENSE`](LICENSE) and [`NOTICE`](NOTICE).

---

**中文版 / Chinese version** — the project's primary version lives on the [`main`](https://github.com/findscripter/everything-skills/tree/main) branch. This `en` branch mirrors it one-to-one by skill `name`.
