---
name: canvas-design
title: 画布设计（Canvas Design）：用设计哲学驱动的海报与静态艺术品
description: 当用户要做海报/封面/艺术海报/静态视觉作品并希望导出 PNG/PDF 时使用；做法是先写一份"设计哲学"再据此在画布上表达，产出 .md 哲学文档 + 单页 .png/.pdf 成品；不适用于网页/前端 UI、品牌规范体系、代码生成式算法艺术或多页文档排版；触发词：海报、poster、视觉艺术、art、平面设计、design、封面、艺术品、PNG、PDF
domain: 创意/design
triggers: [海报, poster, 视觉艺术, art, 平面设计, design, 封面, 艺术品, PNG, PDF]
tags: [canvas-design, poster, graphic-design, visual-art, png, pdf, typography, design-philosophy]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Python, matplotlib, Pillow, reportlab, TTF 字体（canvas-fonts）]
requires: []
related: [algorithmic-art, theme-factory, brand-guidelines, ui-design-system-builder]
combines_with: [brand-guidelines, theme-factory]
license: Apache-2.0
source: anthropics/skills
source_license: Apache-2.0
---
## 何时使用

适用：用户要做**单页静态视觉作品**——海报、艺术海报、封面、展览级平面设计、抽象艺术品，并希望导出为 `.png` 或 `.pdf`。核心思路是"90% 视觉、10% 必要文字"，信息靠形态/空间/色彩/构图表达，而非段落文字。

不该用（负边界）：
- 网页 / 前端 UI / 可交互界面 → 用 `frontend-design` 或 `web-artifacts-builder`。
- 品牌色板、Logo 规范、字体系统等**规范体系**文档 → 用 `brand-guidelines`。
- 纯代码/数学生成的程序化艺术（粒子、分形、参数化图形）→ 用 `algorithmic-art`。
- 多页正文排版、报告、需大量文字的文档 → 这不是本技能目标（本技能文字极简）。
- 临摹/复刻在世或知名艺术家作品 → 禁止，只做**原创**设计以避免版权问题。

## 步骤

分两大阶段，最后一定要做一次精修。

1. **写"设计哲学"（输出 .md）**：把用户输入当作灵感地基而非束缚，提炼出一个**美学运动**而非模板。
   - 命名运动（1-2 词，如"野兽派的喜悦""色彩静默""代谢主义之梦"）。
   - 用 4-6 段精炼文字阐述哲学，逐一覆盖：空间与形态、色彩与材质、尺度与节奏、构图与平衡、视觉层级。
   - 每个维度只讲一次，避免重复。
   - **反复强调工艺感**：成品须显得"耗费无数工时、精雕细琢、出自领域顶尖大师之手"——多次使用"meticulously crafted / 大师级执行 / 极致专注"这类措辞。
   - 保持方向具体但留出解读空间；哲学保持通用，不绑定具体题材。

2. **推演潜在的隐喻线索**：从原始请求里找出一条**微妙、niche 的概念线索**，把它当作作品的"灵魂 DNA"隐性织入形态/色彩/构图。像爵士乐手引用另一首曲子——懂的人会心一笑，不懂的人也只觉是杰出抽象作品。不要直白announce主题。

3. **在画布上表达（输出 .png 或 .pdf）**：用哲学做地基，做**单页、强视觉、设计优先**的成品。
   - 善用重复图案、规整形状、层叠纹理——靠耐心重复积累意义、值得反复观看。
   - 借用"系统化观察"的视觉语言：临床式稀疏排印 + 系统化参考标记，仿佛某门虚构学科的图谱。
   - 文字始终极简、视觉优先；由语境决定是"耳语级标签"还是"粗体排印手势"（朋克场地海报可更大更激进，极简陶艺工作室标识则克制）。多数情况字重偏细。
   - **绝对约束**：任何文字/图形都不得出血出界、不得重叠，每个元素都在画布边界内且留有合理边距与呼吸感。这是专业执行的底线。
   - **字体**：写文字时使用不同字体，从随源附带的 `canvas-fonts/` 目录里检索 TTF（含 IBMPlexMono、JetBrainsMono、CrimsonPro、Lora、WorkSans、Italiana、Boldonse、Silkscreen 等）。让排版成为艺术的一部分；抽象作品就把字"画"上画布，而非数字化排版。按需下载所需字体。

4. **精修（最后一步，不可省略）**：默认用户会说"还不够完美，必须是博物馆级的工艺杰作"。精修时**不要新增图形**——而是让既有构图更紧致、更统一、更脆生。当你想新画一个形状或换滤镜时，先停下问："怎样能让画面里已有的东西更像一件艺术品？"回到代码再打磨一遍。

5. **多页（仅当被要求）**：把首页当作一本咖啡桌画册的第一页，后续页沿同一哲学但各具新意、有品味地串成故事，打包进同一 PDF 或多个 PNG。

## 指令

- 仅输出 `.md`（设计哲学）+ `.png`/`.pdf`（成品）；默认单页。
- 即便是电影/游戏/书籍主题，也要做得 sophisticated，绝不卡通化或业余。
- 用受限、克制、有意图的色板，保证整体凝聚。
- 交付前逐项自检：无重叠、无出界、间距/对齐/字体/配色全部精确。

## 示例

哲学片段（"Chromatic Language / 色彩语言"）：以色彩为主要信息系统——几何精确，色块分区即是含义；排版极简，小号无衬线标签让色域说话；如 Josef Albers 的色彩交互遇上数据可视化；文字只为锚定色彩已表达之物。这是经过反复推敲色彩校准的产物。

其他可参考的运动命名方向："Concrete Poetry（混凝土诗）""Analog Meditation（模拟冥想）""Organic Systems（有机系统）""Geometric Silence（几何静默）"。实际写作时每条应扩展为 4-6 段实质内容。

## 注意事项

- 只做原创，绝不临摹具体艺术家作品（版权红线）。
- "工艺感"要在哲学文档里被**反复**强调——这是区分"大师手作"与"AI 生成"的关键。
- 文字永远是配角：稀疏、必要、作为视觉元素整合，绝不写成解释性段落。
- 字体务必从 `canvas-fonts/` 检索并真正嵌入/渲染，不要默认系统字体。
- 不重叠、不出界是非可协商的硬约束，交付前务必复检。

## 互见

- 程序化/参数化生成的艺术 → `algorithmic-art`。
- 品牌色板与视觉规范体系 → `brand-guidelines`。
- 网页 UI 与可交互界面 → `frontend-design`、`web-artifacts-builder`。
- 主题/配色风格批量生成 → `theme-factory`。
