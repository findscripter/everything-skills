---
name: boardroom-deliberation
title: Multi-Role Boardroom Deliberation (6-Phase C-Suite)
description: Run a high-stakes decision through 6-phase adversarial C-suite deliberation (brief - isolated independent positions - cross-examination - devil's advocate - synthesis - hand-off) to surface dissent and avoid groupthink, producing a board memo with a vote tally. Triggers: boardroo
domain: 通用/thinking
triggers: [boardroom deliberation, multi-role decision review, C-suite adversarial review, avoid groupthink, decision vote and dissent, devil's advocate challenge, strategy brief review, board memo]
tags: [decision, thinking, multi-role, adversarial-review, group-decision, risk-assessment, general]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [executive-adversarial-mentor, premortem-plan-challenger, business-assumption-stress-test, board-meeting-prep]
combines_with: [premortem-plan-challenger, board-deck-builder, entity-research-dossier]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## When to use

Use this when:

- You face a **high-stakes, irreversible, or high-disagreement** decision that needs simultaneous review from multiple expert lenses — finance, risk, product, growth, engineering, etc.
- You worry the review will collapse into **sycophancy or groupthink**, and you want to deliberately surface the dissent that "going along to get along" would have suppressed.
- You need an archivable decision memo with a **vote tally and unresolved dissent** — not just a plan someone "looked at."

Do not use (negative boundary):

- Low-stakes, reversible, single-lens calls — the 6-phase protocol is heavy and will slow you down.
- Pure execution scheduling or task breakdown (that is the "after the decision" work).
- Situations with no real disagreement between roles and highly symmetric information — isolated independent thinking adds nothing.

Core idea: **Phase 2 isolation is the single highest-leverage practice in the protocol.** If advisors see each other's positions before forming their own, they anchor. Only isolation forces out the dissents that would otherwise stay hidden.

## Steps

The six phases (orchestrated by a **Chief of Staff** role), from the underlying `board-meeting` skill:

1. **Phase 1 — Briefing.** The Chief of Staff distributes the strategy brief to all advisors marked in **Affected Roles**. Each advisor reads `company-context.md` + the brief. No discussion yet.
2. **Phase 2 — Independent Thinking (ISOLATION).** Each advisor produces their position **independently, without seeing others' positions**. This is the key anti-groupthink step. Each writes: their voice's opening, recommendation, top 3 concerns, top 3 supports.
3. **Phase 3 — Cross-Examination.** Positions are revealed simultaneously. Each advisor critiques the others **on the dimension they own**:
   - cs-cfo-advisor critiques the math
   - cs-ciso-advisor critiques the risk
   - cs-cpo-advisor critiques the JTBD
   - cs-cmo-advisor critiques the positioning
   - cs-cro-advisor critiques the revenue math
   - etc.
4. **Phase 4 — Devil's Advocate Pass.** The `executive-mentor/devils-advocate` agent runs `/em:challenge` on the **leading option**, surfacing three concerns with severity ratings (CRITICAL / HIGH / MEDIUM).
5. **Phase 5 — Synthesis.** The Chief of Staff synthesizes: which option commands a majority, and which dissents remain unresolved. Produces the **board memo** with recommendation + dissent.
6. **Phase 6 — Decision Hand-off.** The memo is presented to the founder, who **accepts, modifies, or rejects**. An approved memo routes to `/cs:decide` for logging.

Operational workflow:

1. Read the brief from `~/.claude/briefs/<file>`.
2. Identify affected roles.
3. Invoke each `cs-*` advisor **independently** (Phase 2) — each role must get its own single prompt, with no other role's output included.
4. Collect positions, then reveal simultaneously and run the cross-examination round (Phase 3).
5. Run `/em:challenge` on the leading option (Phase 4).
6. Synthesize the memo (Phase 5).
7. Hand off to the founder for decision (Phase 6).

## Example

Topic: should we migrate the core product from our own data center to the cloud?

- **Phase 1:** The Chief of Staff sends the migration brief to four affected roles — cs-ceo-advisor, cs-cfo-advisor, cs-cto-advisor, cs-ciso-advisor.
- **Phase 2 (isolation):** All four write positions without seeing each other. The CFO independently computes a *higher* 3-year TCO and recommends "do not migrate"; the CTO independently recommends "migrate" for elastic scaling. **Because of isolation, the CFO's objection is not anchored by the CTO's optimism.**
- **Phase 3:** Positions revealed simultaneously. The CFO challenges the CTO for omitting egress traffic costs; the CISO challenges the compliance risk during the migration window.
- **Phase 4:** Run `/em:challenge` on the leading option "phased migration." Surfaces a CRITICAL: no rollback plan for dual-write inconsistency during the cutover window.
- **Phase 5:** The Chief of Staff synthesizes — "phased migration" wins a 3:1 majority; the CFO's cost dissent is logged as unresolved.
- **Phase 6:** Memo archived to `~/.claude/boardroom/2026-06-02-cloud-migration.md` with status AWAITING FOUNDER DECISION, handed to the founder.

Board memo template (saved to `~/.claude/boardroom/YYYY-MM-DD-<slug>.md`):

```markdown
# Board Memo: <topic>
**Date:** YYYY-MM-DD
**Brief:** <link to /cs:brief file>
**Status:** AWAITING FOUNDER DECISION | APPROVED | REJECTED

## Question
[One sentence from the brief]

## Recommended Option
**<Option name>** — chosen because <synthesis reasoning>

## Vote Tally
| Advisor | Vote | One-Sentence Reason |
|---|---|---|
| cs-ceo-advisor | A | <reason> |
| cs-cfo-advisor | A | <reason> |
| cs-cto-advisor | B | <reason> |
| ... | | |

## Dissent
- **<dissenter>:** <unresolved concern>

## Devil's Advocate Concerns
1. **CRITICAL** — <concern> — Mitigation: <plan>
2. **HIGH** — <concern> — Mitigation: <plan>
3. **MEDIUM** — <concern> — Mitigation: <plan>

## Success & Kill Criteria
[Copied from brief, refined by the panel]

## Recommended Decision Path
- `/cs:decide` → log the decision
- `/cs:execute` → 90-day plan
- `/cs:cross-eval` → multi-model sanity check (optional, high-stakes)
- `/cs:freeze N` → cooldown lock (optional, irreversible)
```

## Notes

- **Isolation is non-negotiable:** Phase 2 must prompt each advisor separately and never let them see one another. Otherwise the protocol degrades into an ordinary serial review and loses its value of exposing dissent.
- **Make dissent explicit and traceable:** even when the majority option is adopted, list every unresolved dissent in the memo's Dissent column — do not paper over it.
- During cross-examination, have each advisor critique **only the dimension they own**, to avoid out-of-lane hand-waving and keep the scrutiny sharp.
- Run the devil's advocate pass **only on the leading option** — do not spread effort evenly across all options.
- **Why this beats a simple serial review chain (e.g. CEO → design → eng):**

  | | serial `/autoplan` | `/cs:boardroom` |
  |---|---|---|
  | Roles | CEO → design → eng (3) | Up to 10 C-roles |
  | Order | Sequential | Phase 2 isolation, then simultaneous |
  | Dissent capture | Implicit | Explicit dissent column |
  | Adversarial pass | No | Phase 4 devil's advocate |
  | Output | Reviewed plan | Voted memo with dissent + kill criteria |

## See also

- Pipeline position: `/cs:office-hours` → `/cs:brief` → **`/cs:boardroom`** → `/cs:decide` → `/cs:execute` → `/cs:post-mortem`.
- Downstream routing: `/cs:decide` (log approved memo), `/cs:cross-eval` (high-stakes second opinion / multi-model check), `/cs:freeze N` (cooldown lock, irreversible, optional).
- Related agent / skills: Chief of Staff (`cs-chief-of-staff`), the underlying `board-meeting` protocol, and `executive-mentor` (provides the devil's advocate `/em:challenge`).
- Related skills in this library: `executive-adversarial-mentor`, `premortem-plan-challenger`, `business-assumption-stress-test`, `board-meeting-prep`. Combines with: `premortem-plan-challenger`, `board-deck-builder`, `entity-research-dossier`.

---

Adapted from alirezarezvani/claude-skills (MIT License).
