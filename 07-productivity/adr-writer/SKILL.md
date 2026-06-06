---
name: adr-writer
title: Architecture Decision Records (ADR) Writing
description: Write and maintain Architecture Decision Records (ADRs) — capture the context, options, decision, and consequences of significant technical choices (framework, database, API patterns, security architecture). Use when documenting major decisions, reviewing past architectural choic
domain: 协作/knowledge
triggers: [ADR, architecture decision record, MADR, decision record, technology choice documentation, design trade-off]
tags: [adr, architecture, documentation, decision-record, madr, knowledge]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [adr-management-patterns, codebase-onboarding-doc, tech-stack-evaluator, database-design-advisor]
combines_with: [tech-stack-evaluator, backend-architecture-patterns, codebase-onboarding-doc]
license: MIT
source: wshobson/agents
source_license: MIT
---
## When to use

Use this skill to capture the context and rationale behind significant, hard-to-reverse technical decisions so future readers (including new team members) understand *why* a choice was made.

Good fits:

- Making significant architectural decisions
- Documenting technology choices (framework, library, database)
- Recording design trade-offs and integration/API patterns
- Security architecture decisions
- Onboarding new team members
- Reviewing historical decisions and establishing decision-making processes

Skip an ADR (it would just be noise) for: minor version upgrades, bug fixes, pure implementation details, routine maintenance, and configuration changes. Rule of thumb: write an ADR only if the decision affects system structure, is hard to reverse, or needs team consensus — any one of the three is enough.

| Write ADR                  | Skip ADR               |
| -------------------------- | ---------------------- |
| New framework adoption     | Minor version upgrades |
| Database technology choice | Bug fixes              |
| API design patterns        | Implementation details |
| Security architecture      | Routine maintenance    |
| Integration patterns       | Configuration changes  |

Every ADR is anchored by three parts: **Context** (why we needed to decide) → **Decision** (what we decided) → **Consequences** (what happens as a result, including the negatives).

## Steps

1. Confirm the decision clears the "worth recording" bar (see above).
2. Pick a template: MADR for formal technology selection; the lightweight format for small decisions; Y-Statement for one-sentence trade-offs; the deprecation template (mark *Supersedes*) when replacing an old decision; RFC style for proposals under discussion.
3. Create the file under `docs/adr/` named `NNNN-title-with-dashes.md` (four-digit incrementing number).
4. Fill it in: **Context** (problem + constraints) → **Decision Drivers** → **Considered Options** (honest Pros/Cons for each candidate) → **Decision + Rationale** → **Consequences** (Positive / Negative / Risks + mitigations) → **Implementation Notes** → **Related Decisions** → **References**.
5. Set the **Status** along the lifecycle: `Proposed → Accepted → Deprecated → Superseded` (with `Rejected` as a branch).

```
Proposed → Accepted → Deprecated → Superseded
              ↓
           Rejected
```

6. Run the review: at least 2 senior engineers plus affected teams, covering security, cost, and reversibility.
7. After acceptance, update the `docs/adr/README.md` index table, notify the team, and create implementation tickets.
8. When a decision changes, **do not edit the old ADR** — write a new one and mark `Supersedes ADR-XXXX`.

### Automation (adr-tools)

Optionally use `adr-tools` to automate numbering, the index, and links:

```bash
# Install adr-tools
brew install adr-tools

# Initialize ADR directory
adr init docs/adr

# Create new ADR (auto-numbered)
adr new "Use PostgreSQL as Primary Database"

# Supersede an ADR (deprecates ADR-0003)
adr new -s 3 "Deprecate MongoDB in Favor of PostgreSQL"

# Generate table of contents
adr generate toc > docs/adr/README.md

# Link related ADRs
adr link 2 "Complements" 1 "Is complemented by"
```

### Directory structure

```
docs/
├── adr/
│   ├── README.md           # Index and guidelines
│   ├── template.md         # Team's ADR template
│   ├── 0001-use-postgresql.md
│   ├── 0002-caching-strategy.md
│   ├── 0003-mongodb-user-profiles.md  # [DEPRECATED]
│   └── 0020-deprecate-mongodb.md      # Supersedes 0003
```

## Example

### Template 1: Standard ADR (MADR format)

```markdown
# ADR-0001: Use PostgreSQL as Primary Database

## Status

Accepted

## Context

We need to select a primary database for our new e-commerce platform. The system
will handle:

- ~10,000 concurrent users
- Complex product catalog with hierarchical categories
- Transaction processing for orders and payments
- Full-text search for products
- Geospatial queries for store locator

The team has experience with MySQL, PostgreSQL, and MongoDB. We need ACID
compliance for financial transactions.

## Decision Drivers

- **Must have ACID compliance** for payment processing
- **Must support complex queries** for reporting
- **Should support full-text search** to reduce infrastructure complexity
- **Should have good JSON support** for flexible product attributes
- **Team familiarity** reduces onboarding time

## Considered Options

### Option 1: PostgreSQL

- **Pros**: ACID compliant, excellent JSON support (JSONB), built-in full-text
  search, PostGIS for geospatial, team has experience
- **Cons**: Slightly more complex replication setup than MySQL

### Option 2: MySQL

- **Pros**: Very familiar to team, simple replication, large community
- **Cons**: Weaker JSON support, no built-in full-text search (need
  Elasticsearch), no geospatial without extensions

### Option 3: MongoDB

- **Pros**: Flexible schema, native JSON, horizontal scaling
- **Cons**: No ACID for multi-document transactions (at decision time),
  team has limited experience, requires schema design discipline

## Decision

We will use **PostgreSQL 15** as our primary database.

## Rationale

PostgreSQL provides the best balance of ACID compliance, built-in capabilities
(full-text search, JSONB, PostGIS), team familiarity, and a mature ecosystem.
The slight complexity in replication is outweighed by the reduction in
additional services (no separate Elasticsearch needed).

## Consequences

### Positive

- Single database handles transactions, search, and geospatial queries
- Reduced operational complexity (fewer services to manage)
- Strong consistency guarantees for financial data

### Negative

- Need to learn PostgreSQL-specific features (JSONB, full-text search syntax)
- Vertical scaling limits may require read replicas sooner

### Risks

- Full-text search may not scale as well as dedicated search engines
- Mitigation: Design for potential Elasticsearch addition if needed

## Implementation Notes

- Use JSONB for flexible product attributes
- Implement connection pooling with PgBouncer
- Set up streaming replication for read replicas
- Use pg_trgm extension for fuzzy search

## Related Decisions

- ADR-0002: Caching Strategy (Redis) - complements database choice
- ADR-0005: Search Architecture - may supersede if Elasticsearch needed

## References

- [PostgreSQL JSON Documentation](https://www.postgresql.org/docs/current/datatype-json.html)
- [PostgreSQL Full Text Search](https://www.postgresql.org/docs/current/textsearch.html)
```

### Template 2: Lightweight ADR

```markdown
# ADR-0012: Adopt TypeScript for Frontend Development

**Status**: Accepted
**Date**: 2024-01-15
**Deciders**: @alice, @bob, @charlie

## Context

Our React codebase has grown to 50+ components with increasing bug reports
related to prop type mismatches and undefined errors. PropTypes provide
runtime-only checking.

## Decision

Adopt TypeScript for all new frontend code. Migrate existing code incrementally.

## Consequences

**Good**: Catch type errors at compile time, better IDE support, self-documenting code.

**Bad**: Learning curve for team, initial slowdown, build complexity increase.

**Mitigations**: TypeScript training sessions, allow gradual adoption with `allowJs: true`.
```

### Template 3: Y-Statement (one-sentence trade-off)

```markdown
# ADR-0015: API Gateway Selection

In the context of **building a microservices architecture**,
facing **the need for centralized API management, authentication, and rate limiting**,
we decided for **Kong Gateway**
and against **AWS API Gateway and custom Nginx solution**,
to achieve **vendor independence, plugin extensibility, and team familiarity with Lua**,
accepting that **we need to manage Kong infrastructure ourselves**.
```

### Template 4: ADR for deprecation

```markdown
# ADR-0020: Deprecate MongoDB in Favor of PostgreSQL

## Status

Accepted (Supersedes ADR-0003)

## Context

ADR-0003 (2021) chose MongoDB for user profile storage due to schema flexibility
needs. Since then: multi-document transactions remain problematic, our schema has
stabilized, we now have PostgreSQL expertise, and maintaining two databases
increases operational burden.

## Decision

Deprecate MongoDB and migrate user profiles to PostgreSQL.

## Migration Plan

1. **Phase 1** (Week 1-2): Create PostgreSQL schema, dual-write enabled
2. **Phase 2** (Week 3-4): Backfill historical data, validate consistency
3. **Phase 3** (Week 5): Switch reads to PostgreSQL, monitor
4. **Phase 4** (Week 6): Remove MongoDB writes, decommission

## Lessons Learned

- Schema flexibility benefits were overestimated
- Operational cost of multiple databases was underestimated
- Consider long-term maintenance in technology decisions
```

### Template 5: RFC style (proposal)

```markdown
# RFC-0025: Adopt Event Sourcing for Order Management

## Summary

Propose adopting the event sourcing pattern for the order management domain to
improve auditability, enable temporal queries, and support business analytics.

## Motivation

1. Audit requirements need complete order history
2. "What was the order state at time X?" queries are impossible today
3. Analytics team needs an event stream for real-time dashboards

## Drawbacks

- Learning curve, increased complexity vs. CRUD, careful event design needed,
  storage growth (events never deleted)

## Alternatives

1. **Audit tables**: simpler but no temporal queries
2. **CDC from existing DB**: complex, doesn't change data model
3. **Hybrid**: event-source only order state changes

## Unresolved Questions

- [ ] Event schema versioning strategy
- [ ] Retention policy for events
- [ ] Snapshot frequency for performance
```

## Notes

Best practices:

**Do's**

- **Write ADRs early** — before implementation starts, not after the fact.
- **Keep them short** — 1-2 pages maximum; no one reads a wall of text.
- **Be honest about trade-offs** — include real cons and rejected options; a Rejected decision is itself valuable.
- **Link related decisions** — build a decision graph.
- **Update status** — deprecate when superseded.

**Don'ts**

- **Don't change accepted ADRs** — write new ones to supersede (Supersedes).
- **Don't skip context** — future readers need the background.
- **Don't hide failures** — rejected decisions carry information.
- **Don't be vague** — specific decisions yield specific consequences.
- **Don't forget implementation** — an ADR with a conclusion but no action is waste.

Codify the review checklist into the index README so it is enforced consistently:

```markdown
## ADR Review Checklist

### Before Submission
- [ ] Context clearly explains the problem
- [ ] All viable options considered
- [ ] Pros/cons balanced and honest
- [ ] Consequences (positive and negative) documented
- [ ] Related ADRs linked

### During Review
- [ ] At least 2 senior engineers reviewed
- [ ] Affected teams consulted
- [ ] Security implications considered
- [ ] Cost implications documented
- [ ] Reversibility assessed

### After Acceptance
- [ ] ADR index updated
- [ ] Team notified
- [ ] Implementation tickets created
- [ ] Related documentation updated
```

## See also

- **adr-management-patterns** — maintaining the ADR index, lifecycle, and linking at scale.
- **tech-stack-evaluator** — feeds the Considered Options / Decision Drivers of a selection ADR.
- **codebase-onboarding-doc** — ADRs are a primary onboarding artifact for new team members.
- **database-design-advisor** / **backend-architecture-patterns** — common subjects of significant ADRs.
- **first-principles-thinking** — decompose constraints and surface the real trade-offs when filling Decision Drivers and evaluating options.

Adapted from wshobson/agents (MIT).
