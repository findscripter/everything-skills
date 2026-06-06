---
name: visa-doc-translate
title: Visa Doc Translate
description: Translate visa application documents (images) into English and produce a bilingual PDF containing the original and the translation. Use for certified visa-document translation with OCR. Triggers: certified translation, visa document translation, translate visa documents.
domain: 文书/translation
triggers: [certified translation, visa document translation]
tags: [translation, visa, ocr, pdf, bilingual, reportlab]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [pdf-processing-toolkit, pdf-form-filler, markdown-to-docx]
combines_with: [pdf-processing-toolkit]
license: CC-BY-SA-4.0
source: affaan-m/everything-claude-code
source_license: MIT
---
Assists with translating visa application documents for visa applications.

## Procedure

When the user provides a path to an image file, perform the following steps **automatically**, **without asking for confirmation**:

1. **Image conversion**: If the file is in HEIC format, convert it to PNG using `sips -s format png <input> --out <output>`.

2. **Image rotation**:
   * Check the EXIF orientation data.
   * Automatically rotate the image based on the EXIF data.
   * If the EXIF orientation is 6, rotate 90 degrees counterclockwise.
   * Apply additional rotation as needed (if the document appears upside down, test a 180-degree rotation).

3. **OCR text extraction**:
   * Automatically try multiple OCR methods:
     * macOS Vision framework (preferred on macOS)
     * EasyOCR (cross-platform, no tesseract required)
     * Tesseract OCR (when available)
   * Extract all text information from the document.
   * Identify the document type (deposit certificate, employment certificate, retirement certificate, etc.).

4. **Translation**:
   * Translate all text content into professional English.
   * Preserve the original document's structure and formatting.
   * Use professional terminology appropriate for visa applications.
   * Keep proper nouns in the original language and append the English in parentheses.
   * Use Pinyin format for Chinese names (e.g., WU Zhengye).
   * Preserve all numbers, dates, and amounts exactly.

5. **PDF generation**:
   * Write a Python script using the PIL and reportlab libraries.
   * Page 1: Display the rotated original image centered and scaled to fit an A4 page.
   * Page 2: Display the English translation with appropriate formatting:
     * Title centered and bold
     * Content left-aligned with appropriate spacing
     * A professional layout suitable for official documents
   * Add a note at the bottom: "This is a certified English translation of the original document".
   * Run the script to generate the PDF.

6. **Output**: Create a PDF file named `<original_filename>_Translated.pdf` in the same directory.

## Supported documents

* Bank deposit certificate (存款证明)
* Income certificate (收入证明)
* Employment certificate (在职证明)
* Retirement certificate (退休证明)
* Real estate certificate (房产证明)
* Business license (营业执照)
* ID cards and passports
* Other official documents

## Technical implementation

### OCR methods (tried in order)

1. **macOS Vision framework** (macOS only):
   ```python
   import Vision
   from Foundation import NSURL
   ```

2. **EasyOCR** (cross-platform):
   ```bash
   pip install easyocr
   ```

3. **Tesseract OCR** (when available):
   ```bash
   brew install tesseract tesseract-lang
   pip install pytesseract
   ```

### Required Python libraries

```bash
pip install pillow reportlab
```

For the macOS Vision framework:

```bash
pip install pyobjc-framework-Vision pyobjc-framework-Quartz
```

## Important guidelines

* Do **not** ask the user for confirmation at each step.
* Automatically determine the optimal rotation angle.
* If one OCR method fails, try multiple methods.
* Verify that all numbers, dates, and amounts are translated accurately.
* Use concise, professional formatting.
* Complete the entire process and report the location of the final PDF.

## Usage examples

```bash
/visa-doc-translate RetirementCertificate.PNG
/visa-doc-translate BankStatement.HEIC
/visa-doc-translate EmploymentLetter.jpg
```

## Output example

This skill does the following:

1. Extract text using an available OCR method.
2. Translate it into professional English.
3. Generate `<filename>_Translated.pdf` containing:
   * Page 1: The original document image
   * Page 2: The professional English translation

Ideal when you need translated documents for visa applications to Australia, the United States, Canada, the United Kingdom, and other countries.
