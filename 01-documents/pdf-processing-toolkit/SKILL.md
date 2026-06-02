---
name: pdf-processing-toolkit
title: PDF 处理工具箱
description: 当需要合并/拆分/旋转 PDF、提取文本与表格、生成新 PDF、加水印/加密、对扫描件 OCR 时使用；做用 pypdf/pdfplumber/reportlab 等库与 qpdf/pdftotext 等命令完成批量 PDF 处理并产出文件或结构化数据；不适用于填写 PDF 表单字段（用 pdf-form-filler）。触发词：PDF、合并PDF、提取表格、PDF转文本、OCR、加水印
domain: 文书/office
triggers: [合并PDF, 拆分PDF, PDF提取文本, PDF提取表格, 生成PDF, PDF加水印, PDF加密, 扫描件OCR, 旋转PDF页面, pdfplumber, qpdf, reportlab]
tags: [pdf, documents, pypdf, pdfplumber, reportlab, qpdf, ocr]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, pypdf, pdfplumber, reportlab, qpdf, poppler-utils, pytesseract]
requires: []
related: [pdf-form-filler, markdown-to-docx, pptx-document-processing, professional-proofreader]
combines_with: [pdf-form-filler, citation-management]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：

- 合并多份 PDF、拆分为单页、旋转页面、重排页。
- 提取正文文本（含保留版面）、抽取表格导出为 DataFrame/Excel。
- 从零生成 PDF（文本、表格、多页报告）。
- 加水印、设密码加密、解密去密码、抽取内嵌图片。
- 扫描件/纯图 PDF 走 OCR 转可检索文本。

不该用的边界：

- 填写已有 AcroForm/XFA 表单字段（勾选框、文本框、下拉）→ 用 `pdf-form-filler`，本技能不覆盖表单字段写入。
- 需要像素级版式还原的复杂排版生成（杂志/手册）→ reportlab 适合结构化文档，重设计稿应改用专业排版工具。
- 纯文本/Markdown 落地为 Word/PPT → 用 `markdown-to-docx` 等排版技能。

## 步骤 / 指令

1. 先判类型：可选文本 PDF 还是扫描件？`pdftotext input.pdf -` 若几乎无文本则视为扫描件，转 OCR 流程。
2. 选工具：拆分/合并/旋转/加密 → `pypdf` 或命令行 `qpdf`；提取文本/表格 → `pdfplumber`；生成 → `reportlab`；OCR → `pdf2image`+`pytesseract`。简单批处理优先命令行（更快、无需写脚本）。
3. 执行操作（见示例），始终输出到新文件，不覆盖源 PDF。
4. 校验：处理后复读页数/关键文本，表格抽取后检查行列对齐与表头。
5. 加密/解密前确认有权限处理该文档。

## 示例

合并 / 拆分（pypdf）：

```python
from pypdf import PdfReader, PdfWriter

# 合并
writer = PdfWriter()
for f in ["doc1.pdf", "doc2.pdf"]:
    for page in PdfReader(f).pages:
        writer.add_page(page)
with open("merged.pdf", "wb") as out:
    writer.write(out)

# 拆分为单页
reader = PdfReader("input.pdf")
for i, page in enumerate(reader.pages):
    w = PdfWriter(); w.add_page(page)
    with open(f"page_{i+1}.pdf", "wb") as out:
        w.write(out)
```

旋转 / 加密（pypdf）：

```python
page = reader.pages[0]; page.rotate(90)   # 顺时针 90°
writer.encrypt("userpwd", "ownerpwd")     # 设密码
```

提取表格 → Excel（pdfplumber）：

```python
import pdfplumber, pandas as pd
dfs = []
with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        for t in page.extract_tables():
            if t:
                dfs.append(pd.DataFrame(t[1:], columns=t[0]))
if dfs:
    pd.concat(dfs, ignore_index=True).to_excel("tables.xlsx", index=False)
```

提取文本（pdfplumber：`page.extract_text()`；命令行：`pdftotext -layout input.pdf out.txt`）。

命令行批处理（qpdf / poppler）：

```bash
qpdf --empty --pages a.pdf b.pdf -- merged.pdf        # 合并
qpdf input.pdf --pages . 1-5 -- p1-5.pdf              # 取页
qpdf input.pdf out.pdf --rotate=+90:1                 # 旋转第 1 页
qpdf --password=PW --decrypt enc.pdf dec.pdf          # 去密码
pdfimages -j input.pdf imgprefix                      # 抽图为 jpg
```

生成 PDF（reportlab，多页报告）：

```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, PageBreak
from reportlab.lib.styles import getSampleStyleSheet
s = getSampleStyleSheet()
doc = SimpleDocTemplate("report.pdf", pagesize=letter)
doc.build([Paragraph("标题", s['Title']),
           Paragraph("正文…", s['Normal']), PageBreak(),
           Paragraph("第 2 页", s['Heading1'])])
```

扫描件 OCR（pip install pytesseract pdf2image，需系统装 tesseract）：

```python
import pytesseract
from pdf2image import convert_from_path
text = "".join(pytesseract.image_to_string(img, lang="chi_sim+eng")
               for img in convert_from_path("scanned.pdf"))
```

加水印（pypdf：对每页 `page.merge_page(watermark_page)`）。

## 速查表

| 任务 | 首选 | 关键调用 |
|---|---|---|
| 合并 | pypdf / qpdf | `writer.add_page` / `qpdf --empty --pages` |
| 拆分 | pypdf | 每页一文件 |
| 提取文本 | pdfplumber | `page.extract_text()` |
| 提取表格 | pdfplumber | `page.extract_tables()` |
| 生成 | reportlab | Canvas / Platypus |
| OCR 扫描件 | pytesseract | 先 `convert_from_path` 转图 |
| 填表单 | pdf-form-filler | 见该技能 |

## 注意事项

- 始终另存新文件，批量时文件名带唯一键，避免覆盖。
- 中文文本：reportlab 需注册中文字体，OCR 须装中文语言包并传 `lang="chi_sim"`，否则乱码/丢字。
- pdfplumber 抽表对有边框规整表格效果好；无线表/合并单元格易错位，需人工核对行列。
- 扫描件直接 `extract_text()` 返回空属正常——必须走 OCR。
- 加密/去密码涉及版权与授权，处理外部文档前确认有权操作。
- 命令行工具非内置：qpdf/pdftotext/pdfimages 来自 poppler-utils 与 qpdf 包，pytesseract 依赖系统 tesseract，使用前确认已安装。

## 互见

- requires：无。
- related：`audio-to-markdown-transcriber`（音视频转写，与 PDF 同属内容抽取场景）。
- combines_with：`pdf-form-filler`（需要填写 PDF 表单字段时切到它，本技能负责合并/拆分/抽取/生成）；`csv-data-cleaner`（把抽取出的表格 CSV 喂给它做清洗规范化）。

---

采编自 sickn33/antigravity-awesome-skills（MIT），原技能 `pdf-official`，已适配重写为中文版本。
