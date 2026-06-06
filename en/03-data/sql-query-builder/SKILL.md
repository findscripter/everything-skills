---
name: sql-query-builder
title: SQL Query Builder
description: Use when turning a natural-language requirement into correct, efficient SQL — joins, aggregation, window functions, CTEs, or debugging wrong results and slow queries. Triggers: write SQL, query, join, aggregate, window function, slow query.
domain: 数据/sql
triggers: [write SQL, query, join, aggregate, window function, slow query, CTE, GROUP BY, natural language to SQL, EXPLAIN]
tags: [sql, database, query]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [erd-schema-designer, postgresql-optimization, dbt-transformation-modeler, snowflake-development]
combines_with: [postgresql-optimization, kpi-dashboard-design, dbt-transformation-modeler]
license: CC-BY-SA-4.0
source: 
source_license: 
---
## When to use

- Translate a natural-language requirement into executable SQL: filtering, joins, aggregation, grouping, sorting, pagination.
- Write multi-table JOINs, window functions (ranking / running totals / period-over-period / dedup-to-latest), subqueries / CTEs.
- Debug wrong or slow SQL: incorrect results, performance bottlenecks, missed indexes.

When NOT to use:

- Data is already a local CSV / dirty data that needs cleaning and dedup rather than a database query -> use `csv-data-cleaner`.
- Table structure is unknown and the schema cannot be looked up -> ask for the DDL or `information_schema` first; never invent column names.
- Bulk write operations (INSERT/UPDATE/DELETE/DDL) -> this skill only produces SQL; require explicit user confirmation before running, never auto-execute.

## Steps

```
1. Confirm dialect and schema
   - Dialect: postgres | mysql | sqlite | sqlserver | bigquery (default postgres)
   - Tables/columns: get the DDL or read information_schema.columns; if missing,
     stop and ask — do not fabricate column names
2. Decompose the requirement -> map to clauses
   - Which columns/metrics to output       -> SELECT
   - Which tables, join keys, join type     -> FROM / JOIN (default INNER; LEFT to keep all left rows)
   - Row-level filters (before aggregation) -> WHERE
   - Grouping dimensions                    -> GROUP BY
   - Filters after aggregation              -> HAVING
   - Sorting, Top-N / pagination            -> ORDER BY / LIMIT OFFSET
3. Need "rank within group / running total / take latest row" -> use window functions,
   not correlated subqueries
   - ROW_NUMBER()/RANK()/SUM() OVER (PARTITION BY ... ORDER BY ...)
   - Dedup-to-latest: ROW_NUMBER in a subquery, then outer WHERE rn = 1
4. Nested logic -> split with CTEs (WITH); each CTE single-purpose, readable top-down
5. Self-check (run through each point before delivering)
   - Did any JOIN miss its ON / produce a cartesian product? Does many-to-many double counts?
   - Are all non-aggregated SELECT columns in GROUP BY?
   - NULLs: NULLs after outer joins, the NOT IN + NULL trap, COUNT(col) ignores NULL
   - Aggregate condition placed in WHERE (should be HAVING) or vice versa?
   - Does pagination have an ORDER BY for stable ordering?
6. Slow-query triage
   - Run EXPLAIN / EXPLAIN ANALYZE; look for Seq Scan / full table scans, row-estimate skew
   - Check that WHERE/JOIN columns are indexed; avoid wrapping indexed columns in functions
     (e.g. DATE(col)) which defeats the index
   - SELECT * -> select only the needed columns; use EXISTS instead of inefficient IN subqueries
```

## Example

Requirement: "For 2024, show the average salary of active employees per department, only departments with headcount >= 5, sorted high to low."

```sql
-- postgres
SELECT d.name AS dept,
       COUNT(*)             AS headcount,
       ROUND(AVG(e.salary)) AS avg_salary
FROM employees e
JOIN departments d ON d.id = e.dept_id
WHERE e.status = 'active'
  AND e.hire_date < DATE '2025-01-01'
GROUP BY d.name
HAVING COUNT(*) >= 5
ORDER BY avg_salary DESC;
```

Window function — the most recent order per customer:

```sql
WITH ranked AS (
  SELECT o.*,
         ROW_NUMBER() OVER (PARTITION BY customer_id
                            ORDER BY created_at DESC) AS rn
  FROM orders o
)
SELECT customer_id, id AS order_id, amount, created_at
FROM ranked
WHERE rn = 1;
```

Prompt template for the agent:

```
dialect=postgres. Table orders(id, customer_id, amount, created_at, status).
Requirement: <natural language>.
Requirements: split with CTEs; select only necessary columns; append EXPLAIN focus points after the query.
```

## Notes

- Confirm the dialect first: LIMIT/OFFSET vs TOP, string concatenation, date functions, and boolean types all differ per dialect.
- If a column/table name is uncertain, ask — never invent it; quote names that are reserved words or case-sensitive.
- Many-to-many JOINs inflate aggregated values; when needed, dedup in a subquery before aggregating.
- `NOT IN (subquery)` returns an empty set whenever the subquery contains NULL — use `NOT EXISTS` instead.
- Watch floating-point division: integer divide-by-zero and precision; CAST as needed; never use FLOAT for money.
- For large-table pagination use keyset pagination (`WHERE id > last_id`) instead of a large OFFSET.
- Only produce SELECT queries; any write operation must be explicitly confirmed by the user and accompanied by an estimated affected-row count before execution.

## See also

- requires: none.
- related: erd-schema-designer, postgresql-optimization, dbt-transformation-modeler, snowflake-development.
- combines_with: postgresql-optimization, kpi-dashboard-design, dbt-transformation-modeler; csv-data-cleaner — connect when exporting query results or when local data must be cleaned first.
