---
name: html-animated-slides
title: 动画 HTML 演示文稿生成
description: 当要从零创建或把 PPT/PPTX 转成纯前端、富动画、零依赖的单文件 HTML 幻灯片，且每页严格满屏（100vh）适配时使用；做的事是按内容与风格生成内联 CSS/JS、可键盘/滑动翻页、可选浏览器内编辑的自包含 .html 演示文稿；不适用于产出 .pptx 原生文件、需要框架/构建工具的工程，或普通网页/长文档；触发词：HTML幻灯片、网页PPT、演示文稿、slide deck、PPT转网页、满屏适配、reveal动画
domain: 文书/office
triggers: [HTML幻灯片, 网页PPT, 演示文稿, slide deck, PPT转网页, pptx转HTML, 满屏适配, 动画幻灯片, reveal动画, 浏览器内编辑幻灯片]
tags: [html, css, javascript, presentation, slide-deck, animation, viewport, pptx-conversion, zero-dependency]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [html, css, javascript, python-pptx]
requires: []
related: [python-pptx-deck-generator, pptx-document-processing, web-artifacts-builder, html-dashboard-builder]
combines_with: [theme-factory, animejs-web-animation]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# 动画 HTML 演示文稿生成

## 何时使用

需要一份**纯前端、零依赖、富动画**的单文件 HTML 演示文稿，且每页要**严格满屏不滚动**时使用。三种典型场景：

- **新建**：从主题/大纲/内容从零生成一套 deck（路演、教学、大会演讲、内部汇报）。
- **转换**：把已有 `.ppt` / `.pptx` 转成网页版幻灯片。
- **增强**：在既有 HTML 演示上加页/改内容/调动画。

不该用的边界：

- 要产出**原生 `.pptx` 文件**（而非 HTML）—— 改用 `python-pptx-deck-generator` 或 `pptx-document-processing`。
- 需要 **npm / 构建工具 / 前端框架**的工程化演示 —— 本技能坚持零依赖单文件，不引入 React/Vite 等。
- 做的是**普通网页或长文档**（需要滚动、非逐页满屏）—— 用 `frontend-design` / `web-artifacts-builder`。

## 步骤 / 指令

**Phase 0 · 判模式**：先确定是「新建 / PPT 转换 / 增强」。增强模式按下方修改规则，转换走 Phase 4。

**核心原则（贯穿全程）**：
1. **零依赖** —— 单个 HTML，CSS/JS 全内联；不用 npm、不用构建。
2. **Show, don't tell** —— 给可见预览而非抽象描述，让用户看着选。
3. **避免「AI 味」** —— 不要 Inter/Roboto/Arial/系统字体、不要白底紫渐变这类套路；字体取 Fontshare/Google Fonts 的独特款，配色用 CSS 变量保持一致，主色 + 利落点缀胜过平均分布的怯懦调色板。
4. **满屏适配（不可妥协）** —— 每页必须正好填满 `100vh`，**永不**页内滚动；内容超了就**拆成多页**，绝不硬塞。

**Phase 1 · 新建：内容发现**。在**一次** AskUserQuestion 里问全：用途（路演/教学/大会/内部）、篇幅（短 5-10 / 中 10-20 / 长 20+）、内容就绪度（齐备/草记/仅主题）、是否需要**浏览器内编辑**（决定 Phase 3 是否注入编辑代码）。若有图片素材：逐张用 Read 查看（多模态）→ 评估可用/不可用 → 围绕图文**共同设计**大纲（如 3 张截图 → 3 个功能页）→ 确认。

**Phase 2 · 风格发现（show, don't tell）**。先问情绪基调（Impressed/Excited/Calm/Inspired，可多选 ≤2），据此生成 **3 个单页 HTML 预览**（展示排版/配色/动画/整体气质），存到 `.claude-design/slide-previews/`（`style-a.html`/`-b`/`-c`，各约 50-100 行），自动打开供选；支持「混搭」。

**Phase 3 · 生成全篇**。用 Phase 1 的内容 + Phase 2 的风格生成完整 deck：
- 单个自包含 HTML，CSS/JS 全内联；
- 在 `<style>` 中**完整内联** `viewport-base.css`（满屏适配的强制底座）；
- 用 Fontshare/Google Fonts，**绝不用系统字体**；
- 每段加 `/* === SECTION NAME === */` 注释块。

**Phase 4 · PPT 转换**：
```
pip install python-pptx
python scripts/extract-pptx.py <input.pptx> <output_dir>
```
抽取后向用户确认标题/内容/图片数 → 走 Phase 2 选风格 → 转成目标风格 HTML，**保留全部文字、图片（来自 assets/）、页序、演讲备注（作为 HTML 注释）**。

**Phase 5 · 交付**：删掉 `.claude-design/slide-previews/` → 用系统命令在浏览器打开 → 告知文件位置/风格名/页数、翻页方式（方向键/空格/滚动/滑动/导航点）、定制点（`:root` 改色、字体链接改排版、`.reveal` 改动画）；若启用了编辑：悬停左上角或按 `E` 进编辑、点文字即改、`Ctrl+S` 保存。

## 示例

**满屏适配硬规则（每页都要满足）**：

- `.slide { height: 100vh; height: 100dvh; overflow: hidden; }`
- 所有字号/间距用 `clamp(min, preferred, max)`，**绝不**用固定 px/rem。
- 内容容器加 `max-height` 约束；图片 `max-height: min(50vh, 400px)`。
- 必须含高度断点 700px / 600px / 500px，并支持 `prefers-reduced-motion`。
- **绝不直接对 CSS 函数取负**（`-clamp()`/`-min()`/`-max()` 会被静默忽略），改用 `calc(-1 * clamp(...))`。

**单页内容密度上限**（超了就拆页）：

| 页型 | 上限 |
|---|---|
| 标题页 | 1 主标题 + 1 副标题 +（可选）标语 |
| 内容页 | 1 标题 + 4-6 要点 或 1 标题 + 2 段 |
| 功能网格 | 1 标题 + 最多 6 卡（2×3 / 3×2） |
| 代码页 | 1 标题 + 8-10 行代码 |
| 引言页 | 1 句引言（≤3 行）+ 出处 |
| 图片页 | 1 标题 + 1 图（≤60vh 高） |

**增强模式修改规则**（满屏是最大风险）：改前先数现有元素对照密度上限；加图必须带 `max-height: min(50vh, 400px)`，满了就移到新页；加文超 4-6 要点就拆续页；任何改动后复核 `.slide` 有 `overflow: hidden`、新元素用 `clamp()`、图片有视口相对 max-height、在 1280×720 下不溢出；预判会溢出就**主动**拆页并告知用户。

## 注意事项

- **满屏不可妥协**：宁可拆页也不缩字到不可读、不开页内滚动。
- **拒绝 AI 套路审美**：刻意在明暗、字体、气质间变化；连你自己都爱收敛到的「安全选项」（如总是 Space Grotesk）要刻意避开。
- **风格预览要自包含**：每个预览单文件、约 50-100 行、只展示一张带动画的标题页。
- **转换保真**：PPT 转换务必保留文字、图片、页序、演讲备注，别丢内容、别擅自重写。
- **动画优先纯 CSS**：聚焦高光时刻——一次编排良好的入场（`animation-delay` 错峰揭示）比一堆零散微交互更出彩；务必带 `prefers-reduced-motion` 降级。
- 转换脚本依赖 `python-pptx`，仅在你掌控的环境（本地 venv）安装；输出目录选安全路径，避免无确认覆盖。

## 互见

- related：`frontend-design` —— 当产物是可滚动的普通网页/应用界面而非满屏逐页幻灯片时改用它。
- related：`animejs-web-animation` —— 想要超出纯 CSS 的复杂时间线动画时参考。
- combines_with：`pptx-document-processing` —— 先用它解析/抽取已有 `.pptx` 内容，再交本技能转成网页 deck。
- combines_with：`theme-factory` —— 先产出一套配色/字体主题，再注入本技能的 `:root` 变量统一风格。
- combines_with：`python-pptx-deck-generator` —— 当最终需要原生 `.pptx` 而非 HTML 时改走它。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
