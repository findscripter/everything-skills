---
name: animejs-web-animation
title: Anime.js 高性能网页动画
description: 当用 JavaScript 编排复杂、高保真网页动画（时间线、交错、SVG 路径）时使用；产出基于 Anime.js 的可运行动画代码与编排方案；不适用于一行 CSS transition 能搞定的简单过渡或后端逻辑。触发词：Anime.js、时间线动画、stagger 交错、SVG 路径动画、落地页编排
domain: 创意/design
triggers: [Anime.js, animejs, 网页动画, 时间线动画, anime.timeline, stagger 交错, 交错动画, SVG 路径动画, 落地页动画编排, spring 缓动, 高保真交互动效]
tags: [动画, 前端, anime.js, javascript, svg, 交互设计, 创意]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Anime.js, JavaScript, CSS, SVG]
requires: []
related: [design-spells-microinteractions, glassmorphism-ui-design, threejs-3d-web, frontend-design]
combines_with: [web-artifacts-builder, tailwind-css-patterns, frontend-design]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
采用 [Anime.js](https://animejs.com/)（轻量但强大的 JavaScript 动画引擎）构建远超普通 CSS 过渡的高保真网页动效，擅长复杂时间线、交错（stagger）以及对 DOM、CSS、SVG 的精确控制，适合奖项级别的交互站点。

## 何时使用

适用于以下场景：

- 落地页多阶段编排：英雄区文案、图片、模块依次入场的复杂出场动画。
- 交错揭示：网格、文本逐字、数据可视化的 stagger 错峰显现。
- SVG 路径动画：形状变形（morph）、动态描线绘制。
- 高交互动效：随用户输入流畅响应的动力学 UI 元素。

不该用边界（负边界）：

- 一行 CSS `transition` / `transition: opacity .2s` 就能解决的简单悬停、显隐过渡，无需引入动画引擎。
- 纯后端、数据处理或与视觉动效无关的任务。
- 任务范围不明、缺少目标元素或成功标准时，先停下来澄清，再动手。

## 步骤

1. **锁定目标（Identify Targets）**：选定要动画的 DOM 元素或 SVG，确定 `targets` 选择器。
2. **定义属性与缓动（Properties & Easing）**：指定要动画的数值。关键：优先使用高级缓动（自定义 `cubicBezier`、`spring`、`elastic`），避免 `linear` 或基础 `ease-in-out`，让运动显得高级、自然。
3. **编排时间线（Orchestrate Timelines）**：用 `anime.timeline()` 串联复杂编舞，掌握时间线偏移——相对偏移 `'-=200'`（提前 200ms 与上一段重叠）对比绝对偏移，制造无缝交叠的运动节奏。
4. **实现（Implement）**：落地为可运行代码（见下方示例）。

## 指令

- **创意硬性要求**：用本技能构建现代、富有创意、视觉惊艳的 UI/UX，不要堆砌平庸、无聊的过渡——每个动画都应显得定制、流畅、打磨到位。
- **交错（Staggering）**：大量使用 `anime.stagger()`，为多元素注入有机的节奏感。
- **性能（Performance）**：监控主线程占用；在合适处对元素设置 `will-change: transform, opacity` 以启用 GPU 加速。

## 示例

英雄区文案交错上移淡入，图片随后缩放淡入并与文案重叠 800ms：

```javascript
const tl = anime.timeline({
  easing: "spring(1, 80, 10, 0)",
  duration: 1000,
});
tl.add({
  targets: ".hero-text",
  translateY: [50, 0],
  opacity: [0, 1],
  delay: anime.stagger(100),
}).add(
  { targets: ".hero-image", scale: [0.9, 1], opacity: [0, 1] },
  "-=800",
);
```

要点：`spring(1, 80, 10, 0)` 让整体运动带弹性质感；`anime.stagger(100)` 使 `.hero-text` 多元素以 100ms 步进错峰入场；`"-=800"` 让图片动画相对前一段提前 800ms，形成重叠编排。

## 注意事项

- 仅在任务确实落在上述范围内时使用本技能，避免为简单需求过度设计。
- 输出代码不能替代具体环境下的验证、测试与专家评审，务必在目标浏览器/设备实测。
- 缺少必要输入、权限、安全边界或成功标准时，先停下来询问澄清，再继续。
- `will-change` 应按需、节制使用，长期挂在大量元素上反而消耗内存、损害性能。

## 互见

- 创意/设计域内其他动效、SVG、交互相关技能可配合使用。
- 简单显隐/悬停优先用原生 CSS transition；本技能聚焦复杂编排与高保真动力学。

---
采编自 [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills)（MIT License）。
