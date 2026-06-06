---
name: company-culture-builder
title: Company Culture Builder
description: Build, measure, and evolve company culture as operational behavior — not wall posters; use for mission/vision/values workshops, values-to-behaviors translation, culture codes, quarterly culture-health surveys, and stage-based rituals. Triggers: company culture, values, mission/vi
domain: 协作/pm
triggers: [build company values, assess culture health, design cultural rituals, write a culture code, handle culture clashes, mission vision values workshop, manage culture debt, founder culture trap]
tags: [collaboration, pm, company-culture, values, org-development, culture-metrics, culture-code]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [company-culture-architect, company-operating-system, org-health-diagnostic, hr-partner-pro]
combines_with: [company-operating-system, org-change-management, org-health-diagnostic]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## When to use

Use this skill to turn "values on the wall" into "what people actually do." Culture is what you DO, not what you SAY — this builds culture as an operational system: observable behaviors, measurable health, and rituals that scale.

Typical scenarios:

- Extract or reshape mission / vision / values from scratch and translate them into observable behaviors.
- Write a public culture code for hiring and self-selection.
- Design a quarterly culture-health survey, interpret results, and plan interventions.
- Design cultural rituals by team size (<15 / 15–50 / 50–200 / 200+).
- Identify and remediate anti-patterns like value-washing, culture debt, and the founder-culture trap.
- Detect culture clashes triggered by M&A, reorg, or rapid scaling before they spread.

Boundaries — do NOT use this for:

- Replacing individual performance reviews (first separate "culture mismatch" from "skill deficit").
- Owning the hiring funnel/JD design, compensation, or org-chart structure itself — those belong to other functions; this skill only handles their cultural impact.
- Producing motivational slogans. If a value can't be translated into a concrete behavior, it isn't a value — delete it.

## Core principle

**Culture = (What you reward) + (What you tolerate) + (What you celebrate)**

Culture is descriptive, not aspirational. If your values say "transparency" but you punish bearers of bad news, your real value is "optics." The whole job is closing the gap between stated and actual.

## Steps

1. **Mission / Vision / Values workshop** — run conversationally, not as a corporate offsite. Three questions:
   - **Mission** (why we exist, present-tense): "What would be lost if we disappeared tomorrow?" → "We reduce preventable falls in elderly care," not "to be the leading…"
   - **Vision** (winning in 5–10 years): specific enough to be wrong. "Every care home in Europe uses our system" beats "be the market leader."
   - **Values** (behaviors we actually model): start from observation — "What did our last great hire do that nobody asked them to?" Keep to 3–5; more than 5 and none of them mean anything.

2. **Values → Behaviors translation** (the core work). Every value needs a behavioral anchor or it's decoration.
   - Workshop exercise: write the value, then ask "How would a new hire know we actually live this on day 30?" If you can't answer concretely, it's an aspiration, not a value.

3. **Create a culture code** — a public document that scares off the wrong people and attracts the right ones. Structure:
   1. Who we are (mission + context)
   2. Who thrives here (specific behaviors, not adjectives)
   3. Who doesn't thrive here (honest — this is the useful part)
   4. How we make decisions
   5. How we communicate
   6. How we grow people
   7. What we expect of leaders

4. **Quarterly culture-health assessment** — 8–12 questions, anonymous. Core areas: psychological safety, clarity, fairness, growth, trust in leadership.

5. **Configure rituals by stage** (see table) and evolve them as you scale.

6. **Audit anti-patterns** regularly: ask "What behavior got our last promoted person promoted? Is that in our values?" If it doesn't match, your real values differ from the wall.

## Example

Values → behavioral anchors (turn the bad version into a verifiable behavior):

| Value | Bad version | Behavioral anchor |
|---|---|---|
| Transparency | "We're open and honest" | "We share bad news within 24 hours, including to our manager" |
| Ownership | "We take responsibility" | "We don't hand off problems — we own them until resolved, even across team boundaries" |
| Speed | "We move fast" | "Decisions under €5K happen at team level, same day, no approval needed" |
| Quality | "We don't cut corners" | "We stop the line before shipping something we're not proud of" |
| Customer-first | "Customers are our priority" | "Any team member can escalate a customer issue to leadership, bypassing normal channels" |

Culture-health score interpretation:

| Score | Signal | Action |
|---|---|---|
| 80–100% | Healthy | Maintain, celebrate, document |
| 65–79% | Warning | Identify specific friction — don't over-react |
| 50–64% | Damaged | Urgent leadership attention + specific fixes |
| < 50% | Crisis | Culture emergency — all-hands intervention |

Rituals by stage:

- **Seed (< 15 people):** weekly 30-min all-hands (company update + one win + one learning); monthly no-hierarchy retrospective; default to transparency.
- **Early growth (15–50 people):** first quarterly culture survey; explicit public recognition tied to values (not just results); onboarding buddy program; founder office hours.
- **Scaling (50–200 people):** peer-driven (not HR) culture committee, 4–6 people rotating quarterly; values-based performance reviews; manager training; separate department and company all-hands.
- **Large (200+ people):** culture as strategy — annual culture plan with owner and KPIs; internal culture NPS; subculture management (engineering ≠ sales, both aligned to the company core).

**Worked scenario — a 60-person company whose values are "for show":**

1. Values audit: ask "What got the last person promoted?" Answer: "worked the most overtime," but the wall says "quality first." Conclusion: real values don't match stated.
2. Rewrite the anchor: "quality first" becomes "we stop the line before shipping something we're not proud of," and include that behavior in performance reviews.
3. Launch the quarterly anonymous 5-area survey. First score: psychological safety 58% (Damaged).
4. Action: leadership publicly acknowledges the bad-news punishment problem, builds a safe escalation channel, re-tests next quarter.
5. Configure a recognition ritual (tied to values, not results) and remediate the protected "star performer" culture debt — one tolerated bad behavior destroys what ten good behaviors build.

## Notes

Anti-patterns and fixes:

- **Value-washing:** listing values you don't practice. Symptom: employees roll their eyes during values discussions. Fix: run a values audit and align to "what the promoted person actually demonstrated."
- **Culture debt:** "we'll address the toxic star later" — later compounds. Fix: act on culture violations faster than you think necessary. One tolerated bad behavior destroys what ten good behaviors build.
- **Founder culture trap:** culture freezes at the founding team's personality; new hires assimilate or leave. Fix: explicitly evolve values as you scale — "move fast, ask forgiveness" works at 10 people, may be destructive at 100.
- **Culture by osmosis:** assuming culture transmits naturally. It does at 10 people; it doesn't at 50. Fix: make culture intentional — document it, teach it, measure it, reward it explicitly.

Red flags:

- Values posted on the wall, never referenced in reviews or decisions.
- Star performers protected from cultural standards.
- Leaders who "don't have time" for culture rituals.
- New hires feeling the culture is "different than advertised."
- No mechanism to raise cultural concerns safely.
- Culture survey results never shared with the team.

Culture-code anti-patterns to avoid: don't write "we're a family" (families don't fire each other for performance); don't list only positive traits — the "who doesn't thrive here" section is what makes it credible.

Key questions a culture architect asks:

- "Can you name the last person we fired for culture reasons? What did they do?"
- "What behavior got your last promoted employee promoted? Is that in your values?"
- "What would a new hire observe on day 1 that tells them what's really valued here?"
- "What do we tolerate that we shouldn't? Who knows and does nothing?"
- "How does a team lead in Berlin know what the culture is in Madrid?"

## See also

- Hiring surge / performance issues: work with the people/HR function so culture fit is measured, not guessed, and separate culture fit from skill deficit.
- Org reorg / M&A: work with the COO/CEO to detect and resolve culture clashes early and manage disruption from structure change.
- Strategy pivot: update values and behaviors that the pivot makes obsolete.
- The source skill ships `references/culture-playbook.md` (Netflix analysis, survey design, ritual examples, M&A playbook) and `templates/culture-code-template.md` (culture-code document template) — pull them in as needed.

---
Adapted from alirezarezvani/claude-skills (MIT license).
