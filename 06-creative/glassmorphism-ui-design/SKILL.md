---
name: glassmorphism-ui-design
title: 玻璃拟态与空间感 UI 设计
description: 当需要构建悬浮、空间纵深、玻璃拟态的高交互 Web 界面（仪表盘/落地页/沉浸式产品页）时使用；基于 React/Next + Tailwind + GSAP ScrollTrigger + R3F/CSS 3D 产出可复用动效组件与设计规范；不适用于常规扁平 UI、表单密集型后台或低端设备/弱网首屏。触发词：玻璃拟态、glassmorphism、空间感动效
domain: 创意/design
triggers: [玻璃拟态, glassmorphism, 空间感 UI, GSAP 滚动动效, ScrollTrigger, 3D CSS 变换, 悬浮卡片, 等距网格, 视差滚动, 沉浸式落地页, React Three Fiber, backdrop-filter 毛玻璃]
tags: [创意/design, 前端, ui设计, 动效, 玻璃拟态, gsap, 3d-css, react]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [React/Next.js, Tailwind CSS, GSAP + ScrollTrigger, React Three Fiber, CSS 3D Transforms]
requires: []
related: [animejs-web-animation, design-spells-microinteractions, threejs-3d-web, frontend-design]
combines_with: [threejs-3d-web, tailwind-css-patterns, theme-factory]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 要构建强交互、有空间纵深、悬浮失重感、玻璃拟态质感的 Web 界面：仪表盘、落地页、沉浸式产品展示页。
- 设计方向需要依赖 GSAP、3D CSS 变换或 React 三维呈现，而非传统扁平 UI。
- 需要一套明确的视觉与动效规范来统一「失重 / 空间感」风格。

不该用的边界：
- 常规扁平 UI、表单密集型后台、信息表格类页面——动效与 3D 反而增加噪音。
- 性能敏感场景（低端设备、弱网首屏、需要极致 LCP）——重动效/毛玻璃/3D 渲染开销大。
- 无障碍优先且无法提供降级方案时，不要强上动效。
- 任务范围不清、缺少成功标准或权限时，先停下确认，不要凭空发挥。

## 步骤

1. 定技术栈（除非另有要求，默认如下）：
   - 框架 React / Next.js
   - 样式 Tailwind CSS（布局与工具类）+ 自定义 CSS（处理复杂 3D 变换）
   - 动画 GSAP（GreenSock）+ ScrollTrigger（滚动联动）
   - 3D React Three Fiber（R3F）或 CSS 3D 变换（rotateX / rotateY / perspective）
2. 按四条设计原则搭骨架：失重悬浮、空间纵深、玻璃拟态、等距吸附（见下方指令）。
3. 落动效规则：状态切换不瞬切、克制的滚动劫持、错峰入场、视差。
4. 过执行约束：组件模块化、reduced-motion 降级、GPU 提速与性能守则。
5. 自检无障碍与性能后交付，附组件用法说明。

## 指令

设计原则（「失重」气质）：
- 失重感：卡片与元素像漂浮。用分层、柔和、扩散的投影，如 `box-shadow: 0 20px 40px rgba(0,0,0,0.05)`。
- 空间纵深：用 Z 轴分层，背景要「深」，前景元素借 `perspective` 凸出。
- 玻璃拟态：微透明 + 背景模糊 + 半透明描边，营造高级玻璃质感，如 `backdrop-filter: blur(12px)`。
- 等距吸附：仪表盘 / 卡片网格用 3D 变换倾成等距视角，如 `transform: rotateX(60deg) rotateZ(-45deg)`。

动效规则：
- 绝不瞬切：所有 hover / focus / active 状态变化都要平滑过渡，至少 `0.3s ease-out`。
- 克制的滚动劫持：用 GSAP ScrollTrigger 让元素随滚动从 Y 轴带轻微旋转浮入视野。
- 错峰入场：卡片网格加载时不要同时出现，按 `0.1s` 错峰，像多米诺骨牌依次落下。
- 视差：背景元素滚动时比前景慢，强化 3D 错觉。

## 示例

玻璃卡片 + 悬浮投影（Tailwind + 自定义 CSS）：

```css
.glass-card {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease-out;
}
```

等距网格容器：

```css
.iso-grid {
  perspective: 1200px;
  transform: rotateX(60deg) rotateZ(-45deg);
}
```

GSAP 错峰浮入：

```js
gsap.from(".card", {
  scrollTrigger: { trigger: ".grid", start: "top 80%" },
  y: 60, rotateX: -8, opacity: 0,
  duration: 0.6, ease: "power2.out", stagger: 0.1,
});
```

## 注意事项

- 组件务必模块化、可复用。
- 对 `prefers-reduced-motion: reduce` 用户全量关闭动画：

```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

- 性能优先：动效元素加 `will-change: transform`，把渲染交给 GPU；不要持续动画 `box-shadow`、`filter` 等昂贵属性。
- 别把产出当作环境内验证、测试或专家评审的替代；交付前在目标环境实测。

## 互见

- 创意/design 域内其他视觉与动效技能。
- 前端性能与无障碍相关技能（reduced-motion、GPU 合成层、LCP 优化）。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
