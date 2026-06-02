---
name: visa-doc-translate
title: 签证申请材料双语翻译 PDF
description: 当需要把签证申请材料（存款证明/在职证明/营业执照等扫描件或照片）翻译成英文并生成原文+译文双语 PDF 时使用；做对图像做旋转校正与 OCR、专业英译、用 PIL/reportlab 拼出第1页原图第2页英译的认证式 PDF；不适用于纯文本/已是数字文档的翻译，也不做盖章公证等法律认证。触发词：签证翻译、存款证明翻译、在职证明翻译、双语PDF、OCR翻译、certified translation
domain: 文书/translation
triggers: [签证翻译, 签证材料翻译, 存款证明翻译, 在职证明翻译, 营业执照翻译, 双语PDF, OCR翻译, certified translation, visa document translation]
tags: [translation, visa, ocr, pdf, bilingual, reportlab]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, pillow, reportlab, easyocr, pytesseract, sips]
requires: []
related: [pdf-processing-toolkit, pdf-form-filler, markdown-to-docx]
combines_with: [pdf-processing-toolkit]
license: CC-BY-SA-4.0
source: affaan-m/everything-claude-code
source_license: MIT
---
## 何时使用

- 用户给出签证材料的**图片/扫描件**（PNG/JPG/HEIC），需要英译并产出可随申请提交的**双语 PDF**（原图 + 英文译文）。
- 适配对象：存款证明（存款证明）、收入证明、在职证明、退休证明、房产证明、营业执照、身份证/护照等公文。
- 触发词：签证翻译、存款证明翻译、在职证明翻译、双语PDF、OCR翻译、certified translation。
- 面向澳/美/加/英等国签证对「翻译件」的格式要求场景。

不该用的边界：

- 输入已是**纯文本或可选中的数字文档**（无需 OCR）：直接翻译即可，无需本技能的图像处理链路。
- 需要**法律认证 / 公证 / 翻译资质盖章**：本技能只生成自述「certified English translation」字样的排版件，不具备法律公证效力，正式公证另找有资质机构。
- 仅做 PDF 合并/拆分/水印等通用处理：改用 `pdf-processing-toolkit`。
- 在已有 PDF 表单里填字段：改用 `pdf-form-filler`。

## 步骤 / 指令

收到图片路径后，**全程自动执行、各步不再向用户逐一确认**，最后报告产物路径。

1. **格式转换**：若为 HEIC，转 PNG。
   ```bash
   sips -s format png <input> --out <output>   # macOS
   ```
   非 macOS 用 Pillow/`pillow-heif` 读取 HEIC 后另存 PNG。
2. **旋转校正**：读取 EXIF Orientation 自动摆正。EXIF orientation=6 → 逆时针旋转 90°；若文档看着上下颠倒，测试再转 180°。目标是文字水平正向，利于 OCR。
3. **OCR 文本抽取**（按序尝试，失败即降级）：
   - macOS Vision 框架（macOS 优先，识别质量高）
   - EasyOCR（跨平台，免装 tesseract）
   - Tesseract OCR（已安装时）
   抽取全部文字，并判别文档类型（存款证明 / 在职证明 / 退休证明…）以套用对应术语。
4. **专业英译**：
   - 维持原件结构与版式，使用签证场景的规范专业用语。
   - 专有名词保留原文，括号内补英文；中文姓名用拼音格式（例：`WU Zhengye`）。
   - **所有数字、日期、金额必须逐字精确**，不得改写或四舍五入。
5. **生成 PDF**（Python + Pillow + reportlab）：
   - 第 1 页：旋转校正后的**原图**，居中并缩放贴合 A4。
   - 第 2 页：英文译文。标题居中加粗、正文左对齐、行距适中，公文式专业排版。
   - 页脚加注：`This is a certified English translation of the original document`。
6. **输出**：写到原图同目录，命名 `<original_filename>_Translated.pdf`，并报告绝对路径。

## 示例

调用形式：

```bash
/visa-doc-translate RetirementCertificate.PNG
/visa-doc-translate BankStatement.HEIC
/visa-doc-translate EmploymentLetter.jpg
```

依赖安装：

```bash
pip install pillow reportlab          # PDF 生成
pip install easyocr                   # 跨平台 OCR（推荐，免 tesseract）
brew install tesseract tesseract-lang # Tesseract 路线（可选）
pip install pytesseract
# macOS Vision 路线：
pip install pyobjc-framework-Vision pyobjc-framework-Quartz
```

产物：`<filename>_Translated.pdf` —— 第 1 页原件图像，第 2 页专业英译。

## 注意事项

- **零确认自动跑通**：从转换到 PDF 一气呵成，仅在最后汇报结果。
- 旋转角度需**自动判定到最优**；OCR 单方法失败要**自动换下一种**，不要直接放弃。
- 金额/日期/编号错一位即可能导致拒签，译后务必逐项核对原文。
- 数字 OCR 易错（0/O、1/l、6/8），低置信度处人工复核。
- HEIC 在非 macOS 需额外解码库；缺库时先提示安装再继续。
- 本件「certified」仅为排版声明，**不等于法律公证**；目标国若要求公证翻译，须另办。
- 始终使用绝对路径，避免调用间工作目录重置导致找不到文件。

## 互见

- requires：无。
- related：`pdf-processing-toolkit`（通用 PDF 处理/OCR）、`pdf-form-filler`（填写签证表单）、`markdown-to-docx`（译文需 Word 交付时）。
- combines_with：`pdf-processing-toolkit` —— 生成后还需合并多份证明、加水印或再加密时组合使用。

---

采编自 [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code)（MIT），已适配重写为中文。
