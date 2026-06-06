---
name: analysis-qa-validator
title: Analysis QA Validator (Pre-Delivery Review)
description: QA an analysis before sharing with stakeholders — review methodology, spot-check calculations, audit visualizations, and validate conclusions, then produce a confidence assessment (Ready to share / Share with caveats / Needs revision). Triggers: validate analysis, pre-delivery QA
domain: 数据/analysis
triggers: [validate analysis before sharing, pre-delivery QA, review analysis for exec presentation, are these conclusions supported by the data, does this SQL result look right, spot-check calculations, YoY/MoM comparison check, join explosion, survivorship bias, incomplete period comparison, average of averages, denominator shifting, confidence assessment, is this ready to share]
tags: [data, analysis, qa, validation, methodology-review, metric-definitions, visualization-review, stakeholder-reporting]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [data-quality-validator, dataset-quality-auditor, data-quality-frameworks, spreadsheet-formula-auditor]
combines_with: [dataset-profiler, html-dashboard-builder]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## When to use

Use this skill to run a pre-delivery QA pass on an analysis before sharing it with stakeholders, presenting to leadership, or making a decision based on it — checking methodology, accuracy, biases, and presentation, then producing a shareable confidence assessment. The thing being reviewed can be:

- A document or report in the conversation
- A file (markdown, notebook, spreadsheet)
- SQL queries and their results
- Charts and their underlying data
- A description of methodology and findings

Typical requests:

- "Review this quarterly revenue analysis before I send it to the exec team."
- "Check my churn analysis — I'm comparing Q4 churn rates to Q3 but Q4 has a shorter measurement window."
- "Here's a SQL query and its results for our conversion funnel. Does the logic look right?"

Negative boundaries (use a different skill instead):

- Profiling/auditing an **unfamiliar dataset from scratch** (missing values, outliers, data-quality score) → use `dataset-quality-auditor`.
- Building **automated quality validation for a pipeline/warehouse** (Great Expectations, dbt tests, data contracts) → use `data-quality-validator`.
- Just **writing or tuning a SQL query** itself, rather than reviewing a finished analysis → use `sql-query-builder`.

This skill is a human-review judgment framework for finished analyses; it does not produce schedulable validation code.

## Steps

Work through these seven steps in order, recording findings at each step, then roll them into a report.

1. **Review methodology and assumptions.** Is the analysis answering the right question (could it be interpreted differently)? Are the right tables/datasets and time range being used? Are metrics defined clearly and consistently with how stakeholders understand them? Is the comparison fair (time periods, cohort sizes, and contexts comparable)? Is the population correctly defined, with no unintended exclusions?
2. **Run the pre-delivery QA checklist.** Work through the four categories below — data quality, calculation, reasonableness, and presentation checks.
3. **Check for common analytical pitfalls.** Systematically review against the pitfall catalog below (join explosion, survivorship bias, incomplete period comparison, denominator shifting, average of averages, timezone mismatches, selection bias).
4. **Verify calculations and aggregations.** Recalculate a few key numbers independently; verify subtotals sum to totals; check that percentages sum to ~100% where expected; confirm YoY/MoM comparisons use the correct base periods; validate filters are applied consistently across all metrics.
5. **Assess visualizations** (if any charts). Do axes start at appropriate values (zero for bar charts)? Are scales consistent across comparison charts? Do titles accurately describe what's shown? Are there truncated axes, inconsistent intervals, or 3D effects that distort perception?
6. **Evaluate narrative and conclusions.** Are conclusions supported by the data shown? Are alternative explanations acknowledged? Is uncertainty communicated appropriately? Do recommendations follow logically from findings? Does the level of confidence match the strength of evidence?
7. **Suggest improvements and give a 3-level confidence assessment.** Make suggestions specific and actionable (additional analyses, caveats/limitations to note, better framings/visualizations, missing context). Rate on a 3-level scale and explain: **Ready to share** (methodologically sound, calculations verified, caveats noted; only minor non-blocking suggestions) / **Share with noted caveats** (largely correct but has specific limitations or assumptions that must be communicated; list the required caveats) / **Needs revision** (found specific errors, methodological issues, or missing analyses; list the required changes in priority order).

## Example

**Pre-Delivery QA Checklist** (run before sharing any analysis)

- **Data quality:** Source verification (right tables/sources?) | Freshness (note the "as of" date) | Completeness (no unexpected gaps in time series or missing segments) | Null handling (checked null rates in key columns; excluded/imputed/flagged) | Deduplication (no double-counting from bad joins or duplicate source records) | Filter verification (all WHERE clauses correct, no unintended exclusions).
- **Calculation:** Aggregation logic (GROUP BY includes all non-aggregated columns; level matches analysis grain) | Denominator correctness (right, non-zero denominator for rates) | Date alignment (same period length; partial periods excluded or noted) | Join correctness (INNER vs LEFT appropriate; many-to-many hasn't inflated counts) | Metric definitions (match stakeholder definitions; deviations noted) | Subtotals sum (parts add to the whole, or explain why not, e.g. overlap).
- **Reasonableness:** Magnitude (plausible range; revenue not negative; percentages 0–100%) | Trend continuity (no unexplained jumps/drops) | Cross-reference (matches dashboards, prior reports, finance) | Order of magnitude (totals/user counts in the right ballpark) | Edge cases (empty segments, zero-activity periods, new entities).
- **Presentation:** Chart accuracy (bar charts start at zero; axes labeled; scales consistent across panels) | Number formatting (precision, consistent currency/percentage, thousands separators) | Title clarity (state the insight, not just the metric; specify date ranges) | Caveat transparency (known limitations/assumptions stated explicitly) | Reproducibility (someone else could recreate the analysis from the docs).

**Common analytical pitfalls**

- **Join explosion** — a many-to-many join silently multiplies rows, inflating counts and sums. Detect:
  ```sql
  -- Check row count before and after join
  SELECT COUNT(*) FROM table_a;                                      -- 1,000
  SELECT COUNT(*) FROM table_a a JOIN table_b b ON a.id = b.a_id;    -- 3,500 (uh oh)
  ```
  Prevent: always check row counts after joins; investigate the relationship (really 1:1 or 1:many?); use `COUNT(DISTINCT a.id)` instead of `COUNT(*)` when counting entities through joins.
- **Survivorship bias** — analyzing only entities that exist today, ignoring deleted/churned/failed ones. Before drawing conclusions, ask "who is NOT in this dataset?"
- **Incomplete period comparison** — comparing a partial period to a full one ("January revenue is $500K vs. December's $800K" — but January isn't over). Prevent: filter to complete periods, or compare same-day-of-month / same-number-of-days.
- **Denominator shifting** — the definition of "eligible"/"active" changes between periods, making rates incomparable. Prevent: use consistent definitions across compared periods; note any definition changes.
- **Average of averages** — Group A: 100 users, avg $50; Group B: 10 users, avg $200. Wrong: (50+200)/2 = $125. Right: weighted (100×50 + 10×200)/110 = $63.64. Always aggregate from raw data; never average pre-aggregated averages.
- **Timezone mismatches** — UTC event timestamps vs. local-time user-facing dates, or daily rollups with different cutoff times. Prevent: standardize all timestamps to one timezone (UTC recommended) before analysis and document it.
- **Selection bias in segmentation** — segments defined by the outcome being measured create circular logic ("users who completed onboarding have higher retention" — they self-selected). Prevent: define segments on pre-treatment characteristics, not outcomes.
- **Other statistical traps** — Simpson's paradox; correlation presented as causation; small sample sizes; outliers distorting averages (consider medians); multiple testing / cherry-picking; look-ahead bias; cherry-picked time ranges that favor a narrative.

**Result sanity checking**

- **Magnitude smell test:** Do user counts match known MAU/DAU? Is revenue in the right order of magnitude vs. known ARR? Are conversion rates 0–100% and matching the dashboard? Is 50%+ MoM growth real or a data issue? Is the average reasonable given the distribution? Do segment percentages sum to ~100%?
- **Cross-validation techniques:** (1) Calculate the same metric two different ways and verify they match. (2) Spot-check individual records — trace a few specific entities manually. (3) Compare to known benchmarks (published dashboards, finance reports, prior analyses). (4) Reverse engineer — does per-user revenue × user count ≈ total? (5) Boundary checks — filter to a single day/user/category; are the micro-results sensible?
- **Red flags warranting investigation:** any metric that changed >50% period-over-period without an obvious cause; counts/sums that are exact round numbers (filter or default-value issue); rates exactly 0% or 100% (may indicate incomplete data); results that perfectly confirm the hypothesis (reality is usually messier); identical values across periods/segments (query is probably ignoring a dimension).

**Report output format**

```
## Validation Report

### Overall Assessment: [Ready to share | Share with caveats | Needs revision]

### Methodology Review
[Findings about approach, data selection, definitions]

### Issues Found
1. [Severity: High/Medium/Low] [Issue description and impact]

### Calculation Spot-Checks
- [Metric]: [Verified / Discrepancy found]

### Visualization Review
[Any issues with charts or visual presentation]

### Suggested Improvements
1. [Improvement and why it matters]

### Required Caveats for Stakeholders
- [Caveat that must be communicated]
```

## Notes

- Run this validation before any high-stakes presentation or decision; even quick analyses benefit from a sanity check — it takes a minute and can save your credibility.
- If the validation finds issues, fix them and re-validate; share the validation output alongside your analysis to build stakeholder confidence.
- Match confidence wording to the strength of evidence — don't phrase a "likely" as a "certainty."
- Reproducibility is the floor: note the data-snapshot date, keep queries/code in version control (git or a shared docs system), and when re-running with updated data, document what changed and why. Every non-trivial analysis should document: the question; data sources (with as-of dates); definitions; methodology steps; assumptions and limitations; key findings; SQL queries; and caveats. For reusable code, include a docstring stating author, date, data source, last-validated date, assumptions, and output description.

## See also

- related: `dataset-quality-auditor` — when you suspect the underlying data is dirty during review, switch to a full dataset profile and data-quality score.
- related: `data-quality-validator` — when the same issues recur, codify them as pipeline-level automated checks (Great Expectations / dbt tests / data contracts).
- related: `sql-query-builder` — when spot-checking or recomputing requires rewriting or tuning a query.
- combines_with: `financial-analysis-toolkit` — when the thing under review is financial/accounting figures, layer on financial-definition checks.
- combines_with: `kpi-dashboard-design`, `matplotlib-visualization`, `plotly-interactive-viz` — when visualization review finds misleading charts, rebuild them per the suggestions.

---
Adapted from anthropics/knowledge-work-plugins (Apache-2.0). Source: `data/skills/validate-data/SKILL.md`.
