---
name: social-connections-optimizer
title: コネクションオプティマイザー
description: レビュー優先の整理、フォロー/追加の推薦、ユーザーの実際の声で書かれたチャネル別ウォームアウトリーチのドラフトを通じて、ユーザーのXとLinkedInネットワークを再編成します。フォローリストを整理したい、現在の優先事項に向けて成長したい、または高品質な関係を中心にソーシャルグラフのバランスを取り直したい場合に使用します。
domain: 商业/growth
triggers: [social graph, warm intro, X DM, connections optimizer]
tags: [growth, x, linkedin]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [sales-prospecting, cold-email-writer, social-media-multi-publisher, x-twitter-automation]
combines_with: [apollo-lead-enrichment, signal-based-call-prep]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
# Connections Optimizer

Reorganize the user's network instead of treating outbound as a one-way prospect list.

What this skill covers:

- Cleaning up and expanding X follows
- Analyzing LinkedIn follows and connections
- A review-first cleanup queue
- Add and follow recommendations
- Identifying warm paths
- Drafting Apple Mail, X DMs, and LinkedIn messages in the user's actual voice

## When to trigger

- When the user wants to clean up their X follows
- When the user wants to rebalance their follows or connections
- When the user says things like "I want to tidy up my network," "who should I unfollow," "who should I follow," or "who should I reconnect with"
- When outreach quality depends on network structure, not just cold-list generation

## Required inputs

Collect or infer the following:

- Current priorities and work in progress
- Target roles, industries, regions, or ecosystems
- Platform choice: X, LinkedIn, or both
- A do-not-touch list
- Mode: `light-pass`, `default`, or `aggressive`

If the user does not specify a mode, use `default`.

## Tool requirements

### Recommended

- `x-api`: inspect the X graph and recent activity
- `lead-intelligence`: target discovery and warm-path ranking
- `social-graph-ranker`: when the user wants to score bridge value independently of the broader lead workflow
- Exa / deep research: enrich people and companies
- `brand-voice`: before drafting any outbound

### Fallbacks

- Browser control for LinkedIn analysis and drafting
- Browser control for X when API coverage is limited
- Desktop automation to draft in Apple Mail or Mail.app when email is the right channel

## Safe defaults

- Default to review-first; never perform blind, automatic cleanup
- X: only prune accounts the user follows; leave followers untouched
- LinkedIn: treat removing a 1st-degree connection as review-first and manual
- Never auto-send DMs, invitations, or emails
- Output a ranked action plan and drafts before any apply step

## Platform rules

### X

- Mutual follows are stickier than one-way follows
- Accounts that don't follow back can be pruned more aggressively
- Inactive or abandoned accounts should surface quickly
- Engagement, signal quality, and bridge value matter more than raw follower count

### LinkedIn

- API-first (when the user actually has LinkedIn API access)
- Browser workflows must work when there is no API access
- Distinguish outbound follows from accepted 1st-degree connections
- Outbound follows can be pruned more freely
- Accepted 1st-degree connections default to review and are never auto-removed

## Modes

### `light-pass`

- Prune only low-value, one-way follows with high confidence
- Surface the rest for review
- Generate a small add/follow list

### `default`

- A balanced cleanup queue
- A balanced keep list
- A ranked add/follow queue
- Draft warm intros or direct outreach where it helps

### `aggressive`

- A larger cleanup queue
- Lower tolerance for stale non-follow-backs
- A review gate still applies before apply

## Scoring model

Use these positive signals:

- Reciprocity
- Recent activity
- Alignment with current priorities
- Network bridge value
- Role relevance
- Actual engagement history
- Recent presence and responsiveness

Use these negative signals:

- Vanished or abandoned accounts
- Stale one-way follows
- Off-priority topic clusters
- Low-value noise
- Repeated non-response
- No follow-back when many better alternatives exist

Mutual follows and genuine warm-path bridges should not be penalized as aggressively as one-way follows.

## Workflow

1. Collect priorities, do-not-touch constraints, and the chosen platforms.
2. Pull the current follow/connection inventory.
3. Score prune candidates with explicit reasons.
4. Score keep candidates with explicit reasons.
5. Rank expansion candidates using `lead-intelligence` and research surfaces.
6. Match the right channel:
   - X DM for warm, fast social touchpoints
   - LinkedIn message for professional-graph adjacency
   - Apple Mail draft for higher-context intros or outreach
7. Run `brand-voice` before drafting messages.
8. Return a review pack before any apply step.

## Review pack format

```text
CONNECTIONS OPTIMIZER REPORT
============================

Mode:
Platforms:
Priority Set:

Prune Queue
- handle / profile
  reason:
  confidence:
  action:

Review Queue
- handle / profile
  reason:
  risk:

Keep / Protect
- handle / profile
  bridge value:

Add / Follow Targets
- person
  why now:
  warm path:
  preferred channel:

Drafts
- X DM:
- LinkedIn:
- Apple Mail:
```

## Outbound rules

- The default email path is drafting in Apple Mail / Mail.app.
- Never send automatically.
- Choose the channel based on warmth, relevance, and depth of context.
- Don't force a DM when no email or outreach is the right call.
- Drafts should sound like the user, not like automated sales copy.

## Related skills

- `brand-voice`: reusable voice profiles
- `social-graph-ranker`: standalone bridge scoring and warm-path computation
- `lead-intelligence`: weighted targets and warm-path discovery
- `x-api`: X graph access, drafts, and optional apply flows
- `content-engine`: when the user also needs public launch content about a network move
