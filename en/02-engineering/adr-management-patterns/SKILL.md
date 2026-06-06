---
name: adr-management-patterns
title: Architecture Decision Records (ADR) Management Patterns
description: Create and maintain Architecture Decision Records (ADRs) that capture the context, options, decision, and consequences behind significant technical/architecture choices; triggers: ADR, architecture decision, technology choice rationale, adr-tools, MADR, supersede an old decision
domain: 研发/architecture
triggers: [write an ADR, record an architecture decision, document a technology choice, database/framework selection comparison, deprecate and supersede an old decision, ADR template, adr-tools, decision review checklist, MADR]
tags: [architecture, adr, decision-record, research, documentation, technology-selection]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## When to use

Use ADRs for **significant, hard-to-reverse** architectural decisions that need to be recorded and traceable, for example:

- Adopting a new framework, language, or runtime
- Choosing infrastructure: database, cache, message broker, etc.
- Establishing API design patterns, integration patterns, or security architecture
- Recording design trade-offs, or onboarding new members / auditors who need historical decisions
- Establishing a team-level decision-making process

**Do NOT use (negative boundary):**

- You only need to document small implementation details, naming, or configuration tweaks
- Minor version upgrades, bug fixes, or routine maintenance
- There is no architectural decision to capture
- Do not treat an ADR as a substitute for environment-specific validation, testing, or expert review. Stop and confirm if required inputs, permissions, or success criteria are missing.

Write vs. skip heuristic:

| Write ADR | Skip ADR |
|-----------|----------|
| New framework adoption | Minor version upgrades |
| Database technology choice | Bug fixes |
| API design patterns | Implementation details |
| Security architecture | Routine maintenance |
| Integration patterns | Configuration changes |

An ADR captures three things: **Context** (why we needed to decide), **Decision** (what we decided), and **Consequences** (what happens as a result).

## Steps

1. **Capture context** — explain why the decision is needed now: business constraints, technical constraints, and decision drivers.
2. **List considered options** — give honest pros/cons for each, hiding no weaknesses.
3. **Record the decision and rationale** — state clearly what was chosen, why, and what was rejected; document positive/negative/risk consequences and mitigations.
4. **Link and maintain status** — link related ADRs and update status over time (Proposed → Accepted → Deprecated → Superseded, or Rejected). When a new decision replaces an old one, write a new ADR rather than editing the old one.

ADR lifecycle:

```
Proposed → Accepted → Deprecated → Superseded
              ↓
           Rejected
```

Conventions:

- One decision per ADR; number with four digits `NNNN`, filename `NNNN-title-with-dashes.md`.
- Keep it to 1–2 pages, actionable and concrete; an ADR with no follow-up action is waste.
- Do not edit an Accepted ADR in place — supersede it with a new ADR.
- Store centrally in `docs/adr/`, and maintain a `README.md` index table and a `template.md`.

Recommended directory structure:

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

Automate with `adr-tools`:

```bash
# Install adr-tools
brew install adr-tools

# Initialize ADR directory
adr init docs/adr

# Create new ADR
adr new "Use PostgreSQL as Primary Database"

# Supersede an ADR (supersedes ADR-0003)
adr new -s 3 "Deprecate MongoDB in Favor of PostgreSQL"

# Generate table of contents
adr generate toc > docs/adr/README.md

# Link related ADRs
adr link 2 "Complements" 1 "Is complemented by"
```

## Example

**Standard template (MADR format)** with Status / Context / Decision Drivers / Considered Options / Decision / Rationale / Consequences (Positive, Negative, Risks) / Implementation Notes / Related Decisions / References:

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

* **Must have ACID compliance** for payment processing
* **Must support complex queries** for reporting
* **Should support full-text search** to reduce infrastructure complexity
* **Should have good JSON support** for flexible product attributes
* **Team familiarity** reduces onboarding time

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
```

Other templates to pick from as needed: **Lightweight ADR** (good for small decisions, with a Status/Date/Deciders header), **Y-Statement** (one-sentence form), **Deprecation/Supersede** (with a phased migration plan and lessons learned), and **RFC style** (Summary / Motivation / Detailed Design / Drawbacks / Alternatives / Unresolved Questions / Implementation Plan).

Y-Statement example:

```markdown
# ADR-0015: API Gateway Selection

In the context of **building a microservices architecture**,
facing **the need for centralized API management, authentication, and rate limiting**,
we decided for **Kong Gateway**
and against **AWS API Gateway and custom Nginx solution**,
to achieve **vendor independence, plugin extensibility, and team familiarity with Lua**,
accepting that **we need to manage Kong infrastructure ourselves**.
```

Index table (README.md) style:

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| 0001 | Use PostgreSQL as Primary Database | Accepted | 2024-01-10 |
| 0003 | MongoDB for User Profiles | Deprecated | 2023-06-15 |
| 0020 | Deprecate MongoDB | Accepted | 2024-01-15 |

## Notes

**Review checklist** (before submission / during review / after acceptance):

- *Before submission*: context clearly explains the problem; all viable options considered; pros/cons balanced and honest; consequences (positive and negative) documented; related ADRs linked.
- *During review*: at least 2 senior engineers reviewed; affected teams consulted; security/cost implications considered; reversibility assessed.
- *After acceptance*: ADR index updated; team notified; implementation tickets created; related documentation updated.

**Do's:**
- **Write ADRs early** — before implementation starts.
- **Keep them short** — 1–2 pages maximum.
- **Be honest about trade-offs** — include the real cons.
- **Link related decisions** — build a decision graph.
- **Update status** — deprecate when superseded.

**Don'ts:**
- **Don't change accepted ADRs** — write new ones to supersede.
- **Don't skip context** — future readers need the background.
- **Don't hide failures** — rejected decisions are valuable.
- **Don't be vague** — specific decisions, specific consequences.
- **Don't forget implementation** — an ADR without action is waste.

## See also

- [MADR Template](https://adr.github.io/madr/)
- [Documenting Architecture Decisions (Michael Nygard)](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [ADR GitHub Organization](https://adr.github.io/)
- [adr-tools](https://github.com/npryce/adr-tools)

---
Adapted from sickn33/antigravity-awesome-skills (MIT License).
