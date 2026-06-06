---
name: decision-cooldown-freeze
title: Decision Cooldown Freeze
description: Lock an already-approved high-cost or irreversible decision for a cooldown period so decision fatigue or emotional second-guessing can't impulsively reverse it; release only when a preset kill criterion fires or on an explicit, logged unfreeze. Triggers: freeze decision, cooldown
domain: 通用/thinking
triggers: [freeze a decision, decision cooldown lock, prevent impulse reversal, guard against decision fatigue, protect a split-vote boardroom call, unfreeze with stated reason, kill criterion auto-release, lock strategy during transition]
tags: [decision, thinking, discipline, cooldown, irreversible, governance, general]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [hard-call-advisor, structured-decision-framework, decision-navigator, premortem-plan-challenger]
combines_with: [decision-log-recorder, four-voice-decision-council]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## When to use

Founders and leaders are pattern-matchers; pattern-matching right after a tough decision often produces a "reversal" that is really just decision fatigue. A cooldown freeze enforces a discipline. Use it:

- After any **irreversible** or **high-cost-to-reverse** decision (fundraise, layoff/RIF, market entry or exit, pricing, strategic pivot, M&A LOI), when you fear later regret driven by fatigue or mood swings rather than new facts.
- After a **split-vote boardroom** (e.g. a 3:1 squeaker) — preserve the call against constant second-guessing.
- After a **founder gut-feel override** of unanimous advisor consensus — let the intuition actually run instead of overturning it the next morning.
- During a **personnel transition / handoff** — lock the strategy so the incoming exec executes rather than re-debates it.

Do **not** use it (negative boundary):

- When the decision is **not yet approved** — a freeze locks an *approved* decision; it is not a way to avoid deciding.
- For **reversible, low-cost** decisions — a lock is heavy discipline and not worth the overhead.
- When **reality has changed and new evidence demands review** — the freeze protects against impulse, not against reality. Here you should trigger a kill criterion and re-review, not cling to the lock.

Core idea: leaders have authority, but without an explicit lock + log, every wobble turns into "let's discuss this again" — exhausting for advisors and eroding the value of decisions already made. **The freeze is a process, not an iron rule:** it permits early release, but every early release is logged so discipline can be audited at the post-mortem.

## Steps

1. **Read the decision record** and validate it has **APPROVED** status — never freeze an unapproved decision.
2. **Choose the cooldown length** — take the default by decision type, or specify it explicitly in the command (see table below).
3. **Apply the freeze:** write `freeze_until: YYYY-MM-DD` into the decision record, set status to `FROZEN`, and record the reason and override condition.
4. **Add it to the active-freezes index** at `~/.claude/freezes/active.md` so all in-force freezes are viewable in one place.
5. **Refuse re-litigation during the freeze:** the router (or you) declines to route this topic back to review until —
   - the freeze period expires, **OR**
   - a **kill criterion** explicitly triggers, **OR**
   - an explicit `/cs:unfreeze` is issued with a stated reason (logged).

### Default freeze periods

| Decision type | Default freeze |
|---|---|
| Fundraise round size / lead choice | 30 days |
| Pricing change | 60 days |
| Market entry / exit | 90 days |
| Layoff / RIF | 30 days |
| Strategic pivot | 90 days |
| Personnel (exec hire / fire) | 60 days |
| M&A LOI | 30 days |
| Custom | specify in command |

### Commands

```
/cs:freeze   <decision-path> <days>   # apply a cooldown lock
/cs:unfreeze <decision> <reason>      # early release; reason is mandatory
```

The decision record is updated in place:

```markdown
# Decision: <title>
...
**Status:** FROZEN
**Frozen until:** YYYY-MM-DD
**Reason for freeze:** <text>
**Override condition:** Kill criterion <name> triggers OR founder issues `/cs:unfreeze` with stated reason
```

The active-freezes index is updated:

```markdown
# Active Freezes
**Updated:** YYYY-MM-DD

| Decision | Frozen until | Override condition |
|---|---|---|
| <decision title> | YYYY-MM-DD | <kill criterion or /cs:unfreeze> |
```

Two distinct release paths:

- **Explicit early release (`/cs:unfreeze`):** a person decides to release early and **must state a reason**, which is written into the decision history and preserved permanently. Forced overrides leave a paper trail that surfaces at the post-mortem and is used to audit discipline.
- **Auto-override:** a preset **kill criterion in the decision triggers** (e.g. a key metric breaches its threshold); the freeze auto-releases and the router goes immediately to `/cs:post-mortem`. The freeze protects against impulse, not against reality — once reality falsifies the call, the lock gives way.

## Example

Topic: raise the Series B at $8M or $12M round size; the board approves "$8M" by a 3:1 squeaker.

- Apply the lock: `/cs:freeze decisions/2026-06-round-size.md 30` — "fundraise round size" takes the 30-day default.
- The decision record becomes `FROZEN`, `Frozen until: 2026-07-03`, reason "split vote — protect the slim majority from repeated re-litigation," override condition "kill criterion 'two or more leads withdraw' triggers OR explicit `/cs:unfreeze`."
- On day 8 the founder wants to flip back to $12M — the router refuses to re-open the topic, noting it is within the cooldown. To change it anyway: `/cs:unfreeze 2026-06-round-size "market window tightening, need a bigger buffer"` — the reason goes into history and is preserved permanently.
- If on day 15 the lead investor actually withdraws (kill criterion hit) — the lock auto-releases and the router goes straight to `/cs:post-mortem`.

## Notes

- **Only freeze approved decisions:** validate APPROVED status first, or you are using process to dodge deciding.
- **Early release must leave a trail:** an `/cs:unfreeze` with no reason should not pass; the reason enters decision history permanently and is the basis for auditing discipline at post-mortem. An empty-reason override is as good as no lock.
- **The lock guards against impulse, not reality:** define kill criteria up front so reality can auto-release the freeze and route to post-mortem; don't treat the cooldown as an absolute "never touch this."
- **Cooldown is a process, not an iron rule:** its value is the auditability of "lock + log," not absolute prohibition of re-discussion; logging every override is more enforceable than a verbal "just don't re-decide."
- Default day counts are only a starting point — tune them to reversibility and cost-to-reverse; the higher the reversal cost and the more irreversible the decision, the longer the cooldown should be.

## See also

- Upstream: `boardroom-deliberation` (multi-role board deliberation) / `hard-call-advisor` produce an approved decision; use this skill to lock and protect that conclusion.
- Related: `decision-navigator`, `structured-decision-framework`, `premortem-plan-challenger` (premortems define the kill criteria that this skill's auto-override depends on).
- Combines with: `boardroom-deliberation` — deliberate (`/cs:boardroom`) → record the decision (`/cs:decide`) → cooldown lock (`/cs:freeze`), forming a "deliberate–lock–post-mortem" decision-discipline chain. Also `decision-log-recorder` / `decision-logger`, which the freeze updates in place. The `cs-chief-of-staff` router enforces freezes during routing.
