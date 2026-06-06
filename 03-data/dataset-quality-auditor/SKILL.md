---
name: dataset-quality-auditor
title: Dataset Quality Auditor
description: Audit a dataset's health before modeling, dashboards, or decisions: profile completeness/consistency/validity/uniqueness/timeliness, classify missingness (MCAR/MAR/MNAR), detect outliers, and produce a 0-100 Data Quality Score with an impact-ranked remediation plan. Triggers: dat
domain: 数据/wrangling
triggers: [data quality, data audit, dataset quality, missing value analysis, outlier detection, outliers, data profiling, data quality score DQS, is this data ready for modeling, clean this dataset, MCAR MAR MNAR, duplicate keys primary key uniqueness, distribution drift, data monitoring thresholds]
tags: [data, wrangling, data-quality, data-audit, missing-values, outliers, profiling, data-governance]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [data-quality-validator, data-quality-frameworks, csv-data-cleaner, spreadsheet-formula-auditor]
combines_with: [csv-data-cleaner, scikit-learn-ml, polars-dataframe]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## When to use

You are an expert data quality engineer. The goal is to systematically assess dataset health, surface hidden issues that corrupt downstream analysis without ever raising an error, and prescribe prioritized fixes. Move fast, think in impact, and never let "good enough" data quietly poison a model or dashboard. Typical requests:

- "Profile/audit this dataset" -> full DQS report with per-column breakdown and top issues ranked by impact.
- "What's wrong with column X?" -> targeted column audit: nulls, outliers, type issues, value-domain violations.
- "Is this data ready for modeling?" -> model-readiness checklist with pass/fail per ML requirement.
- "Help me clean this data" -> prioritized remediation plan with a specific transform per issue.
- "Set up monitoring" -> threshold config + alerting checklist for critical columns.
- "Compare this to last month" -> distribution comparison report with drift flags.

When NOT to use (negative boundary):
- You need to design or optimize the database **schema / normalization** -> use a database-design skill.
- You need to build the **ETL pipeline itself** -> use an engineering skill.
- The dataset is a **financial model output** that needs model-logic validation -> use a financial-analysis skill.

## Steps

Pick one entry point by scenario.

**Mode 1 — Full Audit (new dataset)**
1. **Profile** — run `data_profiler.py` for shape, dtypes, completeness, distributions, and DQS.
2. **Missing values** — run `missing_value_analyzer.py` to classify missingness as MCAR / MAR / MNAR.
3. **Outliers** — run `outlier_detector.py` to flag anomalies via IQR / Z-score / modified Z-score.
4. **Cross-column checks** — inspect referential integrity, duplicate rows, and logical constraints (e.g. `start <= end`).
5. **Score & report** — assign the Data Quality Score and produce the remediation plan, issues ranked by severity x breadth.

**Mode 2 — Targeted Scan (specific column/metric/pipeline stage suspected)**
1. Ask the three questions: *What broke, when did it start, what changed upstream?*
2. Run the relevant script against the suspect columns only.
3. Compare distributions against a known-good baseline if one exists.
4. Trace to root cause (source system / ETL transform / ingestion lag).

**Mode 3 — Ongoing Monitoring Setup (live pipeline)**
1. Identify the 5-8 critical columns driving key metrics.
2. Define thresholds: acceptable null %, outlier rate, value domain.
3. Generate a monitoring checklist and alerting logic with `data_profiler.py --monitor`.
4. Schedule checks at ingestion cadence.

### Tools / commands

Scripts read CSV by default; pass `--format json` everywhere for downstream consumption.

```bash
# Profile: shape / dtypes / null % / cardinality / distributions + DQS
python3 scripts/data_profiler.py --file data.csv
python3 scripts/data_profiler.py --file data.csv --columns col1,col2,col3
python3 scripts/data_profiler.py --file data.csv --format json
python3 scripts/data_profiler.py --file data.csv --monitor   # generate monitoring thresholds

# Missing values: volume / patterns / mechanism (MCAR/MAR/MNAR) + per-column imputation advice
python3 scripts/missing_value_analyzer.py --file data.csv
python3 scripts/missing_value_analyzer.py --file data.csv --threshold 0.05
python3 scripts/missing_value_analyzer.py --file data.csv --format json

# Outliers: multi-method + business-impact context
python3 scripts/outlier_detector.py --file data.csv
python3 scripts/outlier_detector.py --file data.csv --method iqr
python3 scripts/outlier_detector.py --file data.csv --method zscore --threshold 2.5
python3 scripts/outlier_detector.py --file data.csv --format json
```

**Data Quality Score (DQS, 0-100, five weighted dimensions — report it at the top of every audit)**

| Dimension | Weight | What It Measures |
|---|---|---|
| Completeness | 30% | Null / missing rate across critical columns |
| Consistency | 25% | Type conformance, format uniformity, no mixed types |
| Validity | 20% | Values within expected domain (ranges, categories, regexes) |
| Uniqueness | 15% | Duplicate rows, duplicate keys, redundant columns |
| Timeliness | 10% | Freshness of timestamps, lag from source system |

Scoring thresholds: 🟢 85-100 production-ready; 🟡 65-84 usable with documented caveats (exploratory analysis only); 🔴 0-64 remediation required before use.

**Outlier formulas (choose by distribution)**
- IQR (default, non-parametric, robust): outlier if `x < Q1 − 1.5×IQR` or `x > Q3 + 1.5×IQR`.
- Z-score: `|x − μ| / σ > threshold` (commonly 3.0). Use only when approximately normal and contamination < 5% — mean/std are themselves dragged by outliers.
- Modified Z-score (Iglewicz-Hoaglin, preferred for skew): `M = 0.6745 × |x − median| / MAD`; outlier if `M > 3.5`. Note MAD = 0 for discrete columns with one dominant value.

## Example

Structure every audit report as four sections:

> **Bottom Line** — DQS: 61/100 — remediation required before production use.
> **What** — the specific issues found, ranked by severity x breadth.
> **Why It Matters** — business / analytical impact of each issue.
> **How to Act** — specific, ordered remediation steps.

Missing-value remediation cheat sheet (always add a `col_was_null` indicator when null % > 1% — "was null" may itself be predictive):

| Null % | Recommended Action |
|---|---|
| < 1% | Drop rows (if dataset is large) or impute with median/mode |
| 1–10% | Impute; add a binary indicator column `col_was_null` |
| 10–30% | Impute cautiously; investigate root cause; document the assumption |
| > 30% | Flag for domain review; do not impute blindly; consider dropping the column |

Outlier triage: **likely data error** (physically impossible) -> cap, correct, or drop; **legitimate extreme** (valid but rare) -> keep, document, consider log transform for modeling; **unknown** -> flag, do not silently remove.

Deduplication: confirm the uniqueness key with the data owner first; use `keep='last'` for event data (most recent state wins) and `keep='first'` for slowly-changing-dimension tables.

## Notes

Proactive risk triggers — surface these unprompted the moment you spot the signal:
- **Silent nulls** — nulls encoded as `0`, `""`, `"N/A"`, or `"null"` strings; until caught, completeness metrics lie.
- **Leaky timestamps** — future dates, dates before system launch, timezone mismatches that corrupt time-series joins.
- **Cardinality explosions** — free-text fields with thousands of unique values masquerading as categorical; will blow up one-hot encoding silently.
- **Duplicate keys** — non-unique PKs invalidate every downstream join and aggregation.
- **Distribution shift** — current distribution diverges from baseline (>2σ on mean/std); signals an upstream pipeline change.
- **Correlated missingness** — nulls concentrated in a time range / user segment / region is evidence of MNAR, not random dropout.

Imputation safety red line (decided by mechanism): MCAR is safe to impute (mean/median); MAR requires model-based conditional imputation that accounts for the related observed variables; **MNAR must not be imputed** — it introduces systematic bias and must be escalated to the domain owner.

Evidence grading + human review: tag every finding 🟢 Verified / 🟡 Likely / 🔴 Assumed (needs domain validation). **Never auto-remediate a 🔴 finding without human confirmation.**

Other silent killers: trailing whitespace (`"active "` ≠ `"active"`), timezone-naive timestamps, UTF-8/Latin-1 encoding garble, numbers stored as scientific-notation strings, and upstream lookup fields silently gaining a new category that makes old code drop rows.

## See also

- Root cause in **schema design / normalization** -> database-design skill.
- Data is **subscription / event data feeding SaaS KPIs** -> SaaS-metrics skill.
- Data involves **financial statements / accounting figures** -> financial-analysis skill.
- Auditing **product event data** (funnels, sessions, retention) -> product-analytics skill.
- Quality issues are **systemic and need tracking as tech debt** -> tech-debt-tracker skill.

---
Adapted from alirezarezvani/claude-skills (MIT). Theory: Rubin (1976) missingness mechanisms, Iglewicz-Hoaglin (1993) outlier detection, DAMA-DMBOK and ISO 8000 data-quality dimensions.
