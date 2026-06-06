---
name: ux-microcopy-writer
title: UX Microcopy Writer
description: Write or review UX microcopy — CTAs/buttons, error messages, empty states, confirmation dialogs, tooltips, loading states, onboarding — and ship a recommended line plus tone-tagged alternatives, rationale, and localization notes; not for long-form marketing copy, brand slogans, p
domain: 创意/design
triggers: [UX copy, microcopy, what should this button say, error message wording, review this error message, empty state copy, confirmation dialog wording, CTA naming, onboarding text, tooltip copy]
tags: [creative, design, ux-copy, microcopy, error-messages, empty-states, cta, localization]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [ux-research-design-toolkit, design-critique, conversion-copywriter, i18n-localization-patterns]
combines_with: [frontend-design, conversion-rate-optimizer, i18n-localization-patterns]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## When to use

- You need to write or review short copy for a specific interface element: CTA/button, error message, empty state, confirmation dialog, tooltip, loading state, or onboarding text.
- The deliverable is: one recommended line + 2-3 tone-tagged alternatives + a rationale for the choice + localization notes.
- You can describe the context (which screen/flow, what the user is doing, the tone you want, any character/platform constraints) — or are willing to be asked for it.

Out of scope:
- Long-form marketing copy, landing-page body, brand slogans, SEO articles — that's content creation, not interface microcopy.
- Pure visual/layout design, component implementation, or the logic that wires copy into code — this skill produces copy only; it does not mock up screens or write code.
- "Just write some copy" with no interface context — ask for context first (screen + user state + tone + constraints) before writing.
- Whole-screen usability/anti-pattern audits — use an interface principles/anti-pattern audit skill instead.

## Steps

```
1. Lock down context first (ask the user if missing — don't invent it):
   - Context: What screen, flow, or feature?
   - User state: What is the user trying to do? How are they feeling (rushed / confused / hopeful)?
   - Tone: Formal, friendly, playful, reassuring?
   - Constraints: Character limits, platform guidelines, glossary / brand voice?

2. Apply the copy pattern for the element type (see Patterns below).

3. For each element, produce: 1 recommended line + 2-3 alternatives (each tagged with tone and best-for) + a rationale.

4. Add localization notes: idioms/puns to avoid, character expansion (text can grow in translation), cultural context.
```

Five principles (apply every one):

1. **Clear** — Say exactly what you mean. No jargon, no ambiguity.
2. **Concise** — Use the fewest words that convey the full meaning.
3. **Consistent** — Same terms for the same things everywhere.
4. **Useful** — Every word should help the user accomplish their goal.
5. **Human** — Write like a helpful person, not a robot.

Copy patterns by element:

- **CTAs / buttons** — Start with a verb, be specific: "Start free trial", "Save changes", "Download report" — not "Submit" or "OK". Match the label to the actual outcome. "Create account" not "Submit".
- **Error messages** — Structure: What happened + Why + How to fix. Example: "Payment declined. Your card was declined by your bank. Try a different card or contact your bank."
- **Empty states** — Structure: What this is + Why it's empty + How to start. Example: "No projects yet. Create your first project to start collaborating with your team."
- **Confirmation dialogs** — Make the action clear ("Delete 3 files?" not "Are you sure?"); describe consequences ("This can't be undone"); label buttons with the action ("Delete files" / "Keep files" not "OK" / "Cancel").
- **Tooltips** — Concise, helpful, never state the obvious.
- **Loading states** — Set expectations, reduce anxiety.
- **Onboarding** — Progressive disclosure, one concept at a time.

Voice and tone — adapt to context:
- **Success** — Celebratory but not over the top.
- **Error** — Empathetic and helpful.
- **Warning** — Clear and actionable.
- **Neutral** — Informative and concise.

## Example

Output template:

```markdown
## UX Copy: [Context]

### Recommended Copy
**[Element]**: [Copy]

### Alternatives
| Option | Copy | Tone | Best For |
|--------|------|------|----------|
| A | [Copy] | [Tone] | [When to use] |
| B | [Copy] | [Tone] | [When to use] |
| C | [Copy] | [Tone] | [When to use] |

### Rationale
[Why this copy works — user context, clarity, action-orientation]

### Localization Notes
[Anything translators should know — idioms to avoid, character expansion, cultural context]
```

Minimal error-message example (structure = what happened + why + how to fix):

```
Payment declined. Your card was declined by your bank. Try a different card or contact your bank.
```

## Notes

- Don't force copy with incomplete context — if any of screen, user state, tone, or constraints is missing, ask for it. Vague copy is worse than none.
- Be specific about context — "Error message when payment fails" beats "an error message."
- Honor the emotional state — error messages need empathy, success messages can celebrate; don't make everything cold or everything cute.
- If a brand voice / glossary exists, align to it first so terminology stays consistent everywhere. When wiring into a design, check character limits and layout constraints (this skill does not scrape pages — the user must provide a screenshot or text).
- Alternatives must be genuinely different (distinct tone or scenario), not synonym swaps; the rationale must land on user outcomes, not empty praise like "more elegant."

## See also

- requires: none.
- related: `ux-ui-principles-audit` (interface principles and anti-pattern audit, including copy anti-patterns like confirmshaming — this skill focuses on producing the copy), `ux-research-design-toolkit` (turns user research into design decisions, grounds copy tone).
- combines_with: `brand-guidelines` (pulls brand voice and content style guide to constrain tone and terminology), `ui-design-system-builder` (lands copy alongside components/design tokens in the system).

---
Adapted from anthropics/knowledge-work-plugins (Apache-2.0).
