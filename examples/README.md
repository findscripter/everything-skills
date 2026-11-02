# Three workflows you can inspect and reproduce

[中文](README.zh.md) · [Back to the project](../README.md)

These worked examples show **input → skill instructions → an inspected result**. The repository and API inputs are small, original, deliberately simplified fixtures. The paper is a real public paper; only bibliographic facts, source links, and our own reading notes are stored here.

| Task | Skills used in order | Inspect the result |
| --- | --- | --- |
| [Take over an unfamiliar repository](repository-onboarding/README.md) | `codebase-onboarding-doc` → `monorepo-navigator` | [Onboarding guide](repository-onboarding/output/onboarding.md), dependency map, clean-directory test and CLI run |
| [Read a paper and check its citations](paper-reading/README.md) | `academic-paper-explainer` → `citation-management` | [Chinese reading guide](paper-reading/output/reading-guide.zh.md), corrected BibTeX, citation and claim checks |
| [Review an API change](api-review/README.md) | `api-design-reviewer` → `api-security-best-practices` | [Review](api-review/output/review.md), four breaking changes, four design/security findings |

From the repository root, with **Node.js 22 or newer**, run:

```text
node scripts/check-examples.mjs
```

No package installation, API key, model call, or network access is needed for that check. Each example has a copyable prompt, exact input and skill links, a deterministic reproduction command, and explicit limits. The paper example also offers an optional online metadata check.

The checked-in narrative outputs were produced by reading the named `SKILL.md` files and applying their steps to these inputs. The example scripts independently check selected concrete facts, rerun the tiny program, compare the API fixtures, and check stored bibliographic records. They **do not regenerate the narrative with an LLM**, validate a Claude/Codex installation, certify all skills, or measure production performance. The helper filenames mentioned in some skill bodies are not bundled in those skill directories; these examples use their own clearly identified, zero-dependency scripts rather than claiming to run those missing helpers.

All fixture code and example prose are original contributions to this repository and follow its [license](../LICENSE). The linked paper retains its own rights; no full paper, figures, or tables are redistributed here.
