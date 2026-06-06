---
name: dataset-profiler
title: Dataset Profiler
description: Profile a new table or file before analysis: shape, grain, primary key, null rates, cardinality, distributions, quality flags, and recommended dimensions/metrics/follow-ups. Use when encountering an unfamiliar dataset, checking null rates or column distributions, spotting duplica
domain: 数据/wrangling
triggers: [profile a dataset, explore data, data profiling, what to look at in a new table, understand data shape, null rate, cardinality, column distribution, duplicate and placeholder detection, which dimensions and metrics to use, recommend follow-up analyses, dataset overview]
tags: [data, analysis, profiling, exploratory-analysis, data-quality, dimensions-metrics, wrangling]
level: beginner
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [dataset-quality-auditor, data-quality-validator, analysis-qa-validator, csv-data-cleaner]
combines_with: [csv-data-cleaner, statsmodels-statistical-modeling, matplotlib-visualization]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## When to use

Use this when you first encounter a table or an uploaded file and need to understand "what this data looks like, whether it can be trusted, and where it is worth digging in" **before** writing specific queries or doing formal analysis. Typical requests:

- "Profile/explore this table (or this CSV/Parquet/Excel/JSON)" -> output an overview + per-column profile + quality issues + follow-up suggestions.
- "Which dimensions and metrics should I use to analyze this data?" -> output recommended dimension columns, key metric columns, and time columns suitable for trends.
- "Can I use this table as-is / are there gotchas?" -> output a quality-issue list flagged by severity.

Do NOT use this (negative boundaries):
- For **deep cleaning/repair** plus a data quality score (DQS) and missingness-mechanism diagnosis -> use `dataset-quality-auditor`.
- To **design or optimize a schema / normal form / ER diagram** -> use `erd-schema-designer`.
- To **build the ETL pipeline itself** -> use a data-pipeline skill.

Positioning: this is the "take a first look" exploration layer. Its output is a map, not a remediation plan. When you find something that needs fixing, hand it off to a quality audit.

## Steps

### 1. Access the Data

**If a data warehouse MCP server is connected:**
1. Resolve the table name (handle schema prefixes, suggest matches if ambiguous).
2. Query table metadata: column names, types, descriptions if available.
3. Run profiling queries against the live data.

**If a file is provided (CSV, Excel, Parquet, JSON):**
1. Read the file and load into a working dataset.
2. Infer column types from the data.

**If neither:**
1. Ask the user to provide a table name (with their warehouse connected) or upload a file.
2. If they describe a table schema, provide guidance on what profiling queries to run.

### 2. Understand Structure (answer before analyzing)

**Table-level questions:** How many rows and columns? What is the grain (one row per what)? What is the primary key, and is it unique? When was the data last updated? How far back does the data go?

**Column classification** — categorize each column as one of:
- **Identifier**: unique keys, foreign keys, entity IDs
- **Dimension**: categorical attributes for grouping/filtering (status, type, region, category)
- **Metric**: quantitative values for measurement (revenue, count, duration, score)
- **Temporal**: dates and timestamps (created_at, updated_at, event_date)
- **Text**: free-form text fields (description, notes, name)
- **Boolean**: true/false flags
- **Structural**: JSON, arrays, nested structures

### 3. Generate Data Profile (run checks per column type)

**Table-level:** total row count; column count and type breakdown; approximate table size (if available from metadata); date-range coverage (min/max of date columns).

**All columns:** null count and null rate; distinct count and cardinality ratio (distinct / total); most common values (top 5-10 with frequencies); least common values (bottom 5, to spot anomalies).

**Numeric columns (metrics):**
```
min, max, mean, median (p50)
standard deviation
percentiles: p1, p5, p25, p75, p95, p99
zero count
negative count (if unexpected)
```

**String columns (dimensions, text):**
```
min length, max length, avg length
empty string count
pattern analysis (do values follow a format?)
case consistency (all upper, all lower, mixed?)
leading/trailing whitespace count
```

**Date/timestamp columns:**
```
min date, max date
null dates
future dates (if unexpected)
distribution by month/week
gaps in time series
```

**Boolean columns:**
```
true count, false count, null count
true rate
```

**Present the profile as a clean summary table, grouped by column type (dimensions, metrics, dates, IDs).**

### 4. Identify Data Quality Issues (heuristic — each worth a quick look)

- **High null rates**: >5% nulls (warn), >20% nulls (alert).
- **Low cardinality surprises**: columns that should be high-cardinality but aren't (e.g., a `user_id` with only 50 distinct values).
- **High cardinality surprises**: columns that should be categorical but have too many distinct values.
- **Suspicious values**: negative amounts where only positive is expected, future dates in historical data, obvious placeholders (`N/A`, `TBD`, `test`, `999999`).
- **Duplicate detection**: check whether there is a natural key and whether it has duplicates.
- **Distribution skew**: extremely skewed numeric distributions that could distort averages.
- **Encoding issues**: mixed case in categorical fields, trailing whitespace, inconsistent formats.

### 5. Discover Relationships and Patterns

After profiling individual columns: **foreign key candidates** (ID columns that may link to other tables); **hierarchies** (natural drill-down paths, country > state > city); **correlations** (numeric columns that move together); **derived columns** (computed from others); **redundant columns** (identical or near-identical info).

### 6. Suggest Interesting Dimensions and Metrics

- **Best dimension columns** for slicing (categorical, reasonable cardinality of 3-50 values).
- **Key metric columns** for measurement (numeric, meaningful distributions).
- **Time columns** suitable for trend analysis.
- **Natural groupings/hierarchies** apparent in the data.
- **Potential join keys** linking to other tables (ID columns, foreign keys).

### 7. Recommend Follow-Up Analyses

Suggest 3-5 specific analyses, for example:
- "Trend analysis on [metric] by [time_column] grouped by [dimension]"
- "Distribution deep-dive on [skewed_column] to understand outliers"
- "Data quality investigation on [problematic_column]"
- "Correlation analysis between [metric_a] and [metric_b]"
- "Cohort analysis using [date_column] and [status_column]"

### Instructions / reference

**Schema exploration queries** (PostgreSQL shown; other engines are similar):
```sql
-- List all tables in a schema
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Column details (type / nullable / default)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'my_table'
ORDER BY ordinal_position;

-- Table sizes
SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- Row counts: run per-table -> SELECT COUNT(*) FROM <table>
```

For files, use pandas/polars: `df.shape`, `df.dtypes`, `df.describe()`, `df.isna().mean()` (null rate), `df.nunique()` (cardinality), `df[col].value_counts().head(10)` (top values).

**Completeness score** (rate each column): Complete (>99% non-null) = green; Mostly complete (95-99%) = yellow, investigate the nulls; Incomplete (80-95%) = orange, understand why and whether it matters; Sparse (<80%) = red, may not be usable without imputation.

**Distribution shapes** (numeric columns): Normal (mean ≈ median, bell-shaped); Skewed right (long tail of high values — revenue, session duration); Skewed left; Bimodal (two distinct populations); Power law (few very large, many small — user activity); Uniform (often synthetic or random).

## Example

Use this consistent output structure:

```
## Data Profile: [table_name]

### Overview
- Rows: 2,340,891
- Columns: 23 (8 dimensions, 6 metrics, 4 dates, 5 IDs)
- Date range: 2021-03-15 to 2024-01-22

### Column Details
[summary table grouped by column type]

### Data Quality Issues
[flagged issues with severity]

### Recommended Explorations
[numbered list of suggested follow-up analyses]
```

When documenting a dataset for team reuse, add a schema doc: table description, grain, primary key, row count (with date), update frequency, owner — then list key columns in a `Column | Type | Description | Example Values | Notes` table, and record join relationships and known gotchas.

```markdown
## Table: [schema.table_name]

**Description**: [What this table represents]
**Grain**: [One row per...]
**Primary Key**: [column(s)]
**Row Count**: [approximate, with date]
**Update Frequency**: [real-time / hourly / daily / weekly]
**Owner**: [team or person responsible]

### Key Columns
| Column | Type | Description | Example Values | Notes |
|--------|------|-------------|----------------|-------|
| user_id | STRING | Unique user identifier | "usr_abc123" | FK to users.id |
| event_type | STRING | Type of event | "click", "view", "purchase" | 15 distinct values |
| revenue | DECIMAL | Transaction revenue in USD | 29.99, 149.00 | Null for non-purchase events |
| created_at | TIMESTAMP | When the event occurred | 2024-01-15 14:23:01 | Partitioned on this column |
```

## Notes

- **Very large tables (100M+ rows) are profiled by sampling by default** — say so explicitly if you need exact counts.
- **Quality flags are heuristic** — not every flag is a real problem, but each is worth a quick look.
- Consistency checks: same concept represented differently (`USA` / `US` / `United States` / `us`); numbers stored as strings; cross-column contradictions (`status = "completed"` but `completed_at` is null); foreign keys that don't match any parent record; business-rule violations (negative quantities, end dates before start dates, percentages > 100).
- Accuracy red flags: placeholder values (`0`, `-1`, `999999`, `N/A`, `TBD`, `test`, `xxx`); a single value with suspiciously high frequency (default); impossible values (ages > 150, far-future dates, negative durations); round-number bias (all values ending in 0/5 suggests estimation, not measurement).
- Correlation does not imply causation — when reporting strong correlations (|r| > 0.7), flag this explicitly.
- This skill only "looks," it does not "fix." When you find something that needs hands-on repair, hand it off to `dataset-quality-auditor` — do not silently clean during exploration.

## See also

- related: `dataset-quality-auditor` — after profiling surfaces problems, hand off for a multi-dimensional audit + DQS scoring + remediation plan.
- related: `csv-data-cleaner` — clean and reshape once profiling exposes dirty data.
- related: `erd-schema-designer` — when the root cause lies in schema/relationship design.
- combines_with: `sql-query-builder` — turn profiling conclusions into concrete extraction queries.
- combines_with: `kpi-dashboard-design` — build a dashboard from the recommended dimensions/metrics.
- combines_with: `matplotlib-visualization` / `polars-dataframe` — plot distributions and run efficient per-column profiling.
