# Everything Skills

**English** · [简体中文](https://github.com/findscripter/everything-skills/blob/zh/README.md)

<!-- BEGIN GENERATED:brand -->
<!-- END GENERATED:brand -->

Start with a deliverable you can inspect: a diagnosis, a reviewed patch, or a checked report. Use focused agent skills, with inputs, evidence and limits visible.

**[Search skills online](https://findscripter.github.io/everything-skills/)** · **[Try a worked example](examples/README.md)** · [Full catalog](INDEX/catalog.md) · [Relationships](INDEX/graph.md)

## Start with a real result

**An empty Nix skill package: 0 → 1,116 exported paths.** The same fixed source was replayed before and after an existing source-rule override. Real Nix evaluation passed, and one representative package built with byte-identical instructions. The total includes **1,094 active entries, 21 archived and one template**.

[![Real distribution repair and its verification scope](assets/demos/nix-discovery-result.svg)](examples/nix-discovery/README.md)

**[Inspect inputs, patch and checks](examples/nix-discovery/README.md)** · [Proposed upstream fix](https://github.com/sudosubin/agents.nix/pull/137800) · [Share your task result](https://github.com/findscripter/everything-skills/issues/new?template=workflow-result.yml)

Use `systematic-debugger` → `code-reviewer`: reproduce and verify a repair, then statically review the exact patch. This is a real maintainer case with disclosed skill-use timing, not an external-user study or a model-success benchmark. Check the linked proposal for current upstream status.

```sh
node bin/everything-skills.mjs compose skill-distribution-audit --json
```

The command returns a plan. Give your agent the repository, failure and allowed test scope. The [case guide](examples/nix-discovery/README.md) includes the prompt, actual scanner replay and offline evidence check.

<details>
<summary>Watch the actual result page: evidence, replay scope and skill search</summary>

![Captured result page, evidence links, replay limits and skill search](assets/demos/nix-discovery-walkthrough.gif)

[Recording scope](assets/demos/README.md) · This page walkthrough does not show the scanner or Nix running.

</details>

<details>
<summary>Watch the 33-second catalog walkthrough</summary>

![Actual catalog search, filters, and volume installation instructions](assets/demos/catalog-walkthrough.gif)

[Sharper video and recording scope](assets/demos/README.md)

</details>

## 1. Explore other task combinations

| Your task | Start with | Then add |
| --- | --- | --- |
| Take over a codebase | [codebase-onboarding-doc](07-productivity/codebase-onboarding-doc/SKILL.md) | [monorepo-navigator](02-engineering/monorepo-navigator/SKILL.md) |
| Explain a paper and organize references | [academic-paper-explainer](09-verticals/academic-paper-explainer/SKILL.md) | [citation-management](01-documents/citation-management/SKILL.md) |
| Review and test a REST API | [api-design-reviewer](02-engineering/api-design-reviewer/SKILL.md) | [api-test-suite-builder](02-engineering/api-test-suite-builder/SKILL.md) |
| Audit web accessibility | [accessibility-wcag-audit](02-engineering/accessibility-wcag-audit/SKILL.md) | [wcag-22-audit-patterns](02-engineering/wcag-22-audit-patterns/SKILL.md) |

Open the skill's `SKILL.md` for its scope, inputs, and required tools. [Worked examples](examples/README.md) include prompts, expected outputs, and verification steps. Follow `requires`, `related`, and `combines_with` for more options.

## 2. Install and try a task

### Claude Code

Run these commands inside Claude Code to add the marketplace and install the engineering volume:

```text
/plugin marketplace add findscripter/everything-skills
/plugin install 02-engineering@everything-skills
```

Then supply your OpenAPI file or API specification and start with:

> Use the api-design-reviewer skill to review this REST API. Read its prerequisites first, ask for missing inputs, and report compatibility issues with evidence and suggested fixes.

Each volume below is a separate plugin; install several when your task needs them.

### Install the debugging/review pair for Codex

With Node.js **22.20.0 or later**, run this from the project where you want the skill available:

```sh
npx skills@1.7.4 add findscripter/everything-skills --skill systematic-debugger --agent codex --copy
npx skills@1.7.4 add findscripter/everything-skills --skill code-reviewer --agent codex --copy
```

These commands install the two selected skills at project scope. Read their runtime prerequisites before using them for a task. To discover the default public set without installing, use a separate command:

```sh
npx skills@1.7.4 add findscripter/everything-skills --list
```

Claude Code's volume plugins and the skills CLI's individual-skill installation are separate options.

### Local search with Node.js 22 or later

With Git, Node.js **>=22**, and npm available, run:

```sh
git clone https://github.com/findscripter/everything-skills.git
cd everything-skills
node --version
npm run skill -- search "API review"
npm run skill -- why api-design-reviewer
```

The CLI has no third-party dependencies, so no `npm install` is needed. It searches the checked-in indexes; `why` shows related skills. Open a returned `SKILL.md`, then ask your agent to follow it for your task. Codex, Cursor, and Gemini CLI can use [AGENTS.md](AGENTS.md), [CLAUDE.md](CLAUDE.md), and [GEMINI.md](GEMINI.md) as repository navigation guides.

### System entry and composition plans

The entry `bin/everything-skills.mjs` locates its own catalog, including when called from another project directory:

```sh
node bin/everything-skills.mjs compose api-review --json
node bin/everything-skills.mjs show api-design-reviewer --json
```

`compose` returns an ordered, documented example recipe or unordered combination suggestions; it executes nothing. `show` returns the skill body, absolute path and resource directory. The [catalog navigation skill](00-meta/everything-skills-catalog/SKILL.md) explains staged use. See [Arch/Omarchy integration](docs/omarchy.md) for the optional system package, client setup, dependencies and limits; the package is not yet in Omarchy's repositories.

## 3. Explore by domain

| Volume | Tasks |
| --- | --- |
| [00-meta](00-meta/README.md) | Research, planning, reasoning, agent workflows |
| [01-documents](01-documents/README.md) | Documents, spreadsheets, presentations, writing |
| [02-engineering](02-engineering/README.md) | Development, architecture, testing, delivery |
| [03-data](03-data/README.md) | Analysis, databases, data engineering |
| [04-ai](04-ai/README.md) | Models, RAG, agents, evaluation |
| [05-business](05-business/README.md) | Marketing, product, operations, growth |
| [06-creative](06-creative/README.md) | Design, images, audiovisual work |
| [07-productivity](07-productivity/README.md) | Communication, projects, personal workflows |
| [08-security](08-security/README.md) | Defensive audits, risk, compliance |
| [09-verticals](09-verticals/README.md) | Science, healthcare, legal, specialist workflows |
| [10-platform](10-platform/README.md) | Cloud, CLIs, connectors, automation |

## What is included

Volume plugins offer **{{CURRENT_SKILLS}} current skills**. The catalog also retains **{{ARCHIVED_SKILLS}} archived entries** for source history and migration, making **{{BUNDLED_SKILLS}} bundled skill folders** in total. Their bodies retain their native language.

**{{EXTERNAL_REPOS}} external repository entries** provide discovery metadata for upstream projects. Their skill bodies are not included in the volume plugins. Daily repository collection expands this directory; bundled skill additions and revisions follow a separate curation workflow.

The [catalog](INDEX/catalog.md), [tags](INDEX/tags.md), [graph](INDEX/graph.md), [search.json](INDEX/search.json), and [quality.json](INDEX/quality.json) are generated navigation and evidence views. Review status, freshness, licenses, and runtime dependencies are separate facets; `unknown` or `unreviewed` is not a verification claim. Read the selected skill's prerequisites and [source/license record](INDEX/sources.md) before running it.

## Contribute and follow updates

Missing a useful skill or found a broken workflow? [Open an issue](https://github.com/findscripter/everything-skills/issues/new) or follow [CONTRIBUTING.md](CONTRIBUTING.md). If this collection helps you, star it to find it again and [watch releases](https://github.com/findscripter/everything-skills/releases) for curated updates.

[Architecture](ARCHITECTURE.md) · [Language policy](LANGUAGE.md) · [Maintenance SOP](sop.md) · [Security](SECURITY.md) · [Sources](INDEX/sources.md) · [License](LICENSE) · [Notice](NOTICE)

---
