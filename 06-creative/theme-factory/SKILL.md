---
name: theme-factory
title: 主题工厂：为内容产物套用配色与字体主题
description: 当需要给幻灯片/文档/HTML 落地页等产物套用统一的配色与字体主题时使用；做的是从 10 套预设主题中选用或现场生成自定义主题，并将其色板与字体一致地应用到产物；不适用于从零做品牌视觉规范或纯插画生成；触发词：主题、配色、换肤、theme、套主题、配色方案、字体搭配、风格化、style deck、color palette
domain: 创意/design
triggers: [主题, 配色, 换肤, theme, 套主题, 配色方案, 字体搭配, 风格化, style deck, color palette]
tags: [theme, design, color-palette, typography, slides, branding, styling, artifact]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [theme-showcase.pdf, themes/*.md, HTML/CSS]
requires: []
related: [brand-guidelines, ui-design-system-builder, canvas-design]
combines_with: [brand-guidelines, python-pptx-deck-generator, web-artifacts-builder]
license: Apache-2.0
source: anthropics/skills
source_license: Apache-2.0
---
## 何时使用

- 已经有一份产物（幻灯片、文档、报告、HTML 落地页等），想给它套上一致、专业的配色与字体主题。
- 用户给出风格描述（如"科技感""自然清新""暗黑高级"），希望据此选主题或现场生成一个新主题。
- 需要在一组产物间保持统一视觉身份（同一套色板 + 字体配对）。

不该用的边界：
- 不用于从零搭建完整品牌视觉规范（VI 手册、logo 体系）——那属于品牌指南类工作，见 brand-guidelines。
- 不用于纯插画/生成式美术创作，见 algorithmic-art。
- 本技能只负责"主题的选择与应用"，不负责产物本身的内容创作与排版结构。

## 步骤

1. 展示主题样例。把 `theme-showcase.pdf` 原样呈现给用户预览全部 10 套主题，不要修改该文件，仅供查看。
2. 询问选择。让用户明确指定要套用哪一套主题。
3. 等待确认。拿到对所选主题的明确确认后再动手，不要擅自替用户决定。
4. 应用主题。读取 `themes/` 目录下对应主题文件，把其中的色板（hex）与字体配对一致地应用到整个产物。
5. 校验可读性。确保对比度足够、文字清晰，并在所有页面/区块间保持同一视觉身份。

指令：
- 预设主题文件位于 `themes/` 目录，文件结构固定为：标题 + 简介 + `## Color Palette`（带 hex 码的命名色）+ `## Typography`（Headers / Body Text 字体）+ `## Best Used For`（适用场景）。
- 应用时严格采用主题文件中的 hex 值与字体名，不要自行替换近似色或字体。

10 套预设主题（按场景速查）：
- Ocean Depths 海洋深处：沉稳冷静的海事风，适合企业演示、财报、咨询、信任感内容。
- Sunset Boulevard 日落大道：温暖明快的落日色。
- Forest Canopy 林冠：自然踏实的大地色。
- Modern Minimalist 现代极简：干净当代的灰阶。
- Golden Hour 黄金时刻：浓郁温暖的秋日色。
- Arctic Frost 极地冰霜：冷冽清爽的冬季风。
- Desert Rose 沙漠玫瑰：柔和高级的灰调。
- Tech Innovation 科技创新：高对比、现代的科技美学，适合科技初创、软件发布、AI/ML、数字化转型。
- Botanical Garden 植物园：清新有机的花园色。
- Midnight Galaxy 午夜星河：戏剧性的深紫宇宙色，适合娱乐、游戏、夜场、奢侈品、创意机构。

## 示例

主题文件的典型内容（Ocean Depths 海洋深处）：

```
## Color Palette
- Deep Navy: #1a2332  - 主背景色
- Teal:      #2d8b8b  - 强调/高亮
- Seafoam:   #a8dadc  - 浅色次强调
- Cream:     #f1faee  - 文字与浅背景

## Typography
- Headers:   DejaVu Sans Bold
- Body Text: DejaVu Sans
```

应用到 HTML/CSS 时即把这些 hex 映射为背景、强调、文字等变量，标题用 Headers 字体、正文用 Body Text 字体。

自定义主题（现有 10 套都不合适时）：
1. 依据用户提供的描述生成一套新主题，结构与预设主题一致。
2. 取一个能描述其配色/字体含义的主题名。
3. 先展示新主题供用户审阅确认。
4. 确认后再按上述"应用主题"流程套用。

## 注意事项

- `theme-showcase.pdf` 只读：仅展示，绝不在预览阶段改动它。
- 必须先拿到用户的明确主题选择再应用，不要跳过确认环节。
- 保持一致性：同一产物内所有页面/区块沿用同一套色板与字体，不要混搭。
- 始终检查对比度与可读性，深色背景配浅色文字、浅色背景配深色文字。
- 源技能为 Apache-2.0，字体多为 DejaVu Sans / FreeSans 等开源字体，落地时确认目标环境可用对应字体或提供回退。

## 互见

- brand-guidelines：当需要的是完整品牌规范而非单次套主题时。
- algorithmic-art：当需求是生成式美术/图形本身时。
- canvas-design：在画布/版面设计中应用主题色与字体。
- frontend-design：把主题落到前端页面与组件样式时。
