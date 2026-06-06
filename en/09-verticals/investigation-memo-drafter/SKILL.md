---
name: investigation-memo-drafter
title: /investigation-memo
description: Draft or update the privileged investigation memo from the investigation log. Use when an investigation is far enough along to write the first memo cut, or when new data has been added and the existing draft needs updating.
domain: 领域/legal
triggers: [investigation memo, draft memo, work product]
tags: [legal, employment, investigation, memo, work-product, credibility, hr]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [litigation-chronology-builder, deposition-outline-prep, privilege-log-reviewer, general-counsel-advisor, diligence-issue-extractor]
combines_with: [litigation-chronology-builder, general-counsel-advisor]
license: Apache-2.0
source: anthropics/claude-for-legal
source_license: Apache-2.0
---
# /investigation-memo

Drafts the first cut of the privileged investigation memo from the log,
or updates an existing draft when new data has been added.

## Instructions

1. Load the `internal-investigation` reference skill and run Mode 4 (Draft or update memo).
2. If drafting for the first time, warn if high-priority sources are still
   open on the checklist.
3. If updating, show what changed before rewriting.
4. All output is marked PRIVILEGED AND CONFIDENTIAL — ATTORNEY WORK PRODUCT.

## Examples

```
/employment-legal:investigation-memo [matter name]
```

```
/employment-legal:investigation-memo [matter name]
(updates existing memo if one exists)
```

> Detailed memo structure, credibility-assessment framework, and update rules
> live in the `internal-investigation` reference skill — load it before doing
> substantive work.
