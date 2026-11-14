# Task results you can inspect and reproduce

[中文](README.zh.md) · [Back to the project](../README.md)

Start with a real maintainer repair: [restore an empty Nix skill package](nix-discovery/README.md). The same fixed source went from **0 to 1,116 exported paths** (1,094 active, 21 archived, one template); one package was built and checked against the source bytes. The case includes fixed revisions, the full path map, static review, a scanner replay and an [upstream patch awaiting review](https://github.com/sudosubin/agents.nix/pull/137800). It does not measure model success or external-user outcomes.

The three smaller **bounded teaching cases** below show input → inspected result. The repository and API inputs are small, original, deliberately simplified fixtures. The paper is a real public paper; only bibliographic facts, source links, and our own reading notes are stored here.

| Task | Skills used in order | Inspect the result |
| --- | --- | --- |
| [Take over an unfamiliar repository](repository-onboarding/README.md) | `codebase-onboarding-doc` → `monorepo-navigator` | [Onboarding guide](repository-onboarding/output/onboarding.md), dependency map, clean-directory test and CLI run |
| [Read a paper and check its citations](paper-reading/README.md) | `academic-paper-explainer` → `citation-management` | [Chinese reading guide](paper-reading/output/reading-guide.zh.md), corrected BibTeX, citation and claim checks |
| [Review an API change](api-review/README.md) | `api-design-reviewer` → `api-security-best-practices` | [Review](api-review/output/review.md), four breaking changes, four design/security findings |

From the repository root, with **Node.js 22 or newer**, run:

```text
node scripts/check-examples.mjs
```

No package installation, API key, model call, or network access is needed for that check. For the Nix case it checks saved evidence consistency, without rerunning the scanner or Nix. Each case has exact input and skill links, reproduction steps and explicit limits. The paper example also offers an optional online metadata check.

The checked-in narrative outputs were produced by reading the named `SKILL.md` files and applying their steps to these inputs. The example scripts independently check selected concrete facts, rerun the tiny program, compare the API fixtures, and check stored bibliographic records. They **do not regenerate the narrative with an LLM**, validate a Claude/Codex installation, certify all skills, or measure production performance. The helper filenames mentioned in some skill bodies are not bundled in those skill directories; these examples use their own clearly identified, zero-dependency scripts rather than claiming to run those missing helpers.

All fixture code and example prose are original contributions to this repository and follow its [license](../LICENSE). The linked paper retains its own rights; no full paper, figures, or tables are redistributed here.
