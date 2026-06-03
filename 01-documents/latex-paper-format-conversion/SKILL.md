---
name: latex-paper-format-conversion
title: LaTeX 论文格式转换
description: 当需要把 LaTeX 论文从一个期刊/出版社模板（如 Springer、IPOL）移植到另一个模板（如 MDPI、IEEE、Nature）时使用；做内容抽取、注入新模板、批量修正格式并编译排错，产出可零错误编译的目标格式 .tex 与 PDF；不适用于撰写论文内容、从零排版或处理非 LaTeX 文稿。触发词：LaTeX 转格式、期刊模板移植、MDPI、IEEE、pdflatex、单双栏转换
domain: 文书/writing
triggers: [LaTeX 转格式, 期刊模板移植, 论文格式转换, MDPI, IEEE, Springer, Nature, IPOL, pdflatex, bibtex, 单双栏转换, 投稿模板, tex 模板适配, documentclass]
tags: [文书, writing, 学术写作, latex, 期刊模板, 格式转换, 投稿, 编译排错]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, pdflatex, bibtex, ripgrep]
requires: []
related: [academic-paper-writer, scientific-manuscript-writing, academic-paper-explainer, citation-management]
combines_with: [academic-paper-writer, citation-management, academic-peer-reviewer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# LaTeX 论文格式转换

## 何时使用

把一篇已写好的 LaTeX 论文从某出版社模板移植到另一出版社模板时使用。不同期刊（Springer、MDPI、IEEE、Nature 等）在 `documentclass`、栏数、页边距、浮动体、参考文献样式上差异很大，本技能用「抽取 → 注入 → 批量修正 → 编译排错」的结构化流程自动化这一重复劳动。典型触发：

- 用户要求把现有 `.tex` 改投到新期刊格式，并提供了源文件 + 目标模板目录。
- 明确说从格式 A（如 IPOL / Neural Processing）转到格式 B（如 MDPI）。

不该用的边界：

- 撰写或扩写论文内容、做学术润色（属写作类技能，本技能只搬运与适配格式）。
- 从零排版、非 LaTeX 文稿（Word/Markdown）转换。
- 源文件、目标模板目录、栏数/参考文献样式等结构映射缺失时，应先停下向用户确认，而非臆造。
- 输出不能替代真实编译验证与专家评审。

## 步骤

1. 前置评估：确认**源 LaTeX 文件**，向用户索取**目标模板目录**。厘清核心布局映射——单栏 vs 双栏、参考文献样式（natbib/biblatex/数字式）、abstract 与 keywords 是否需合并。
2. 写抽取+注入脚本：**务必写 Python 脚本**（如 `convert_format.py`），用正则抽取正文核心块（introduction 到 conclusion），再把目标模板的 `preamble` + 抽取的 `body` + `backmatter` 合并，写入输出目录的新文件。**严禁手工复制粘贴数千行 LaTeX**。
3. 系统化修正（写最终文件前或后续轮次）：
   - 数学环境名大小写适配（如 `\begin{theorem}` → `\begin{Theorem}`）。
   - 收敛激进的浮动体放置参数（`[!t]`、`[h!]`）为模板支持的选项；**未显式加载 `float` 包时不要强行用 `[H]`**。
   - 确保 `\includegraphics` 路径相对于新 `.tex` 文件位置正确。
   - 转双栏时把 `\begin{tabular}` 改为 `\begin{tabularx}{\textwidth}` 或用 `\resizebox` 包裹。
4. 编译与排错：跑构建循环 `pdflatex → bibtex → pdflatex`。用 `rg`/`grep` 扫 `.log` 系统性修正包冲突、未定义命令、编译中断，直到零错误。

## 指令

构建循环（双跑 pdflatex 以解析交叉引用）：

```bash
pdflatex -interaction=nonstopmode Paper.tex
bibtex Paper
pdflatex -interaction=nonstopmode Paper.tex
pdflatex -interaction=nonstopmode Paper.tex
```

扫日志定位问题：

```bash
# 未定义控制序列 / 缺包
rg -n "Undefined control sequence|LaTeX Error|! Package" Paper.log
# 溢出盒子（双栏表格常见）
rg -n "Overfull \\\\hbox" Paper.log
```

常见映射与修正速查：

- 缺数学包 → 在 preamble 补 `\usepackage{amsmath}`（不要假设新模板自带）。
- 双栏溢出表格 → `\resizebox{\columnwidth}{!}{ ... }` 包裹 `tabular`，或改用 `tabularx`。
- 浮动体过度强制 → `[!t]`/`[h!]` 降级为 `[tbp]`；`[H]` 仅在已加载 `float` 时使用。
- 图片找不到 → 校正 `\includegraphics` 相对路径，或设 `\graphicspath{{figures/}}`。

## 示例

把 IPOL 论文转为 MDPI：

```
用户：把我的论文 SAHQR_Paper.tex 转成 MDPI_template_ACS 文件夹里的 MDPI 格式。
Agent：
1. 分析源 SAHQR_Paper.tex 与目标 template.tex，确认布局映射（双栏、biblatex）。
2. 写 convert_format.py，正则抽取 Introduction 到 Conclusion。
3. 把抽取内容注入 MDPI 模板 preamble/backmatter 之间。
4. 修正图片路径、表格浮动参数，按需补 \usepackage{amsmath}。
5. 跑 pdflatex + bibtex，扫 .log 确认零错误并产出 PDF。
```

## 注意事项

- 永远写抽取脚本，不要手工搬运正文；正则抽取边界要覆盖 `\section`/`\appendix`/`\bibliography` 等锚点。
- 务必实际编译并核对 `.log`：未编译通过的转换等于没完成。
- 源与目标结构差异大时（如合并 abstract/keywords、改参考文献样式），显式向用户确认映射规则。
- 不要假设新模板自带所有数学/图表包，缺啥补啥。
- 检查 `bibtex` 的 `.blg` 日志，参考文献样式不匹配会静默丢条目。
- 转换产物需在目标期刊真实环境/Overleaf 上复验，本技能不替代投稿前的人工审阅。
- 参考：Overleaf 官方文档 https://www.overleaf.com/learn 。

## 互见

- related：`academic-paper-writer` —— 负责撰写/扩写论文内容，本技能只做已成稿的格式移植。
- related：`academic-peer-reviewer` —— 投稿前的同行评审视角，可在格式转换后核查规范性。
- combines_with：`citation-management` —— 切换期刊常需改参考文献样式，配合它生成符合目标投稿要求的 BibTeX 与校验。
- combines_with：`scientific-manuscript-writing` —— 从写作到投稿的完整链路，本技能补上「换模板」一环。

---

采编自 sickn33/antigravity-awesome-skills（MIT License）。
