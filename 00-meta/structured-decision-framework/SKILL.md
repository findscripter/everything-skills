---
name: structured-decision-framework
title: Structured Decision Framework
description: Use after a high-stakes, irreversible decision is already APPROVED and must become a durable, auditable record; capture the chosen and rejected options with rationale, quantified success/kill criteria, verbatim-preserved dissent, and a review checkpoint, split into a two-layer me
domain: 通用/thinking
triggers: [log a decision, decision record, approved decision log, success and kill criteria, review checkpoint, preserve dissent verbatim, two-layer decision memory, stale-decision audit, turn approved memo into a record]
tags: [decision, thinking, decision-record, post-mortem, knowledge-retention, governance, general]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [decision-log-recorder, hard-call-advisor, four-voice-decision-council, premortem-plan-challenger]
combines_with: [adr-writer, business-assumption-stress-test]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## When to use

Use it when:

- A **high-stakes, irreversible, or strongly contested** decision **has already been made (APPROVED)** and you need to harden it from "we discussed it in a meeting" into a traceable, reviewable **durable record**.
- You worry that later you will only remember "what was chosen" but forget "why someone disagreed" — and the dissent often turns out to have been correct once the kill criteria trigger.
- You need to keep the **decision conclusion** and the **decision process** in separate stores: the conclusion feeds future decisions; the raw process is reference-only and never auto-replayed, so unresolved debates are never mistaken for settled consensus.

Do NOT use it (negative boundaries):

- The decision is **not yet made** and is still in multi-perspective option weighing — that is deliberation (see `boardroom-deliberation`); this skill only handles logging **after approval**.
- Low-risk, reversible, easily-changed small calls — heavyweight recording is just overhead.
- Pure task scheduling / execution breakdown (that is "after the decision" delivery, not the decision itself).

Core idea: **two-layer memory**. The raw process (every session, every party's position, every dissent) is read-only archive and is **never auto-fed back**; only the **approved conclusion** becomes the "company memory" that replays into future decisions. This isolation prevents the system from "remembering" unresolved debates as if they were decisions.

## Steps

1. **Read the source and verify approval.** Take the proposal/memo and confirm its status is `APPROVED`. If not approved, do not log — return it to deliberation.
2. **Extract the structured decision record** fields: decision title, date decided, approver, option chosen, rejected options + one-line rationale, quantified success criteria, quantified kill criteria, **dissent preserved verbatim**, review checkpoint date.
3. **Write to the "approved" layer.** Append to `~/.claude/decisions/approved/<YYYY-MM-DD>-<slug>.md` (one file per decision). This layer feeds future decisions.
4. **Update the "raw" layer pointer.** Keep process material under `~/.claude/decisions/raw/`, and back-link to it from the approved record. The raw layer is read-only and never auto-replays.
5. **Schedule the auto-revisit.** Default: trigger a review checkpoint after 90 days.
6. **(Optional) Sync to the knowledge vault.** If a vault bridge is configured, also write a copy to `~/company-vault/10-decisions/`.

Instructions / constraints:

- Approved record path: `~/.claude/decisions/approved/<YYYY-MM-DD>-<slug>.md`; raw process archive: `~/.claude/decisions/raw/`.
- Both success criteria and kill criteria must be **quantified** (metric + threshold + timeframe/action), otherwise they cannot be adjudicated at review time.
- Dissent is **preserved verbatim** — do not summarize, delete, or edit it. This is the single most important discipline of the framework.
- Default review cycle is 90 days; irreversible decisions may add a cooling-off lock.

Decision record template:

```markdown
# Decision: <title>
**Decided:** YYYY-MM-DD
**By:** <approver name>
**Memo:** <link to deliberation memo>
**Brief:** <link to original brief>
**Review checkpoint:** YYYY-MM-DD (90d default)

## Decision
**Chose:** <option>
**Rejected:** <other options + one-line why>

## Success Criteria (binding)
- <metric, threshold, timeframe>

## Kill Criteria (binding)
- <metric, threshold, action>

## Preserved Dissent
- **<dissenter>:** <unresolved concern>
- (preserved verbatim; dissent never erased)

## Next Action
- 90-day execution plan due <date>

## Status History
- YYYY-MM-DD: APPROVED
```

Stale-decision audit (run periodically, e.g. weekly):

- Decisions > 90 days without a revisit → flag for review.
- Decisions whose kill criteria have triggered → flag immediately.
- Decisions whose underlying context/assumptions have changed → flag for re-examination.

## Example

Topic: should we migrate the core product to the cloud (already passed 3:1 in deliberation as a "phased migration", with the CFO holding a cost dissent).

After logging, written to `~/.claude/decisions/approved/2026-06-03-cloud-migration.md`:

```markdown
# Decision: Phased cloud migration of the core product
**Decided:** 2026-06-03
**By:** Founder
**Review checkpoint:** 2026-09-01 (90d)

## Decision
**Chose:** Phased migration (stateless services first)
**Rejected:** Big-bang full migration (high rollback risk); keep self-hosted (forgo elastic scaling)

## Success Criteria (binding)
- After Phase 1 ships, P95 latency ≤ current value AND monthly cloud cost ≤ 1.1× budget, achieved within 3 months.

## Kill Criteria (binding)
- If one or more non-rollbackable data-inconsistency incidents occur during migration → pause remaining phases and run a post-mortem.

## Preserved Dissent
- **CFO:** 3-year TCO model actually rises; egress traffic fees may be underestimated (preserved verbatim, unresolved).

## Status History
- 2026-06-03: APPROVED
```

At the September checkpoint, if cloud cost exceeds the CFO's warned threshold, the kill criteria together with that **preserved dissent** jointly signal that the original objection may have been right.

## Notes

- **The two-layer isolation is non-negotiable.** The raw process must never auto-feed future decisions; otherwise the system treats unresolved debate as a settled conclusion and "hallucinates" a consensus that never existed.
- **Dissent leaves a verbatim trace.** Even when the majority option is adopted, unresolved dissent is listed separately and never smoothed over — it is the most valuable honesty receipt at post-mortem time.
- **Success/kill criteria must be quantified.** A criterion with no threshold = unadjudicable at review = effectively not written.
- **Only log APPROVED decisions.** Anything not in `APPROVED` status is returned; do not contaminate "company memory" with drafts.
- This framework governs **recording and review**, not the multi-perspective evaluation of the decision itself.

## See also

- requires: none (but typically follows a completed deliberation).
- related: `decision-navigator` (converge a stuck problem into actionable steps), `premortem-plan-challenger` (pre-mortem failure analysis), `executive-adversarial-mentor` (adversarial stress test).
- combines_with: `boardroom-deliberation` — the upstream produces a memo with votes and dissent; this skill hardens the approved conclusion into a durable record and schedules its review.
