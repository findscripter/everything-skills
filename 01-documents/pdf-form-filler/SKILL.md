---
name: pdf-form-filler
title: PDF Form Filler
description: Programmatically read, fill, check, and export PDF form fields (AcroForm/XFA) and batch-fill a template from a data table; triggers: fill form, PDF form, form fields, AcroForm, batch mail-merge.
domain: 文书/office
triggers: [fill form, PDF form, form fields, AcroForm, XFA, batch mail-merge, flatten PDF, checkbox export value]
tags: [pdf, forms, documents]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [pdf-processing-toolkit, kyc-document-parser, markdown-to-docx]
combines_with: [pdf-processing-toolkit]
license: CC-BY-SA-4.0
source: 
source_license: 
---
Use this skill when you need to programmatically read, fill, check, or export PDF form fields, or batch-generate many filled PDFs from one template plus a data table (mail merge).

## When to use

- Read the existing form fields in a PDF (field name, type, current value, available options).
- Write into text boxes, checkboxes, radio groups, and dropdown/list fields via a `field name -> value` mapping.
- Batch-generate many filled PDFs from one template + a data file (CSV/JSON).
- Lock fields after filling (flatten) to prevent further edits, or keep the form editable.

When NOT to use (boundaries):

- The PDF has no real form fields (it is a scanned image or plain-text layout). Stamping text/images at fixed coordinates is content drawing, not form filling — confirm AcroForm/XFA fields exist first.
- Pure XFA forms (dynamic XFA with no AcroForm fallback): pypdf / pdf-lib usually cannot write these reliably. Probe first; if you hit pure XFA, report it and switch to a dedicated tool (Adobe / iText) instead of forcing the fill.
- Authoring a brand-new document layout (not filling a form) → use a typesetting skill such as `markdown-to-docx`.
- Extracting body text from a PDF for Q&A/summarization with no field writing — out of scope.

## Steps

1. Probe fields: list all fields first, confirm AcroForm vs. XFA. Pure XFA goes straight to boundary handling.
2. Build the mapping: construct `{field name: value}`. For checkboxes use the field's export value (the "on" state name), not the literal `"true"`. Read the export value from the probe result.
3. Validate the data: check that required fields are present, radio/dropdown values are within the allowed options, and field names exist (spelling and case sensitive).
4. Write: update field values per the mapping; set `NeedAppearances` so viewers render text-box appearances.
5. Handle appearances and locking: flatten when you need to lock (merge fields into static content); otherwise keep the form editable.
6. Save to a new file (never overwrite the template), then re-read to verify the key fields took effect.
7. Batch case: repeat steps 2–6 for each row of the data table; include a per-row unique key in each output filename.

Pseudocode (pypdf):

```python
reader = PdfReader("template.pdf")
fields = reader.get_fields()            # 1. probe: name / type / options / export value
assert fields, "no AcroForm fields"     # continue if present, else handle as boundary

data = {"name": "Jane Doe", "agree": "/Yes"}  # 2. mapping; checkbox uses export value
# 3. validate
for k in data:
    assert k in fields, f"field not found: {k}"

writer = PdfWriter(clone_from=reader)
for page in writer.pages:
    writer.update_page_form_field_values(
        page, data, auto_regenerate=False)
# 4. appearances
writer.set_need_appearances_writer(True)
with open("out.pdf", "wb") as f:
    writer.write(f)
```

## Example

Minimal — probe fields (command line):

```bash
python -c "from pypdf import PdfReader; import json; print(json.dumps({k:{'type':v.get('/FT'),'states':v.get('/_States_')} for k,v in (PdfReader('template.pdf').get_fields() or {}).items()}, ensure_ascii=False, indent=2))"
```

Batch mail merge (template + CSV → many PDFs):

```python
import csv
from pypdf import PdfReader, PdfWriter

rows = list(csv.DictReader(open("data.csv", encoding="utf-8")))
tmpl = PdfReader("template.pdf")
for row in rows:
    w = PdfWriter(clone_from=tmpl)
    for p in w.pages:
        w.update_page_form_field_values(p, row, auto_regenerate=False)
    w.set_need_appearances_writer(True)
    with open(f"out_{row['id']}.pdf", "wb") as f:
        w.write(f)
```

Prompt template for an agent:

```
Read all form fields of template.pdf and list field name / type / checkbox export value;
then fill with the mapping below and save as out.pdf (do not overwrite the template),
and after finishing re-read to confirm `name` and `agree` were written:
{ name: "Jane Doe", agree: <checkbox export value> }
```

## Notes

- Checkboxes/radios must use the export value from the field definition (e.g. `/Yes`, `/On`, `/Off`, or a custom state name). Writing `"true"`/`"1"` will usually do nothing.
- If text shows blank in a viewer after writing, it is usually a missing appearance stream: set `NeedAppearances`, or flatten with a library that can generate appearances.
- Flatten is one-way — fields become non-editable afterward. Always save to a new file and keep the original template.
- Field names are case sensitive and may carry dotted hierarchy (e.g. `topmostSubform[0].Page1[0].name[0]`). Trust the probe result; do not invent names.
- Non-ASCII / CJK values need font support; some libraries drop such text after flatten. Test a sample before running a batch.
- Always write to a new file; in batch mode ensure unique filenames so outputs don't overwrite each other.
- Before processing PDFs from external sources, confirm there is no encryption/permission restriction; encrypted documents must be decrypted/authorized first.

## See also

- requires: none.
- related: `markdown-to-docx` (use it to author a brand-new document layout instead of filling fields).
- combines_with: `csv-data-cleaner` (before batch mail merge, use it to clean and normalize the source CSV, then feed it into this skill's field mapping).
