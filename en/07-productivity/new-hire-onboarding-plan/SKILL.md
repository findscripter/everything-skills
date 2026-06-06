---
name: new-hire-onboarding-plan
title: New Hire Onboarding Plan
description: Generate a role-tailored onboarding plan for a new hire with a confirmed start date — pre-start checklist, Day 1 schedule, Week 1 plan, and 30/60/90-day goals; use when prepping accounts/equipment/buddy, scheduling Day 1/Week 1, or setting ramp goals. Not for comp negotiation or 
domain: 协作/knowledge
triggers: [onboarding, new hire, Day 1, first week plan, 30/60/90 goals, onboarding buddy, pre-start checklist, ramp plan]
tags: [human-resources, onboarding, new-hire, 30-60-90, checklist-template, team-collaboration]
level: beginner
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [hr-partner-pro, codebase-onboarding-doc, interview-system-designer, process-sop-documenter]
combines_with: [offer-letter-drafter, codebase-onboarding-doc, company-culture-architect]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## When to use

Use this when a role is filled, a start date is confirmed, and you need to build an actionable onboarding plan for the new hire. It covers the full arc: **Pre-Start → Day 1 → Week 1 → 30/60/90-day goals**. The output is a role-tailored, ready-to-execute Markdown checklist.

**Out of scope:**
- No compensation negotiation, employment-contract drafting, or labor-law / jurisdictional compliance rulings — hand those to an HR partner or local counsel.
- This is not interview or hiring-pipeline design (see related `interview-system-designer`); it starts *after* the candidate is hired and about to join.
- It does not replace real HRIS/IT tickets — the plan lists the to-dos, but the underlying systems still have to execute them.

## Steps

1. **Collect the 5 inputs** (if any is missing, leave a `[…]` placeholder — do not invent values):
   - New hire name · Role/position · Team they're joining · Start date · Manager.
2. **Tailor to the role.** An engineer, a designer, and a salesperson need different tools, access, and required reading. Fill in the role-specific "accounts/tools", "key docs to read", and "30/60/90 goals" accordingly.
3. **Fill the four phases** using the template below: Pre-Start → Day 1 → Week 1 → 30/60/90-day goals, plus Key Contacts and a Tools Access table.
4. **Don't overload Day 1.** Focus Day 1 on setup and relationship-building; deep work starts in Week 2.
5. **Assign a buddy** — a peer who is *not* their manager — and record them under Key Contacts.
6. If connectors are wired up, auto-pull/create per "If Connectors Available"; otherwise leave placeholders for a human to fill.

## Example

```markdown
## Onboarding Plan: [Name] — [Role]
**Start Date:** [Date] | **Team:** [Team] | **Manager:** [Manager]

### Pre-Start (Before Day 1)
- [ ] Send welcome email with start date, time, and logistics
- [ ] Set up accounts: email, Slack, [tools for role]
- [ ] Order equipment (laptop, monitor, peripherals)
- [ ] Add to team calendar and recurring meetings
- [ ] Assign onboarding buddy: [Suggested person]
- [ ] Prepare desk / remote setup instructions

### Day 1
| Time | Activity | With |
|------|----------|------|
| 9:00 | Welcome and orientation | Manager |
| 10:00 | IT setup and tool walkthrough | IT / Buddy |
| 11:00 | Team introductions | Team |
| 12:00 | Welcome lunch | Manager + Team |
| 1:30 | Company overview and values | Manager |
| 3:00 | Role expectations and 30/60/90 plan | Manager |
| 4:00 | Free time to explore tools and docs | Self |

### Week 1
- [ ] Complete required compliance training
- [ ] Read key documentation: [list for role]
- [ ] 1:1 with each team member
- [ ] Shadow key meetings
- [ ] First small task or project assigned
- [ ] End-of-week check-in with manager

### 30-Day Goals
1. [Goal aligned to role]
2. [Goal aligned to role]
3. [Goal aligned to role]

### 60-Day Goals
1. [Goal]
2. [Goal]

### 90-Day Goals
1. [Goal]
2. [Goal]

### Key Contacts
| Person | Role | For What |
|--------|------|----------|
| [Manager] | Manager | Day-to-day guidance |
| [Buddy] | Onboarding Buddy | Questions, culture, navigation |
| [IT Contact] | IT | Tool access, equipment |
| [HR Contact] | HR | Benefits, policies |

### Tools Access Needed
| Tool | Access Level | Requested |
|------|-------------|-----------|
| [Tool] | [Level] | [ ] |
```

### If Connectors Available
- **HRIS connected:** pull new hire details and team org chart; auto-populate the tools access list based on role.
- **Knowledge base connected:** link to relevant onboarding docs, team wikis, and runbooks; pull the team's existing onboarding checklist to customize.
- **Calendar connected:** create Day 1 calendar events and Week 1 meeting invites automatically.

## Notes

- **Always customize for the role** — an engineer's onboarding looks very different from a designer's; applying the template without tailoring it is the same as not doing it.
- **Don't overload Day 1** — the first day is for setup and relationships; leave free time to explore.
- **The buddy must be a non-manager peer** — having a "someone I can always ask" person makes a huge difference to how fast a new hire settles in.
- Use `[…]` for any missing information — never fabricate names, dates, or access levels.
- Contracts, compensation, and compliance disputes are out of scope — route them to HR or counsel.

## See also

- related `hr-partner-pro` — onboarding is one stage of its broader people-ops workflow; reuse its 30/60/90 and PTO templates.
- related `interview-system-designer` — the upstream stage (hiring/selection); this skill takes over after the offer is accepted.
- related `company-culture-builder` — the Day 1 "values/culture" segment can reference its culture assets.
- combines_with `task-decomposition-planner` — break the 30/60/90 goals into assignable, trackable task lists.
- combines_with `org-change-management` — for batch onboarding / team scaling, pair with org-change and integration management.
