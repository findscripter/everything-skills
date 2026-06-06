---
name: board-meeting-prep
title: Board Meeting Prep (Adversarial)
description: Use when prepping for a board meeting, investor update, or fundraise pitch — run an adversarial rehearsal that forces numbers-cold mastery, a hard-question bank, an honest narrative, and a 48h pre-meeting checklist; triggers: board meeting, investor update, fundraising.
domain: 商业/finance
triggers: [board meeting, board prep, investor update, fundraising presentation, adversarial Q&A rehearsal, high-stakes review, director questions]
tags: [business, finance, board, investor-relations, executive-communication, adversarial-rehearsal, narrative]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [board-deck-builder, cfo-financial-advisor, cro-revenue-advisor, startup-financial-modeler]
combines_with: [board-deck-builder, cfo-financial-advisor, startup-financial-modeler]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## When to use

Use when preparing for the **adversarial** version of your board, not the friendly one: board meetings, quarterly investor updates, fundraising presentations, or any high-stakes review where **every number must live in your head, not just on a slide**.

Your board members have seen 50+ companies. They've watched founders flinch at their own numbers, spin bad news as "learning opportunities," and present sanitized decks that hide what's actually happening. They know when you're not being straight with them. This skill helps you ask the hard questions before they do.

**When NOT to use:**
- Internal team weeklies or friendly progress syncs — no adversarial rehearsal needed; forcing it just reads as over-defensive.
- Pure financial modeling / three-statement forecasting — that's data prep. This skill is about explaining it clearly under pressure.
- Settled, pure-FYI announcements that no one will challenge.

## Steps

Drive all five phases — none is optional.

**Phase 1 · Numbers Cold**
Every number in your deck should live in your head, not just the slide. Know without looking:
- Current MRR / ARR and month-over-month growth rate
- Burn rate (monthly) and runway (months at current burn)
- Headcount by department
- CAC and LTV by channel / segment
- Net Revenue Retention
- Pipeline: value, conversion rate, average sales cycle
- Churn: rate, top reasons, top churned accounts
- Gross margin (product), net margin (company)
- Key hiring positions open and time-to-fill

> Stress test: Can you answer "what's your burn?" without hesitation? "Churn rate by segment?" If you pause, you don't know it.

**Phase 2 · Anticipate the Hard Questions**
For every agenda item, generate the adversarial version of the question. Cover revenue, runway, product, team, and competition (see Example).

**Phase 3 · Build the Narrative (a leadership demonstration, not a status update)**
A fixed five-part structure:
1. **Where we are (honest)** — the real number, not the smoothed one
2. **What we learned** — what the data tells you now that you didn't know 90 days ago
3. **What we got wrong** — name it directly; don't make them ask
4. **What we're doing about it** — specific, dated, owned actions
5. **What we need from this room** — a concrete ask: not "support" but a specific introduction, decision, or resource

**Phase 4 · Adversarial Simulation**
Run a mock board. Have someone play the hardest director you have:
- Present your deck as you would
- The mock director asks every uncomfortable question
- You answer **without referring to the deck**
- After: note every question that made you pause or feel defensive

**The questions that made you defensive = the questions you need to prepare for.**

**Phase 5 · Director-by-Director Prep**
For each director, know: their primary concern right now (usually tied to their investment thesis), the metric they watch most closely, what would make them lose confidence in you, and what they said last meeting that you should address.

## Example

Source command: `/em:board-prep <agenda>` (pass in this meeting's agenda).

Sample adversarial questions by topic:

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

*Competition:*
- "Competitor Y just raised $50M. How does that change your position?"
- "If they copy your best feature in 90 days, what's your moat?"

**Common director types** (which set the angle of follow-up): **operator** (what's breaking, who owns fixing it) / **financial investor** (path to profitability or next raise) / **strategic investor** (competitive position and moat) / **independent** (governance, team dynamics, your judgment).

## Notes

- **Numbers before narrative.** Any story, however polished, collapses the moment one number you can't answer breaks it. Don't move to Phase 3 if Phase 1 isn't solid.
- **Never let the board be surprised by bad news.** If a quarter went badly, they should know *before* the deck. A 5-sentence email 3 days before: "Revenue came in at $X vs $Y target. Here's what happened, here's what I'm doing, here's what I need from you." Revealing it live ambushes them in front of peers.
- The mock board must be **real, out loud, no deck** — silently rehearsing in your head has no stress-test value.
- "What we need from this room" must be concrete down to a person / decision / resource. "Please support us" says nothing.
- The best board meetings aren't where everything looks good — they're where the CEO demonstrates they see reality clearly, have a plan, and can execute under pressure.

**Pre-meeting checklist (48 hours before):**
- [ ] All numbers verified against source systems (not last week's export)
- [ ] Deck reviewed for internal consistency
- [ ] Pre-read sent to board (deck + 1-page brief on key topics)
- [ ] One-on-ones done with any director likely to have concerns
- [ ] 3 hardest questions you expect — rehearsed out loud

**Day of meeting:**
- [ ] Agenda with time allocations distributed
- [ ] Know the ask for each agenda item (decision needed / input wanted / FYI)
- [ ] Leave-behind materials and a follow-up action template ready

**During the meeting** — what the board is watching: Do you own the bad news or deflect it? Defending a narrative or sharing reality? Do you know your numbers or look them up? When challenged, defensive or engaged? Do you know what you don't know? The single best move: **name the hard thing before they do** — "I want to address the revenue miss directly. Here's what happened, here's what I should have caught earlier, here's what changes."

**After the meeting (within 24 hours):** send action items with owners and dates; send any data you promised but didn't have; note the questions you weren't ready for; schedule follow-up with any director who seemed unsatisfied. The next board prep starts now.

## See also

- Companion skills under the same source: `board-deck-builder`, `cfo-financial-advisor`, `startup-financial-modeler`, `cro-revenue-advisor` (combine for deck + numbers + narrative).
- Executive-communication and fundraising-prep skills under `executive-mentor` / `c-level-advisor`.
- Financial-metrics, investor-relations, and quarterly-retrospective entries in the business/finance domain.
