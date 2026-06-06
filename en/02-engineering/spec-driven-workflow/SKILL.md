---
name: spec-driven-workflow
title: Spec-Driven Workflow
description: Use when the user asks to write specs before code, define acceptance criteria, plan features before implementation, generate tests from specifications, or follow spec-first development practices.
domain: 研发/architecture
triggers: [write spec, spec-first, acceptance criteria, spec-driven development, generate tests from spec, requirements first, feature spec, Given/When/Then, RFC 2119]
tags: [architecture, engineering-process, requirements-engineering, tdd, acceptance-criteria, spec, spec-driven]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: []
combines_with: []
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## When to use

Adopt this workflow whenever any of the following holds:

- The user asks to write specs before code, define acceptance criteria, or follow spec-first development.
- A new feature needs its scope, constraints, and boundaries pinned down before implementation, to avoid scope creep.
- You need to derive test cases directly from a specification, translating acceptance criteria 1:1 into tests.

The Iron Law:

```
NO CODE WITHOUT AN APPROVED SPEC.
NO EXCEPTIONS. NO "QUICK PROTOTYPES." NO "I'LL DOCUMENT IT LATER."
```

A spec is not documentation — it is a contract. It defines what the system MUST do, what it SHOULD do, and what it explicitly WILL NOT do. Every line of code traces back to a requirement; every test traces back to an acceptance criterion. If it is not in the spec, it does not get built.

Why spec-first matters: it eliminates rework (60-80% of defects originate from requirements, not implementation — catching ambiguity in a spec costs minutes, catching it in production costs days); it forces clarity (if you cannot write what the system should do in plain language, you do not understand the problem); it enables parallelism (once approved, frontend/backend/QA/docs start simultaneously); it creates accountability (the spec is the definition of done); and it feeds TDD directly (Given/When/Then criteria translate 1:1 into test cases).

Do NOT use it for:

- Pure exploratory spikes / proofs of concept where requirements are not yet formed — explore first, then return to this workflow.
- Post-hoc documentation describing "what was already built" — that is documentation, not a spec (see Anti-Pattern 4); relabel it.
- One-line fixes, pure refactors, or internal cleanup with no behavior change — go straight to TDD refactoring.

## Steps

Six phases, each with an explicit exit criterion.

**Phase 1 — Gather Requirements.** Interview the user: What problem does this solve? Who are the users? What does success look like? What explicitly should NOT be built? Read existing code, identify constraints (performance budgets, security, backward compatibility), and list every unknown (each unknown is a risk — surface it now, not during implementation). *Exit:* you can explain the feature to someone unfamiliar with the project in 2 minutes.

**Phase 2 — Write Spec.** Fill every section of the template (below) — no section left blank. Number all requirements (FR-*, NFR-*, AC-*, EC-*, OS-*), use RFC 2119 keywords precisely, write acceptance criteria in Given/When/Then, define API contracts with TypeScript-style types, and list explicit exclusions in Out of Scope. *Exit:* a developer who was not in the requirements meeting can implement the feature without asking clarifying questions.

**Phase 3 — Validate Spec.** Run the validator and the manual checklist:

```bash
python spec_validator.py --file spec.md --strict
```

Manual checklist: every FR has at least one AC; every AC is testable (no subjective language); API contracts cover all endpoints in requirements; data models cover all entities; edge cases cover failure modes for every external dependency; Out of Scope is explicit about what was considered and rejected; non-functional requirements have measurable thresholds. *Exit:* spec scores 80+ on validator and all manual items pass.

**Phase 4 — Generate Tests.** Extract test stubs from acceptance criteria before writing implementation:

```bash
python test_extractor.py --file spec.md --framework pytest --output tests/
```

Each AC and each EC becomes one or more test cases. Tests are stubs — they define the assertion but not the implementation — and all MUST fail initially (the RED phase of TDD). *Exit:* a test file where every test fails with "not implemented" or equivalent.

**Phase 5 — Implement.** Pick one acceptance criterion (start with the simplest), make its test(s) pass with minimal code, run the full suite (no regressions), commit, then pick the next. Do NOT implement anything not in the spec; do NOT optimize or refactor before all ACs pass; if you discover a missing requirement, STOP and update the spec first. *Exit:* all tests pass, all ACs satisfied.

**Phase 6 — Self-Review.** Run the Self-Review Checklist (Notes). If any item fails, fix it before declaring the task complete.

### The spec format — 9 mandatory sections

No section is optional. If a section does not apply, write "N/A — [reason]" so reviewers know it was considered, not forgotten.

| # | Section | Key Rules |
|---|---------|-----------|
| 1 | **Title and Metadata** | Author, date, status (Draft/In Review/Approved/Superseded), reviewers |
| 2 | **Context** | Why this feature exists. 2-4 paragraphs with evidence (metrics, tickets). |
| 3 | **Functional Requirements** | RFC 2119 keywords. Numbered FR-N. Each atomic and testable. |
| 4 | **Non-Functional Requirements** | Performance, security, accessibility, scalability, reliability — all with measurable thresholds. |
| 5 | **Acceptance Criteria** | Given/When/Then. Every AC references at least one FR-* or NFR-*. |
| 6 | **Edge Cases** | Numbered EC-N. Cover failure modes for every external dependency. |
| 7 | **API Contracts** | TypeScript-style interfaces. Cover success and error responses. |
| 8 | **Data Models** | Table format: field, type, constraints. Every entity from requirements has a model. |
| 9 | **Out of Scope** | Explicit exclusions with reasons. Prevents scope creep during implementation. |

RFC 2119 keywords: **MUST** = absolute requirement / **MUST NOT** = absolute prohibition / **SHOULD** = recommended (omit only with documented justification) / **MAY** = optional, implementer's discretion.

### Bounded autonomy — STOP and ask when

Scope creep detected (something needed but not in the spec — the spec may have excluded it deliberately); ambiguity exceeds 30% for a requirement; breaking changes required (existing API contract, DB schema, public interface); security implications (authentication, authorization, encryption, PII); performance characteristics you cannot measure or guarantee; cross-team dependencies. **Continue autonomously when:** the spec is clear and unambiguous for the current task; all ACs have passing tests and you are refactoring internals; changes are non-breaking; implementation is a direct translation of a well-defined AC; error handling follows established codebase patterns.

When you must stop, escalate with a recommendation — never an open-ended question:

```markdown
## Escalation: [Brief Title]

**Blocked on:** [requirement ID, e.g., FR-3]
**Question:** [Specific, answerable question — not "what should I do?"]
**Options considered:**
  A. [Option] — Pros: [...] Cons: [...]
  B. [Option] — Pros: [...] Cons: [...]
**My recommendation:** [A or B, with reasoning]
**Impact of waiting:** [What is blocked until this is resolved?]
```

## Example

Take a "Password Reset" feature. In Context, justify why it is needed with tickets and metrics. Write functional requirements (e.g., "FR-1: The system MUST send a one-time reset link after a user submits their registered email") with paired non-functional requirements (e.g., "NFR-1: The reset email MUST be sent in < 30s"). Write acceptance criteria in Given/When/Then:

> AC-1 (references FR-1): Given a registered user clicks "Forgot password" on the login page, When they enter a valid email and submit, Then the system sends a one-time link valid for 15 minutes.

Cover external-dependency failures in edge cases, e.g. "EC-1: Email service timeout — the system MUST return a friendly message and allow retry." Then `test_extractor.py` turns every AC/EC into a pytest stub (all red initially), and the implementation phase lights them up one by one.

Tool commands:

```bash
# Generate a spec template
python spec_generator.py --name "User Authentication" --description "OAuth 2.0 login flow"

# Validate a spec (0-100 score), strict mode
python spec_validator.py --file specs/auth.md --strict

# Extract test cases from acceptance criteria
python test_extractor.py --file specs/auth.md --framework pytest --output tests/test_auth.py
```

| Script | Purpose | Key Flags |
|--------|---------|-----------|
| `spec_generator.py` | Generate spec template from feature name/description | `--name`, `--description`, `--format`, `--json` |
| `spec_validator.py` | Validate spec completeness (0-100 score) | `--file`, `--strict`, `--json` |
| `test_extractor.py` | Extract test stubs from acceptance criteria | `--file`, `--framework`, `--output`, `--json` |

## Notes

**Self-Review Checklist** (verify ALL before marking done): every AC has a passing test; every EC has a test; no scope creep (if you added something, update the spec or remove it); API contracts match implementation field-for-field (names, types, status codes); every error response defined in the spec has a test that triggers it; non-functional requirements verified with evidence (benchmark, load test, profiling); data model matches the DB schema (no extra columns, no missing constraints); out-of-scope items were not built.

Avoid these anti-patterns:

1. **Coding before spec approval** — review surfaces changes; you end up with code implementing a rejected design. Do not start until status is "Approved."
2. **Vague acceptance criteria** — "should work well" / "should be responsive" are untestable. Every AC must be machine-verifiable; if you cannot write a test for it, rewrite it.
3. **Missing edge cases** — happy path only leads developers to invent inconsistent error handling. For every external dependency, specify at least one failure scenario.
4. **Spec as post-hoc documentation** — a spec written after the code is documentation; it cannot catch design errors because the design is frozen. Relabel it.
5. **Gold-plating beyond spec** — "while I was in there, I also added…" introduces untested, unreviewed code. File a new spec for extra features.
6. **Acceptance criteria without traceability** — an orphaned AC means either a requirement is missing or the criterion is unnecessary. Every AC-* MUST reference at least one FR-* or NFR-*.
7. **Skipping validation** — always run `spec_validator.py --strict` before implementation and fix all warnings.

**Integration with TDD:** this workflow produces the test stubs (Phase 4, RED), then hands off to TDD's red-green-refactor. The spec tells you WHAT to test; TDD tells you HOW to implement.

```
Spec-Driven Workflow          TDD (Red-Green-Refactor)
─────────────────────         ──────────────────────────
Phase 4: Generate Tests  ──→  RED: Tests exist and fail
Phase 5: Implement       ──→  GREEN: Minimal code to pass
Phase 6: Self-Review     ──→  REFACTOR: Clean up internals
```

## See also

- **tdd-guide** — Red-green-refactor cycle, coverage analysis, framework-specific test patterns (Jest/Pytest/JUnit). Use after Phase 4 of this workflow.
- **focused-fix** — Deep-dive feature repair; use for diagnosis when a spec-driven implementation has systemic issues.
- **rag-architect** — If the feature involves retrieval or knowledge systems, use it for the technical design within the spec.
- References: `spec_format_guide.md` (complete template with section-by-section examples), `bounded_autonomy_rules.md` (full stop/continue decision matrix), `acceptance_criteria_patterns.md` (Given/When/Then pattern library).

---
Adapted from alirezarezvani/claude-skills (MIT License).
