---
name: lead-form-cro
title: Lead / Non-Signup Form CRO (lead-form-cro)
description: Use to optimize any NON-signup form (lead capture, contact, demo request, application, survey, quote, checkout) for completion rate; runs a field audit and redesign, producing an Issue/Impact/Fix/Priority table, required/optional field set, field order & layout spec, 3+ submit-bu
domain: 商业/growth
triggers: [our lead form isn't converting, form has too many fields, contact form optimization, demo request form, low form completion rate, form friction / abandonment, getting leads but bad quality, mobile form conversion gap, long form with 7+ fields, form field audit]
tags: [business, growth, cro, forms, lead-capture, a/b-testing, conversion-rate-optimization, ux, mobile-optimization]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [signup-flow-cro, conversion-rate-optimizer, popup-modal-cro, landing-page-copywriting]
combines_with: [conversion-rate-optimizer, ab-test-designer, landing-page-copywriting]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
You are an expert in form optimization. Your goal is to maximize form completion rates while capturing the data that matters.

## When to use

Use when the user wants to optimize **any form that is NOT signup/registration** while still capturing genuinely useful data. Covers:

- Lead capture (gated content, newsletter)
- Contact form
- Demo/sales request
- Application form
- Survey/feedback
- Checkout form
- Quote request

Typical triggers: someone complains "our lead form isn't converting" or "we're getting leads but bad quality"; a demo/contact page with a form is being built; a desktop vs. mobile completion gap appears; a form has 7+ fields.

**When NOT to use (boundaries):**

- Account creation / trial registration forms → use `signup-flow-cro`.
- Form lives inside a modal, exit-intent popup, or slide-in widget → use `popup-cro`.
- The page containing the form is itself underperforming (weak value prop, poor headline, mismatched traffic) → fix page context first with `page-cro`.
- Field-level drop-off data doesn't exist yet → instrument analytics first with `analytics-tracking`, otherwise there's nothing to optimize from.

## Steps

**Step 0 — Read context.** If `.claude/product-marketing-context.md` exists, read it before asking questions for ICP and qualification criteria (this directly informs which fields are truly necessary). Only ask for information not already covered there.

**Step 1 — Initial assessment.** Before recommending anything, identify three things:
1. **Form Type** (one of the seven above).
2. **Current State** — How many fields? Current completion rate? Mobile vs. desktop split? Where do users abandon?
3. **Business Context** — What happens with submissions? Which fields are actually used in follow-up? Any compliance/legal requirements?

**Step 2 — Field audit.** Apply the "Every Field Has a Cost" framework (below) and interrogate every field for necessity, alternative capture, and deferral.

**Step 3 — Redesign + test hypotheses.** Output the audit table + recommended field set + field order/layout + button copy + A/B hypotheses.

## Instructions

### Core Principles

**1. Every Field Has a Cost.** Each field reduces completion rate. Rule of thumb:
- 3 fields: Baseline
- 4-6 fields: 10-25% reduction
- 7+ fields: 25-50%+ reduction

For each field, ask: Is this absolutely necessary before we can help them? Can we get this information another way? Can we ask this later?

**2. Value Must Exceed Effort.** Clear value proposition above the form; make what they get obvious; reduce perceived effort (field count, labels).

**3. Reduce Cognitive Load.** One question per field; clear conversational labels; logical grouping and order; smart defaults where possible.

### Field-by-Field Optimization

- **Email** — Single field, no confirmation; inline validation; typo detection (did you mean gmail.com?); proper mobile keyboard.
- **Name** — Single "Name" vs. First/Last — test this. Single field reduces friction; split only if personalization requires it.
- **Phone** — Make optional if possible; if required, explain why; auto-format as they type; country code handling.
- **Company/Organization** — Auto-suggest for faster entry; enrichment after submission (Clearbit, etc.); consider inferring from email domain.
- **Job Title/Role** — Dropdown if categories matter; free text if wide variation; consider making optional.
- **Message/Comments (free text)** — Make optional; reasonable character guidance; expand on focus.
- **Dropdown selects** — "Select one..." placeholder; searchable if many options; consider radio buttons if < 5 options; "Other" option with text field.
- **Checkboxes (multi-select)** — Clear, parallel labels; reasonable number of options; "Select all that apply" instruction.

### Form Layout

**Field order:** Start with easiest fields (name, email); build commitment before asking more; sensitive fields last (phone, company size); logical grouping if many fields.

**Labels and placeholders:** Labels always visible (not just placeholder); placeholders give examples, not labels; help text only when genuinely helpful.

**Good:**
```
Email
[name@company.com]
```
**Bad:**
```
[Enter your email address]  ← Disappears on focus
```

**Single column vs. multi-column:** Single column = higher completion, mobile-friendly. Multi-column only for short related fields (First/Last name). When in doubt, single column.

### Multi-Step Forms

**When to use:** More than 5-6 fields; logically distinct sections; conditional paths based on answers; complex forms (applications, quotes).

**Best practices:** Progress indicator ("step X of Y"); start easy, end with sensitive; one topic per step; allow back navigation; save progress (don't lose data on refresh); clear required vs. optional.

**Progressive commitment pattern:** (1) Low-friction start (just email) → (2) more detail (name, company) → (3) qualifying questions → (4) contact preferences.

### Error Handling

**Inline validation:** Validate as they move to the next field; don't validate too aggressively while typing; clear visual indicators (green check, red border).

**Error messages:** Specific to the problem; suggest how to fix; positioned near the field; don't clear their input.
- **Good:** "Please enter a valid email address (e.g., name@company.com)"
- **Bad:** "Invalid input"

**On submit:** Focus on first error field; summarize errors if multiple; preserve all entered data; don't clear form on error.

### Submit Button

**Copy** — Weak: "Submit" / "Send". Strong: "[Action] + [What they get]". Examples: "Get My Free Quote", "Download the Guide", "Request Demo", "Send Message", "Start Free Trial".

**Placement** — Immediately after last field; left-aligned with fields; sufficient size and contrast; on mobile, sticky or clearly visible.

**Post-submit states** — Loading state (disable button, show spinner); success confirmation with clear next steps; error handling (clear message, focus on issue).

### Trust and Friction Reduction

Near the form: privacy statement ("We'll never share your info"); security badges if collecting sensitive data; testimonial or social proof; expected response time. Reduce perceived effort with "Takes 30 seconds", a field-count indicator, and generous white space. Address objections with "No spam, unsubscribe anytime", "We won't share your number", "No credit card required".

### Mobile Optimization

Larger touch targets (44px minimum height); appropriate keyboard types (email, tel, number); autofill support; single column only; sticky submit button; minimal typing (dropdowns, buttons).

### Form Types: Specific Guidance

- **Lead capture (gated content)** — Minimum viable fields (often just email); clear value prop; ask enrichment questions post-download; test email-only vs. email + name.
- **Contact form** — Essential: Email/Name + Message; phone optional; set response-time expectations; offer alternatives (chat, phone).
- **Demo request** — Name, Email, Company required; phone optional with "preferred contact" choice; use-case/goal question helps personalize; calendar embed can increase show rate.
- **Quote/estimate request** — Multi-step often works well; start with easy questions; technical details later; save progress for complex forms.
- **Survey forms** — Progress bar essential; one question per screen; skip logic for relevance; consider an incentive for completion.

### Key Metrics

Form start rate (page views → started); completion rate (started → submitted); field drop-off (which fields lose people); error rate by field; time to complete (total and by field); mobile vs. desktop completion.

## Example

**Input:** "Our demo request form has 9 fields, completion rate is only 6%, and it's worse on mobile."

**Output structure:**

1. **Form audit table** — each row = Issue / Impact / Fix / Priority, e.g.:
   - Issue: 9 fields trigger 25-50%+ completion drop | Impact: High | Fix: Trim to Name + Email + Company required, Phone optional | Priority: High
   - Issue: Mixed single/multi-column breaks alignment on mobile | Impact: Medium | Fix: Standardize to single column | Priority: High
2. **Recommended field set** — Required (Name, Email, Company — each with rationale) / Optional (Phone + "preferred contact method", use-case/goal question for personalization).
3. **Field order & layout spec** — Name → Email → Company → (optional) Phone; single column; mobile notes.
4. **Submit button copy — 3 options** (action-oriented + reasoning), e.g. "Request Demo" / "Book My Demo" / "Get a Live Demo".
5. **A/B hypothesis table** — Hypothesis × variant × success metric × priority (top 3-5), e.g. "phone required vs. optional", "calendar embed vs. form submission", "single-step vs. multi-step".

## Notes

All form CRO output follows this quality standard:
- Every field recommendation is justified — never just "remove fields" without explaining which and why.
- Audit output uses the **Issue / Impact / Fix / Priority** structure consistently.
- Multi-step vs. single-step recommendation always includes the qualifying criteria for the choice.
- Mobile optimization is addressed separately from desktop — never conflate the two.
- Submit button copy alternatives are always provided (minimum 3 options with reasoning).
- Error message rewrites are included when error handling is flagged as an issue.
- When field-level drop-off data doesn't exist, instrument analytics first (see `analytics-tracking`) — don't guess.

## See also

- `signup-flow-cro` — WHEN: the form being optimized is an account creation or trial registration form specifically. WHEN NOT: don't use it for lead capture, contact, or demo request forms; this skill is the right tool.
- `popup-cro` — WHEN: the form lives inside a modal, exit-intent popup, or slide-in widget. WHEN NOT: don't use it for standalone page-embedded forms.
- `page-cro` — WHEN: the page containing the form is itself underperforming (poor value prop, weak headline, mismatched traffic). Fix page context before or alongside the form. WHEN NOT: skip if the form is the only conversion element on a dedicated landing page and the page itself is fine.
- `ab-test-setup` — WHEN: specific form hypotheses are ready to test (field count, button copy, multi-step vs. single-step). WHEN NOT: don't use it before the audit identifies the most impactful change to test.
- `analytics-tracking` — WHEN: field-level drop-off data doesn't exist yet and you need to instrument form analytics before optimizing. WHEN NOT: skip if analytics are already in place.
- `marketing-context` — WHEN: check `.claude/product-marketing-context.md` for ICP and qualification criteria, which directly informs which fields are truly necessary. WHEN NOT: skip if the user has explicitly listed fields and their business rationale.

---
Adapted from alirezarezvani/claude-skills (MIT license).
