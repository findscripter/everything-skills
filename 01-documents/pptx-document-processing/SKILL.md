---
name: pptx-document-processing
title: PPTX 演示文稿处理
description: 当需要创建、编辑或分析 .pptx 演示文稿（含正文/讲者备注/批注/版式/主题/媒体）时使用；做拆解 OOXML、抽取文本、按 HTML 或模板生成幻灯片并产出 .pptx；不适用于纯文本无版式需求、Word/Excel 文档或一句话答复；触发词：做PPT、生成幻灯片、改PPTX、套模板做演示、提取演示文稿文本
domain: 文书/office
triggers: [帮我做一份PPT/演示文稿, 把内容生成幻灯片, 编辑/修改现有 PPTX 的某页, 按公司模板套做演示, 提取/总结 PPTX 里的文字、备注或批注]
tags: [文书, pptx, 演示文稿, ooxml, html2pptx, 模板]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, markitdown, pptxgenjs, playwright, sharp, libreoffice, poppler]
requires: []
related: [python-pptx-deck-generator, markdown-to-docx, theme-factory]
combines_with: [python-pptx-deck-generator, board-deck-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当用户要**创建、编辑或分析 `.pptx` 演示文稿**时使用。`.pptx` 本质是一个 ZIP 包，内含 XML 与媒体资源，可读可改。按四类任务分流：

- **读/分析内容**：抽取正文、讲者备注、批注、版式、动画、设计配色字体。
- **从零创建（无模板）**：走 html2pptx 工作流，把 HTML 幻灯片转成定位精确的 PPTX。
- **编辑现有文稿**：直接改 OOXML（拆包→改 XML→校验→打包）。
- **套模板创建**：复用现成模板的版式，复制重排幻灯片后替换占位文本。

不该用的边界：

- 只需纯文本、无版式/视觉要求 → 直接写 Markdown 或正文，别做 PPTX。
- 目标是 Word（`.docx`）或 Excel（`.xlsx`）→ 用对应文档技能，不用本技能。
- 仅需把 PPTX 内容做问答/总结 → 用「读/分析」分支抽文本即可，不必生成新文件。
- 一句话回复、随手笔记不构成演示场景。

## 步骤 / 指令

### A. 读取与分析

- 只读正文：转 Markdown
  ```bash
  python -m markitdown path-to-file.pptx
  ```
- 需要备注/批注/版式/动画/复杂格式：必须拆包读原始 XML
  ```bash
  python ooxml/scripts/unpack.py <office_file> <output_dir>
  ```
  脚本若不在该路径，用 `find . -name "unpack.py"` 定位。关键结构：
  - `ppt/presentation.xml` 主元数据与幻灯片引用
  - `ppt/slides/slide{N}.xml` 单页内容
  - `ppt/notesSlides/notesSlide{N}.xml` 讲者备注
  - `ppt/comments/modernComment_*.xml` 批注
  - `ppt/slideLayouts/`、`ppt/slideMasters/`、`ppt/theme/`、`ppt/media/`
- **仿照示例设计时**先提取配色与字体：读 `ppt/theme/theme1.xml` 的 `<a:clrScheme>`/`<a:fontScheme>`；看 `slide1.xml` 实际 `<a:rPr>` 用法；用 grep 搜 `<a:solidFill>`、`<a:srgbClr>` 跨文件找配色字体。

### B. 从零创建（html2pptx）

1. **强制先读整份** `html2pptx.md`（不要设行数范围），掌握语法与硬规则再动手。
2. 动手前**先声明设计取向**：分析主题/行业/受众，选 3–5 色调色板（主色+辅色+点缀，确保对比度），只用 web 安全字体（Arial、Helvetica、Times New Roman、Georgia、Courier New、Verdana、Tahoma、Trebuchet MS、Impact）。
3. 每页一个 HTML，按 16:9 设 `720pt × 405pt`；文本用 `<p>/<h1>-<h6>/<ul>/<ol>`；图表/表格区用 `class="placeholder"`（灰底占位）。**渐变与图标先用 Sharp 栅格化为 PNG** 再引用。
4. 含图表/表格的页用「整页布局」或「两栏布局（如 40%/60%）」，**严禁**文字上、图表下的纵向堆叠。
5. 写并运行 JS，用 `scripts/html2pptx.js` 的 `html2pptx()` 处理每页，用 PptxGenJS API 往占位区加图表/表格，`pptx.writeFile()` 保存。
6. **视觉校验**：生成缩略图网格 `python scripts/thumbnail.py output.pptx workspace/thumbnails --cols 4`，逐页查文字截断/重叠/贴边/对比度不足，有问题改 HTML 再重生成，直至无误。

### C. 编辑现有文稿

1. **强制先读整份** `ooxml.md`（约 500 行，不要设范围）。
2. 拆包 `python ooxml/scripts/unpack.py <office_file> <output_dir>`。
3. 改 XML（主要是 `ppt/slides/slide{N}.xml`）。
4. **每改一处立即校验并修错**：`python ooxml/scripts/validate.py <dir> --original <file>`。
5. 打包 `python ooxml/scripts/pack.py <input_directory> <office_file>`。

### D. 套模板创建

1. 抽文本 + 生成缩略图：`python -m markitdown template.pptx > template-content.md`；`python scripts/thumbnail.py template.pptx`，整读 `template-content.md`。
2. 写 `template-inventory.md` 盘点每页（**0 起索引**：首页=0，末页=count-1），逐页记版式与用途。
3. 据盘点写 `outline.md` 与模板映射：**版式必须匹配真实内容数量**（两栏只用于恰好 2 项，三栏只用于恰好 3 项，引用版式只用于真实带署名的引语，占位多于内容则不选）。先数内容块再选版式。
4. 复制/重排/删页：`python scripts/rearrange.py template.pptx working.pptx 0,34,34,50,52`（索引可重复以复制该页）。
5. 抽全量文本清单：`python scripts/inventory.py working.pptx text-inventory.json`，整读该 JSON（slide-N / shape-N，按视觉位置排序，含 placeholder_type 与段落属性）。
6. 生成替换文本存 `replacement-text.json`：只引用清单中**确实存在**的 shape；给需要内容的 shape 加 `paragraphs`（**不是** replacement_paragraphs）；**未给 paragraphs 的 shape 会被自动清空**；标题/段头 `"bold": true`，列表项 `"bullet": true, "level": 0`（bullet 为真时 level 必填且别再设 alignment、别在文本里写 •/-/* 符号）；保留原始对齐/字体/颜色（`"color":"FF0000"` 或 `"theme_color":"DARK_1"`）。
7. 应用：`python scripts/replace.py working.pptx replacement-text.json output.pptx`（脚本会先校验 shape 存在、清空全部清单内 shape、再按 JSON 写回并保留格式；越界 shape/slide 会一次性报全部错误）。

### 辅助：转图做视觉分析

```bash
soffice --headless --convert-to pdf template.pptx
pdftoppm -jpeg -r 150 template.pdf slide   # 生成 slide-1.jpg...，-f/-l 限定页范围
```

## 示例

最小可用——抽取演示文稿正文：

```bash
python -m markitdown deck.pptx
```

改某页文字（编辑分支）：

```bash
python ooxml/scripts/unpack.py deck.pptx ./unpacked
# 编辑 ./unpacked/ppt/slides/slide3.xml
python ooxml/scripts/validate.py ./unpacked --original deck.pptx
python ooxml/scripts/pack.py ./unpacked deck-edited.pptx
```

`replacement-text.json` 片段（套模板分支）：

```json
{
  "slide-0": {
    "shape-0": {
      "paragraphs": [
        { "text": "新标题", "alignment": "CENTER", "bold": true },
        { "text": "首条要点（无需符号）", "bullet": true, "level": 0 }
      ]
    }
  }
}
```

给 Agent 的提示词模板：

> 用 `template.pptx` 做一份 5 页演示：先盘点模板每页版式（0 起索引），按内容块数量选匹配版式，rearrange 出 working.pptx，inventory 抽文本，生成 replacement-text.json 后 replace 出 output.pptx，最后用 thumbnail 逐页核对无截断/重叠再交付。

## 注意事项

- 一律用**绝对路径**；脚本默认在 `skills/pptx/ooxml/scripts/` 下，路径不符先 `find` 定位。
- 编辑分支**每改一处立即 validate**，校验失败先修再继续，别累积错误到打包阶段才发现。
- 套模板分支索引**0 起**；rearrange 前核对索引在范围内（73 页模板索引为 0–72），越界会报错。
- replace 的「自动清空」是默认行为：凡清单里有、JSON 里没给 `paragraphs` 的 shape 都会被清空，别遗漏需保留的页。
- bullet 为真时**别写项目符号字符、别设 alignment**，符号与左对齐由脚本自动处理。
- html2pptx 里**渐变/图标必须先栅格化为 PNG** 再引用，否则定位与渲染会出错；只用 web 安全字体。
- 缩略图视觉校验是必经环节，命令静默成功不代表版面正确，务必读图核对。
- 依赖须就位：`markitdown[pptx]`、`pptxgenjs`、`playwright`、`react-icons`、`sharp`、LibreOffice、poppler-utils、`defusedxml`（安全 XML 解析）。
- 代码风格：简洁、避免冗长变量名与多余 print。处理外部来源文件前确认无加密/权限限制。

## 互见

- requires：无。
- related：`markdown-to-docx`（目标是 Word 而非演示时改用）、`doc-coauthoring`（先共创文档大纲，再据此做 PPT）。
- combines_with：`pdf-form-filler`（演示导出 PDF 后若需在表单字段上填写时搭配）。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
