---
name: ux-research-design-toolkit
title: UX Research & Design Toolkit
description: Use when turning user research data into actionable design decisions: data-driven persona generation, journey mapping, usability test planning, and research synthesis. Not for visual UI/design-system component building, pure front-end implementation, or fabricating personas with 
domain: 创意/design
triggers: [create user persona, generate persona from data, build customer journey map, map user journey, plan usability test, design usability study, analyze user research, synthesize interview findings, identify user pain points, define user archetypes, calculate research sample size, create empathy map, identify user needs]
tags: [ux-research, personas, journey-mapping, usability-testing, research-synthesis, design-validation, creative/design]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [ux-ui-principles-audit, apple-hig-advisor, accessibility-wcag-audit, design-brainstorming]
combines_with: [ux-ui-principles-audit, ui-design-system-builder]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## When to use

For a Senior UX Designer/Researcher turning *existing user data* into actionable design decisions across four scenarios:

- **Generate a persona** — you have analytics, surveys, or interviews and need a research-backed persona.
- **Create a journey map** — visualize the end-to-end experience and emotion curve for a specific goal.
- **Plan a usability test** — validate a design with real users.
- **Synthesize research** — cluster raw interview/survey/observation data into actionable insights.

**Out of scope (negative boundaries):**

- Not for visual UI / design-system component building — that belongs to the "UI Design System" skill.
- Not for pure front-end code implementation.
- Do not fabricate personas when there is zero user data. With an insufficient sample you may only produce exploratory conclusions, which must be flagged low-confidence and never treated as production-grade evidence.

## Steps

### Step 1 · Generate a user persona

1. Prepare user data in this JSON structure:

```json
[
  {
    "user_id": "user_1",
    "age": 32,
    "usage_frequency": "daily",
    "features_used": ["dashboard", "reports", "export"],
    "primary_device": "desktop",
    "usage_context": "work",
    "tech_proficiency": 7,
    "pain_points": ["slow loading", "confusing UI"]
  }
]
```

2. Run the persona generator:

```bash
# Human-readable output
python scripts/persona_generator.py

# JSON output for integration
python scripts/persona_generator.py json
```

3. Review the generated components:

| Component | What to Check |
|-----------|---------------|
| Archetype | Does it match the data patterns? |
| Demographics | Are they derived from actual data? |
| Goals | Are they specific and actionable? |
| Frustrations | Do they include frequency counts? |
| Design implications | Can designers act on these? |

4. Validate the persona: show it to 3-5 real users ("Does this sound like you?"); cross-check with support tickets; verify against analytics data.

The tool auto-classifies archetypes by signals: `power_user` (daily use, 10+ features → efficiency, customization), `casual_user` (weekly use, 3-5 features → simplicity, guidance), `business_user` (work context, team use → collaboration, reporting), `mobile_first` (mobile primary → touch, offline, speed).

### Step 2 · Create a journey map

1. Define scope: persona, goal, start (trigger event), end (success criteria), timeframe.
2. Gather journey data: user interviews ("walk me through..."), session recordings, analytics (funnel, drop-offs), support tickets.
3. Map the stages. Typical B2B SaaS: `Awareness → Evaluation → Onboarding → Adoption → Advocacy`.
4. Fill in layers for each stage:

```
Stage: [Name]
├── Actions: What does user do?
├── Touchpoints: Where do they interact?
├── Emotions: How do they feel? (1-5)
├── Pain Points: What frustrates them?
└── Opportunities: Where can we improve?
```

5. Identify opportunities, ranked by **Priority Score = Frequency × Severity × Solvability**.

### Step 3 · Plan a usability test

1. Transform vague goals into testable research questions, e.g. "Is it easy to use?" → "Can users complete checkout in <3 min?".
2. Select a method:

| Method | Participants | Duration | Best For |
|--------|--------------|----------|----------|
| Moderated remote | 5-8 | 45-60 min | Deep insights |
| Unmoderated remote | 10-20 | 15-20 min | Quick validation |
| Guerrilla | 3-5 | 5-10 min | Rapid feedback |

3. Design tasks as scenarios, not instructions:

```
SCENARIO: "Imagine you're planning a trip to Paris..."
GOAL: "Book a hotel for 3 nights in your budget."
SUCCESS: "You see the confirmation page."
```

Task progression: Warm-up → Core → Secondary → Edge case → Free exploration.

4. Define success metrics: completion rate >80%, time on task <2× expected, error rate <15%, satisfaction >4/5.
5. Prepare the moderator guide: think-aloud instructions, non-leading prompts, post-task questions.

### Step 4 · Synthesize research

1. Code each data point: `[GOAL]` (want to achieve), `[PAIN]` (frustration), `[BEHAVIOR]` (actual action), `[CONTEXT]` (when/where), `[QUOTE]` (direct words).
2. Cluster similar patterns (e.g. group daily-use + advanced-feature users A and B as Power Users).
3. Calculate segment sizes and assess primary/secondary persona viability:

| Cluster | Users | % | Viability |
|---------|-------|---|-----------|
| Power Users | 18 | 36% | Primary persona |
| Business Users | 15 | 30% | Primary persona |
| Casual Users | 12 | 24% | Secondary persona |

4. Extract, per theme: finding statement + supporting evidence (quotes/data) + frequency (X/Y participants) + business impact + recommendation.
5. Prioritize by Frequency / Severity / Breadth / Solvability (each scored 1-5).

## Example

Human-readable output from `persona_generator.py`:

```
============================================================
PERSONA: Alex the Power User
============================================================

A daily user who primarily uses the product for work purposes

Archetype: Power User
Quote: "I need tools that can keep up with my workflow"

Demographics:
  • Age Range: 25-34
  • Location Type: Urban
  • Tech Proficiency: Advanced

Goals & Needs:
  • Complete tasks efficiently
  • Automate workflows
  • Access advanced features

Frustrations:
  • Slow loading times (14/20 users)
  • No keyboard shortcuts
  • Limited API access

Design Implications:
  → Optimize for speed and efficiency
  → Provide keyboard shortcuts and power features
  → Expose API and automation capabilities

Data: Based on 45 users
    Confidence: High
```

## Notes

- For personas and journeys, **use real data only — no guessed assumptions**. Frustrations must carry frequency counts (e.g. "slow loading 14/20").
- Persona confidence by sample size: 5-10 users = Low (exploratory), 11-30 = Medium (directional), 31+ = High (production). Minimum 20 users to serve as a formal persona.
- Require at least 2 data sources (quantitative + qualitative).
- Usability issue severity: 4 Critical (prevents completion → fix immediately), 3 Major (significant difficulty → fix before release), 2 Minor (causes hesitation → fix when possible), 1 Cosmetic (noticed but not problematic → low priority).
- Pick the research method by question type:

| Question Type | Best Method | Sample Size |
|---------------|-------------|-------------|
| "What do users do?" | Analytics, observation | 100+ events |
| "Why do they do it?" | Interviews | 8-15 users |
| "How well can they do it?" | Usability test | 5-8 users |
| "What do they prefer?" | Survey, A/B test | 50+ users |
| "What do they feel?" | Diary study, interviews | 10-15 users |

- Design interview questions by type: Context ("walk me through your typical day"), Behavior ("show me how you do X"), Goals ("what are you trying to achieve?"), Pain ("what's the hardest part?"), Reflection ("what would you change?").

**Validation checklists:**

- *Persona quality*: based on 20+ users, ≥2 data sources, specific/actionable goals, frustrations with frequency counts, specific design implications, confidence level stated.
- *Journey map quality*: scope clearly defined (persona/goal/timeframe), based on real data, all layers filled, pain points per stage, opportunities prioritized.
- *Usability test quality*: research questions testable, tasks are realistic scenarios not instructions, 5+ participants per design, success metrics defined, findings include severity ratings.
- *Research synthesis quality*: data coded consistently, patterns based on 3+ data points, findings include evidence, recommendations actionable, priorities justified.

## See also

- **UI Design System** — research findings inform design-system decisions.
- **Product Manager Toolkit** — customer interview analysis complements persona research.

---

Adapted from alirezarezvani/claude-skills (MIT). Original skill: `ux-researcher-designer` under `product-team`; core commands, data structures, and methodological constraints preserved.
