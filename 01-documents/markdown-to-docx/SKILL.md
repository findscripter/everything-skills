---
name: markdown-to-docx
title: Markdown 转 Word
description: 当需要把 Markdown 转换成 .docx（保留标题/表格/样式）、生成可交付 Word 文档时使用；触发词：md 转 word、导出 docx、Markdown 转 Word、Pandoc。
domain: 文书/markdown
tags: [markdown, docx, conversion]
level: 入门
status: stable
version: 0.1.0
agents: [claude-code, codex, cursor, gemini-cli]
tools: [pandoc]
requires: []
related: [pdf-processing-toolkit, pptx-document-processing, professional-proofreader]
combines_with: [docs-architect, doc-coauthoring]
license: CC-BY-SA-4.0
---
## 何时使用

- 需要把 Markdown（`.md`）转换成可交付的 Word 文档（`.docx`），并保留标题层级、表格、列表、代码块、粗斜体等结构。
- 触发词：md 转 word、导出 docx、Markdown 转 Word、Pandoc、生成 Word 报告。
- 需要套用企业模板（字体/页眉页脚/封面）批量产出格式统一的 `.docx`。

不该用的边界：

- 反向需求（Word/docx 转 Markdown）不在本技能范围，方向相反需另寻其他能力。
- 目标格式是 PDF、HTML、PPTX 时不用本技能（Pandoc 虽可转，但本技能只负责 docx 交付路径）。
- 需要在已有 PDF 表单里填写字段，用 `pdf-form-filler`。
- 需要逐字符精确控制 Word 内部 XML（如复杂域代码、修订痕迹）时，Pandoc 不可靠，应改用专用库手工生成。

## 步骤 / 指令

1. 确认输入：定位源 `.md` 文件绝对路径；确认输出 `.docx` 目标路径。
2. 检查工具链：运行 `pandoc --version`；缺失则提示安装（Windows：`winget install --id JohnMacFarlane.Pandoc`）。
3. 基础转换：
   ```
   pandoc <input.md> -o <output.docx>
   ```
4. 需要套样式时，先准备参考文档（一次性生成可编辑模板）：
   ```
   pandoc -o reference.docx --print-default-data-file reference.docx
   ```
   在 Word 中改好样式后保存，再用 `--reference-doc=reference.docx` 应用。
5. 处理表格/资源：含 GFM 表格或脚注时加 `-f gfm`；图片用相对路径并加 `--resource-path=<dir>`。
6. 校验产物：确认 `.docx` 存在且体积非 0，必要时回读确认标题与表格未丢失，再交付绝对路径。

伪代码：

```
assert exists(input_md)
if not has("pandoc"): tell_user_install(); stop
cmd = ["pandoc", input_md, "-o", output_docx]
if needs_template: cmd += ["--reference-doc", reference_docx]
if has_gfm_tables: cmd = ["pandoc","-f","gfm", input_md, "-o", output_docx, ...]
run(cmd); verify(output_docx)
```

## 示例

最小可用（基础转换）：

```
pandoc report.md -o report.docx
```

带模板 + GFM 表格 + 目录：

```
pandoc -f gfm --reference-doc=corp-template.docx --toc report.md -o report.docx
```

提示词示例（交给 Agent 时）：

> 把 `E:\docs\周报.md` 转成 `E:\out\周报.docx`，套用 `E:\tpl\公司模板.docx`，保留所有表格。

## 注意事项

- 必须使用绝对路径，避免工作目录在调用间被重置导致找不到文件。
- 标题层级从 `#`（H1）映射到 Word「标题 1」；样式不对时多半是 reference-doc 里的样式名缺失，而非转换失败。
- 复杂表格（合并单元格、嵌套）Pandoc 支持有限，转换后需人工抽查；纯 Markdown 管道表格最稳。
- 图片不嵌入是常见坑：路径错误或缺 `--resource-path` 会静默丢图，应核对产物。
- 中文字体由 reference-doc 控制，默认模板可能显示宋体/Calibri 混排，交付前确认字体一致。
- Pandoc 命令静默成功也可能产出空壳，务必校验输出文件大小与关键内容。

## 互见

- requires：无。
- related：`pdf-form-filler`（需求方向为填写 PDF 表单而非生成 Word 时改用）。
- combines_with：无。
