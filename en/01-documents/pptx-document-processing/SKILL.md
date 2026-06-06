---
name: pptx-document-processing
title: PPTX Document Processing
description: Create, edit, or analyze .pptx presentations (body text, speaker notes, comments, layouts, themes, media) by unpacking OOXML, extracting text, or generating slides from HTML or a template; use it for "make a deck", "generate slides", "edit a PPTX", "apply a company template", or 
domain: 文书/office
triggers: [make me a PPT/presentation, turn this content into slides, edit/change a specific slide in an existing PPTX, build a deck following a company template, extract/summarize the text, notes, or comments in a PPTX]
tags: [documents, pptx, presentation, ooxml, html2pptx, template]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [python-pptx-deck-generator, markdown-to-docx, theme-factory]
combines_with: [python-pptx-deck-generator, board-deck-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## When to use

Use this when a user asks you to **create, edit, or analyze a `.pptx` presentation**. A `.pptx` file is essentially a ZIP archive containing XML files and other resources you can read or edit. Different tasks have different tools and workflows:

- **Read / analyze content**: extract body text, speaker notes, comments, layouts, animations, design colors and fonts.
- **Create from scratch (no template)**: use the html2pptx workflow to convert HTML slides into a precisely positioned PPTX.
- **Edit an existing deck**: work directly with the raw OOXML (unpack → edit XML → validate → repack).
- **Create from a template**: reuse an existing template's layouts, duplicate/reorder slides, then replace placeholder text.

Out of scope:

- Plain text with no layout/visual requirement → just write Markdown or prose; do not produce a PPTX.
- The target is Word (`.docx`) or Excel (`.xlsx`) → use the corresponding document skill instead.
- Only need Q&A or a summary of an existing PPTX → use the read/analyze branch to extract text; do not generate a new file.
- One-line replies and quick notes are not presentations.

## Steps

### A. Reading and analyzing content

- **Text extraction** — convert the document to markdown:
  ```bash
  python -m markitdown path-to-file.pptx
  ```
- **Raw XML access** — required for comments, speaker notes, slide layouts, animations, design elements, and complex formatting. Unpack the presentation and read its raw XML:
  ```bash
  python ooxml/scripts/unpack.py <office_file> <output_dir>
  ```
  The unpack script lives at `skills/pptx/ooxml/scripts/unpack.py` relative to the project root. If it isn't there, locate it with `find . -name "unpack.py"`. Key file structures:
  - `ppt/presentation.xml` — main metadata and slide references
  - `ppt/slides/slide{N}.xml` — individual slide contents
  - `ppt/notesSlides/notesSlide{N}.xml` — speaker notes per slide
  - `ppt/comments/modernComment_*.xml` — comments for specific slides
  - `ppt/slideLayouts/`, `ppt/slideMasters/`, `ppt/theme/`, `ppt/media/`
- **Typography and color extraction (when given an example design to emulate)**: (1) read `ppt/theme/theme1.xml` for colors (`<a:clrScheme>`) and fonts (`<a:fontScheme>`); (2) sample `ppt/slides/slide1.xml` for actual font usage (`<a:rPr>`) and colors; (3) grep across all XML files for color (`<a:solidFill>`, `<a:srgbClr>`) and font references.

### B. Creating from scratch (html2pptx)

1. **MANDATORY — read the entire file**: read `html2pptx.md` completely, start to finish, with **no range limits**, to learn the syntax, critical formatting rules, and best practices before proceeding.
2. **State your design approach BEFORE writing code**: consider subject matter, tone, industry, and any brand colors. Pick a 3–5 color palette (dominant + supporting + accent) with strong contrast. Use **web-safe fonts only**: Arial, Helvetica, Times New Roman, Georgia, Courier New, Verdana, Tahoma, Trebuchet MS, Impact. Build a clear visual hierarchy through size, weight, and color, and keep patterns consistent across slides.
3. Create one HTML file per slide with proper dimensions (e.g. `720pt × 405pt` for 16:9). Use `<p>`, `<h1>`–`<h6>`, `<ul>`, `<ol>` for all text. Use `class="placeholder"` (rendered with a gray background) for areas where charts/tables will go. **Rasterize gradients and icons to PNG first using Sharp**, then reference them in the HTML.
4. For slides with charts/tables/images, use a **full-slide layout** or a **two-column layout** (header spanning full width, then e.g. a 40%/60% flex split — text/bullets in one column, featured content in the other). **NEVER vertically stack** text above a chart/table in a single column.
5. Create and run a JavaScript file using the `scripts/html2pptx.js` library: call `html2pptx()` to process each HTML file, add charts/tables to placeholder areas via the PptxGenJS API, and save with `pptx.writeFile()`.
6. **Visual validation**: generate a thumbnail grid and inspect it:
   ```bash
   python scripts/thumbnail.py output.pptx workspace/thumbnails --cols 4
   ```
   Examine each slide for text cutoff, text/shape overlap, content too close to edges, and insufficient contrast. If issues are found, adjust HTML margins/spacing/colors and regenerate. Repeat until all slides are visually correct.

### C. Editing an existing presentation

1. **MANDATORY — read the entire file**: read `ooxml.md` (~500 lines) completely, start to finish, with **no range limits**.
2. Unpack: `python ooxml/scripts/unpack.py <office_file> <output_dir>`
3. Edit the XML (primarily `ppt/slides/slide{N}.xml` and related files).
4. **CRITICAL — validate immediately after each edit and fix all errors before proceeding**:
   ```bash
   python ooxml/scripts/validate.py <dir> --original <file>
   ```
5. Pack the final presentation: `python ooxml/scripts/pack.py <input_directory> <office_file>`

### D. Creating from a template

1. **Extract text and create a thumbnail grid**:
   ```bash
   python -m markitdown template.pptx > template-content.md
   python scripts/thumbnail.py template.pptx
   ```
   Read the entire `template-content.md` (no range limits).
2. **Analyze and save an inventory** to `template-inventory.md`. Slides are **0-indexed** (first slide = 0, last = count-1). List **every** slide individually with its index, layout code (if any), and purpose.
3. **Build an outline with template mapping** in `outline.md`. **Match layout structure to actual content**: two-column layouts ONLY for exactly 2 items, three-column ONLY for exactly 3, image+text ONLY when you have real images, quote layouts ONLY for real attributed quotes. Never pick a layout with more placeholders than you have content. **Count your content pieces BEFORE selecting a layout.** Example mapping (0-based; a 73-slide template has indices 0–72):
   ```python
   template_mapping = [
       0,   # Title/Cover
       34,  # B1: Title and body
       34,  # B1 again (duplicate)
       50,  # E1: Quote
       54,  # F2: Closing + Text
   ]
   ```
4. **Duplicate, reorder, and delete slides** with `rearrange.py` (0-based indices; repeat an index to duplicate that slide):
   ```bash
   python scripts/rearrange.py template.pptx working.pptx 0,34,34,50,52
   ```
5. **Extract ALL text** with `inventory.py`, then read the entire output JSON (no range limits):
   ```bash
   python scripts/inventory.py working.pptx text-inventory.json
   ```
   Shapes are named `shape-0`, `shape-1`, … ordered by visual position (top-to-bottom, left-to-right); slides are `slide-0`, `slide-1`, …. Only non-default properties are included; `placeholder_type` may be TITLE, CENTER_TITLE, SUBTITLE, BODY, OBJECT, or null. SLIDE_NUMBER placeholders are filtered out.
6. **Generate replacement text** and save to `replacement-text.json`:
   - Only reference shapes that **actually exist** in the inventory (`replace.py` validates this).
   - **AUTOMATIC CLEARING**: every text shape in the inventory is cleared unless you provide a `paragraphs` field for it (the field is `paragraphs`, **not** `replacement_paragraphs`).
   - Headers/titles typically get `"bold": true`; list items get `"bullet": true, "level": 0` (`level` is required when `bullet` is true).
   - When `bullet: true`, do **NOT** include bullet symbols (•, -, *) in text and do **NOT** set `alignment` — both are handled automatically.
   - Preserve original alignment, font, and color: `"color": "FF0000"` (RGB) or `"theme_color": "DARK_1"` (theme).
7. **Apply replacements**:
   ```bash
   python scripts/replace.py working.pptx replacement-text.json output.pptx
   ```
   The script extracts the inventory, validates all referenced shapes exist, clears every inventory shape, then writes new text only to shapes with `paragraphs`, preserving formatting. Out-of-range shape/slide references are reported all at once.

### Helper: convert to images for visual analysis

```bash
soffice --headless --convert-to pdf template.pptx
pdftoppm -jpeg -r 150 template.pdf slide   # produces slide-1.jpg, slide-2.jpg, ...; use -f/-l to limit pages
```

## Example

Minimal — extract presentation body text:

```bash
python -m markitdown deck.pptx
```

Edit one slide (editing branch):

```bash
python ooxml/scripts/unpack.py deck.pptx ./unpacked
# edit ./unpacked/ppt/slides/slide3.xml
python ooxml/scripts/validate.py ./unpacked --original deck.pptx
python ooxml/scripts/pack.py ./unpacked deck-edited.pptx
```

`replacement-text.json` fragment (template branch):

```json
{
  "slide-0": {
    "shape-0": {
      "paragraphs": [
        { "text": "New Title", "alignment": "CENTER", "bold": true },
        { "text": "First bullet point (no symbol)", "bullet": true, "level": 0 }
      ]
    }
  }
}
```

Agent prompt template:

> Build a 5-slide deck from `template.pptx`: first inventory every template slide's layout (0-indexed), pick layouts matching the number of content pieces, `rearrange` into working.pptx, `inventory` the text, produce `replacement-text.json`, then `replace` into output.pptx, and finally verify each slide with `thumbnail` for no cutoff/overlap before delivering.

## Notes

- Always use **absolute paths**; scripts default to `skills/pptx/ooxml/scripts/` — if a path doesn't match, `find` the script first.
- In the editing branch, **validate immediately after each edit** and fix failures before continuing; don't let errors pile up until packing.
- Template indices are **0-based**; confirm indices are in range before `rearrange` (a 73-slide template is 0–72) — out-of-range values error out.
- `replace.py` **automatic clearing** is the default: any inventory shape without `paragraphs` in the JSON is cleared, so don't omit content you want to keep.
- When `bullet` is true, **do not write bullet characters and do not set alignment** — symbols and left alignment are applied automatically.
- In html2pptx, **gradients/icons must be rasterized to PNG first**, then referenced; use web-safe fonts only.
- The thumbnail visual check is mandatory — a silent command success does not mean the layout is correct, so read the image and verify.
- Required dependencies (should already be installed): `markitdown[pptx]`, `pptxgenjs`, `playwright`, `react-icons`, `sharp`, LibreOffice, poppler-utils, `defusedxml` (secure XML parsing).
- Code style: write concise code; avoid verbose variable names, redundant operations, and unnecessary print statements. Confirm source files aren't encrypted or permission-restricted before processing.

## See also

- requires: none.
- related: `markdown-to-docx` (use when the target is Word, not a presentation); `python-pptx-deck-generator`; `theme-factory`.
- combines_with: `python-pptx-deck-generator`, `board-deck-builder`.
