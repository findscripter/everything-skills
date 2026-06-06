---
name: bullet-point-structurer
title: Bulletmind: Hierarchical Bullet-Point Structurer
description: Convert dense text, notes, articles, or explanations into clean hierarchical bullet points (only `-` bullets, parent-child indentation, no prose) for scanning, memorization, and structured thinking; not for narrative prose, exact quotation, creative writing, or table/code/JSON ou
domain: 通用/learning
triggers: [bullet points, bulletize, bullet-only summary, hierarchical outline, structured notes, clean up messy notes, convert paragraphs to bullets, study outline, revision outline, note-taking]
tags: [writing, summarization, note-taking, formatting, structured-output, general]
level: beginner
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [caveman-compressed-mode, meeting-transcript-analyzer]
combines_with: [audio-to-markdown-transcriber, doc-coauthoring]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## When to use

When active, responses remain in hierarchical bullet format with no paragraphs, no prose blocks, no drift, and only structured bullet output.

Transform input into a structured bullet hierarchy when the user asks for:

- Bullet-only summaries of dense text, notes, explanations, articles, or webpages
- Cleaned-up note-taking output with clear parent-child relationships
- Structured study material that is easier to scan and memorize
- Consistent formatting for messy or mixed bullet lists

Use this skill to enforce:

- No paragraphs or long prose
- Only bullets with clean indentation

This improves readability, memorization, and structured thinking for note-taking and review workflows.

When NOT to use (negative boundaries):

- User requests paragraphs or prose narrative
- Creative writing tasks such as stories, essays, or copywriting
- Formats where bullets reduce clarity or violate the requested output format (e.g. tables, code blocks, JSON)
- Do not invent structure beyond the source material when the user asks for faithful summarization

## Steps

1. Pick an intensity level (default `full`) — see the mode command below.
2. Extract main ideas: Paragraph -> main ideas -> top-level bullets.
3. Nest details: subordinate information -> nested sub-bullets; group related ideas under the same parent.
4. Split and clean: break long sentences into smaller bullets, remove filler words, keep meaning intact, do not over-summarize.
5. Normalize hierarchy: restructure existing bullets and normalize indentation depth; short input is still converted into a bullet tree, never flattened to a single level.
6. Output only the structured bullets — no commentary or explanation.

### Mode command

Switch with `/bulletmind lite|full|ultra`. Default mode: **full**.

| Level | Behavior |
| ----- | --------------------------------------------------------------------------------------------------- |
| lite  | clean hierarchical bullets, light restructuring, preserve sentence flow |
| full  | default strict hierarchy, balanced compression, clear grouping + splitting |
| ultra | deep hierarchical decomposition, aggressive splitting, high granularity, maximal structural clarity |

### Hard rules

- NO paragraphs
- ONLY bullets `-` (no mixed symbols)
- ALWAYS hierarchical structure; indent 2 spaces per level
- GROUP related ideas under parent bullets
- SPLIT long sentences into smaller bullets
- KEEP meaning intact, no over-summarize
- REMOVE filler words
- Keep bullets short, one idea per line, no prose bridging lines

## Example

Input: a passage about "Climate Change". Output:

```
- Climate Change
  - Definition
    - Long-term shift in global temperatures and weather patterns
  - Causes
    - Human activities
      - Burning fossil fuels
      - Deforestation
      - Industrial emissions
    - Natural factors (less dominant)
      - Volcanic activity
      - Solar variations
  - Effects
    - Rising global temperatures
    - Melting glaciers and ice caps
    - Sea level rise
    - Extreme weather events
  - Solutions
    - Reduce carbon emissions
    - Transition to renewable energy
    - Reforestation
    - Sustainable practices
```

See the source repo's `EXAMPLES.md` for more output templates (including an "Operating Systems" example).

## Notes

- Prefer clarity over strict compression — under-compress rather than lose logic.
- Avoid flattening everything into one level; maintain a logical tree structure.
- Do not preserve bullet-only formatting if a higher-priority instruction requires tables, code blocks, JSON, or paragraphs — defer to that instruction.
- Do not invent structure beyond the source material when the user asks for faithful summarization.
- Do not use for deliverables that require prose, narrative flow, or exact source quotation.

## See also

- Writing, summarization, and structured-output skills pair well with this one: use this skill to extract the hierarchical skeleton first, then convert it into paragraphs, tables, or slides as needed.

---

Adapted from sickn33/antigravity-awesome-skills (MIT license).
