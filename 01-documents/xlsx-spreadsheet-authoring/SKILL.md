---
name: xlsx-spreadsheet-authoring
title: XLSX Spreadsheet Authoring: Excel Creation, Formatting & Analysis
description: Use to create, edit, or analyze .xlsx workbooks (data, formulas, formatting, financial models): pandas to read/analyze, openpyxl to write formulas and styles, recalc.py to force recalculation and ship zero formula errors. Not for .docx/.pptx or plain-text answers. Triggers: build
domain: 文书/office
triggers: [create or generate an Excel/xlsx spreadsheet, write cell formulas or conditional formatting, build or update a financial model with zero formula errors, read and analyze Excel data with pandas, edit sheets and cells in an existing xlsx]
tags: [documents, xlsx, excel, openpyxl, pandas, financial-model, formula]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [spreadsheet-formula-auditor, python-pptx-deck-generator, pdf-form-filler, markdown-to-docx]
combines_with: [spreadsheet-formula-auditor, csv-data-cleaner, startup-financial-modeler]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## When to use

Use this skill when a user asks you to **create, edit, or analyze the contents of an `.xlsx` file** (data, formulas, formatting, or financial models). Pick the library by task:

- **Reading / analyzing data**: use **pandas** (`read_excel` preview, statistics, bulk export).
- **Writing formulas / formatting / financial models**: use **openpyxl** (cells, formula strings, fonts, fills, column widths, multiple sheets).
- **Whenever formulas are present**: openpyxl writes formula *strings* but does not compute values, so you MUST run `recalc.py` (LibreOffice) to recalculate and scan for errors.

Do NOT use this skill when:

- The target is Word (`.docx`) or PowerPoint (`.pptx`) → use the matching document skill instead.
- A plain-text, one-line answer is enough and no spreadsheet structure is needed → just reply.
- You only need to audit/troubleshoot formula errors in an existing sheet rather than produce a new one → use `spreadsheet-formula-auditor`.
- You are updating a specific structure in an existing financial model → prefer `financial-model-updater`.

## Steps

**Common workflow:**

1. **Choose tool**: pandas for data, openpyxl for formulas/formatting.
2. **Create/Load**: create a new `Workbook()` or `load_workbook(path)`.
3. **Modify**: add/edit data, formulas, and formatting.
4. **Save**: `wb.save(path)`.
5. **Recalculate formulas (MANDATORY IF USING FORMULAS)**: `python recalc.py output.xlsx [timeout_seconds]`.
6. **Verify and fix errors**: the script returns JSON; if `status` is `errors_found`, read `error_summary` to locate and fix, then recalculate again until zero errors. Common errors: `#REF!` (invalid references), `#DIV/0!` (division by zero), `#VALUE!` (wrong data type), `#NAME?` (unrecognized formula name).

**CRITICAL — use formulas, not hardcoded values.** Always use Excel formulas instead of calculating values in Python and hardcoding them, so the spreadsheet stays dynamic and recalculates when source data changes:

- WRONG: `sheet['B10'] = df['Sales'].sum()` (hardcodes 5000)
- RIGHT: `sheet['B10'] = '=SUM(B2:B9)'`
- RIGHT: `sheet['C5'] = '=(C4-C2)/C2'`, `sheet['D20'] = '=AVERAGE(D2:D19)'`

This applies to ALL calculations — totals, percentages, ratios, differences, etc.

**Delivery requirements:**

- **Zero formula errors**: every workbook MUST ship with NO `#REF! / #DIV/0! / #VALUE! / #N/A / #NAME?`.
- **Preserve existing templates**: when modifying someone else's file, study and EXACTLY match its existing format, style, and conventions. Never impose standardized formatting on files with established patterns — existing template conventions ALWAYS override the defaults below.

**Financial model defaults** (unless otherwise stated by the user or existing template):

- **Color coding** — Blue text `(0,0,255)`: hardcoded inputs / numbers users change for scenarios. Black text `(0,0,0)`: ALL formulas and calculations. Green text `(0,128,0)`: links pulling from other worksheets within the same workbook. Red text `(255,0,0)`: external links to other files. Yellow background `(255,255,0)`: key assumptions needing attention or cells to be updated.
- **Number formatting** — Years as text strings ("2024" not "2,024"); Currency `$#,##0` and ALWAYS specify units in headers ("Revenue ($mm)"); make zeros show as `-` (e.g. `$#,##0;($#,##0);-`); Percentages default to `0.0%`; valuation Multiples as `0.0x` (EV/EBITDA, P/E); negative numbers in parentheses `(123)` not `-123`.
- **Formula construction** — Place ALL assumptions (growth rates, margins, multiples) in separate assumption cells and reference them: use `=B5*(1+$B$6)` instead of `=B5*1.05`.
- **Documentation for hardcodes** — comment or note beside the cell. Format: `Source: [System/Document], [Date], [Specific Reference], [URL if applicable]`. Examples: "Source: Company 10-K, FY2024, Page 45, Revenue Note, [SEC EDGAR URL]"; "Source: Bloomberg Terminal, 8/15/2025, AAPL US Equity".

**Formula verification checklist** — Verify 2–3 sample references pull correct values before building the full model. Confirm column mapping (column 64 = BL, not BK) and row offset (DataFrame row 5 = Excel row 6, since Excel is 1-indexed). Handle nulls with `pd.notna()`. Check denominators before using `/` to avoid `#DIV/0!`. Verify all references point to intended cells. Use correct cross-sheet format `Sheet1!A1`. Start small (test 2–3 cells before applying broadly), test edge cases (zero, negative, very large values), and watch for unintended circular references.

## Example

Read and analyze (pandas):

```python
import pandas as pd
df = pd.read_excel('file.xlsx')                           # Default: first sheet
all_sheets = pd.read_excel('file.xlsx', sheet_name=None)  # All sheets as dict
df.head(); df.info(); df.describe()
df.to_excel('output.xlsx', index=False)
```

Create a new file with formulas and formatting (openpyxl):

```python
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

wb = Workbook(); sheet = wb.active
sheet['A1'] = 'Hello'; sheet.append(['Row', 'of', 'data'])
sheet['B2'] = '=SUM(A1:A10)'
sheet['A1'].font = Font(bold=True, color='FF0000')
sheet['A1'].fill = PatternFill('solid', start_color='FFFF00')
sheet['A1'].alignment = Alignment(horizontal='center')
sheet.column_dimensions['A'].width = 20
wb.save('output.xlsx')
```

Edit an existing file (preserving formulas and formatting):

```python
from openpyxl import load_workbook
wb = load_workbook('existing.xlsx'); sheet = wb.active   # or wb['SheetName']
sheet['A1'] = 'New Value'
sheet.insert_rows(2); sheet.delete_cols(3)
new_sheet = wb.create_sheet('NewSheet'); new_sheet['A1'] = 'Data'
wb.save('modified.xlsx')
```

Recalculate and verify (MANDATORY when formulas are present):

```bash
python recalc.py output.xlsx 30
```

The script auto-configures a LibreOffice macro on first run, recalculates all formulas in all sheets, scans ALL cells for Excel errors, and returns JSON like:

```json
{ "status": "success", "total_errors": 0, "total_formulas": 42,
  "error_summary": { "#REF!": { "count": 2, "locations": ["Sheet1!B5", "Sheet1!C10"] } } }
```

## Notes

- **Run recalc.py whenever formulas are present**: openpyxl writes formula strings with empty values, so shipping without recalculation leaves cells blank or stale. The script requires LibreOffice (auto-configured on first run); works on Linux and macOS.
- Always use **absolute paths**; the working directory may be reset between calls.
- openpyxl cell indices are **1-based** (row=1, column=1 = A1).
- Read computed values with `load_workbook(path, data_only=True)` — but if you open with `data_only=True` and save, formulas are permanently replaced with values. Do not save by accident.
- Large files: use `read_only=True` for reading and `write_only=True` for writing.
- pandas type-inference pitfalls: pin types with `dtype={'id': str}`; read specific columns with `usecols=[...]`; parse dates with `parse_dates=[...]`.
- Code style: keep generated Python minimal — few comments, no unnecessary print statements. Inside the Excel file, do add cell comments for complex formulas / key assumptions and document data sources for hardcodes.
- Confirm source files are free of encryption/permission limits before processing. Output is not a substitute for environment-specific validation or expert review; stop and ask if required inputs, permissions, safety boundaries, or success criteria are missing.

## See also

- requires: none.
- related: `spreadsheet-formula-auditor` (dedicated formula-error auditing and troubleshooting), `csv-data-cleaner` (clean CSV data before export/import).
- combines_with: `financial-model-updater` (update structure in an existing financial model), `financial-statements-generator` (generate the three statements, then land and format them with this skill).
