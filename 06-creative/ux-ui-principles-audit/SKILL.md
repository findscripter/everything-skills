---
name: ux-ui-principles-audit
title: UX/UI Principles Audit & Antipattern Detection
description: Use to audit an interface, screen, or user flow against research-backed UX/UI principles, detect antipatterns (UX smells), and produce a severity-rated report with concrete remediation; not for visual design from scratch or front-end implementation.
domain: 创意/design
triggers: [UX audit, interface audit, antipattern detection, UX smell, usability evaluation, AI interface review, user flow check, accessibility audit, design walkthrough, heuristic evaluation]
tags: [creative, design, ux-audit, antipatterns, usability, accessibility, ai-interface, user-flow]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [ux-research-design-toolkit, apple-hig-advisor, accessibility-wcag-audit, design-spells-microinteractions]
combines_with: [ux-research-design-toolkit, wcag-22-audit-patterns]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## When to use

- You have a describable interface, screen, or user flow (screenshot description, component inventory, interaction transcript, or wireframe description) and want to evaluate it against research-backed UX/UI principles.
- The goal is to detect antipatterns (UX smells), check whether the UI follows best practices, and return structured findings with severity levels and actionable remediation steps.
- Covers four specialized perspectives:
  - **Interface evaluation** — evaluate interface descriptions against 168 research-backed UX/UI principles (`uxui-evaluator`).
  - **Antipattern detection** — detect UX antipatterns using the uxuiprinciples smell taxonomy (`interface-auditor`).
  - **AI-interface review** — audit AI-powered interfaces against 44 AI-era UX principles for trust, transparency, control, and safety (`ai-interface-reviewer`).
  - **Flow checking** — check user flows against decision, error, and feedback principles (`flow-checker`).

Do NOT use for:
- Producing visual design, UI mockups, or brand logos from scratch — this skill evaluates, it does not draw.
- Writing front-end code or editing component implementations — it produces remediation guidance, not code.
- Abstract design philosophy with no interface or flow to evaluate — request an interface description first.
- Building a design-token or component-library system — use a design-system builder skill instead.

## Steps

```
1. Pick the evaluation perspective (multiple allowed)
   - Whole-interface checkup   -> evaluate against 168 research-backed principles
   - Hunt for bad smells       -> antipattern / UX smell detection
   - AI-powered product UI     -> 44 AI-era principles (trust / transparency / control / safety)
   - Multi-step flow           -> decision points, error handling, feedback checks

2. Fix the evaluation target (request it if missing)
   - Interface: screen/component inventory + key interaction descriptions.
   - User flow: start -> each step -> branches -> end, marking error branches and feedback points.
   - If there is a live URL/prototype, ask the user for a screenshot or text description
     (this skill does not fetch or render pages).

3. Scan against the relevant principles. For every finding, return a structured entry:
   - [Severity] Location/component — one-line problem (which principle violated / which antipattern)
   - Why: why it is a problem (consequence for the user)
   - Fix: a directly usable change (specific to layout / copy / interaction)

4. Severity grading
   - Critical: blocks the task, misleads decisions, hard accessibility failure, AI misleads the user. Must fix.
   - Major:    antipattern that clearly raises cognitive load or error rate. Should fix.
   - Minor:    polish (wording, consistency, visual hierarchy). Optional.

5. Aggregate output
   - Critical/Major first, then Minor; group findings of the same antipattern.
   - For clean categories, state "no issues of this type found" — do not pad or fabricate.
   - Mark uncertain items "to be confirmed" and state the assumption; never present guesses as fact.
```

Audit framework (apply where relevant, drawn from Nielsen's heuristics + mobile UX):
- visibility of system status
- match between system and real-world language
- user control and freedom
- consistency and standards
- error prevention
- recognition rather than recall
- flexibility and efficiency of use
- aesthetic and minimalist design
- recovery from errors
- help, onboarding, and empty-state guidance
- mobile-specific: reachability, touch ergonomics, input burden, thumb-friendly action placement

Rules:
- Single responsibility: audit and evaluate only — do not redesign or write front-end code.
- Every finding must be locatable (name the component/step) and actionable (include a concrete fix).
- Accessibility issues (contrast, keyboard access, screen-reader support, hit-target size) are treated as Critical/Major and called out explicitly.
- For AI interfaces additionally check: is AI-generated content labeled, is it correctable/reversible, is uncertainty exposed, is there a warning for over-reach / hallucination risk.

## Example

Minimal audit prompt:
```
Audit the interface below against research-backed UX/UI principles and the antipattern catalog.
For each finding: [Severity] location/component — principle/antipattern violated; Why (user consequence); actionable Fix.
Critical/Major first, then Minor; say so explicitly if a category is clean — do not fabricate.
<paste interface / user-flow description>
```

Sample finding entries:
```
[Critical] Checkout page · primary button — Dark pattern (confirmshaming): cancel button reads "I don't want to save money"
Why: emotional pressure manipulates the user, violating autonomy and honesty principles, eroding trust.
Fix: change the cancel button to neutral copy ("Not now") with visual weight equal to the primary button.

[Major] AI summary card — not labeled as AI-generated, and no correction path
Why: violates AI transparency and control principles; the user cannot judge reliability or report errors.
Fix: add an "AI-generated" label + "Report issue / Regenerate" actions.

[Minor] Form · error message — conveys error by red color only, no text/icon
Why: color-blind users cannot perceive it; weakens accessibility.
Fix: add an icon + explicit message to error items; do not rely on color alone.
```

## Notes

- This skill does not fetch or render pages; it only evaluates the interface or flow description the user provides. When real pages need inspection, ask the user for screenshots or a text transcript.
- The principle counts (168 / 44) are the reference framework — you do not need to recite every one. Surface only the genuinely-hit issues by relevance; avoid bloated, unfocused output.
- Distinguish "confirmed antipattern" from "subjective preference" — do not mark a style taste as Critical.
- Output does not replace real usability testing or expert review. Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
- Remediation must be directly usable: specify which copy/layout/interaction to change, not just "improve the experience."
- Optionally connect to the uxuiprinciples.com API for enriched output with full citations.

## See also

- requires: none.
- related: `ux-research-design-toolkit` (turns user-research data into design decisions; this skill focuses on principle-based audit of a finished interface — the two are sequential), `apple-hig-advisor` (platform-specific Apple HIG audit; this skill covers cross-platform general principles), `accessibility-wcag-audit`, `design-spells-microinteractions`.
- combines_with: `ux-research-design-toolkit`, `wcag-22-audit-patterns`, and `ui-design-system-builder` (route the inconsistency/accessibility findings back into design tokens and the component system).
- Adapted from sickn33/antigravity-awesome-skills (MIT); original source uxuiprinciples/agent-skills.
