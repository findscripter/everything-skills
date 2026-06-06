---
name: prd-spec-writer
title: Write a PRD / Feature Spec
description: Use when turning a vague idea, user request, or problem statement into a structured feature spec or PRD with goals/non-goals, user stories, P0/P1/P2 requirements, Given-When-Then acceptance criteria, leading/lagging success metrics, open questions, and phased timeline; not for pu
domain: 协作/knowledge
triggers: [write a PRD / feature spec, turn a vague idea into a structured doc, define goals and non-goals, write user stories and acceptance criteria, Given-When-Then acceptance criteria, P0/P1/P2 requirement prioritization, MoSCoW tradeoffs, leading/lagging success metrics, phase requirements / split v1 v2, prevent scope creep]
tags: [product-management, prd, feature-spec, user-stories, acceptance-criteria, goals-and-non-goals, success-metrics, scope-management, collaboration, pm]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [product-manager-toolkit, codebase-to-prd, agile-product-owner, status-report-generator]
combines_with: [task-decomposition-planner, design-dev-handoff]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## When to use

Use this when turning a not-yet-formed idea into a reviewable, actionable feature specification or product requirements document (PRD). Accept any of these inputs:

- A feature name ("SSO support").
- A problem statement ("Enterprise customers keep asking for centralized auth").
- A user request ("Users want to export their data as CSV").
- A vague idea ("We should do something about onboarding drop-off").

The core artifact is a Markdown document containing Problem Statement / Goals / Non-Goals / User Stories / categorized Requirements with acceptance criteria / Success Metrics / Open Questions / Timeline & phasing — while actively converging scope along the way.

Do **not** use this (route elsewhere, do not force-fit):

- Pure quantitative prioritization (RICE / value-vs-effort matrix) -> use `product-manager-toolkit`.
- Engineering implementation, architecture design, writing code — this skill only produces requirements, it does not build.
- UI visual and interaction design — this skill describes wireframe-level requirements only.
- An existing Scrum backlog where you only need to write stories / estimate / plan sprints -> use `agile-product-owner`.

## Steps

### 1. Understand the feature
Ask the user what they want to spec. Accept any of the input types above. Restate your understanding first and align before going deeper.

### 2. Gather context
Ask the user for the following. Be conversational — do not dump all questions at once. Ask the most important ones first and fill gaps as you go:

- **User problem**: What problem does this solve? Who experiences it, and how often?
- **Target users**: Which user segment(s) does this serve?
- **Success metrics**: How will we know this worked?
- **Constraints**: Technical constraints, timeline, regulatory requirements, dependencies.
- **Prior art**: Has this been attempted before? Are there existing solutions?

### 3. Pull context from connected tools
Only if connected — otherwise work entirely from what the user provides; do not ask the user to connect tools, just proceed with available information.

- If a **project tracker** is connected: search for related tickets/epics/features, pull in existing requirements or acceptance criteria, identify dependencies on other work items.
- If a **knowledge base** is connected: search for related research docs, prior specs, or design docs; pull in user research findings; find related meeting notes or decision records.
- If a **design tool** is connected: pull related mockups/wireframes/explorations and design system components relevant to the feature.

### 4. Generate the PRD
Produce a structured PRD with these sections (see writing constraints below):

- **Problem Statement**: The user problem, who is affected, and impact of not solving it (2-3 sentences). Ground it in evidence — user research, support data, metrics, or customer feedback — covering user pain, business impact, and competitive risk.
- **Goals**: 3-5 specific, measurable outcomes tied to user or business metrics. Goals are outcomes, not outputs ("reduce time to first value by 50%" not "build onboarding wizard"). Distinguish user goals from business goals.
- **Non-Goals**: 3-5 things explicitly out of scope, each with a one-line rationale (not enough impact, too complex, separate initiative, premature). Non-goals are as important as goals — they are the guardrail against scope creep.
- **User Stories**: Standard format, grouped by persona, ordered by priority (see User Story rules below).
- **Requirements**: Categorized as Must-Have (P0), Nice-to-Have (P1), and Future Considerations (P2), each with acceptance criteria, technical considerations, and flagged cross-team dependencies.
- **Success Metrics**: Leading indicators (change quickly) and lagging indicators (change over time), with specific targets.
- **Open Questions**: Tagged with who needs to answer (engineering, design, legal, data, stakeholder) and split into blocking vs non-blocking. List only genuinely open questions you cannot answer from context.
- **Timeline Considerations**: Hard deadlines (contractual commitments, events, compliance dates), dependencies on other teams/releases, and suggested phasing if too large for one release.

### 5. Review and iterate
Ask which sections need adjustment; offer to expand specific sections; offer to create follow-up artifacts (design brief, engineering ticket breakdown, stakeholder pitch).

### User Story rules
Write stories as: "As a [user type], I want [capability] so that [benefit]".

- The user type should be specific enough to be meaningful ("enterprise admin" not just "user").
- The capability describes what they want to accomplish, not how (no UI widgets).
- The benefit explains the "why" — the value delivered.
- Include edge cases: error states, empty states, boundary conditions.
- Include different user types if the feature serves multiple personas.
- Order by priority — most important stories first.
- Satisfy INVEST: **Independent**, **Negotiable**, **Valuable** (to the user, not just the team), **Estimable**, **Small** (one sprint), **Testable**.

### Requirements categorization
- **Must-Have (P0)**: Cannot ship without these — the minimum viable version. Ask: "If we cut this, does the feature still solve the core problem?" If no, it is P0. Be ruthless: if everything is P0, nothing is P0.
- **Nice-to-Have (P1)**: Significantly improves the experience but the core use case works without it. Often a confident fast follow-up, not a wish list.
- **Future Considerations (P2)**: Explicitly out of scope for v1, but design to support them later so you avoid architectural decisions that make them hard to add. P2s are architectural insurance.

MoSCoW mapping when useful: **Must have** (non-negotiable), **Should have** (important, high-priority fast follow), **Could have** (desirable if time permits, cut without delay), **Won't have (this time)** (explicitly out of scope, may revisit).

### Success metrics
- **Leading indicators** (days to weeks): adoption rate, activation rate, task completion rate, time to complete, error rate, feature usage frequency.
- **Lagging indicators** (weeks to months): retention impact, revenue impact, NPS/satisfaction change, support ticket reduction, competitive win rate.
- **Targets** must be specific ("50% adoption within 30 days" not "high adoption"), based on comparable features / benchmarks / explicit hypotheses, with both a "success" threshold and a "stretch" target. Define the measurement method (tool, query, time window) and when you will evaluate (1 week / 1 month / 1 quarter post-launch).

### Acceptance criteria
Write criteria in **Given/When/Then** format or as a **checklist**. Cover the happy path, error cases, and edge cases; include what should NOT happen (negative test cases); make each criterion independently testable. Avoid ambiguous words — "fast", "user-friendly", "intuitive" — and define them as concrete, measurable behavior.

### Scope management (hard rules)
- Write explicit non-goals in every spec.
- Any scope addition must come with a scope removal or timeline extension.
- Separate "v1" from "v2" clearly in the spec.
- Review the spec against the original problem statement — does everything serve it?
- Time-box investigations: "If we cannot figure out X in 2 days, we cut it."
- Create a "parking lot" for good ideas that are not in scope.

Recognize scope creep when: requirements keep getting added after approval; "small" additions accumulate into a much larger project; the team builds features no user asked for; the launch date keeps moving without re-scoping; stakeholders add requirements without removing anything.

### Output format
Use Markdown with clear headers and bold key sentences. Keep it scannable — busy stakeholders should get the gist from just the headers and bold text.

## Example

User stories (multiple personas, ordered by priority):

```
As a team admin, I want to configure SSO for my organization so that my team members can log in with their corporate credentials.
As a team member, I want to be automatically redirected to my company's SSO login so that I do not need to remember a separate password.
As a team admin, I want to see which members have logged in via SSO so that I can verify the rollout is working.
```

Acceptance criteria — Given/When/Then:

```
Given the admin has configured SSO for their organization
When a team member visits the login page
Then they are automatically redirected to the organization's SSO provider
```

Acceptance criteria — checklist:

```
- [ ] Admin can enter SSO provider URL in organization settings
- [ ] Team members see "Log in with SSO" button on login page
- [ ] SSO login creates a new account if one does not exist
- [ ] SSO login links to existing account if email matches
- [ ] Failed SSO attempts show a clear error message
```

## Notes

- Be opinionated about scope. A tight, well-defined spec beats an expansive vague one.
- If the idea is too big for one spec, suggest breaking it into phases and spec only the first phase.
- Success metrics must be specific and measurable — never "improve user experience".
- Non-goals are as important as goals — they stop scope creep during implementation.
- Open questions should be genuinely open — do not list questions you can answer from context.
- Common user-story mistakes: too vague ("I want it faster" — faster at what?); solution-prescriptive ("I want a dropdown" — describe the need, not the widget); no benefit ("I want to click a button" — why?); too large ("I want to manage my team" — break it down); internal focus ("we want to refactor the database" — that is a task, not a user story).

## See also

- requires: none
- related: `product-manager-toolkit` (RICE prioritization and PRD templates; can feed priority input into this skill), `agile-product-owner` (turn spec requirements into INVEST stories and sprints), `codebase-to-prd`, `status-report-generator`
- combines_with: `task-decomposition-planner` (spec -> work breakdown), `design-dev-handoff` (spec -> design brief and handoff), `enterprise-project-manager` (spec -> project plan and milestones)

---

Adapted from anthropics/knowledge-work-plugins (Apache-2.0); original skill `product-management/skills/write-spec`.
