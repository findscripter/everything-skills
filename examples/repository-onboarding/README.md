# Take over an unfamiliar repository

[中文](README.zh.md) · [All examples](../README.md)

**Input:** an [original seven-file Node.js workspace](input/mini-repo/) with a CLI and shared core. **Result:** an [onboarding guide](output/onboarding.md), a dependency map, and [reproducible facts](output/facts.json). The clean-directory run executes three tests and the CLI.

## Skill order and copyable prompt

Read [codebase-onboarding-doc](../../07-productivity/codebase-onboarding-doc/SKILL.md), then [monorepo-navigator](../../02-engineering/monorepo-navigator/SKILL.md). This exact sequence was applied: scan files and configuration → read the implementation/tests → identify workspace dependencies → run the setup commands in a clean copy → write a guide for a new maintainer.

```text
Read codebase-onboarding-doc and monorepo-navigator as methodology references
for this teaching example. Use only the original fixture specified below and
examples/repository-onboarding/reproduce.mjs for reproduction; do not execute
the absent Python helpers. This bounded substitution is not a complete run
of these skills on a real project.
Inspect examples/repository-onboarding/input/mini-repo without changing it.
Write a new-maintainer guide: purpose, Node prerequisite, exact run commands,
key files, dependency map, change impact, and troubleshooting. Run the tests
and CLI in a fresh temporary copy. Cite the files behind each important fact.
Do not add build tools or claim that this is a deployed service.
```

From the library root:

```text
node examples/repository-onboarding/reproduce.mjs
```

To intentionally regenerate the machine facts after editing this fixture, use `--write`. The script does not regenerate the narrative guide. It uses Node built-ins, not the absent Python helper names referenced by the skill bodies. No installation of this library into an agent client was tested. See the guide's evidence and limits.
