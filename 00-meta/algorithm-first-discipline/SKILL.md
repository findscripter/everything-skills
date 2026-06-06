---
name: algorithm-first-discipline
title: Algorithm-First Discipline
description: Use when writing or reviewing code with loops, queries, joins, recursion, or collection traversal over more than a handful of items: state Big-O, data structure, and algorithm family BEFORE coding to catch O(n^2), N+1, and brute-force defaults. Not for n<10 trivial sets, one-shot
domain: 通用/thinking
triggers: [about to write a for inside a for, calling .find/.includes/.indexOf inside a loop, await inside for/map/forEach over independent items, one query per item in a collection, reviewing AI code that looks idiomatic but may hide O(n^2), claiming code is fast/efficient/scales without a derivation, auditing a PR for await-in-loop, N+1, SELECT *, recursion without a stated base case or memoization plan]
tags: [algorithms, big-o, complexity, performance, code-review, data-structures, discipline, gateway]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [large-scale-math-algorithms, complexity-cuts, invariant-guard-correctness, python-performance-optimization]
combines_with: [closed-loop-delivery, adversarial-code-reviewer, code-reviewer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
The model already knows Big-O, hash tables, divide-and-conquer, dynamic programming, sorting, graph algorithms, and amortized analysis. It just does not apply them spontaneously. This skill fixes the **behavior**, not the knowledge. It is the gateway for an algorithm-discipline suite of four skills (this one, `mathguard`, `invariant-guard`, `complexity-cuts`) and enforces the hard rules every other guard in the suite assumes.

**Violating the letter of these rules is violating the spirit of the skill.** "Just this once" is how O(n²) ships to production.

## When to use

Use this skill when:

- Writing, editing, or reviewing code that involves loops, collections, lookups, searches, joins, recursion, graphs, queries, or any computation over more than a handful of items.
- About to write a `for` inside a `for`, `.find` / `.includes` / `.indexOf` inside a loop, `await` inside `for` / `map` / `forEach` over independent items, or one query per item in a collection.
- Auditing a codebase / PR for known anti-patterns (await-in-loop, `.includes` inside `.filter`, string-concat in loop, `SELECT *`, N+1, etc.).
- Reviewing AI-generated code that "looks idiomatic" but might hide O(n²) or N+1.

When in doubt, **start here** — this is the gateway and will tell you when to escalate to its three sibling skills.

| If you are about to… | Use | Why |
| --- | --- | --- |
| Write *new* code that loops, queries, joins, recurses, or processes a collection | **this skill** | Forces complexity + data structure + algorithm family **before** code is written. |
| Refactor *existing* code that is already slow, OOMs, times out, or has nested loops / N+1 / repeated work | **complexity-cuts** | Corrective playbook for code that already shipped with bad Big-O. |
| Implement an algorithm where the obvious version is subtly wrong (binary search variants, in-place dedup, Boyer–Moore, QuickSelect partition, recursion with accumulators, fixed-point / termination concerns) | **invariant-guard** | Forces writing the function contract + loop invariant before code. The trap is in the contract, not the loop body. |
| Work with n ≥ 10⁶, similarity search, dedup at scale, top-K, streaming analytics, cardinality estimation, embeddings, FFT/NTT, dimensionality reduction, computational geometry, randomized algorithms | **mathguard** | Classical algorithms have hit their lower bound; an approximate or math-heavy technique (Bloom, HLL, Count-Min, MinHash/LSH, FFT, JL projection, sweep line, kd-tree) gives the asymptotic win. |

**Exemptions (do NOT use):**

- `n < ~10` trivial collections and one-shot setup code — do not waste time stating complexity for `for i in range(3)`.
- Constant-factor wins, latency tails, I/O bottlenecks — those need a profiler; this skill forces asymptotic reasoning only, not measurement.
- Auto-rewriting existing slow code — that is `complexity-cuts`; this is a reasoning gate run *before* writing, it does not modify shipped code.
- Intentional brute force — if the author writes a one-line justification ("n ≤ 100 in practice; readability matters more"), brute force ships. The skill only requires the justification to exist.

## Steps

**The Iron Law:**

```text
NO NON-TRIVIAL CODE WITHOUT STATED COMPLEXITY, DATA STRUCTURE, AND ALGORITHM FAMILY
```

Before producing non-trivial code, your message must contain the seven-step pre-write protocol — **in this order**:

1. **Problem shape** — one sentence. ("Given n events with a timestamp, find the longest contiguous window where total weight ≤ K.")
2. **Input dimensions** — `n = ?`, realistic magnitude (e.g. `n ~ 10^6 rows`), whether hot path.
3. **Target complexity** — `time = O(?)`, `space = O(?)`, with the dominant input dimension named.
4. **Data structures** — name each collection-shaped value deliberately from `Array / List / Set / HashMap / TreeMap / Heap / Deque / Trie / Graph / BitSet / Counter / LinkedList`, with a one-phrase reason ("Set for O(1) membership inside the loop", "Heap for top-K in O(n log k)"). Default to hashed structures (`Set`, `Map`) for lookup inside loops; default to streaming/iterator over a materialized list when n is large.
5. **Algorithm family** — name one of: `linear scan`, `divide and conquer`, `two-pointer`, `sliding window`, `binary search`, `sort + sweep`, `hash join`, `BFS/DFS`, `topological sort`, `Dijkstra/A*`, `union-find`, `dynamic programming`, `greedy`, `recursion + memoization`, `prefix sum`, `segment tree`, `monoid reduction`. If you cannot name a family, you are about to write brute force — stop and reconsider.
6. **Edge cases you will handle** — empty, singleton, all-equal, n=1, n=max, overflow, duplicates. List the ones that apply.
7. **The code.**

If any of 1–6 is missing, do not emit code yet. If you cannot state all three of complexity, structure, and family, you do not understand the problem — ask, or read more code.

### Non-negotiable rules

1. **State complexity before writing any non-trivial code.** One line: `time = O(?)`, `space = O(?)`, dominant input dimension with realistic magnitude. If you cannot state these, you do not yet understand the problem.
2. **Name the data structure with a one-phrase reason.** Prefer `Counter`/`Map` to fold a nested loop into a single pass; prefer streaming when n is large.
3. **Identify the algorithm family before writing.** No family named = about to write brute force.
4. **Repeated work in loops is algorithmic waste** — presumed wrong until justified. If any of these must live inside a loop, write a one-comment line explaining why:
   - I/O inside a loop (DB queries, HTTP, file reads) → batch with `IN (...)`, `Promise.all`, bulk endpoints, streaming.
   - Recomputing the same value → hoist or memoize.
   - Re-sorting / re-grouping inside a loop → sort once outside.
   - Linear scan (`.find`, `.indexOf`, `.includes`, `in list`) inside a loop → precompute an index `Map`.
   - Allocating fresh structures per iteration → hoist the allocation and reuse.
   - Materializing intermediate collections only to iterate again → fuse into one pass.
5. **No invented complexity or numbers.** Never write "O(log n) on average" without an argument; never write "10x faster" or "~3ms" without measuring. If you cannot derive complexity, write `<complexity: TBD>`; if you have not measured, write `<measured: TBD>`. Move on.

### Red flags — STOP and restart the protocol

- `for` inside a `for` without first stating it is the intended O(n·m).
- `.find` / `.includes` / `.indexOf` inside a loop body.
- `await` inside `for` / `map` / `forEach` over independent items.
- One query per item in a collection.
- Recursion without a stated base case or memoization plan.
- Writing code without having stated complexity.
- Claiming "this is fast" / "efficient" / "scales" without a derivation.
- Copying a brute-force solution from memory because it "should work for now".

All of these mean: stop, restart the seven-step protocol, choose a better algorithm or explicitly accept the brute force with a written justification.

## Example

The same problem with and without the seven-step protocol.

**Problem.** Given `users: User[]` and `bannedIds: string[]`, return users whose `id` is not banned. Realistic n: 50k users, 5k banned.

**Without the protocol — ships O(n·m):**

```ts
// Looks idiomatic, ships O(n·m)
const active = users.filter((u) => !bannedIds.includes(u.id));
```

`bannedIds.includes` is O(m) per call. The filter runs it n times → 50k × 5k = 250M comparisons. This is the default an AI ships when asked "filter the active users."

**With the protocol — O(n + m):**

```ts
// Protocol applied:
//   time = O(n + m), space = O(m), n = 50k users, m = 5k banned
//   structure: Set<string> for O(1) membership inside the loop
//   family: linear scan with hashed lookup
//   edge cases: empty users → [], empty bannedIds → users, duplicates in bannedIds → fine (Set dedupes)
const banned = new Set(bannedIds);
const active = users.filter((u) => !banned.has(u.id));
```

Readability is unchanged; asymptotic complexity drops from O(n·m) to O(n + m).

**Rationalizations to watch for** (real verbatim thoughts captured from controlled tests where the model shipped O(n·m) code):

| Excuse | Reality |
| --- | --- |
| "`.filter` then `.reduce` is the idiomatic way, ship it." | Idiomatic ≠ correct asymptotic. Idiom-driven coding is how O(n²) ships. |
| "It's fine for now, we can optimize later." | Later is a different engineer with no context. State the complexity now. |
| "I'll just use `Array.find` here, it's just one lookup." | One lookup inside a loop over `n` items is `O(n)` lookups. Make the `Map` outside. |
| "The data is small in dev — I'll worry about scale when we ship." | Production data is never the size of dev data. The seven-step protocol takes 30 seconds. |
| "I already understand the problem, the protocol is overhead." | The cases the protocol "wastes time on" are the cases that break in prod. |

## Notes

**Verification checklist (every box must pass before claiming done):**
- [ ] `time = O(?)` and `space = O(?)` appear in the message or PR description.
- [ ] Dominant input dimension is named with a realistic magnitude.
- [ ] Every collection-shaped value has a deliberate data-structure choice with a one-phrase reason.
- [ ] The algorithm family is named (not "a loop").
- [ ] No I/O, `.find` / `.includes` / `.indexOf`, regex compile, sort, or independent `await` sits inside a loop without a one-line justification.
- [ ] The shipped code matches the complexity that was claimed (re-derive if uncertain).
- [ ] Edge cases listed in the pre-write protocol each have a corresponding code path or test.
- [ ] Any "fast" / "efficient" / "scales" claim has a derivation or a measurement — `<measured: TBD>` is acceptable; an unsupported claim is not.

Cannot check every box? You did not run the protocol — restart from step 1.

**Escalate to sibling skills:** math-level optimization (probabilistic data structures, FFT, dimensionality reduction, approximation algorithms, computational geometry, n large) → `mathguard`; correctness traps (loop invariants, termination, recursion base cases, edges tests miss) → `invariant-guard`; existing shipped code with bad Big-O → `complexity-cuts`. When unsure, start here and it will tell you when to escalate.

**Optional upstream CLI scanner (use with caution).** The upstream `morsechimwai/lemmaly` repo ships a deterministic CLI scanner enforcing the same anti-patterns (**59 rules across 11 languages**: JS/TS, Python, SQL, Java, C#, C++, Go, Rust, PHP, Ruby, Shell). **Do not auto-clone and run it from the default branch** — that executes arbitrary current code in a third-party repo. If the user explicitly wants the scanner, pin the source to a reviewed release tag or commit, use a throwaway directory, and print the resolved commit before running:

```bash
# Replace <reviewed-tag-or-commit> after reviewing the upstream release.
tmpdir="$(mktemp -d)"
git clone --filter=blob:none https://github.com/morsechimwai/lemmaly.git "$tmpdir/lemmaly"
git -C "$tmpdir/lemmaly" checkout --detach <reviewed-tag-or-commit>
git -C "$tmpdir/lemmaly" rev-parse HEAD
node "$tmpdir/lemmaly/cli/lemmaly.js" scan <path>
node "$tmpdir/lemmaly/cli/lemmaly.js" rules
```

Remove the throwaway directory only after verifying `$tmpdir` points to the directory created by `mktemp -d`. CRITICAL-severity (CI error) examples: `js-await-in-for-loop`, `js-async-in-foreach`, `py-mutable-default-arg`, `sql-update-no-where`, `java-arraylist-remove-in-for-i`, `cs-async-void`, `go-loop-var-capture`, `php-query-in-loop`.

**The thesis, in one line:** AI ships algorithmically lazy code by default; this skill makes it think first.

## See also

- `mathguard` — escalation for n ≥ 10⁶ where classical O(n log n) is the floor and probabilistic / math-heavy techniques (Bloom, HLL, Count-Min, MinHash/LSH, FFT, JL projection, sweep line, kd-tree) win.
- `invariant-guard` — correctness layer for algorithms whose obvious version is subtly wrong (binary search variants, in-place dedup, Boyer–Moore, QuickSelect partition, recursion with accumulators, termination); write the function contract + loop invariant before the code.
- `complexity-cuts` — corrective playbook for code that already shipped with bad Big-O (slow, OOM, timeout, nested loops, N+1, repeated work).

One-line mental model of the four skills: this skill = think first (prevention); `complexity-cuts` = clean up bad Big-O (correction); `invariant-guard` = prove it's correct (verification); `mathguard` = beat the classical floor (acceleration).
