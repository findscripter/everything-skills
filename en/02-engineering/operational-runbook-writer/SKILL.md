---
name: operational-runbook-writer
title: Operational Runbook Writer
description: Turn repeatable ops/on-call tasks into an exact, step-by-step runbook (purpose, prerequisites, commands, verification, troubleshooting, rollback, escalation); use when documenting tribal knowledge into a repeatable procedure, not for live incident command or blameless postmortems
domain: 研发/devops
triggers: [runbook, SOP, on-call, playbook, escalation path, rollback steps, operational procedure, recurring ops task]
tags: [operations, runbook, sop, on-call, ops, troubleshooting, rollback]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [postmortem-writer, oncall-handoff-writer, pre-deploy-checklist, sre-incident-responder]
combines_with: [devops-troubleshooter, incident-commander-framework, observability-strategy-designer]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## When to use

Use this to turn a recurring operational task that "only one person knows how to do" (deploys, data syncs, cert rotation, backup/restore, on-call checks) into an exact procedure anyone can follow. Typical cases:

- Documenting a task that on-call or ops needs to run repeatably — turning tribal knowledge into exact step-by-step commands.
- Adding troubleshooting and rollback steps to an existing procedure.
- Writing escalation paths for when things go wrong.

Boundaries — do NOT use this for:

- **Live incident command and mitigation** of a one-off outage — use an incident-commander framework. A runbook is a playbook prepared *before* things break; it does not do on-scene coordination.
- **Blameless postmortems** after an incident — use a postmortem writer. That reviews root cause; this documents operational steps.
- One-off operations that will never repeat — not worth a runbook.

## Steps

1. Pin down task boundaries and metadata: **Owner** (team/person), **Frequency** (Daily/Weekly/Monthly/As Needed), Last Updated and Last Run dates.
2. Write the **Purpose**: what this runbook accomplishes and when to use it.
3. List **Prerequisites** as a checklist: access/permission needed, tools or systems required, data or input needed.
4. Break out the **Procedure**. Each step must have three parts: (1) the exact command, action, or instruction in a code block; (2) **Expected result**; (3) **If it fails** — what to do.
5. Write a **Verification** checklist: how to confirm the task completed successfully and what to check.
6. Build a **Troubleshooting** table (Symptom | Likely Cause | Fix) covering the common failure modes of each step.
7. Write **Rollback**: how to undo this if something goes wrong and return to the pre-change state.
8. Write an **Escalation** table (Situation | Contact | Method).
9. Keep a **History** table (Date | Run By | Notes / observations).
10. **Test the runbook**: have someone unfamiliar with the process follow it, and fix wherever they get stuck.

If a **knowledge base** is connected: search for existing runbooks to update rather than create from scratch, and publish the completed runbook to your ops wiki. If an **ITSM** is connected: link the runbook to related incident types and change requests, and auto-populate escalation contacts from on-call schedules.

## Example

Full runbook skeleton (Markdown):

```markdown
## Runbook: [Task Name]
**Owner:** [Team/Person] | **Frequency:** [Daily/Weekly/Monthly/As Needed]
**Last Updated:** [Date] | **Last Run:** [Date]

### Purpose
[What this runbook accomplishes and when to use it]

### Prerequisites
- [ ] [Access or permission needed]
- [ ] [Tool or system required]
- [ ] [Data or input needed]

### Procedure

#### Step 1: [Name]
\`\`\`
[Exact command, action, or instruction]
\`\`\`
**Expected result:** [What should happen]
**If it fails:** [What to do]

### Verification
- [ ] [How to confirm the task completed successfully]
- [ ] [What to check]

### Troubleshooting
| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| [What you see] | [Why] | [What to do] |

### Rollback
[How to undo this if something goes wrong]

### Escalation
| Situation | Contact | Method |
|-----------|---------|--------|
| [When to escalate] | [Who] | [How to reach them] |

### History
| Date | Run By | Notes |
|------|--------|-------|
| [Date] | [Person] | [Any issues or observations] |
```

"Exact enough to copy" — bad vs. good:

```text
Bad:  Run the script.
Good: Run `python sync.py --prod --dry-run` from the ops server, confirm it's clean, then re-run without --dry-run.
```

## Notes

- **Be painfully specific** — "Run the script" is not a step. Give the exact command, which host, and what arguments.
- **Include failure modes** — spell out what can go wrong at each step and what to do about it; otherwise the runbook is useless when things actually break.
- **Test the runbook** — have someone unfamiliar with the process follow it and fix where they get stuck. An untested runbook is not done.
- Keep metadata (Last Updated / Last Run / Owner) current on every run — a stale runbook is more dangerous than none.
- Default dangerous operations (deletes, rollbacks, prod writes) to a dry-run first, and flag them explicitly in the step.

## See also

- requires: none.
- related: `postmortem-writer` — improvement items found in a postmortem often become new runbook steps.
- combines_with: `incident-commander-framework` — during incident command, invoke ready-made runbooks to execute detection/mitigation/recovery; `sre-incident-responder`, `devops-troubleshooter` — apply this runbook directly during troubleshooting and on-call response.

---

Adapted from anthropics/knowledge-work-plugins (Apache-2.0).
