---
name: code-reviewer
title: Code Reviewer
description: Use when you have a concrete code change (diff, PR, patch, or pasted snippet) to review for correctness bugs, reuse/simplification opportunities, and readability, and you want structured, actionable fixes; triggers: code review, review, find bugs, refactor suggestions.
domain: 研发/review
triggers: [code review, review this diff, find bugs, refactor suggestions, review my PR, review this code]
tags: [review, code-quality, engineering]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [dependency-auditor]
combines_with: []
license: CC-BY-SA-4.0
source: 
source_license: 
---
## When to use

- Use when there is a concrete code change to review: a diff, a PR, a patch, or a pasted snippet.
- The goal is to find: correctness bugs (logic, boundaries, concurrency, error handling, null values), reuse/simplification opportunities, and readability problems — and to give fixes you can apply directly.
- Triggers: code review, review, find bugs, refactor suggestions, code review.

Out of scope:
- Pure dependency / license / CVE audits -> use `dependency-auditor`.
- No concrete change, just "how should I write this" or generate code from scratch -> that is not review; write the code directly.
- Running tests, builds, performance benchmarks, or deployment validation -> this skill is static review only; it does not execute code.
- Large blocks of unrelated legacy code: review only the change and its direct blast radius; do not rewrite whole files.

## Steps

```
1. Get the change set
   - Prefer git diff (uncommitted: `git diff`; committed: `git diff <base>...<head>` or `git show <sha>`).
   - With no git, review only the snippet the user provided, and read its context
     (the changed function, callers, relevant type definitions).

2. Build context (read only what is necessary)
   - Read the full body of the changed function/method, not just the diff lines.
   - Read the interfaces/types the change touches and key callers; confirm the
     contract is not broken.

3. Scan dimension by dimension (in priority order)
   a. Correctness: logic errors, off-by-one, boundaries/empty collections,
      null/undefined, type mismatches, wrong operators/comparisons, unhandled or
      swallowed exceptions, leaked resources, concurrency/races, unvalidated user
      input, missing fallback branches, comments that contradict the implementation.
   b. Reuse/simplification: duplicated logic that can be extracted, existing
      helpers not used, dead code to delete, over-abstraction or inlinable code,
      complex conditions that can be simplified.
   c. Readability: naming, magic values, over-long functions / deep nesting,
      missing key comments (only the "why" kind).

4. Produce a structured entry per finding:
   - [Severity] file:line — one-line problem statement
   - Why: why it is a problem (trigger condition / consequence)
   - Fix: a change you can apply directly (give replacement code or the exact edit)

5. Severity levels
   - Blocker: causes wrong results / crash / data corruption / security issue; must fix.
   - Major: boundary risk, latent hazard, clear code smell; should fix.
   - Minor: readability/style; optional.

6. Summarize the output
   - List Blocker and Major first, then Minor.
   - If there are no issues, say so explicitly ("no correctness issues found"); do not invent any.
   - Mark uncertain findings as "needs confirmation" and state the assumption; do not pass them off as fact.
```

Rules:
- Single responsibility: review only. Do not commit on the side and do not modify files unsupervised (unless the user asks for a `--fix`-style operation).
- Every finding must be locatable (file:line) and actionable (with a concrete fix).
- Prioritize Blocker/Major; keep Minor moderate so noise does not drown the important points.
- Do not comment on code the user did not change, unless the change directly breaks it.

## Example

Minimal review prompt:
```
Review the following diff, output in three buckets: correctness / reuse-simplification / readability.
Per item: [Severity] file:line — problem; why; actionable fix (give replacement code).
Blocker/Major first, then Minor; if there are no correctness issues say so, do not invent any.
<paste git diff here>
```

Get the change:
```bash
git diff                      # uncommitted changes
git diff main...HEAD          # changes on the branch relative to main
git show <sha>                # a specific commit
```

Sample finding entries:
```
[Blocker] src/auth.py:42 — `if token == None` compares None with ==
Why: a custom object may override __eq__, causing a false match; an empty token would bypass the check.
Fix: change to `if token is None:`

[Major] src/list.js:88 — fetchUser(id) called repeatedly inside the loop, an N+1 request pattern
Why: each iteration fires a network request; noticeably slow for large lists.
Fix: batch `fetchUsers(ids)` before the loop, then read values from a Map.

[Minor] src/list.js:12 — variable `d` has an unclear meaning
Fix: rename to `deadline`.
```

## Notes

- Do not execute or test code: reason statically only; when behavior must be verified by running it, hand off to an execution-type skill or prompt the user.
- Do not fabricate line numbers or file names; locate against the actual diff/file.
- Distinguish a "confirmed bug" from a "style preference"; do not label subjective style as Blocker.
- Security-related findings (injection, authentication, hardcoded secrets, deserialization) are always treated as Blocker and pointed out explicitly.
- For very large changes, review in batches, core logic files first, to avoid producing an overly long, unfocused report.
- Make suggestions directly applicable: provide replacement code or an exact edit; do not just say "consider optimizing".

## See also

- requires: none.
- related: `dependency-auditor` (dedicated audit of dependencies / licenses / known vulnerabilities; this skill focuses on the correctness and quality of the changed code itself, and hands dependency-layer risk off to it).
- combines_with: none.
