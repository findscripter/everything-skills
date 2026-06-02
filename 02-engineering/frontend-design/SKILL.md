---
name: frontend-design
title: 前端设计
description: 当需要构建有强烈设计感的前端界面（组件、页面、落地页、仪表盘、海报、Web 应用）并产出可运行代码时使用；做：先定一个大胆且统一的美学方向，再实现排版/配色/动效/布局精雕细琢的生产级前端代码；不适用于纯后端逻辑、数据建模、无视觉诉求的脚本，或仅需中性默认样式的内部工具；触发词：前端设计、做个页面、落地页、landing page、UI、美化界面、React 组件、HTML/CSS、仪表盘、dashboard、网页、海报
domain: 研发/frontend
triggers: [前端设计, 做个页面, 落地页, landing page, UI, 美化界面, React 组件, HTML/CSS, 仪表盘, dashboard, 网页, 海报]
tags: [frontend, ui, design, css, react, animation, typography]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [HTML/CSS/JS, React, Vue, Motion, CSS variables]
requires: []
related: [brand-guidelines, theme-factory, canvas-design, web-artifacts-builder, webapp-testing]
combines_with: [webapp-testing]
license: Apache-2.0
source: anthropics/skills
source_license: Apache-2.0
---
## 何时使用

- 用户要构建或美化有视觉诉求的前端：组件、页面、落地页、仪表盘、海报、Web 应用，且希望成品有辨识度、避免「一眼 AI 味」的通用审美。
- 需要一次性产出可运行、可交付的前端代码（HTML/CSS/JS、React、Vue 等），而不只是给布局建议。
- 触发词：前端设计、做个页面、落地页、landing page、UI、美化界面、React 组件、HTML/CSS、仪表盘、dashboard、网页、海报。

不该用的边界：

- 纯后端/数据/算法逻辑、构建脚本、CLI，没有界面诉求 → 不属于本技能。
- 已有明确品牌规范（色板/字体/Logo 约束）要落地或抽取 → 配合 `brand-guidelines`；要做可切换主题系统 → 配合 `theme-factory`。
- 纯静态图形/插画/SVG 生成（非交互界面）→ 用 `canvas-design`。
- 写完后要在浏览器里跑测试、验交互/可访问性 → 交给 `webapp-testing`。
- 用户明确只要中性、默认、最朴素的内部工具样式，不追求设计感时，按需克制，不要强行炫技。

## 步骤 / 指令

```
1. 定方向（动手前必做）—— 不要一上来就写代码
   - 目的：这个界面解决什么问题、给谁用？
   - 基调：选一个「极端」并贯彻到底，例如
     极简 / 极繁 / 复古未来 / 自然有机 / 奢华精致 / 玩具感 /
     杂志编辑风 / 粗野主义 / 装饰艺术几何 / 柔和马卡龙 / 工业实用。
     仅作灵感，最终要为本场景量身设计，不照抄。
   - 约束：框架、性能、可访问性等技术要求。
   - 差异化：让人记住的「那一个点」是什么？

2. 锚定一致的概念方向并精确执行
   —— 大胆极繁和克制极简都成立，关键是「有意图」，不是「堆强度」。

3. 写出真正可运行的代码（HTML/CSS/JS / React / Vue …），同时满足：
   生产可用且功能完整、视觉强烈且令人记住、风格统一有明确观点、每处细节都打磨过。

4. 按五个维度精修（见下）。

5. 复杂度匹配愿景：极繁方向就上丰富动效与图层；
   极简/精致方向就靠留白、间距、字体与微妙细节的克制取胜。
```

五个美学维度（精修清单）：

```
排版 Typography
  - 选有个性、好看、独特的字体；显示字体（display）+ 正文字体（body）搭配。
  - 禁用通用脸：Arial、Inter、Roboto、系统默认字体。

配色与主题 Color & Theme
  - 锁定统一基调，用 CSS variables 管理。
  - 主色 + 锐利点缀色，强于平均分布的「胆小」配色。

动效 Motion
  - HTML 优先纯 CSS；React 在可用时用 Motion 库。
  - 聚焦高光时刻：一次编排良好、用 animation-delay 错峰入场的加载动画，
    胜过零散的微交互。善用滚动触发与出人意料的 hover 态。

空间构图 Spatial Composition
  - 不落俗套的布局：非对称、重叠、对角流动、打破网格的元素；
    要么大方留白，要么受控密集。

背景与视觉细节 Backgrounds & Details
  - 用氛围和层次替代纯色填充：渐变网格、噪点纹理、几何图案、
    叠层透明、戏剧性阴影、装饰边框、自定义光标、颗粒叠加。
```

硬性规则：

- 绝不用通用 AI 审美：滥用字体（Inter/Roboto/Arial/系统字体）、套路配色（尤其白底紫色渐变）、可预测的布局与组件套路、缺乏场景特征的模板感设计。
- 每次产出都应不同：在明暗主题、字体、整体美学间变化，不要每次都收敛到同一选择（例如总用 Space Grotesk）。
- 复杂度服从愿景，优雅来自「把方向执行到位」，而非强度。

## 示例

最小启动提示词：

```
为「<场景/受众/约束>」做一个前端 <组件/落地页/仪表盘>。
先用一句话锁定一个大胆的美学方向（例：杂志编辑风深色主题），
再产出可直接运行的 <HTML+CSS / React> 代码。
要求：display+body 双字体搭配、CSS 变量管色、一次错峰入场加载动画、
非对称构图、有氛围背景。禁用 Inter/Roboto/Arial 与白底紫渐变。
```

配色用 CSS 变量统一管理：

```css
:root {
  --bg: #0e0e10;
  --fg: #f5f3ec;
  --accent: #ff5c38;      /* 锐利点缀色 */
  --muted: #8a877e;
}
```

错峰入场（纯 CSS，HTML 优先）：

```css
.reveal { opacity: 0; transform: translateY(16px); animation: in .6s ease forwards; }
.reveal:nth-child(1) { animation-delay: .05s; }
.reveal:nth-child(2) { animation-delay: .15s; }
.reveal:nth-child(3) { animation-delay: .25s; }
@keyframes in { to { opacity: 1; transform: none; } }
```

React 动效优先用 Motion 库（可用时），而非手写大量 keyframes。

## 注意事项

- 先定方向、后写代码：跳过「定基调/差异化」直接动手，几乎必然产出模板感界面。
- 一次只贯彻一个清晰方向，不要在同一界面里混搭多种互斥风格。
- 字体是辨识度的第一来源：务必避开 Inter/Roboto/Arial/系统默认；显示字体要有性格。
- 警惕默认陷阱：白底紫色渐变、居中三栏卡片、千篇一律的圆角阴影，都是「AI slop」信号。
- 可访问性别丢：再炫的视觉也要保证对比度、焦点态、语义结构、键盘可达。
- 性能与复杂度匹配：极简方向别堆无意义动效；极繁方向的动效也要可控、不卡顿。
- 跨多次生成要主动求变（明暗、字体、构图），不要每次收敛到同一套「安全」选择。

## 互见

- requires：无。
- related：`brand-guidelines`（已有品牌色板/字体/Logo 约束时先取规范再落地）、`theme-factory`（需要可切换的主题/设计 token 系统）、`canvas-design`（纯静态图形/SVG 而非交互界面）、`web-artifacts-builder`（构建可分发的 Web 工件/artifact）、`webapp-testing`（成品在浏览器里验交互与可访问性）。
- combines_with：`webapp-testing`（设计实现后接测试，形成「构建—验证」闭环）。
