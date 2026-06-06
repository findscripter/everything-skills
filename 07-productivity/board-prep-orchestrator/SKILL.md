---
name: board-prep-orchestrator
title: Board Prep Orchestrator
description: Use to systematically prepare for a high-stakes, adversarial board meeting / investor update / fundraising pitch by orchestrating numbers-cold mastery, a hard-question bank, a five-part narrative, a mock-board rehearsal, and director-by-director prep into a pre-meeting pipeline; 
domain: 协作/pm
triggers: [board prep, board meeting preparation, investor update, fundraising presentation, adversarial Q&A rehearsal, mock board meeting, director-by-director prep, 48-hour pre-board checklist, high-stakes review prep]
tags: [collaboration, pm, board, investor-relations, meeting-prep, adversarial-rehearsal, narrative, orchestration]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [board-meeting-prep, board-deck-builder, cfo-financial-advisor, investor-materials-builder, executive-adversarial-mentor]
combines_with: [board-deck-builder, executive-adversarial-mentor, cfo-financial-advisor, boardroom-deliberation]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## When to use

Prepare for the **adversarial version of your board, not the friendly one**: every hard question they'll ask, every number you need cold, and the narrative that acknowledges weakness without losing the room. This skill does not build your deck — it orchestrates *numbers → questions → narrative → rehearsal → director-by-director* into a single pre-meeting pipeline, delivering checkable artifacts at each phase.

Use it when you are systematically preparing for a **high-stakes, adversarial review**, typically:

- Quarterly / monthly board meetings — especially when last quarter's results were bad and you have to face bad news head-on.
- Investor updates, fundraising pitches, partner meetings — any setting where every number must live in your head, not just on a slide.
- Any high-stakes briefing that will be sharply challenged and needs rehearsing until you no longer flinch.

**Out of scope:**
- Internal team weeklies and friendly progress syncs — no adversarial rehearsal needed; this is overkill.
- Layout, narrative, and "so what" structure for the reporting deck itself → use `board-deck-builder`.
- Pure financial modeling (base/bull/bear runway, cohort LTV, dilution scenarios) → use `cfo-financial-advisor`.
- Bulk-refreshing deck data or producing external pitch materials → use `pitch-deck-refresh` / `investor-materials-builder`.

Your board members have seen 50+ companies. They've watched founders flinch at their own numbers, spin bad news as "learning opportunities," and present sanitized decks that hide what's actually happening. The best board meetings aren't the ones where everything looks good — they're the ones where the CEO demonstrates they see reality clearly, have a plan, and can execute under pressure.

## Steps

Work through five phases. Each produces a checkable artifact. **Core principle: never let the board learn the bad news for the first time while looking at the deck.**

**Phase 1 — Numbers cold.** Move every number in your deck into your head; self-test that you can answer each instantly.

Numbers you must know without looking:
- Current MRR / ARR and month-over-month growth rate
- Burn rate (monthly) and runway (months at current burn)
- Headcount by department
- CAC and LTV by channel / segment
- Net Revenue Retention
- Pipeline: value, conversion rate, average sales cycle
- Churn: rate, top reasons, top churned accounts
- Gross margin (product), net margin (company)
- Key hiring positions open and time-to-fill

*Stress test yourself:* Can you answer "what's your burn?" without hesitation? "What's your churn rate by segment?" If you pause, you don't know it.

**Phase 2 — Anticipate the hard questions.** For every agenda item, generate the **adversarial version** of the question (see the standard bank in Example). Write each anticipated question as a paragraph you can answer out loud.

**Phase 3 — Build the narrative.** The board meeting isn't a status update; it's a leadership demonstration. Structure it in five parts:
1. **Where we are (honest)** — the real number, not the smoothed one.
2. **What we learned** — what the data is telling you that you didn't know 90 days ago.
3. **What we got wrong** — name it directly; don't make them ask.
4. **What we're doing about it** — specific, dated, owned actions.
5. **What we need from this room** — a concrete ask. Not "support" — specific introductions, decisions, resources.

**Phase 4 — Adversarial preparation.** Run a mock board meeting; have someone play the hardest director you have. Present your deck as you would → the mock director asks every uncomfortable question → you answer **without referring to the deck** → afterward, note every question that made you pause or feel defensive. *The questions that made you defensive = the questions you need to prepare for.*

**Phase 5 — Director-by-director prep.** Not all board members want the same thing. For each director, know: their primary concern right now (usually tied to their investment thesis), the metric they watch most closely, what would make them lose confidence in you, and what they said last meeting that you should address.

## Example

**Standard adversarial question bank (by topic) — write a spoken answer for each before the meeting:**

*Revenue performance:*
- "You missed revenue by 20% this quarter. What specifically failed?"
- "Is this a pipeline problem, a conversion problem, or a capacity problem?"
- "If you missed because of one big deal, how dependent is your model on individual deals?"
- "When do you project recovery and what are the leading indicators you're right?"

*Runway / burn:*
- "At current burn you have N months. What's your plan if the next round takes 9 months?"
- "What would you cut first if you had to extend runway by 6 months today?"
- "Is there a scenario where you don't raise another round?"

*Product / roadmap:*
- "You shipped X. What did customers actually do with it?"
- "What did you kill this quarter and why?"
- "Where are you behind on roadmap? What's slipping?"

*Team:*
- "Who's at risk of leaving? How would that affect execution?"
- "You've had 3 VP-level hires not work out. What pattern do you see?"
- "Is the team the right team for this stage?"

*Competition:*
- "Competitor Y just raised $50M. How does that change your position?"
- "If they copy your best feature in 90 days, what's your moat?"

**Common director types and what they want (for Phase 5):**

| Type | What they want |
|------|----------------|
| The operator | What's breaking and who owns fixing it |
| The financial investor | Path to profitability or next raise |
| The strategic investor | Competitive position and moat |
| The independent | Governance, team dynamics, your judgment |

**Pre-meeting checklist — 48 hours before:**
- [ ] All numbers verified against source systems (not last week's export)
- [ ] Deck reviewed for internal consistency
- [ ] Pre-read sent to board (deck + 1-page brief on key topics)
- [ ] One-on-ones done with any director likely to have concerns
- [ ] 3 hardest questions you expect — rehearsed out loud

**Day of meeting:**
- [ ] Agenda with time allocations distributed
- [ ] Know the ask for each agenda item (decision needed, input wanted, FYI)
- [ ] Materials to leave behind prepared
- [ ] Follow-up action template ready

**Bad-news pre-warning email (3 days out, 5 sentences):**

> Revenue came in at $X vs $Y target. Here's what happened, here's what I'm doing, here's what I need from you.

**"Name the hard thing first" opening (before they bring it up):**

> I want to address the revenue miss directly. Here's what happened, here's what I should have caught earlier, here's what changes.

**What the board is watching during the meeting:**

| They're watching | Good looks like |
|------------------|-----------------|
| Do you own the bad news or deflect it? | Own it; don't deflect |
| Defending a narrative vs. sharing reality | Sharing reality |
| Numbers from your head vs. looking them up | Cold, from memory |
| When challenged: defensive or engaged | Engage, not defend |
| Do you know what you don't know? | Acknowledge the unknowns |

**Within 24 hours after the meeting:**
- Send action items with owners and dates
- Send any data you promised but didn't have on hand
- Note the questions that came up you weren't ready for
- Schedule follow-up with any director who seemed unsatisfied — the next board prep starts now.

## Notes

- **Bad news must never surprise the board.** A bad quarter should be known before they see the deck (the 5-sentence email 3 days out).
- **Numbers are the verdict, not decoration.** If Phase 1 fails (you pause when asked), even a beautiful narrative collapses under follow-up questions — memorize the numbers before orchestrating the story.
- **"The question that makes you defensive" is a signal.** Every question that put you on the defensive in Phase 4 is a hole left in Phase 2/3 — backfill it.
- **Narrative is not whitewashing.** Acknowledging weakness ≠ packaging bad news as a "learning opportunity." Directors have seen 50+ companies and can smell the spin.
- **This skill only orchestrates the people-and-Q&A flow from pre-meeting to post-meeting.** Hand deck production to `board-deck-builder`, financial numbers and runway models to `cfo-financial-advisor`, and multi-role adversarial deliberation of a single major decision to `boardroom-deliberation`.

## See also

- **requires:** none — can be used standalone.
- **related:** `board-meeting-prep` (same-source adversarial board rehearsal, business/finance lens, more focused on numbers-cold and Q&A); `board-deck-builder` (reporting materials and narrative structure); `cfo-financial-advisor` (financial numbers and runway models); `investor-materials-builder` (external fundraising materials); `executive-adversarial-mentor` (general adversarial stress-testing and pre-mortem).
- **combines_with:** `board-deck-builder` (orchestrate narrative and asks first, then generate the deck); `executive-adversarial-mentor` (use it as the mock director and vulnerability rating in Phase 4); `cfo-financial-advisor` (feed it all the financial numbers Phase 1 needs); `boardroom-deliberation` (when an agenda item is itself a high-stakes decision needing internal multi-role deliberation first).

---
Adapted from alirezarezvani/claude-skills (MIT license).
