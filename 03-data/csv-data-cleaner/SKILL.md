---
name: csv-data-cleaner
title: CSV Data Cleaner
description: Clean CSV/tabular data before analysis or loading — deduplication, missing-value handling, type coercion, outlier flagging, and column/value normalization with pandas. Triggers: data cleaning, deduplicate, missing values, dirty data, tidy/normalize columns, outliers.
domain: 数据/wrangling
triggers: [data cleaning, clean csv, deduplicate rows, missing values, dirty data, tidy data, normalize columns, type coercion, outlier detection, standardize values, pandas cleaning]
tags: [data, cleaning, csv, pandas]
level: beginner
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [dataset-quality-auditor, data-quality-validator, polars-dataframe, data-quality-frameworks]
combines_with: [polars-dataframe, dataset-quality-auditor, matplotlib-visualization]
license: CC-BY-SA-4.0
source: 
source_license: 
---
## When to use

- You received a CSV/TSV/Excel export and need to clean it before analysis or loading: deduplication, missing-value handling, type coercion, outlier detection, and column-name/value standardization.
- Triggers: data cleaning, deduplicate, missing values, dirty data, tidy/normalize, column standardization, outliers.
- One file, or a batch of structurally identical files, cleaned offline / in batch.

Do not use when:
- The data already lives in a database and you need to query/join/aggregate it -> use `sql-query-builder`.
- You need a streaming/real-time data pipeline or incremental ETL scheduling.
- The file is larger than memory (multiple GB+) and needs chunked/distributed processing — this skill gives a single-machine approach only; switch to chunked reads as needed.
- You need strong semantic validation (business rules, cross-table foreign-key consistency) — this skill only does structural and basic-quality cleaning.

## Steps

Run in order. Observe before you act at each step — never blindly overwrite:

1. Profile (read-only): inspect the first N rows + dtypes + shape + null rate; confirm the delimiter, encoding, and header position.
2. Standardize columns: trim whitespace, lower-case to `snake_case`, and disambiguate duplicate names.
3. Deduplicate: locate duplicates first (full-row, or on specified key columns), confirm, then drop; log the count removed.
4. Coerce types: explicitly convert numeric/date/boolean columns; flag values that fail to convert instead of silently dropping them.
5. Missing values: decide per column — drop rows, fill (mean/median/mode/constant/forward-back fill), or keep as an explicit null; unify the empty representation (`""`, `"NA"`, `"null"`, `"-"` -> NaN) first.
6. Normalize text: strip leading/trailing whitespace, unify case / full-width vs half-width, and merge synonymous values (e.g. `"M" / "1" -> male`).
7. Outliers: flag numeric outliers with IQR or z-score; by default only flag, never silently delete — leave the decision to a human.
8. Validate & output: re-check null rate / duplicate count / dtypes; write the cleaned file plus a change summary (rows affected per step).

Pseudocode:
```
df = read(path, encoding=detect, sep=detect)
report.before = profile(df)            # shape, null_rate, dtypes
df.columns = snake_case(strip(cols)); dedup_col_names()
df = df.drop_duplicates(subset=keys)   # keys default to all columns
for col in typed_cols: df[col] = safe_cast(col, target_type)  # fail -> NaN + flag
df = unify_missing_tokens(df)          # "","NA","null","-" -> NaN
df = fill_or_drop_missing(df, strategy_per_col)
df = strip_and_normalize_text(df)
outliers = flag_outliers(df, method="iqr")   # flag only
report.after = profile(df)
write(df, out_path); write(report, summary_path)
```

## Example

Minimal working pipeline (pandas):
```python
import pandas as pd, numpy as np, re

df = pd.read_csv("raw.csv", encoding="utf-8", na_values=["", "NA", "null", "-", "N/A"])

# Standardize column names
df.columns = [re.sub(r"\W+", "_", c.strip().lower()).strip("_") for c in df.columns]

# Deduplicate (full-row)
before = len(df); df = df.drop_duplicates(); print("dropped duplicates:", before - len(df))

# Coerce types: failures become NaN (never silently dropped)
df["amount"] = pd.to_numeric(df["amount"], errors="coerce")
df["created_at"] = pd.to_datetime(df["created_at"], errors="coerce")

# Normalize text + merge synonymous values
df["gender"] = (df["gender"].astype("string").str.strip().str.upper()
                .replace({"M": "male", "1": "male", "F": "female", "0": "female"}))

# Missing values: numeric -> median, categorical -> mode
df["amount"] = df["amount"].fillna(df["amount"].median())

# Outliers: IQR, flag only
q1, q3 = df["amount"].quantile([.25, .75]); iqr = q3 - q1
df["amount_outlier"] = ~df["amount"].between(q1 - 1.5*iqr, q3 + 1.5*iqr)

df.to_csv("clean.csv", index=False, encoding="utf-8-sig")
print(df.isna().mean().round(3))  # re-check null rate
```

Delegation prompt (when handing this to an agent):
> Clean `raw.csv`: first emit a profile report (shape / per-column null rate / dtypes), then process in the order column-standardization -> deduplication -> type-coercion -> missing-values -> text-normalization -> outlier-flagging. Only flag outliers, never delete them. Finally write `clean.csv` plus a summary of rows affected per step.

## Notes

- Never overwrite the source file in place; write to a new file so the original stays auditable.
- Before deleting/filling, print the number of rows that will be affected and confirm — destructive operations must be explainable.
- Coerce types with `errors="coerce"`; set failed conversions to explicit nulls and optionally flag them — never silently drop the whole row.
- Outliers are flagged, not deleted, by default — being an outlier does not mean being wrong.
- Encoding pitfalls (common with non-ASCII / Excel exports): if reading with `utf-8` fails, try `gbk` / `utf-8-sig`; write with `utf-8-sig` to avoid garbled text in Excel.
- Unify the empty-value tokens (`""`, `"NA"`, `"null"`, `"-"`, etc.) before computing missingness, otherwise the null rate is distorted.
- Mind float precision before deduping float columns; mind time zones and mixed formats in date columns.
- For large files, use `chunksize` to read in chunks, or sample first to validate the strategy, then run on the full dataset.

## See also

- requires: none.
- related: `dataset-quality-auditor`, `data-quality-validator`, `polars-dataframe`, `data-quality-frameworks`; `sql-query-builder` (switch to it once the data is loaded into a database and needs querying/joining/aggregation).
- combines_with: `polars-dataframe`, `dataset-quality-auditor`, `matplotlib-visualization`.
