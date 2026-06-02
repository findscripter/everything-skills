---
name: algorithmic-art
title: 算法艺术：用 p5.js 生成可探索的生成式艺术
description: 当用户想用代码创作生成式/算法艺术（流场、粒子系统、噪声、Voronoi 等）并要可交互调参与种子复现时使用；产出一份算法理念 .md 加一个自包含、带种子导航与参数控件的 p5.js 交互 HTML 作品；不适用于位图修图、复刻某位在世艺术家风格或常规网页/数据可视化开发；触发词：算法艺术、生成艺术、generative art、algorithmic art、流场、flow field、粒子系统、particle system、p5.js、noise、Voronoi
domain: 创意/image
triggers: [算法艺术, 生成艺术, generative art, algorithmic art, 流场, flow field, 粒子系统, particle system, p5.js, noise, Voronoi, 用代码画画]
tags: [generative-art, creative, image, p5js, javascript, seeded-random, interactive, html-artifact]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [p5.js, HTML, JavaScript, Canvas]
requires: []
related: [glsl-shader-programming, canvas-design, d3js-data-viz, threejs-3d-web]
combines_with: [theme-factory, web-artifacts-builder]
license: Apache-2.0
source: anthropics/skills
source_license: Apache-2.0
---
## 何时使用

适用：
- 用户想「用代码创作艺术」「生成式/算法艺术」，指名流场、粒子系统、噪声场、递归分形、圆形堆叠、Voronoi 镶嵌等算法美学。
- 需要参数可调、可换种子复现、能在浏览器或 claude.ai artifact 里直接运行的交互作品。

不该用：
- 编辑/修饰已有位图照片、做常规图标或 UI 设计（用 canvas-design）。
- 复刻某位（尤其在世）艺术家的具体作品或风格——存在版权风险。务必创作**原创**算法美学，而非临摹。
- 普通网页开发或商业数据可视化。

核心原则：**美在过程，不在单帧**。做的是「活的算法」，相同种子永远产出相同结果（Art Blocks 模式）。

## 步骤

分两个阶段：先立「算法理念」，再用 p5.js 表达。

1. 解读意图：用户想要什么美学？从原始请求里提炼一条**隐性概念种子**——巧妙、内敛地织入参数与行为中，懂的人能会心一笑，不懂的人也只见一件精致的生成作品，不要直白点题。
2. 写算法理念（输出 .md，4–6 段）：给运动起个 1–2 字名字（如「Organic Turbulence」「Quantum Harmonics」）；阐述它如何通过计算过程、噪声函数、粒子行为、场动力学、时间演化、参数变化与涌现复杂度来体现。每个要点只讲一次、不重复堆砌；反复强调成品须「精雕细琢、经无数次迭代打磨、出自计算美学顶尖高手之手」。给下一步留出高水准的实现发挥空间。
3. 读模板再写代码（关键）：动手前先用 Read 读 `templates/viewer.html`，把它当作**字面起点**而非灵感参考。保留所有固定区，只替换可变区。
4. 用 p5.js 实现算法，让代码表达理念（而非从「图案菜单」里挑一个）。所有随机必须**带种子**。
5. 设计参数并配 UI 控件：从「这个系统有哪些可调的性质」出发（数量/尺度/概率/比例/角度/阈值），而不是从「图案类型」出发。

### 固定 vs 可变（来自 viewer.html 注释）

- 固定（原样保留）：整体布局（头部/侧栏/画布区）、Anthropic 品牌（Poppins/Lora 字体、浅色背景、渐变、品牌色）、侧栏「Seed 区」（种子显示 + 上一个/下一个/随机/跳转）、「Actions 区」（Regenerate / Reset / Download PNG）。
- 可变（每件作品自定义）：整个 p5.js 算法（setup/draw/类）、参数对象、「Parameters 区」控件（数量、命名、滑块 min/max/step）、可选「Colors 区」色板选择器（按作品需要决定要不要、是否单色）。

不要：从零写 HTML、自创配色或字体、改侧栏结构、套用深色主题、原样照抄流场示例。

### 工艺要求

平衡（繁而不乱、序而不僵）、和谐配色（精选调色板而非随机 RGB）、构图层次（随机中保持视觉流动）、性能（动画争取 60fps）、可复现（同种子必同输出）。

## 示例

种子复现（每件作品必做）：

```javascript
function initializeSeed(seed) {
  randomSeed(seed);
  noiseSeed(seed);
  // 此后所有 random()/noise() 调用都确定可复现
}
```

参数集中管理 + 画布生命周期：

```javascript
let params = {
  seed: 12345,                 // 始终包含 seed
  // colorPalette 用数组，自选品牌色：['#d97757','#6a9bcc','#788c5d','#b0aea5']
  // 按你的算法补充：数量 / 尺度 / 概率 / 比例 / 角度 / 阈值
};

function setup() {
  createCanvas(1200, 1200);    // 模板默认 800×800，成品建议 1200×1200
  initializeSeed(params.seed);
  // 初始化系统：粒子数组 / 网格 / 初始位置
  // 静态作品在末尾 noLoop()；动画则让 draw() 持续运行
}
function draw() { /* 你的生成算法 */ }
```

自包含 HTML 作品骨架（一切内联，仅 p5.js 走 CDN）：

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js"></script>
  <!-- Poppins / Lora 字体；Anthropic 品牌色与渐变背景，全部内联 -->
</head>
<body>
  <!-- 侧栏：Seed(固定) → Parameters(可变) → Colors(可选) → Actions(固定) -->
  <!-- 主区：画布容器 -->
  <script>/* 全部 p5.js：params、类、setup/draw、UI 处理器，内联 */</script>
</body>
</html>
```

参数滑块控件（每个参数一组，实时更新）：

```html
<div class="control-group">
  <label>Parameter Name</label>
  <input type="range" id="param" min="..." max="..." step="..."
         value="..." oninput="updateParam('param', this.value)">
  <span class="value-display" id="param-value">...</span>
</div>
```

导出 PNG：`saveCanvas('generative-art-' + params.seed, 'png')`。

## 注意事项

- 最终交付两样东西：算法理念（.md/文本）+ 单个自包含 HTML 作品；算法直接内联进 HTML，不另建 .js 文件。
- `templates/generator_template.js` 只是结构与最佳实践参考（参数组织、seeded 随机、类结构、缓动/噪声工具函数），不是图案菜单。
- 种子导航必须可用：显示当前种子、上一个/下一个/随机/跳转输入；用户要 100 个变体时用种子 1–100。
- Regenerate / Reset / Download PNG 三个按钮必须真正生效。
- 品牌仅约束 UI（字体、配色、布局），不约束艺术本身的颜色。
- 版权红线：只做原创算法美学，不复制现有艺术家作品。
- 本技能为 Apache-2.0 源（含 LICENSE.txt）转写，保留其技术约束。

## 互见

- canvas-design：需要做平面/UI 设计、海报或图标，而非生成式算法艺术时改用它。
- web-artifacts-builder：把这件交互作品扩展成更完整的网页应用时配合使用。
- theme-factory / brand-guidelines：需要统一配色与品牌规范时参考。
