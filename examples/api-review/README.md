# Review an API change

[中文](README.zh.md) · [All examples](../README.md)

**Input:** original [before](input/before.openapi.json) and [proposed](input/after.openapi.json) OpenAPI JSON fixtures. **Output:** an [inspected review](output/review.md) and [machine-readable findings](output/findings.json): four breaking changes, four design/security findings, and an explicitly bounded scorecard.

## Skill order and copyable prompt

Read [api-design-reviewer](../../02-engineering/api-design-reviewer/SKILL.md) → [api-security-best-practices](../../08-security/api-security-best-practices/SKILL.md). We applied contract comparison first, then checked authentication, transport, input bounds and the boundary between a written specification and a running service.

```text
Read api-design-reviewer and api-security-best-practices as methodology
references for this teaching example. Use only the original fixtures specified
below and examples/api-review/reproduce.mjs for reproduction; do not execute
the absent Python helpers. This bounded substitution is not a complete run
of these skills on a real project.
Compare examples/api-review/input/before.openapi.json with after.openapi.json.
Identify backward-incompatible routes, response fields/types and required inputs.
Then inspect authentication, HTTPS and collection bounds. Give JSON pointers,
consumer impact, a migration recommendation, and a transparent scorecard.
Treat these as synthetic specifications; do not infer runtime vulnerabilities.
```

From the library root:

```text
node examples/api-review/reproduce.mjs
```

Use `--write` only when intentionally refreshing `findings.json`. This original Node checker is limited to these fixtures. It does not run the missing Python helpers named by the skill, regenerate the narrative, or validate an installed agent client. [The review](output/review.md) explains every scoring criterion and the untested runtime concerns.
