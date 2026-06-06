---
name: kaizen-continuous-improvement
title: Kaizen: Continuous Improvement
description: Use when improving code quality, refactoring, designing, or reviewing — apply four pillars (continuous improvement, error-proofing, standardization, just-in-time) to ship verifiable incremental changes and prevent whole classes of errors; not for big-bang rewrites or unmeasured p
domain: 通用/thinking
triggers: [refactor code, improve code quality, improve process, error-proof design, review improvement suggestions, avoid over-engineering, incremental optimization, standardize patterns]
tags: [thinking-method, continuous-improvement, refactoring, error-proofing, code-quality, engineering-culture, yagni]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [invariant-guard-correctness, algorithm-first-discipline, closed-loop-delivery, first-principles-thinking]
combines_with: [clean-code-principles, tech-debt-prioritizer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## When to use

Apply this to everyday engineering improvement — across implementation, refactoring, architecture and design decisions, error handling and validation, and code review. **Core principle:** many small improvements beat one big change; prevent errors at design time, not with fixes. Quality comes through incremental progress and prevention, not perfection through massive effort.

**Do not use (negative boundaries):**
- Don't stall chasing "perfect on the first try" — the method says good enough today, better tomorrow.
- Don't do big-bang rewrites; improvements must be splittable and verifiable step by step.
- Don't do unmeasured premature optimization or "just in case" over-abstraction — get evidence before adding complexity.
- If task boundaries, permissions, safety constraints, or success criteria are unclear, stop and ask before acting.

## Steps

Four pillars, applied as needed:

**1. Continuous Improvement (Kaizen) — incremental over revolutionary**
- Make the smallest viable change that improves quality; verify each change before the next; build momentum through small wins.
- Always leave code better: fix small issues as you encounter them, refactor within scope, update outdated comments, remove dead code.
- Iterative refinement, not all at once: first version make it work → second pass make it clear → third pass make it robust/efficient.
- When refactoring, fix one smell at a time, commit after each improvement, keep tests passing, and stop at "good enough" (diminishing returns).
- When reviewing, suggest incremental improvements (not rewrites), prioritize critical → important → nice-to-have, and accept "better than before."

**2. Poka-Yoke (Error Proofing) — make errors impossible**
Defense in layers, earliest (leftmost) is best: ① type system (compile time) → ② validation (runtime, early) → ③ guards (preconditions) → ④ error boundaries (graceful degradation).
- Use types so invalid states are unrepresentable (discriminated unions with state data, `NonEmptyArray<T>`, branded types like `PositiveNumber`).
- Validate once at the system boundary, then use safely everywhere inside; never use-before-validate.
- Use early-return guards to express and enforce preconditions; fail fast and loudly with helpful messages. Make the correct path obvious and the incorrect path difficult.
- Prefer required config over optional-with-defaults; validate all config at startup so deployment/boot fails — not a production request.

**3. Standardized Work — follow proven patterns**
- Consistency over cleverness: follow existing codebase patterns, don't reinvent solved problems; introduce a new pattern only if significantly better and the team agrees.
- Documentation lives with code: README for architecture, CLAUDE.md for conventions, comments for "why" not "what", examples for complex patterns.
- Automate standards: linters enforce style, type checks enforce contracts, tests verify behavior, CI/CD enforces quality gates.
- Before adding a new pattern, search the codebase for existing solutions and check CLAUDE.md conventions; discuss exceptions and update docs.

**4. Just-In-Time (JIT / YAGNI) — build only what's needed now**
- Implement only current requirements; delete speculative "we might need this later" code.
- Start with the simplest thing that works; add complexity only when requirements change.
- Optimize when measured: profile to find the bottleneck first, measure before/after, accept "good enough" performance.
- Abstract by the Rule of Three: wait for 3+ similar cases; prefer duplication over the wrong abstraction.

**Directives**
- Always make the smallest verifiable change; verify one before continuing.
- Always leave code better than you found it.
- Put validation at the boundary, before use; make the correct path obvious and the incorrect path hard.
- Follow existing patterns; a new pattern must be better and agreed-on, and docs updated.
- No optimization without measurement; no abstraction before 3+ occurrences; delete every "just in case" line.

## Example

Iterative refinement (TypeScript, from the original skill):

```typescript
// Iteration 1: Make it work
const calculateTotal = (items: Item[]) => {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total;
};

// Iteration 2: Make it clear (refactor)
const calculateTotal = (items: Item[]): number =>
  items.reduce((total, item) => total + item.price * item.quantity, 0);

// Iteration 3: Make it robust (add validation)
const calculateTotal = (items: Item[]): number => {
  if (!items?.length) return 0;
  return items.reduce((total, item) => {
    if (item.price < 0 || item.quantity < 0) {
      throw new Error('Price and quantity must be non-negative');
    }
    return total + item.price * item.quantity;
  }, 0);
};
```

Each step is complete, tested, and working — don't try all three at once.

Poka-Yoke — validate once at the boundary, safe everywhere else:

```typescript
type PositiveNumber = number & { readonly __brand: 'PositiveNumber' };

const validatePositive = (n: number): PositiveNumber => {
  if (n <= 0) throw new Error('Must be positive');
  return n as PositiveNumber;
};

const processPayment = (amount: PositiveNumber) => {
  // amount is guaranteed positive, no need to re-check
  const fee = amount * 0.03;
};

// Validate at system boundary
const handlePaymentRequest = (req: Request) => {
  const amount = validatePositive(req.body.amount); // validate once
  processPayment(amount);                           // use everywhere safely
};
```

Make invalid states unrepresentable with discriminated unions:

```typescript
type Order =
  | { status: 'pending'; createdAt: Date }
  | { status: 'processing'; startedAt: Date; estimatedCompletion: Date }
  | { status: 'shipped'; trackingNumber: string; shippedAt: Date }
  | { status: 'delivered'; deliveredAt: Date; signature: string };
// Now it's impossible to be 'shipped' without a trackingNumber.
```

Companion commands (structured problem analysis that pairs with this method): `/why` (5 Whys root cause), `/cause-and-effect` (Fishbone multi-factor), `/plan-do-check-act` (PDCA iteration), `/analyse-problem` (A3 full documentation), `/analyse` (smart selection of Gemba/VSM/Muda). Use commands for structured problem-solving; apply this skill for day-to-day development.

## Notes

Red flags for each pillar — correct course the moment they appear:
- Violating Continuous Improvement: "I'll refactor it later" (never happens), leaving code worse than you found it, big-bang rewrites instead of incremental.
- Violating Poka-Yoke: "users should just be careful", validation after use instead of before, optional config with no validation.
- Violating Standardized Work: "I prefer to do it my way", not checking existing patterns, ignoring project conventions.
- Violating Just-In-Time: "we might need this someday", building frameworks before using them, optimizing without measuring.

Remember: it's "small improvements continuously + prevent errors by design + follow proven patterns + build only what's needed" — not "perfection on the first try + massive refactoring + clever abstractions + premature optimization." Mindset: good enough today, better tomorrow; repeat. This skill is not a substitute for environment-specific validation, testing, or expert review.

## See also

- Companion structured commands: `/why`, `/cause-and-effect`, `/plan-do-check-act`, `/analyse-problem`, `/analyse`.
- Other "incremental delivery / error-proof design / YAGNI and simplification" skills in the thinking domain.

---
Adapted from sickn33/antigravity-awesome-skills (MIT License).
