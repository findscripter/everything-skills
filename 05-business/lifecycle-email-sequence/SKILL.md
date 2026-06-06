---
name: lifecycle-email-sequence
title: Lifecycle Email Sequence Design
description: Design or optimize lifecycle/automated email sequences (welcome, nurture, re-engagement, onboarding, post-purchase) — produce sequence architecture plus complete ready-to-send drafts (subject/preview/body/CTA) and metric benchmarks. Use for opted-in/warm audiences; not for cold o
domain: 商业/growth
triggers: [email sequence, drip campaign, nurture sequence, welcome / onboarding emails, re-engagement / win-back emails, email automation / lifecycle emails, trial-to-paid email flow, post-purchase / renewal email flow]
tags: [business, growth, email-marketing, lifecycle, automation, copywriting]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [email-drip-sequence, churn-prevention, user-onboarding-optimizer, cold-email-writer]
combines_with: [user-onboarding-optimizer, churn-prevention, conversion-copywriter]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## When to use

Use when the user wants to **create or optimize an automated email flow** that moves people from a trigger point toward activation, conversion, or repeat purchase. Common forms:

- Welcome / onboarding sequence (post-signup or post-activation)
- Lead nurture sequence (pre-sale)
- Re-engagement / win-back sequence (30-60 days of inactivity)
- Post-purchase / renewal / failed-payment recovery sequence
- Event-based, educational, or sales sequences

**Boundaries (do NOT use here):**
- Outbound prospecting to people who have **NOT opted in** → use `cold-email`. This skill serves only warm leads, subscribers, or users who have expressed interest.
- Pure **in-app onboarding** experience → use `onboarding-cro`; email only supports and must not duplicate the in-app flow.
- Landing-page copy linked from emails → use `copywriting`. Click tracking / UTM / attribution → use `analytics-tracking`.

## Steps

1. **Read context before asking.** If `.claude/product-marketing-context.md` exists, read it first. Only ask for information not already covered and specific to this task (brand voice, ICP, product background).
2. **Establish the three essentials:**
   - **Sequence type** (welcome / nurture / re-engagement / post-purchase / event / educational / sales).
   - **Audience context:** Who are they? What triggered entry into this sequence? What do they already know/believe? What is their current relationship stage with you?
   - **Goals:** primary conversion action, relationship-building goals, segmentation goals, and what defines success.
3. **Define the sequence skeleton:** length, timing/cadence, exit conditions, and branching logic (see baselines below).
4. **Write every email in full:** subject line, preview text, complete body, CTA, and (if applicable) segmentation conditions — plus 3 A/B subject-line variations per email.
5. **Attach a metrics plan:** open / click / conversion-rate benchmarks per email type and sequence goal.
6. **Conflict check:** flag whether any email overlaps or collides in timing with other sequences the audience is already receiving.

## Instructions

**Core principles**
- **One email, one job:** one primary purpose and one main CTA per email; don't try to do everything.
- **Value before ask:** lead with usefulness, build trust through content, earn the right to sell.
- **Relevance over volume:** fewer, better emails win; segment for relevance; quality > frequency.
- **Clear path forward:** every email moves them somewhere; links must do something useful; make next steps obvious.

**Sequence length & timing baselines**
- Length: Welcome 3-7 emails; Lead nurture 5-10; Onboarding 5-10; Re-engagement 3-5 — adjust for sales-cycle length, product complexity, and relationship stage.
- Timing: Welcome email immediately; early sequence 1-2 days apart; nurture 2-4 days apart; long-term weekly or bi-weekly.
- B2B: avoid weekends. B2C: test weekends. Send at the recipient's local time zone.

**Subject lines**
- Clear > Clever, Specific > Vague, benefit- or curiosity-driven; 40-60 characters ideal; test emoji (polarizing).
- Patterns that work: Question "Still struggling with X?" / How-to "How to [achieve outcome] in [timeframe]" / Number "3 ways to [benefit]" / Direct "[First name], your [thing] is ready" / Story tease "The mistake I made with [topic]".

**Preview text:** ~90-140 characters; extend the subject line rather than repeat it; complete the thought or add intrigue.

**Body structure & length:** Hook → Context → Value → CTA → human, warm sign-off. Short paragraphs (1-3 sentences), white space, bullet points for scanability, bold sparingly, mobile-first. Length: 50-125 words transactional, 150-300 words educational, 300-500 words story-driven. Tone: conversational not formal, first- and second-person, active voice — read it out loud to check it sounds human.

**CTA:** buttons for primary actions, links for secondary; one clear primary CTA per email; button text = action + outcome.

## Example

**Sequence overview (output template)**
```
Sequence Name: [Name]
Trigger: [What starts the sequence]
Goal: [Primary conversion goal]
Length: [Number of emails]
Timing: [Delay between emails]
Exit Conditions: [When they leave the sequence]
```

**For each email (output template)**
```
Email [#]: [Name/Purpose]
Send: [Timing]
Subject: [Subject line]
Preview: [Preview text]
Body: [Full copy]
CTA: [Button text] → [Link destination]
Segment/Conditions: [If applicable]
```

**Welcome sequence (5-7 emails over 12-14 days):** 1. Welcome + deliver promised value (immediate) → 2. Quick win (day 1-2) → 3. Story/Why (day 3-4) → 4. Social proof (day 5-6) → 5. Overcome objection (day 7-8) → 6. Core feature highlight (day 9-11) → 7. Conversion (day 12-14).

**Lead nurture sequence (6-8 emails over 2-3 weeks):** Deliver lead magnet → Expand on topic → Problem deep-dive → Solution framework → Case study → Differentiation → Objection handler → Direct offer.

**Re-engagement sequence (3-4 emails over 2 weeks, trigger = 30-60 days inactive):** 1. Check-in (genuine concern) → 2. Value reminder (what's new) → 3. Incentive (special offer) → 4. Last chance (stay or unsubscribe).

## Notes

- **Deliver ready to send:** every email includes subject, preview, full body, and CTA; for sequences of 5+ emails, lead with the overview table before expanding each email.
- Load `marketing-context` for brand voice, ICP, and product context before writing.
- **Tool integrations:** Customer.io (behavior-based automation), Mailchimp (SMB email marketing), Resend (developer-friendly transactional), SendGrid (transactional email at scale), Kit (creator/newsletter focused).
- **Proactive diagnostic triggers:**
  - Low trial-to-paid conversion → check for a trial-expiration email sequence before recommending in-app or pricing changes.
  - High open rates but low clicks → diagnose body copy and CTA specificity before blaming subject lines.
  - List going cold → suggest a re-engagement sequence with progressive offers before recommending acquisition spend.
  - User just says "do email marketing" → clarify sequence type before writing anything.
- **Output artifacts:** sequence architecture doc; complete email drafts; metrics benchmarks; segmentation rules (entry/exit/branching/suppression); 3 subject-line variations per email.

## See also

- `cold-email` — use instead when the sequence targets people who have NOT opted in (outbound prospecting).
- `onboarding-cro` — coordinate when emails support a parallel in-app onboarding flow, to avoid duplication.
- `copywriting` — optimize landing-page copy linked from emails.
- `launch-strategy` — when orchestrating email sequences around a specific launch/announcement window.
- `analytics-tracking` — email click tracking, UTM parameters, and attribution.
