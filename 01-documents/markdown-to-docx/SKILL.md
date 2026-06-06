---
name: markdown-to-docx
title: Markdown to Word (DOCX)
description: Use when converting Markdown (.md) into deliverable Word .docx files with Pandoc, preserving headings, tables, lists, code blocks and styles, optionally applying a corporate template; triggers: md to word, export docx, Markdown to Word, Pandoc, generate Word report.
domain: 文书/markdown
triggers: [md to word, export docx, markdown to word, pandoc, generate word report, convert markdown to docx, apply word template]
tags: [markdown, docx, conversion]
level: beginner
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [pdf-processing-toolkit, pptx-document-processing, professional-proofreader]
combines_with: [docs-architect, doc-coauthoring]
license: CC-BY-SA-4.0
source: 
source_license: 
---
## When to use

- You need to convert Markdown (`.md`) into a deliverable Word document (`.docx`) while preserving heading levels, tables, lists, code blocks, bold/italic, and other structure.
- Triggers: md to word, export docx, Markdown to Word, Pandoc, generate Word report.
- You need to apply a corporate template (fonts / headers & footers / cover page) to batch-produce consistently formatted `.docx` files.

When NOT to use:

- Reverse direction (Word/docx to Markdown) is out of scope — find another capability for the opposite direction.
- When the target format is PDF, HTML, or PPTX. Pandoc can produce those, but this skill only owns the docx delivery path.
- When you need to fill fields in an existing PDF form, use `pdf-form-filler`.
- When you need byte-exact control over Word's internal XML (e.g. complex field codes, tracked changes/revisions), Pandoc is unreliable — generate the document manually with a dedicated library instead.

## Steps

1. Confirm inputs: locate the absolute path of the source `.md`; confirm the absolute path of the target `.docx`.
2. Check the toolchain: run `pandoc --version`. If missing, prompt to install (Windows: `winget install --id JohnMacFarlane.Pandoc`).
3. Basic conversion:
   ```
   pandoc <input.md> -o <output.docx>
   ```
4. To apply styling, first generate an editable reference document (one-time template):
   ```
   pandoc -o reference.docx --print-default-data-file reference.docx
   ```
   Edit the styles in Word and save, then apply them with `--reference-doc=reference.docx`.
5. Handle tables / resources: for GFM tables or footnotes add `-f gfm`; for images use relative paths and add `--resource-path=<dir>`.
6. Verify the output: confirm the `.docx` exists and is non-zero in size; if needed, read it back to confirm headings and tables survived, then deliver the absolute path.

Pseudocode:

```
assert exists(input_md)
if not has("pandoc"): tell_user_install(); stop
cmd = ["pandoc", input_md, "-o", output_docx]
if needs_template: cmd += ["--reference-doc", reference_docx]
if has_gfm_tables: cmd = ["pandoc","-f","gfm", input_md, "-o", output_docx, ...]
run(cmd); verify(output_docx)
```

## Example

Minimal (basic conversion):

```
pandoc report.md -o report.docx
```

Template + GFM tables + table of contents:

```
pandoc -f gfm --reference-doc=corp-template.docx --toc report.md -o report.docx
```

Prompt example (when handing off to an agent):

> Convert `E:\docs\weekly.md` into `E:\out\weekly.docx`, apply `E:\tpl\corp-template.docx`, and keep all tables.

## Notes

- Always use absolute paths so a working-directory reset between calls does not break file resolution.
- Heading levels map from `#` (H1) to Word's "Heading 1" style; if styling looks wrong, the cause is usually a missing style name in the reference-doc, not a failed conversion.
- Pandoc has limited support for complex tables (merged cells, nesting) — spot-check by hand after conversion; plain Markdown pipe tables are the most reliable.
- Images not embedding is a common pitfall: a wrong path or a missing `--resource-path` drops images silently — verify the output.
- Chinese (and other CJK) fonts are controlled by the reference-doc; the default template may mix fonts (e.g. SimSun/Calibri) — confirm font consistency before delivery.
- A Pandoc command can "succeed" silently and still produce an empty shell — always verify the output file size and key content.

## See also

- requires: none.
- related: `pdf-processing-toolkit`, `pptx-document-processing`, `professional-proofreader`; `pdf-form-filler` (use it instead when the need is filling a PDF form rather than generating Word).
- combines_with: `docs-architect`, `doc-coauthoring`.
