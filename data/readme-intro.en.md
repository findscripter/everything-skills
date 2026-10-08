# Everything Skills

<!-- BEGIN GENERATED:brand -->
<!-- END GENERATED:brand -->

## Quick start

Add the marketplace in Claude Code, then choose the volumes you need:

```text
/plugin marketplace add findscripter/everything-skills
```

For example, install the engineering volume:

```text
/plugin install 02-engineering@everything-skills
```

Each skill has its own folder and `SKILL.md`. Codex, Cursor, Gemini CLI, and other agents can follow [AGENTS.md](AGENTS.md), [GEMINI.md](GEMINI.md), or [CLAUDE.md](CLAUDE.md) to find and load the instructions for a task.

## Discover, connect, compose

<p align="center">
  <picture><source media="(max-width: 600px)" srcset="assets/brand/workflow-mobile.svg" /><source media="(prefers-reduced-motion: reduce)" srcset="assets/brand/workflow-static.svg" /><img src="assets/brand/workflow.svg" alt="Discover skills through descriptions and triggers, follow their requirements and relationships, then compose a workflow." width="1200" /></picture>
</p>

A skill encyclopedia for AI agents: organized by domain and connected by a relationship graph. Use `domain`, `tags`, and `triggers` to narrow candidates, then match the task against `description`. Each skill has one home and keeps its native language.

Browse the [Catalog](INDEX/catalog.md), [Tags](INDEX/tags.md), and [Graph](INDEX/graph.md). Machine-readable indexes are [search.json](INDEX/search.json) and [graph.json](INDEX/graph.json).

## Eleven volumes, installed as needed

| Volume | Domain | Typical tasks |
| --- | --- | --- |
| [00-meta](00-meta/README.md) | Meta | Research, planning, reasoning, and agent workflows |
| [01-documents](01-documents/README.md) | Documents | Documents, spreadsheets, presentations, and writing |
| [02-engineering](02-engineering/README.md) | Engineering | Development, architecture, testing, and delivery |
| [03-data](03-data/README.md) | Data | Analysis, databases, and data engineering |
| [04-ai](04-ai/README.md) | AI | Models, RAG, agents, and evaluation |
| [05-business](05-business/README.md) | Business | Marketing, product, operations, and growth |
| [06-creative](06-creative/README.md) | Creative | Design, images, audiovisual work, and interaction |
| [07-productivity](07-productivity/README.md) | Productivity | Communication, projects, processes, and personal workflows |
| [08-security](08-security/README.md) | Security | Defensive audits, risk, and compliance |
| [09-verticals](09-verticals/README.md) | Industry | Research, healthcare, legal, and specialist workflows |
| [10-platform](10-platform/README.md) | Platform | Cloud platforms, CLIs, connectors, and automation |

## Maintenance and contributions

Skill metadata and repository JSONL files are the source of truth. Indexes, graphs, and brand statistics are generated. Run `npm run build` for English or `npm run build:zh` for Chinese; commit the generated files, then run the corresponding `check` or `check:zh`.

- [CONTRIBUTING.md](CONTRIBUTING.md): adding and validating skills.
- [ARCHITECTURE.md](ARCHITECTURE.md): source, generation, and publishing boundaries.
- [LANGUAGE.md](LANGUAGE.md): `main` / `zh` interfaces and native-language skill bodies; the historical `en` mirror is retired.
- [PROJECT-REVIEW.md](PROJECT-REVIEW.md): the project audit, fixes, and follow-up work.
- [assets/brand/README.md](assets/brand/README.md): animated and static SVG branding.

For provenance and license terms, see [Sources](INDEX/sources.md), [LICENSE](LICENSE), and [NOTICE](NOTICE). Usage policy: [SECURITY.md](SECURITY.md).

---
