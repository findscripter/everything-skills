---
name: codetour-authoring
title: CodeTour Authoring
description: Create persona-targeted CodeTour `.tour` files with real file/line anchors for onboarding, architecture walkthroughs, PR/RCA/security-review tours. Triggers: code tour, onboarding tour, architecture walkthrough, PR tour, "explain how X works" as a reusable artifact.
domain: 文书/writing
triggers: [author a code tour / CodeTour for a codebase, build an onboarding walkthrough for a new engineer, create an architecture walkthrough/tour, generate a review tour anchored to a PR, RCA/failure-path walkthrough, security-review tour of trust boundaries, turn "explain how X works" into a reusable guided artifact]
tags: [codetour, code-tour, onboarding, architecture-walkthrough, pr-review, technical-docs, code-explanation]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [codetour-walkthrough-builder, code-tutorial-engineer, codebase-onboarding-doc, docs-architect]
combines_with: [codebase-onboarding-doc, docs-architect]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
## When to use

Create **CodeTour** `.tour` (JSON) files for codebase walkthroughs that open directly to real files and line ranges. Tours live in `.tours/` and target the CodeTour VS Code format, not ad hoc Markdown notes.

A good tour is a narrative for a **specific reader**:
- what they are looking at
- why it matters
- what path they should follow next

Use this skill when:
- the user asks for a code tour, onboarding tour, architecture walkthrough, or PR tour
- the user says "explain how X works" and wants a reusable guided artifact
- the user wants a ramp-up path for a new engineer or reviewer
- the task is better served by a guided sequence than a flat summary

Examples: onboarding a new maintainer; architecture tour for one service or package; PR-review walkthrough anchored to changed files; RCA tour showing the failure path; security-review tour of trust boundaries and key checks.

**When NOT to use:**

| Instead of a code tour | Use |
| --- | --- |
| A one-off explanation in chat is enough | answer directly |
| The user wants prose docs, not a `.tour` artifact | `docs-architect` / repo docs editing |
| The task is implementation or refactoring | do the implementation work |
| Broad codebase onboarding without a tour artifact | `codebase-onboarding-doc` |

**Hard constraint: only create `.tour` JSON files. Do not modify source code as part of this skill.**

## Steps

### 1. Discover (do this before writing anything)

Explore the repo before writing any step:
- README and package/app entry points
- folder structure
- relevant config files
- the changed files if the tour is PR-focused

Do not start writing steps before you understand the shape of the code.

### 2. Infer the reader

Decide the persona and depth from the request shape:

| Request shape | Persona | Suggested depth |
| --- | --- | --- |
| "onboarding", "new joiner" | `new-joiner` | 9-13 steps |
| "quick tour", "vibe check" | `vibecoder` | 5-8 steps |
| "architecture" | `architect` | 14-18 steps |
| "tour this PR" | `pr-reviewer` | 7-11 steps |
| "why did this break" | `rca-investigator` | 7-11 steps |
| "security review" | `security-reviewer` | 7-11 steps |
| "explain how this feature works" | `feature-explainer` | 7-11 steps |
| "debug this path" | `bug-fixer` | 7-11 steps |

### 3. Read and verify anchors

Every file path and line anchor must be real:
- confirm the file exists
- confirm the line numbers are in range
- if using a selection, verify the exact block
- if the file is volatile, prefer a pattern-based anchor

**Never guess line numbers.**

### 4. Write the `.tour`

Write to a deterministic, readable path:

```text
.tours/<persona>-<focus>.tour
```

### 5. Validate (before finishing)

- every referenced path exists
- every line or selection is valid
- the first step is anchored to a real file or directory (not content-only)
- the tour tells a coherent story rather than listing files

## Step types (`steps[]`)

**Content** — use sparingly, usually only for a closing step. Do not make the first step content-only:

```json
{ "title": "Next Steps", "description": "You can now trace the request path end to end." }
```

**Directory** — orient the reader to a module:

```json
{ "directory": "src/services", "title": "Service Layer", "description": "The core orchestration logic lives here." }
```

**File + line** — the default step type:

```json
{ "file": "src/auth/middleware.ts", "line": 42, "title": "Auth Gate", "description": "Every protected request passes here first." }
```

**Selection** — when one code block matters more than the whole file:

```json
{
  "file": "src/core/pipeline.ts",
  "selection": {
    "start": { "line": 15, "character": 0 },
    "end": { "line": 34, "character": 0 }
  },
  "title": "Request Pipeline",
  "description": "This block wires validation, auth, and downstream execution."
}
```

**Pattern** — when exact lines may drift:

```json
{ "file": "src/app.ts", "pattern": "export default class App", "title": "Application Entry" }
```

**URI** — for PRs, issues, or docs when helpful:

```json
{ "uri": "https://github.com/org/repo/pull/456", "title": "The PR" }
```

## Writing rule: SMIG

Each `description` should answer four things, kept compact, specific, and grounded in the actual code:
- **Situation** — what the reader is looking at
- **Mechanism** — how it works
- **Implication** — why it matters for this persona
- **Gotcha** — what a smart reader might miss

## Narrative shape

Use this arc unless the task clearly needs something different:
1. orientation → 2. module map → 3. core execution path → 4. edge case or gotcha → 5. closing / next move.

The tour should feel like a path, not an inventory.

## Example

A minimal `.tour` walking the request path of a payments service:

```json
{
  "$schema": "https://aka.ms/codetour-schema",
  "title": "API Service Tour",
  "description": "Walkthrough of the request path for the payments service.",
  "ref": "main",
  "steps": [
    {
      "directory": "src",
      "title": "Source Root",
      "description": "All runtime code for the service starts here."
    },
    {
      "file": "src/server.ts",
      "line": 12,
      "title": "Entry Point",
      "description": "The server boots here and wires middleware before any route is reached."
    },
    {
      "file": "src/routes/payments.ts",
      "line": 8,
      "title": "Payment Routes",
      "description": "Every payments request enters through this router before hitting service logic."
    },
    {
      "title": "Next Steps",
      "description": "You can now follow any payment request end to end with the main anchors in place."
    }
  ]
}
```

## Notes

**Anti-patterns and fixes:**

| Anti-pattern | Fix |
| --- | --- |
| Flat file listing | Tell a story with dependency between steps |
| Generic descriptions | Name the concrete code path or pattern |
| Guessed anchors | Verify every file and line first |
| Too many steps for a quick tour | Cut aggressively |
| First step is content-only | Anchor the first step to a real file or directory |
| Persona mismatch | Write for the actual reader, not a generic engineer |

**Best practices:**
- Only produce `.tour` files — do not implement, refactor, or edit business files.
- Keep step count proportional to repo size and persona depth; use directory steps for orientation, file steps for substance.
- For PR tours, cover changed files first; for monorepos, scope to the relevant packages instead of touring everything.
- Close with what the reader can now do, not a recap of what they just saw.
- Prefer `pattern` for files whose line numbers drift; when using `line`/`selection`, verify first and never invent line numbers.
- If a key input is missing (tour topic/focus, target reader, whether it anchors a specific PR), stop and clarify before writing.

## See also

- `docs-architect` — for prose architecture narrative / design decisions (the "why") instead of a clickable tour artifact.
- `readme-doc-writer` — project-level README/quickstart that complements the orientation step of a tour.
- `code-tutorial-engineer` — for hands-on, step-by-step tutorials that teach building, rather than reading existing code.
- `codebase-onboarding-doc` (combines_with) — broad onboarding doc plus a guided `.tour`, covering both "read the docs" and "follow the walkthrough" ramp-up styles.
- Upstream format reference: `microsoft/codetour`.
