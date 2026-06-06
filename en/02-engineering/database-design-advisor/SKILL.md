---
name: database-design-advisor
title: Database Design & Migration Advisor
description: Use when designing database schemas, choosing SQL vs NoSQL (PostgreSQL/MySQL/SQLite/SQL Server), planning zero-downtime migrations, optimizing indexes and slow queries, or designing sharding/replication; not for one-off SQL debugging, ORM framework details, or cluster ops/deploym
domain: 研发/architecture
triggers: [database design, schema design, SQL or NoSQL, data migration, zero-downtime migration, expand-contract, index optimization, slow query, EXPLAIN, N+1, sharding, read replica, connection pooling, data modeling, normalization, replication]
tags: [database, architecture, schema-design, data-migration, index-optimization, query-optimization, sharding, replication, postgresql, mysql, nosql]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: []
combines_with: []
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## When to use

Use this skill for data-architecture decisions, including:

- **Database selection** for a new project or refactor (SQL vs NoSQL; choosing among PostgreSQL / MySQL / SQLite / SQL Server).
- Designing or reviewing a **schema**: normalization (1NF–BCNF), denormalization trade-offs, data types, constraints (foreign key / unique / not-null), naming conventions, and ERD modeling.
- Planning **data migrations**, especially evolutionary changes that must be **zero-downtime**.
- Optimizing **indexes and slow queries**: index gaps, composite index column order, redundant indexes, reading `EXPLAIN`, and N+1 problems.
- Designing scalability: **sharding, replication, read/write splitting, connection pooling**.

**Out of scope (negative boundaries):**

- Writing or debugging one specific business SQL statement — use a day-to-day SQL assistant instead.
- Pure ORM framework usage and application-layer code details — that is backend development.
- Provisioning, deploying, and operating database clusters — that is DevOps.
- This skill does not replace real production change review and backup processes; it only provides method and draft scripts.

## Steps

1. **Clarify requirements and constraints**: data volume, read/write ratio, consistency requirements, latency targets, the team's existing stack, compliance/region requirements.
2. **Select the database**: default to SQL (prefer PostgreSQL); reach for NoSQL only when the access pattern clearly benefits. Use the decision matrix below to give a recommendation with rationale.
3. **Design the schema**: pick a normalization level plus necessary denormalization, choose right-sized data types and constraints, standardize naming, and generate an ERD with Mermaid when helpful.
4. **Plan indexes**: cover common query patterns, avoid over-indexing; index foreign keys, set composite-index column order, and remove redundant indexes.
5. **Design migrations**: pair every migration with a reversible up/down script; use the expand-contract pattern for zero-downtime and backfill data in batches.
6. **Optimize performance**: validate plans with `EXPLAIN (ANALYZE, BUFFERS)`, hunt for Seq Scan / N+1 / working-set-exceeds-memory signals.
7. **Plan scalability (as needed)**: partition/shard strategy, replication pattern, read/write splitting, connection-pool sizing.
8. **Deliver**: modeling plan + migration scripts + index/query optimization advice + selection and scalability rationale, annotated with rollback and backup requirements.

## Instructions

### Schema design best practices
1. **Use meaningful, consistent names** for tables and columns.
2. **Choose appropriate, right-sized data types** for storage efficiency.
3. **Define proper constraints**: foreign keys, check constraints, unique indexes.
4. **Plan for future growth** from the beginning.
5. **Document relationships** and business rules.

### Security considerations
- **Principle of least privilege**: grant minimal necessary permissions.
- **Encrypt sensitive data** at rest and in transit.
- **Audit access patterns**: monitor and log database access.
- **Validate inputs** to prevent SQL injection.
- **Apply security updates** promptly.

### Indexing strategies (PostgreSQL)

| Index Type | Use Case | Example |
|------------|----------|---------|
| **B-tree** (default) | Equality, range, ORDER BY | `CREATE INDEX idx_users_email ON users(email);` |
| **GIN** | Full-text search, JSONB, arrays | `CREATE INDEX idx_docs_body ON docs USING gin(to_tsvector('english', body));` |
| **GiST** | Geometry, range types, nearest-neighbor | `CREATE INDEX idx_locations ON places USING gist(coords);` |
| **Partial** | Subset of rows (reduce size) | `CREATE INDEX idx_active ON users(email) WHERE active = true;` |
| **Covering** | Index-only scans | `CREATE INDEX idx_cov ON orders(customer_id) INCLUDE (total, created_at);` |

### Reading EXPLAIN plans

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) SELECT ...;
```

Key signals to watch:
- **Seq Scan** on large tables — missing index.
- **Nested Loop** with high row estimates — consider hash/merge join or add an index.
- **Buffers shared read** much higher than **hit** — working set exceeds memory.

### Connection pooling

| Tool | Protocol | Best For |
|------|----------|----------|
| **PgBouncer** | PostgreSQL | Transaction/statement pooling, low overhead |
| **ProxySQL** | MySQL | Query routing, read/write splitting |
| **Built-in pool** (HikariCP, SQLAlchemy pool) | Any | Application-level pooling |

**Rule of thumb:** set pool size to `(2 * CPU cores) + disk spindles`. For cloud SSDs, start with `2 * vCPUs` and tune.

### Multi-database decision matrix

| Criteria | PostgreSQL | MySQL | SQLite | SQL Server |
|----------|-----------|-------|--------|------------|
| **Best for** | Complex queries, JSONB, extensions | Web apps, read-heavy workloads | Embedded, dev/test, edge | Enterprise .NET stacks |
| **JSON support** | Excellent (JSONB + GIN) | Good (JSON type) | Minimal | Good (OPENJSON) |
| **Replication** | Streaming, logical | Group replication, InnoDB cluster | N/A | Always On AG |
| **Licensing** | Open source (PostgreSQL License) | Open source (GPL) / commercial | Public domain | Commercial |
| **Max practical size** | Multi-TB | Multi-TB | ~1 TB (single-writer) | Multi-TB |

**When to choose:**
- **PostgreSQL** — default for new projects; best extensibility and standards compliance.
- **MySQL** — existing MySQL ecosystem; simple read-heavy web applications.
- **SQLite** — mobile apps, CLI tools, unit-test databases, IoT/edge.
- **SQL Server** — mandated by enterprise policy; deep .NET/Azure integration.

**NoSQL considerations:**

| Database | Model | Use When |
|----------|-------|----------|
| **MongoDB** | Document | Schema flexibility, rapid prototyping, content management |
| **Redis** | Key-value / cache | Session store, rate limiting, leaderboards, pub/sub |
| **DynamoDB** | Wide-column | Serverless AWS apps, single-digit-ms latency at any scale |

> Use SQL as the default. Reach for NoSQL only when the access pattern clearly benefits from it.

### Sharding & replication

**Vertical partitioning**: split columns across tables (e.g., separate BLOB columns) to reduce I/O for narrow queries. **Horizontal partitioning (sharding)**: split rows across databases/servers — required only when a single node cannot hold the dataset or handle the throughput.

Sharding strategies:

| Strategy | How It Works | Pros | Cons |
|----------|-------------|------|------|
| **Hash** | `shard = hash(key) % N` | Even distribution | Resharding is expensive |
| **Range** | Shard by date or ID range | Simple, good for time-series | Hot spots on latest shard |
| **Geographic** | Shard by user region | Data locality, compliance | Cross-region queries are hard |

Replication patterns:

| Pattern | Consistency | Latency | Use Case |
|---------|------------|---------|----------|
| **Synchronous** | Strong | Higher write latency | Financial transactions |
| **Asynchronous** | Eventual | Low write latency | Read-heavy web apps |
| **Semi-synchronous** | At-least-one replica confirmed | Moderate | Balance of safety and speed |

For read/write splitting: route all `SELECT` queries to replicas and writes to the primary; account for replication lag and use `pg_last_wal_replay_lsn()` to detect lag before reading critical data.

## Example

**Zero-downtime migration (expand-contract, four steps):**

1. **Expand** — add the new column/table (nullable, with default).
2. **Migrate data** — backfill in batches; dual-write from the application.
3. **Transition** — application reads from the new column; stop writing to the old one.
4. **Contract** — drop the old column in a follow-up migration.

**Migration file naming (timestamp prefix, up/down pairs):**

```
migrations/
├── 20260101_000001_create_users.up.sql
├── 20260101_000001_create_users.down.sql
├── 20260115_000002_add_users_email_index.up.sql
└── 20260115_000002_add_users_email_index.down.sql
```

**Batch backfill to avoid long-running locks:**

```sql
UPDATE users SET email_normalized = LOWER(email)
WHERE id IN (SELECT id FROM users WHERE email_normalized IS NULL LIMIT 5000);
-- Repeat in a loop until 0 rows affected
```

**Query patterns:**

```sql
-- Recursive CTE for org chart
WITH RECURSIVE org AS (
  SELECT id, name, manager_id, 1 AS depth
  FROM employees WHERE manager_id IS NULL
  UNION ALL
  SELECT e.id, e.name, e.manager_id, o.depth + 1
  FROM employees e INNER JOIN org o ON o.id = e.manager_id
)
SELECT * FROM org ORDER BY depth, name;

-- Window functions for pagination/dedup and adjacent-row comparison
SELECT *, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) AS rn
FROM orders;
SELECT date, revenue,
  revenue - LAG(revenue) OVER (ORDER BY date) AS daily_change
FROM daily_sales;

-- Conditional aggregation (PostgreSQL FILTER)
SELECT
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE status = 'active') AS active
FROM accounts;
```

## Notes

- **Migrations must be reversible**: test `down.sql` in staging before deploying `up.sql` to production.
- **Keep the rollback window short**: once the contract step (column drop) has run, rollback requires a new forward migration, not a simple revert.
- **Back up before irreversible changes**: take a logical backup before dropping columns that contain data.
- **N+1 detection**: the symptom is one query issued per row; fix with a JOIN/subquery single round-trip, ORM eager loading (`select_related` / `includes` / `with`), or the DataLoader pattern for GraphQL resolvers.
- **Do not over-index**: indexes speed reads but slow writes and consume space — cover only real, high-frequency query patterns.
- **Partition/shard is a last resort**: use only when a single node can no longer hold the data or sustain throughput; prefer vertical splitting (separating large columns) before horizontal sharding.
- **Replication lag**: async replication is typically <1s; critical consistent reads must explicitly detect lag or route to the primary.

## See also

- **sql-database-assistant** — query writing, optimization, and debugging for day-to-day SQL work.
- **database-schema-designer** — ERD modeling, normalization analysis, and schema generation.
- **migration-architect** — large-scale migration planning across database engines or major schema overhauls.
- **senior-backend** — application-layer patterns (connection pooling, ORM best practices).
- **senior-devops** — infrastructure provisioning for database clusters and replicas.
