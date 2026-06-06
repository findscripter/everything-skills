---
name: data-question-analyzer
title: Data Question Analyzer (Quick Lookup to Formal Report)
description: Answer any data question end to end -- from a quick metric lookup, to trend/drop attribution and cross-segment comparison, to a formal stakeholder report -- by scaling depth to complexity (quick answer / full analysis / formal report): gather data, analyze, validate before presen
domain: 数据/analysis
triggers: [analyze the data, data question, what's driving, why did it drop, why is it growing, look up a metric, compare segments, trend analysis, quarterly business review, data report, root cause analysis, break it down]
tags: [data, analysis, data-analysis, attribution, trend-analysis, data-report, stakeholder-reporting, querying]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [analysis-qa-validator, data-quality-validator, kpi-dashboard-design, sql-query-builder]
combines_with: [html-dashboard-builder, matplotlib-visualization]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## When to use

The single entry point for answering any **data question**. Judge the complexity first, then scale your depth:

- **Quick answer**: Single metric, simple filter, factual lookup. E.g. "How many users signed up last week?"
- **Full analysis**: Multi-dimensional exploration, trend attribution, cross-segment comparison. E.g. "What's driving the drop in conversion rate? Break it down by channel and device."
- **Formal report**: Comprehensive investigation with methodology, caveats, and recommendations. E.g. "Prepare a quarterly business review of our subscription metrics."

When **not** to use:

- You only need natural language turned into SQL, or to debug a slow query -> use `sql-query-builder`.
- You have an unfamiliar table and need to understand its shape and quality before analyzing -> use `dataset-profiler`.
- You only need to turn existing results into a chart or dashboard -> use `matplotlib-visualization` or `html-dashboard-builder`.
- You already have a finished analysis and only want a pre-delivery QA pass -> use `analysis-qa-validator`.
- The task is primarily model training, statistical modeling, or significance testing -> use `statsmodels-statistical-modeling` or `scikit-learn-ml`.

## Steps

### 1. Understand the question

Parse the user's question and determine:

- **Complexity level**: Quick answer | Full analysis | Formal report (this decides effort and output shape).
- **Data requirements**: Which tables, metrics, dimensions, and time ranges are needed.
- **Output format**: Number, table, chart, narrative, or combination.

### 2. Gather data

**If a data warehouse MCP server is connected:**

1. Explore the schema to find relevant tables and columns.
2. Write SQL query(ies) to extract the needed data.
3. Execute the query and retrieve results.
4. If the query fails, debug and retry (check column names, table references, syntax for the specific dialect).
5. If results look unexpected, run sanity checks before proceeding.

**If no data warehouse is connected:**

1. Ask the user to provide data in one of these ways:
   - Paste query results directly.
   - Upload a CSV or Excel file.
   - Describe the schema so you can write queries for them to run.
2. If writing queries for manual execution, use the `sql-query-builder` skill for dialect-specific best practices.
3. Once data is provided, proceed with analysis.

### 3. Analyze

- Calculate relevant metrics, aggregations, and comparisons.
- Identify patterns, trends, outliers, and anomalies.
- Compare across dimensions (time periods, segments, categories).
- For complex analyses, break the problem into sub-questions and address each.

### 4. Validate before presenting

Run through every check; if any raises concerns, investigate and note caveats:

- **Row count sanity**: Does the number of records make sense?
- **Null check**: Are there unexpected nulls that could skew results?
- **Magnitude check**: Are the numbers in a reasonable range?
- **Trend continuity**: Do time series have unexpected gaps?
- **Aggregation logic**: Do subtotals sum to totals correctly?

### 5. Present findings (pick the template by complexity)

```
Quick answer  -> State the answer directly with relevant context;
                 include the query used (code block / collapsed) for reproducibility.
Full analysis -> Lead with the key finding/insight -> support with data tables and/or
                 visualizations -> note methodology and caveats -> suggest follow-ups.
Formal report -> Executive summary (key takeaways) / Methodology (approach + data sources) /
                 Detailed findings (evidence) / Caveats, limitations & data quality /
                 Recommendations & next steps.
```

### 6. Visualize where helpful

When a chart communicates results more effectively than a table:

- Use the `data-visualization` skill to select the right chart type.
- Generate a Python visualization or build it into an HTML dashboard.
- Follow visualization best practices for clarity and accuracy.

## Example

**Quick answer:**
```
/analyze How many new users signed up in December? Give the number and include the SQL used.
```

**Full analysis:**
```
/analyze What's causing the increase in support ticket volume over the past 3 months?
Break down by category and priority. Lead with the key finding, support with tables/charts,
then list 2-3 follow-up directions worth investigating.
```

**Formal report:**
```
/analyze Prepare a data quality assessment of our customer table -- completeness,
consistency, and any issues we should address. Output as Executive summary / Methodology /
Detailed findings / Caveats / Recommendations.
```

**Asking the user for data (no warehouse connected):**
```
I'm not connected to a data warehouse. Please provide data one of these ways:
(1) paste query results, (2) upload a CSV/Excel, or
(3) describe the schema (column names + types) and I'll write the SQL for you to run.
```

## Notes

- Be specific about time ranges, segments, or metrics when possible. If you know the table names, mention them to speed up the process.
- Validate before you present: any check that raises concern must be chased down, and you must spell out definitions and caveats in the deliverable -- never bring an unverified conclusion to a meeting.
- Common definition traps: misaligned YoY/MoM baselines, comparing incomplete periods, JOIN fan-out doubling counts, "average of averages", survivorship bias, and `NOT IN` returning empty when the set contains NULL.
- Break complex questions into multiple queries / sub-questions and solve them one at a time -- don't try to cover everything with one giant SQL statement.
- Write operations (INSERT/UPDATE/DELETE/DDL) only after the user explicitly confirms and you've given an estimate of affected rows; by default this skill produces only SELECT queries and analytical conclusions.

## See also

- requires: none.
- related: `sql-query-builder` -- SQL authoring and debugging for the data-gathering step; `dataset-profiler` -- profile an unfamiliar table before you start analyzing.
- combines_with: `analysis-qa-validator` -- QA and grade methodology/calculations/conclusions before delivery; `html-dashboard-builder`, `matplotlib-visualization` -- turn conclusions into dashboards or publication-grade charts.

Adapted from anthropics/knowledge-work-plugins (Apache-2.0).
