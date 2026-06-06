---
name: customer-response-drafter
title: Customer Response Drafter
description: Draft a professional customer-facing response tailored to the situation, relationship, and channel — with a labeled tone, the body, and internal notes — when answering a product question, handling an outage or escalation, delivering bad news, declining a request, or replying to a
domain: 商业/copy
triggers: [customer response, draft response, draft-response, reply to customer, outage notification, incident communication, handle escalation, escalation, bad news, delay notice, decline feature request, won't-fix reply, billing issue, ticket response, follow-up email]
tags: [customer-support, customer-facing, response-draft, tone, escalation, email, ticket, bad-news, customer-success, copywriting]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [ai-customer-support, customer-research-synthesizer, churn-prevention, cold-email-writer]
combines_with: [ai-customer-support, customer-health-scorer]
license: CC-BY-4.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## When to use

Use this skill when you need to draft a **customer-facing** response that is tailored to the situation, the customer relationship, and the communication channel. Typical scenarios:

- Answering a product question or capability inquiry.
- Responding to an issue, outage, or customer escalation.
- Delivering bad news: a delivery delay, a feature sunset, a won't-fix, or no exception.
- Declining a feature request, discount, or exception.
- Handling a billing or account issue and offering a resolution path.
- Following up after silence, tailored to the stakeholder level (end user / manager / executive / technical / business).

Do **not** use this skill for:

- Internal communication, internal announcements, or team broadcasts (use an internal-comms skill).
- Pure marketing / landing-page / cold-email acquisition copy (use a marketing-copy skill).
- Tasks unrelated to a customer-facing reply.
- This skill produces a **draft only**. Fact-checking, commitment authorization, and compliance review before sending remain a human responsibility; it does not replace actual sending or expert review.

## Steps

### 1. Understand the context

Parse the input to determine:

- **Customer**: Who is the communication for? Look up account context if available.
- **Situation type**: Question, issue, escalation, announcement, negotiation, bad news, good news, follow-up.
- **Urgency**: Is this time-sensitive? How long has the customer been waiting?
- **Channel**: Email, support ticket, chat, or other (adjust formality accordingly).
- **Relationship stage**: New customer, established, frustrated/escalated.
- **Stakeholder level**: End user, manager, executive, technical, business.

### 2. Research context

Gather relevant background from available sources:

- **Email**: Previous correspondence on this topic, any commitments or timelines previously shared, the tone and style of the existing thread.
- **Internal chat**: Internal discussions about this customer or topic, guidance from product/engineering/leadership, similar situations and how they were handled.
- **CRM (if connected)**: Account details and plan level, contact information and key stakeholders, previous escalations or sensitive issues.
- **Support platform (if connected)**: Related tickets and their resolution, known issues or workarounds, SLA status and response-time commitments.
- **Knowledge base**: Official documentation or help articles to reference, product roadmap info (if shareable), policy or process documentation.

### 3. Generate the draft

Produce a response using the template below, including a tone label and an **internal notes (do not send)** block.

### 4. Run quality checks

Verify against the checklist (see Notes). If it does not pass, rewrite.

### 5. Offer iterations

After presenting the draft, proactively offer to:
- Adjust the tone (more formal, casual, empathetic, or direct).
- Add or remove specific points.
- Make it shorter or longer.
- Draft a version for a different stakeholder.
- Draft the internal escalation note as well.
- Prepare a follow-up message to send after N days if there is no response.

## Example

**Draft output template:**

```
## Draft Response

**To:** [Customer contact name]
**Re:** [Subject/topic]
**Channel:** [Email / Ticket / Chat]
**Tone:** [Empathetic / Professional / Technical / Celebratory / Candid]

---

[Draft response text]

---

### Notes for You (internal — do not send)
- **Why this approach:** [Rationale for tone and content choices]
- **Things to verify:** [Any facts or commitments to confirm before sending]
- **Risk factors:** [Anything sensitive about this response]
- **Follow-up needed:** [Actions to take after sending]
- **Escalation note:** [If this should be reviewed by someone else first]
```

**Bad news — declining a feature request (excerpt):**

```
Hi [Name],

Thank you for sharing this request — I can see why [capability] would
be valuable for [their use case].

I discussed this with our product team, and this isn't something we're
planning to build in the near term. The primary reason is [honest,
respectful explanation].

That said, I want to make sure you can accomplish your goal. Here are
some alternatives:
- [Alternative approach 1]
- [Alternative approach 2]

I've also documented your request in our feedback system, and if our
direction changes, I'll let you know.

Would any of these alternatives work for your team? Happy to dig
deeper into any of them.
```

**Escalation format:**

```
ESCALATION: [Customer Name] — [One-line summary]

Urgency: [Critical / High / Medium]
Customer impact: [What's broken for them]
History: [Brief background — 2-3 sentences]
What I've tried: [Actions taken so far]
What I need: [Specific help or decision needed]
Deadline: [When this needs to be resolved by]
```

**Invocation examples:**
- "Acme Corp is asking when the new dashboard feature will ship."
- "Customer escalation — their integration has been down for 2 days."
- "Responding to a feature request we won't be building."
- "Customer hit a billing error and wants a resolution ASAP."

## Notes

### Core principles
1. **Lead with empathy** before jumping to solutions.
2. **Be direct** — bottom-line-up-front; customers are busy.
3. **Be honest** — never overpromise, mislead, or hide bad news in jargon.
4. **Be specific** — concrete dates and names, not "in a few days."
5. **Own it** — say "we," not "the system" or "the process."
6. **Close the loop** — every response ends with a clear next step.
7. **Match their energy** — soothe frustration first; match excitement with enthusiasm.

### Response structure
1. Acknowledgment / context (1-2 sentences) → 2. Core message (1-3 paragraphs, specific and verifiable) → 3. Next steps (1-3 bullets: what I'll do and when, what they need to do, when they'll hear next) → 4. Closing (1 warm, professional sentence reinforcing availability).

### Length guidelines
- **Chat/IM**: 1-4 sentences.
- **Support ticket**: 1-3 short, scannable paragraphs.
- **Email**: 3-5 paragraphs max.
- **Escalation response**: As long as needed but well-structured with headers.
- **Executive communication**: Shorter is better — 2-3 paragraphs, data-driven.

### Tone spectrum

| Situation | Tone | Characteristics |
|-----------|------|----------------|
| Good news / wins | Celebratory | Enthusiastic, warm, forward-looking |
| Routine update | Professional | Clear, concise, informative, friendly |
| Technical response | Precise | Accurate, detailed, structured, patient |
| Delayed delivery | Accountable | Honest, apologetic, action-oriented |
| Bad news | Candid | Direct, empathetic, solution-oriented |
| Issue / outage | Urgent | Immediate, transparent, actionable, reassuring |
| Escalation | Executive | Composed, ownership-taking, plan-presenting |
| Billing / account | Precise | Clear, factual, empathetic, resolution-focused |

### Tone by relationship stage
- **New customer (0-3 months)**: More formal, extra context, proactively offer resources, build trust through responsiveness.
- **Established customer (3+ months)**: Warm and collaborative, reference shared history, more direct and efficient.
- **Frustrated / escalated**: Extra empathy and acknowledgment, urgent response times, concrete action plans with specific commitments, shorter feedback loops.

### Writing-style rules
**Do**: use active voice; "I" for personal commitments, "we" for team commitments; name specific people for actions; use the customer's terminology; include exact dates and times; break up long responses with headers/bullets.
**Don't**: use buzzwords (synergy, leverage, paradigm shift); deflect blame to other teams/systems/processes; use passive voice to dodge ownership ("Mistakes were made"); add confidence-undermining hedging; CC people unnecessarily; overuse exclamation marks (one per email max).

### Quality checklist
- [ ] Tone matches the situation and relationship
- [ ] No commitments beyond what's authorized
- [ ] No roadmap details that shouldn't be shared externally
- [ ] Accurate references to previous conversations
- [ ] Clear next steps and ownership
- [ ] Appropriate for the stakeholder level (not too technical for executives, not too vague for engineers)
- [ ] Length appropriate for the channel

### When to escalate
**To your manager** when: the customer threatens to cancel or significantly downsell; requests an exception you can't authorize; an issue is past SLA; they request leadership contact; you made an error needing senior involvement.
**To product/engineering** when: a bug is critical and blocking the customer's business; a feature gap is causing a competitive loss; the customer has unique technical requirements beyond standard support; integration issues require engineering investigation.

### Follow-up cadence
- Unanswered question: 2-3 business days.
- Open support issue: daily for critical, 2-3 days for standard.
- After delivering bad news: 1 week to check on impact and sentiment.

### Hard constraints
- The draft is a pre-send aid: all facts, timelines, and commitments must be human-verified and within authorization.
- Never leak non-public roadmap, internal positioning, or other customers' sensitive information.
- Empathy first, but every reply must close with a clear next step and ownership.

## See also

- related: `ai-customer-support` — designing AI/automated support systems; this skill focuses on a single customer-facing message
- related: `customer-research-synthesizer`, `churn-prevention`, `cold-email-writer`
- combines_with: `customer-health-scorer` — assess customer health/risk first, then set the reply's tone and escalation strategy accordingly

---

Adapted from anthropics/knowledge-work-plugins (Apache-2.0).
