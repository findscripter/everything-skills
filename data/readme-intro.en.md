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

## Start from a task

You do not need to know a skill name first. Pick the outcome closest to your task, open the first skill, and follow its `requires` / `related` links when you need more coverage:

| I need to... | Start here |
| --- | --- |
| Understand and onboard a codebase | [codebase-onboarding-doc](07-productivity/codebase-onboarding-doc/SKILL.md) → [monorepo-navigator](02-engineering/monorepo-navigator/SKILL.md) |
| Research and explain a paper | [entity-research-dossier](00-meta/entity-research-dossier/SKILL.md) → [academic-paper-explainer](09-verticals/academic-paper-explainer/SKILL.md) |
| Design, test, and review an API | [api-design-reviewer](02-engineering/api-design-reviewer/SKILL.md) → [api-test-suite-builder](02-engineering/api-test-suite-builder/SKILL.md) |
| Audit accessibility or agent security | [accessibility-wcag-audit](02-engineering/accessibility-wcag-audit/SKILL.md) · [agent-skill-security-scanner](08-security/agent-skill-security-scanner/SKILL.md) |

### What you are looking at

- **Bundled skills** are the folders in this repository. Each has a `SKILL.md` and can be installed by volume through the marketplace.
- **Indexed repositories** are external libraries, marketplaces, and lists summarized in [INDEX/skill-repos.md](INDEX/skill-repos.md). Their source and `SKILL.md` files are not copied here; check the upstream license and install instructions before using them.
- **Generated maps** are the catalog, tags, graph, `search.json`, `quality.json`, marketplace metadata, and README statistics. They are generated from source data and are navigation aids, not additional skill bodies. `quality.json` exposes evidence facets such as review state, freshness, license confidence, dependencies, and security risk; `unknown` / `unreviewed` means no claim has been established.

### Starter bundles

These small combinations show how to turn the relationship graph into a workflow:

| Bundle | Suggested path |
| --- | --- |
| Repository onboarding | [codebase-onboarding-doc](07-productivity/codebase-onboarding-doc/SKILL.md) → [monorepo-navigator](02-engineering/monorepo-navigator/SKILL.md) → [spec-driven-workflow](02-engineering/spec-driven-workflow/SKILL.md) |
| Literature review | [entity-research-dossier](00-meta/entity-research-dossier/SKILL.md) → [academic-paper-explainer](09-verticals/academic-paper-explainer/SKILL.md) → [citation-management](01-documents/citation-management/SKILL.md) |
| API delivery | [api-design-reviewer](02-engineering/api-design-reviewer/SKILL.md) → [api-test-suite-builder](02-engineering/api-test-suite-builder/SKILL.md) → [api-security-best-practices](08-security/api-security-best-practices/SKILL.md) |
| Accessibility and trust | [accessibility-wcag-audit](02-engineering/accessibility-wcag-audit/SKILL.md) → [wcag-22-audit-patterns](02-engineering/wcag-22-audit-patterns/SKILL.md) → [supply-chain-risk-auditor](08-security/supply-chain-risk-auditor/SKILL.md) |

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
