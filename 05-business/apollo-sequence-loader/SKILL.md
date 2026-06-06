---
name: apollo-sequence-loader
title: Apollo Sequence Loader
description: Find leads matching a target profile (title/seniority/industry/size/location) and bulk-add them to an existing Apollo outreach sequence — search, enrich, create contacts, dedupe, enroll. Use it for the end-to-end "load people into a sequence" action; not for sequence/step authori
domain: 商业/sales
triggers: [Apollo sequence load, add leads to an outreach sequence, bulk-add contacts to a campaign, add VP Sales into sequence, list sequences, reload more leads into sequence]
tags: [business, sales, apollo, outreach-sequence, prospecting, mcp]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [apollo-lead-enrichment, sales-prospecting, cold-email-writer, email-sequence-designer]
combines_with: [apollo-lead-enrichment, cold-email-writer, sales-prospecting]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## When to use

- You have an explicit target profile (job titles, seniority, industry, company size, location) and want to find a batch of leads in one shot and add them to an existing Apollo outreach sequence.
- You want to top up ("reload") an existing sequence with more contacts, or just run `list sequences` to see what sequences exist.
- End-to-end coverage: search people → enrich → create contacts (deduped) → enroll into the sequence → confirm with a receipt.

**Out of scope:**
- Sequence authoring (steps, cadence, A/B, email body copy) is NOT covered — this skill only loads people into a sequence, it does not author the sequence content.
- If no sequence exists yet, create it inside Apollo first, then use this skill to load it.
- Non-Apollo platforms (Outreach, Salesloft, HubSpot Sequences) are not supported.
- Enrichment consumes Apollo credits — do not run Step 5 in bulk without explicit user confirmation.

## Steps

Input comes from a one-line user request (targeting criteria + sequence name). Run in order:

1. **Parse input** — Extract the targeting criteria and sequence info (mapping below). If the user just says "list sequences", skip to Step 2 and only show available sequences.
2. **Find the sequence** — Use `mcp__claude_ai_Apollo_MCP__apollo_emailer_campaigns_search` with `q_name` set to the sequence name. If no match or multiple matches, show all sequences in a `| Name | ID | Status |` table and ask the user to pick one.
3. **Get email account** — Use `mcp__claude_ai_Apollo_MCP__apollo_email_accounts_index` to list linked email accounts. If one → use it automatically; if multiple → show them and ask which to send from.
4. **Find matching people** — Use `mcp__claude_ai_Apollo_MCP__apollo_mixed_people_api_search` with the targeting criteria; set `per_page` to the requested volume (default 10). Present candidates in a preview table and ask for confirmation (this consumes credits).
5. **Enrich and create contacts** — After confirmation: first `mcp__claude_ai_Apollo_MCP__apollo_people_bulk_match` (batch up to 10 per call, `reveal_personal_emails: true`); then `mcp__claude_ai_Apollo_MCP__apollo_contacts_create` per person (`run_dedupe: true`). Collect all created contact IDs.
6. **Add to sequence** — Use `mcp__claude_ai_Apollo_MCP__apollo_emailer_campaigns_add_contact_ids` to enroll the contacts.
7. **Confirm enrollment** — Output the sequence, contacts added, sending email account, credits used, and the enrolled-contacts table.
8. **Offer next actions** — Offer: load more / review sequence / remove a contact / pause a contact.

### Step 1 field mapping (profile → API params)
- Job titles → `person_titles`
- Seniority levels → `person_seniorities`
- Industry keywords → `q_organization_keyword_tags`
- Company size → `organization_num_employees_ranges`
- Locations → `person_locations` or `organization_locations`
- Sequence name: text after "to", "into", or "→"; volume defaults to 10.

### Step 4 confirmation prompt (wait for confirmation before continuing)
> "Add these [N] contacts to [Sequence Name]? This will consume [N] Apollo credits for enrichment."

### Step 5 parameters
- `apollo_people_bulk_match`: pass `first_name`, `last_name`, `domain` for each person; `reveal_personal_emails: true`.
- `apollo_contacts_create`: `first_name`, `last_name`, `email`, `title`, `organization_name`; include `direct_phone` or `mobile_phone` if available; `run_dedupe: true`.

### Step 6 `apollo_emailer_campaigns_add_contact_ids` parameters
- `id`: the sequence ID
- `emailer_campaign_id`: the same sequence ID
- `contact_ids`: array of created contact IDs
- `send_email_from_email_account_id`: the email account ID chosen in Step 3
- `sequence_active_in_other_campaigns`: `false` (safe default)

## Example

- `add 20 VP Sales at SaaS companies to my "Q1 Outbound" sequence`
- `SDR managers at fintech startups → Cold Outreach v2`
- `list sequences` (show all available sequences)
- `directors of engineering, 500+ employees, US → Demo Follow-up`
- `reload 15 more leads into "Enterprise Pipeline"` (top up an existing sequence)

**Step 4 preview table:**

| # | Name | Title | Company | Location |
|---|---|---|---|---|

**Step 7 receipt:**

| Field | Value |
|---|---|
| Sequence | [Name] |
| Contacts added | [count] |
| Sending from | [email address] |
| Credits used | [count] |

**Contacts enrolled:**

| Name | Title | Company | Email |
|---|---|---|---|

## Notes

- **Credit consumption**: enrichment (Step 5) consumes Apollo credits per person — always get explicit user confirmation in Step 4 first, and state the consumption in the preview.
- **Deduplication**: always create contacts with `run_dedupe: true` to avoid polluting the database with duplicate contacts.
- **Batch limit**: `apollo_people_bulk_match` handles at most 10 people per call — split into batches for larger volumes.
- **Cross-sequence protection**: enroll with `sequence_active_in_other_campaigns: false` by default so contacts already active in other sequences are not re-activated by mistake; only flip it explicitly when truly cross-sequence.
- **Pause vs remove**: in Step 8, "pause" = re-add with `status: "paused"` plus an `auto_unpause_at` date; "remove" uses `apollo_emailer_campaigns_remove_or_stop_contact_ids`.
- For multiple-match or multiple-email-account cases, always have the user choose — never silently default to the first option.

## See also

- Other Apollo prospecting/enrichment skills in the business/sales domain (people search, lead enrichment).
- Sequence content authoring and email-copy skills (this skill only loads people, it does not write content).

---

Adapted from anthropics/knowledge-work-plugins (Apache-2.0), source skill `partner-built/apollo/skills/sequence-load`.
