---
name: pdf-processing-toolkit
title: PDF Processing Toolkit
description: Use to merge/split/rotate PDFs, extract text and tables, generate new PDFs, watermark/encrypt, and OCR scanned documents with pypdf/pdfplumber/reportlab plus qpdf/pdftotext; not for filling AcroForm/XFA form fields (use pdf-form-filler). Triggers: PDF, merge PDF, extract tables, 
domain: 文书/office
triggers: [merge PDF, split PDF, extract text from PDF, extract tables from PDF, create PDF, watermark PDF, encrypt PDF, OCR scanned PDF, rotate PDF pages, pdfplumber, qpdf, reportlab]
tags: [pdf, documents, pypdf, pdfplumber, reportlab, qpdf, ocr]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [pdf-form-filler, markdown-to-docx, pptx-document-processing, professional-proofreader]
combines_with: [pdf-form-filler, citation-management]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## When to use

Use this skill for essential PDF processing with Python libraries and command-line tools:

- Merge several PDFs, split into single pages, rotate pages, reorder pages.
- Extract body text (optionally preserving layout) and extract tables into a DataFrame/Excel.
- Create PDFs from scratch (text, tables, multi-page reports).
- Add watermarks, password-protect (encrypt), remove passwords (decrypt), extract embedded images.
- OCR scanned / image-only PDFs into searchable text.

Out of scope:

- Filling existing AcroForm/XFA form fields (checkboxes, text fields, dropdowns) -> use `pdf-form-filler`. This skill does not write form-field values.
- Pixel-perfect, design-heavy layout generation (magazines/brochures) -> reportlab suits structured documents; use a dedicated DTP tool for heavy design work.
- Turning plain text/Markdown into Word/PPT -> use formatting skills such as `markdown-to-docx`.

## Steps

1. Classify the input: is it a selectable-text PDF or a scan? Run `pdftotext input.pdf -`; if almost no text comes back, treat it as a scan and go to the OCR flow.
2. Pick the tool: split/merge/rotate/encrypt -> `pypdf` or CLI `qpdf`; extract text/tables -> `pdfplumber`; generate -> `reportlab`; OCR -> `pdf2image` + `pytesseract`. For simple batch jobs prefer the CLI (faster, no script needed).
3. Run the operation (see Example). Always write to a new file; never overwrite the source PDF.
4. Validate: re-read page count / key text after processing; after table extraction check row/column alignment and headers.
5. Before encrypting/decrypting, confirm you are authorized to process the document.

## Example

Quick start (pypdf):

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("document.pdf")
print(f"Pages: {len(reader.pages)}")

text = ""
for page in reader.pages:
    text += page.extract_text()
```

Merge / split (pypdf):

```python
from pypdf import PdfReader, PdfWriter

# Merge
writer = PdfWriter()
for f in ["doc1.pdf", "doc2.pdf", "doc3.pdf"]:
    for page in PdfReader(f).pages:
        writer.add_page(page)
with open("merged.pdf", "wb") as out:
    writer.write(out)

# Split into one file per page
reader = PdfReader("input.pdf")
for i, page in enumerate(reader.pages):
    w = PdfWriter(); w.add_page(page)
    with open(f"page_{i+1}.pdf", "wb") as out:
        w.write(out)
```

Rotate / encrypt / metadata (pypdf):

```python
page = reader.pages[0]; page.rotate(90)   # 90 degrees clockwise
writer.encrypt("userpassword", "ownerpassword")  # password-protect

meta = reader.metadata
print(meta.title, meta.author, meta.subject, meta.creator)
```

Extract tables -> Excel (pdfplumber):

```python
import pdfplumber, pandas as pd
dfs = []
with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        for t in page.extract_tables():
            if t:  # skip empty tables
                dfs.append(pd.DataFrame(t[1:], columns=t[0]))
if dfs:
    pd.concat(dfs, ignore_index=True).to_excel("extracted_tables.xlsx", index=False)
```

Extract text (pdfplumber: `page.extract_text()`; CLI: `pdftotext -layout input.pdf out.txt`).

Command-line batch (qpdf / poppler):

```bash
qpdf --empty --pages file1.pdf file2.pdf -- merged.pdf   # merge
qpdf input.pdf --pages . 1-5 -- pages1-5.pdf             # select pages
qpdf input.pdf output.pdf --rotate=+90:1                 # rotate page 1
qpdf --password=PW --decrypt encrypted.pdf decrypted.pdf # remove password
pdftotext -layout input.pdf output.txt                   # text with layout
pdfimages -j input.pdf output_prefix                     # extract images as jpg
```

Create a multi-page PDF (reportlab, Platypus):

```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet

styles = getSampleStyleSheet()
doc = SimpleDocTemplate("report.pdf", pagesize=letter)
doc.build([
    Paragraph("Report Title", styles['Title']),
    Spacer(1, 12),
    Paragraph("This is the body of the report. " * 20, styles['Normal']),
    PageBreak(),
    Paragraph("Page 2", styles['Heading1']),
    Paragraph("Content for page 2", styles['Normal']),
])
```

OCR scanned PDFs (`pip install pytesseract pdf2image`; needs system tesseract):

```python
import pytesseract
from pdf2image import convert_from_path

text = "".join(
    pytesseract.image_to_string(img)
    for img in convert_from_path("scanned.pdf")
)
```

Add a watermark (pypdf: `page.merge_page(watermark_page)` for each page):

```python
from pypdf import PdfReader, PdfWriter

watermark = PdfReader("watermark.pdf").pages[0]
reader = PdfReader("document.pdf")
writer = PdfWriter()
for page in reader.pages:
    page.merge_page(watermark)
    writer.add_page(page)
with open("watermarked.pdf", "wb") as out:
    writer.write(out)
```

## Quick reference

| Task | Best tool | Key call |
|------|-----------|----------|
| Merge | pypdf / qpdf | `writer.add_page` / `qpdf --empty --pages` |
| Split | pypdf | one file per page |
| Extract text | pdfplumber | `page.extract_text()` |
| Extract tables | pdfplumber | `page.extract_tables()` |
| Create | reportlab | Canvas / Platypus |
| OCR scanned PDF | pytesseract | `convert_from_path` to images first |
| Fill PDF forms | pdf-form-filler | see that skill |

## Notes

- Always save to a new file; in batch jobs add a unique key to filenames to avoid overwriting.
- Non-Latin text: reportlab needs a registered font (e.g. CJK), and OCR needs the matching language pack passed via `lang=` (e.g. `lang="chi_sim+eng"`), otherwise you get garbled or dropped characters.
- pdfplumber table extraction works well on ruled, regular tables; borderless tables and merged cells misalign easily, so verify rows/columns by hand.
- Calling `extract_text()` on a scan correctly returns empty; you must run OCR.
- Encryption/decryption touches copyright and authorization; confirm you have the right to process external documents before doing so.
- CLI tools are not built in: qpdf/pdftotext/pdfimages come from the poppler-utils and qpdf packages; pytesseract depends on system tesseract. Confirm they are installed before use.

## See also

- requires: none.
- related: `pdf-form-filler`, `markdown-to-docx`, `pptx-document-processing`, `professional-proofreader`.
- combines_with: `pdf-form-filler` (switch to it when you need to fill PDF form fields; this skill handles merge/split/extract/generate); `citation-management` (feed extracted bibliographic data into reference workflows).
