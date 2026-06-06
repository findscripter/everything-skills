---
name: employee-leave-deadline-tracker
title: /leave-tracker
description: Check open leaves for deadline alerts and required decisions. Surfaces only the leaves that require an action and explains why — not a status board. Use weekly, or whenever the attorney needs to know which leaves have upcoming designation, certification, or exhaustion deadlines.
domain: 领域/legal
triggers: []
tags: [legal, employment, leave, fmla, ada, certification, designation, exhaustion]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [employment-termination-review, legal-hold-manager, general-counsel-advisor, wage-hour-employment-qa, employee-handbook-update-diff]
combines_with: [employment-termination-review, general-counsel-advisor]
license: CC-BY-4.0
source: anthropics/claude-for-legal
source_license: Apache-2.0
---
# /leave-tracker

Checks all open leaves with hard legal deadlines and surfaces only the ones
requiring a decision or action. Not a status board — tells you what you need
to do and why.

## Instructions

1. Load the `leave-tracker` agent and run the full workflow.

2. If no HRIS is connected and no `~/.claude/plugins/config/claude-for-legal/employment-legal/leave-register.yaml` exists, prompt
   the attorney to upload a leave spreadsheet or use
   `/employment-legal:log-leave` to add entries.

3. Alerts only for leaves requiring action. Clean leaves summarized one line each.

## Examples

```
/employment-legal:leave-tracker
```

Run this weekly — set a Monday-morning reminder to invoke
`/employment-legal:leave-tracker`. Automated scheduling requires a separate
integration (calendar reminder, cron job, etc.); Claude Code agents do not
self-schedule.
