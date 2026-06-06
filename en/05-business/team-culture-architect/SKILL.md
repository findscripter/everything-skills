---
name: team-culture-architect
title: Team Culture Architect
description: Build, measure, and evolve company culture as operational behavior — not wall posters; use for mission/vision/values workshops, values-to-behaviors translation, culture codes, quarterly culture-health surveys, and stage-based rituals. Triggers: company culture, values, culture co
domain: 商业/growth
triggers: [build company values, assess culture health, design cultural rituals, write a culture code, handle culture clashes, culture debt, founder culture trap, values to behaviors, mission vision workshop, culture dilution while scaling]
tags: [business, growth, company-culture, org-building, c-level, values, culture-health, founder]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [company-culture-architect, company-culture-builder, org-health-diagnostic]
combines_with: [org-change-management, headcount-org-planner, strategic-alignment-cascader]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## When to use

Use this when culture needs to be **built, measured, and evolved as an operational behavioral system** — not decoration on a wall. Typical situations:

- A startup distilling or rewriting its mission, vision, and values for the first time
- Values stuck on adjectives like "open and transparent" that need translating into concrete behaviors a new hire can recognize by day 30
- Writing a public Culture Code that screens out the wrong people and attracts the right ones
- Designing a quarterly anonymous culture-health survey and interpreting the scores
- Scaling from 10 to 100+ people, where old rituals stop working and culture gets diluted
- Handling anti-patterns like "the star performer who is exempt from cultural standards" or "culture debt"

**Where NOT to use:**

- Individual founder growth or career coaching → use a founder-coach skill
- Pure HR recruiting process, compensation benchmarking, or performance-review mechanics → that's a CHRO function
- Treating values as a slogan to print and hang on a wall — this skill exists precisely to oppose that
- One-off team-building or offsite planning (this skill is about an ongoing operational system, not a single event)

## Core principle

> **Culture = (What you reward) + (What you tolerate) + (What you celebrate)**

Culture is descriptive, not aspirational. If your values say "transparency" but you punish bearers of bad news, your real value is "optics." The entire job is **closing the gap between the stated and the actual**.

## Steps

### 1. Mission / Vision / Values workshop (conversational, not a corporate process)

Run this conversationally, not as a corporate offsite. Three questions:

- **Mission** — Why do we exist (beyond making money)? Ask "What would be lost if we disappeared tomorrow?" Mission is present-tense ("We reduce preventable falls in elderly care"), not "to be the leading...".
- **Vision** — What does winning look like in 5–10 years? Specific enough to be wrong: "Every care home in Europe uses our system" beats "be the market leader."
- **Values** — What behaviors do we actually model? Start with what you observe, not what sounds good: "What did our last great hire do that nobody asked them to?" **Keep to 3–5.** More than 5 and none of them mean anything.

### 2. Values → Behaviors translation (this is the work)

Every value needs behavioral anchors or it's decoration. For each value, ask **"How would a new hire know we actually live this on day 30?"** If you can't answer concretely, it's not a value — it's an aspiration.

| Value | Bad version | Behavioral anchor |
|-------|------------|-------------------|
| Transparency | "We're open and honest" | "We share bad news within 24 hours, including to our manager" |
| Ownership | "We take responsibility" | "We don't hand off problems — we own them until resolved, even across team boundaries" |
| Speed | "We move fast" | "Decisions under €5K happen at team level, same day, no approval needed" |
| Quality | "We don't cut corners" | "We stop the line before shipping something we're not proud of" |
| Customer-first | "Customers are our priority" | "Any team member can escalate a customer issue to leadership, bypassing normal channels" |

### 3. Culture Code creation

A culture code is a public document that describes how you operate. It should **scare off the wrong people and attract the right ones.**

**Structure:**
1. Who we are (mission + context)
2. Who thrives here (specific behaviors, not adjectives)
3. **Who doesn't thrive here** (honest — this is the useful part that makes it credible)
4. How we make decisions
5. How we communicate
6. How we grow people
7. What we expect of leaders

> See `templates/culture-code-template.md` in the source repo for a complete template.

**Anti-patterns to avoid:** "We're a family" (families don't fire each other for performance); listing only positive traits; making it aspirational instead of descriptive.

### 4. Culture Health Assessment (quarterly, anonymous, 8–12 questions)

Core areas to measure:
1. **Psychological safety** — "Can I raise a concern without fear?"
2. **Clarity** — "Do I know how my work connects to company goals?"
3. **Fairness** — "Are decisions made consistently and transparently?"
4. **Growth** — "Am I learning and being challenged here?"
5. **Trust in leadership** — "Do I believe what leadership tells me?"

**Score interpretation:**

| Score | Signal | Action |
|-------|--------|--------|
| 80–100% | Healthy | Maintain, celebrate, document |
| 65–79% | Warning | Identify specific friction — don't over-react |
| 50–64% | Damaged | Urgent leadership attention + specific fixes |
| < 50% | Crisis | Culture emergency — all-hands intervention |

### 5. Cultural Rituals by stage (rituals deliver culture; what works at 10 breaks at 100)

- **Seed stage (< 15 people):** Weekly 30-min all-hands (update + one win + one learning); monthly retrospective with no hierarchy; default to transparency.
- **Early growth (15–50 people):** Quarterly culture survey (first formal check-in); recognition ritual tied to values, not just results; onboarding buddy program; leadership office hours.
- **Scaling (50–200 people):** Peer-driven culture committee (not HR, 4–6 people rotating quarterly); values-based performance review; manager training; separate department and company all-hands.
- **Large (200+ people):** Culture as strategy (annual culture plan with owner and KPIs); internal NPS for culture; subculture management (engineering culture ≠ sales culture, but both align to the company core).

## Example

**Anti-pattern diagnosis and fixes:**

- **Value-washing:** Listing values you don't practice. Symptom: employees roll their eyes during values discussions. *Fix:* Run a values audit — "What did the last person who got promoted demonstrate?" If it doesn't match your values, your real values are different.
- **Culture debt:** Accumulating cultural compromises over time — "We'll address the toxic star performer later." Later compounds. *Fix:* Act on culture violations faster than you think necessary. One tolerated bad behavior destroys what ten good behaviors build.
- **Founder culture trap:** Culture stays frozen at the founding team's personality; new hires assimilate or leave. *Fix:* Explicitly evolve values as you scale. "Move fast, ask forgiveness" at 10 people may be destructive at 100.
- **Culture by osmosis:** Assuming culture transmits naturally. It did at 10 people; it doesn't at 50. *Fix:* Make culture intentional — document it, teach it, measure it, reward it explicitly.

**Key questions a culture architect asks (for diagnosis):**

- "Can you name the last person we fired for culture reasons? What did they do?"
- "What behavior got your last promoted employee promoted? Is that in your values?"
- "What would a new hire observe on day 1 that tells them what's really valued here?"
- "What do we tolerate that we shouldn't? Who knows and does nothing?"
- "How does a team lead in Berlin know what the culture is in Madrid?"

## Notes

- **Red flags:** Values posted on the wall but never referenced in reviews or decisions; star performers protected from cultural standards; leaders who "don't have time" for culture rituals; new hires feeling the culture is "different than advertised"; no mechanism to raise cultural concerns safely; culture survey results never shared with the team.
- Culture is **descriptive, not aspirational** — don't write it as an aspiration.
- When the assessment lands in the "Warning" band (65–79%), **don't over-react** — identify the specific friction point first.
- Rituals don't transfer: what works at 10 people must be redesigned at 50/100.

## See also

- **CHRO-type skills:** During hiring surges, ensure culture fit is measured rather than guessed; in performance issues, separate culture fit from skill deficit.
- **COO / CEO:** During org reorgs and M&A/partnerships, detect and resolve culture clashes early; on a strategy pivot, update the values the pivot makes obsolete.
- **Rapid growth:** Scale rituals before culture dilutes.
- Detailed references in the source repo: `references/culture-playbook.md` (Netflix analysis, survey design, ritual examples, M&A playbook) and `templates/culture-code-template.md`.
