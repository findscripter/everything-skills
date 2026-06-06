---
name: llm-coding-mistake-guardrails
title: Karpathy Guidelines: Guardrails to Reduce LLM Coding Mistakes
description: Behavioral guardrails for writing/reviewing/refactoring code with an LLM: surface assumptions, keep changes surgical, avoid over-engineering, and turn tasks into verifiable goals (write a reproducing/validating test first). Triggers: LLM coding, surgical change, over-engineering,
domain: 研发/review
triggers: [writing code with an LLM, review code to avoid over-engineering, keep a refactor to the minimal change, turn a task into a verifiable goal, code is overcomplicated and needs simplifying, change only what must change]
tags: [coding-guidelines, code-review, llm-coding, simplicity, refactoring]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [adversarial-code-reviewer, code-reviewer, clean-code-principles, autonomous-coding-agent-patterns]
combines_with: [test-coverage-gap-finder, systematic-debugger, code-simplifier]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## When to use

Behavioral guidelines to reduce common LLM coding mistakes, derived from [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876) on LLM coding pitfalls.

- Use when writing, reviewing, or refactoring code with an LLM and you need to avoid overcomplication and speculative abstractions.
- Use when a change needs to stay surgical and touch only code directly tied to the request.
- Use when assumptions, tradeoffs, and verification criteria should be made explicit.
- Use when code has become overcomplicated and needs to be simplified.

**Don't use (negative boundaries):**
- Trivial, low-risk changes — use judgment and just make them; no need to run the full process.
- Pure requirements clarification or architecture-selection discussions that don't land in code.
- Emergency fixes — prioritize the smallest verified correction over extensive planning.
- Exploratory prototypes — some caution can be relaxed, but assumptions and verification still must be explicit.

> **Tradeoff:** These guidelines bias toward caution over speed. They are behavioral guardrails, not a replacement for the project's own architecture and style rules.

## Steps

1. **Think before coding.** Don't assume, don't hide confusion, surface tradeoffs.
   - State your assumptions explicitly. If uncertain, ask.
   - If multiple interpretations exist, present them — don't pick silently.
   - If a simpler approach exists, say so. Push back when warranted.
   - If something is unclear, stop. Name what's confusing. Ask.
2. **Simplicity first.** Write the minimum code that solves the problem; nothing speculative.
   - No features beyond what was asked.
   - No abstractions for single-use code.
   - No "flexibility" or "configurability" that wasn't requested.
   - No error handling for impossible scenarios.
   - Ask: "Would a senior engineer say this is overcomplicated?" If yes, rewrite.
3. **Surgical changes.** Touch only what you must; clean up only your own mess.
   - Don't "improve" adjacent code, comments, or formatting.
   - Don't refactor things that aren't broken.
   - Match existing style, even if you'd do it differently.
   - If you notice unrelated dead code, mention it — don't delete it.
4. **Clean up the orphans you create.** Remove imports/variables/functions that YOUR changes made unused. Don't remove pre-existing dead code unless asked.
5. **Goal-driven execution.** Transform the task into a verifiable goal, define success criteria, and loop independently until verified. For multi-step tasks, state a brief plan with a `verify` per step.

## Example

**The test for a change:** every changed line should trace directly to the user's request.

**Turn tasks into verifiable goals:**
- "Add validation" -> "Write tests for invalid inputs, then make them pass"
- "Fix the bug" -> "Write a test that reproduces it, then make it pass"
- "Refactor X" -> "Ensure tests pass before and after"

**Multi-step plan template:**

```text
1. [Step] -> verify: [check]
2. [Step] -> verify: [check]
3. [Step] -> verify: [check]
```

Strong success criteria let you loop independently. Weak criteria such as "make it work" require constant clarification.

```text
User request: "Add validation to this form."

Better response:
1. Assumption: validation should run before submit and show inline errors.
2. Plan: add a small validator, add tests for invalid inputs, then verify existing submit behavior.
3. Scope: only touch the form component and its test file.
```

```text
User request: "Refactor this service."

Better response:
1. Ask what behavior must remain unchanged.
2. Identify a concrete smell, such as duplicated parsing logic.
3. Make the smallest refactor and run the existing service tests.
```

## Notes

- These guidelines are behavioral guardrails, not a replacement for project-specific architecture or style rules; when they conflict, the project's rules win.
- For emergency fixes, prioritize the smallest verified correction over extensive planning.
- For exploratory prototypes, some caution can be relaxed, but assumptions and verification criteria should still be explicit.
- "If you write 200 lines and it could be 50, rewrite it" is an attitude, not a hard metric — the goal is to eliminate speculative complexity, not to mechanically cut lines.

## See also

- Source: Andrej Karpathy's observations on LLM coding pitfalls (x.com/karpathy/status/2015883857489522876).
- Pair with code-review skills (correctness and simplification review over a diff) to enforce steps 3 and 5.
- Connect with the project's test-first / TDD practice for the verifiable goals in steps 4 and 5.

---

Adapted from sickn33/antigravity-awesome-skills (MIT); original entry multica-ai/andrej-karpathy-skills.
