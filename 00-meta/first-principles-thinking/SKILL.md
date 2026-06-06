---
name: first-principles-thinking
title: First-Principles Thinking
description: Strip away analogy and convention to re-derive a solution from basic facts; use when breaking down complex or unfamiliar problems. Triggers: first principles, derive from scratch, fundamentals, challenge assumptions.
domain: 通用/thinking
triggers: [first principles, derive from scratch, fundamentals, challenge assumptions, from the ground up, question the premises, break down the problem, reason from basics]
tags: [thinking, reasoning, problem-solving]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [first-principles-assumption-auditor, decision-navigator, design-brainstorming]
combines_with: [business-assumption-stress-test, design-brainstorming]
license: CC-BY-SA-4.0
source: 
source_license: 
---
## When to use

- The current approach inherits an analogy, a convention, or "everyone does it this way," and you need to question whether that premise actually holds.
- You face a complex or unfamiliar problem with no ready-made template and must break it down and rebuild the chain of reasoning yourself.
- Several candidate solutions are stuck in path dependence or a local optimum, and you need to return to the constraints themselves and redesign.
- Triggers: first principles, derive from scratch, fundamentals, challenge assumptions.

**When NOT to use:**

- The problem already has a reliable, mature solution and you only need to execute it — just do it, don't over-decompose.
- Time or information is severely limited and you need a fast decision — analogy or experience is cheaper here.
- The real dispute is "is this fact true?" rather than "does this derivation hold?" — use fact-checking to verify the fact instead.

## Steps

```
1. Define the goal
   - Write the problem in one sentence, with a measurable success criterion.

2. List every assumption behind the current approach
   - Write each one as "We do it this way because we assume ___."
   - Tag the source of each assumption: [fact] / [convention] / [analogy] / [guess].

3. Reduce to basic facts (the foundation)
   - For each assumption, keep asking "Must this be true? On what grounds?"
     until only these remain:
     a) Physical / mathematical / logical constraints (cannot be violated);
     b) Verified hard facts (data, specs, contract terms).
   - All [convention] / [analogy] / [guess] assumptions are marked "challengeable"
     and may NOT serve as foundation.
   - If a key hard fact is in doubt, run fact-checking before admitting it to the
     foundation.

4. Re-derive from the foundation
   - Rebuild the solution using ONLY the basic facts from step 3, referencing none
     of the original approach's structure.
   - For each derivation step, note which foundation fact it depends on.

5. Compare and trade off
   - Place the newly derived solution next to the original; mark the differences and
     which assumptions each one relaxes.
   - Give a recommended solution + the conditions that would trigger a fallback.

6. Validate the foundation
   - If any foundation fact is overturned, return to step 3 and redo.
```

Execution constraints:

- Distinguish "cannot-be-violated constraint" from "current choice" — the former is foundation, the latter is challengeable.
- Do not smuggle the original approach's implicit structure into the derivation (e.g., reusing its data model or process ordering).
- Every conclusion must trace back to a basic fact; otherwise mark it "unproven."

## Example

Minimal prompt template:

```
Do a first-principles analysis of [Goal: X]:
1) List all assumptions of the current approach, tagging each [fact/convention/analogy/guess];
2) Drill each one down to an irreducible physical/logical constraint or hard fact,
   producing a "foundation list";
3) Re-derive a solution using ONLY the foundation list, noting the dependency at each step;
4) Compare with the original, then give a recommended solution and fallback conditions.
For any doubtful hard fact, verify it before use.
```

Worked decomposition (Goal: reduce service response latency):

```
Assumption list:
- [convention] Must keep the existing three-tier architecture   -> challengeable
- [analogy]    A competitor got faster by adding cache, so will we -> challengeable
- [fact]       Single DB query P99 = 80ms                        -> foundation
- [fact]       SLA requires P99 < 120ms                          -> foundation
- [guess]      The bottleneck is the database                    -> verify with tracing first,
                                                                    otherwise not foundation

Foundation list: DB query 80ms; SLA 120ms; request runs 4 serial DB calls (measured).
Re-derivation: 4 x 80 = 320ms already over budget -> root cause is the number of serial
               calls, not single-query speed
            -> merging/parallelizing queries meets the target; cache is not required.
Comparison: the original "add cache" approach bypassed the real constraint (call count).
```

## Notes

- Decomposition has a cost: apply it only to high-value, high-uncertainty problems; don't re-derive everything from scratch.
- Beware "false foundations": mistaking a convention or industry standard for an inviolable constraint is the most common error.
- The foundation is only as good as its facts: a wrong "hard fact" pollutes the entire derivation chain — if in doubt, verify.
- First-principles thinking governs "does the derivation hold," not "is the fact true" — the two have a division of labor.
- A rebuilt solution must still pass empirical testing; logical self-consistency does not equal real-world feasibility.

## See also

- requires: none.
- related: `fact-checking` (when a hard fact extracted during decomposition is in doubt, verify it before treating it as foundation); `first-principles-assumption-auditor`, `decision-navigator`, `design-brainstorming`.
- combines_with: `business-assumption-stress-test`, `design-brainstorming`.
