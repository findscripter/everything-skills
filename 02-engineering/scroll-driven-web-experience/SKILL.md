---
name: scroll-driven-web-experience
title: 滚动驱动沉浸式网页体验
description: 当需要把网页做成「随滚动展开的叙事/电影感」体验（视差、滚动动画、Pin 钉住、横向滚动、进度揭示）时使用；产出滚动驱动的页面方案与可运行代码（GSAP ScrollTrigger / Framer Motion / CSS scroll-timeline），含 60fps 性能、移动端与无障碍兜底；不适用于普通静态页排版、纯 3D/WebGL（转 3d-web-experience）、框架级实现（转 frontend）；触发词：滚动动画、视差、滚动叙事
domain: 研发/frontend
triggers: [滚动动画, 视差, parallax, 滚动叙事, scroll storytelling, 交互式故事, 电影感网页, 沉浸式网页, ScrollTrigger, Pin 钉住, 横向滚动, 滚动揭示, scroll-timeline]
tags: [前端, 网页动画, 滚动交互, GSAP, Framer-Motion, 视差, 性能优化, 无障碍, CSS]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [GSAP ScrollTrigger, Framer Motion, Lenis, Locomotive Scroll, CSS scroll-timeline, Chrome DevTools]
requires: []
related: [animejs-web-animation, threejs-3d-web, magic-motion-animator, design-spells-microinteractions]
combines_with: [frontend-design, web-artifacts-builder, tailwind-css-patterns]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当你要把页面从「能读」升级为「随手指滚动展开的电影/叙事体验」时使用，典型场景：视差讲故事、滚动触发的揭示与进度条、Pin 钉住区块、横向滚动面板、产品功能逐帧走查、Before/After 对比。把滚动当成叙事装置而非单纯导航。

不该用的边界：
- 普通静态页面排版、表单、后台列表 —— 加滚动特效只会拖慢且增加无障碍风险。
- 涉及 3D / WebGL / three.js / Spline 的场景 —— 转 `3d-web-experience`。
- 需要框架级落地（React/Vue/Next 工程结构、状态、路由）—— 转 `frontend`。
- 纯视觉设计 / 设计稿 —— 转 `ui-design`；专项性能压榨 —— 转 `performance-hunter`。

## 步骤 / 指令

1. 先定叙事节拍（story beats），再写动画。推荐五段式：钩子（满屏视觉）→ 背景铺垫 → 旅程（视差）→ 高潮（戏剧化揭示）→ 收尾（CTA/结论）。
2. 选库：复杂动画用 GSAP ScrollTrigger（学习曲线中）；React 项目用 Framer Motion（低）；只要平滑滚动用 Lenis（低）；平滑滚动+视差用 Locomotive Scroll（中）；简单原生场景用 CSS `scroll-timeline`（低）。
3. 内容优先（Progressive Enhancement）：先保证无 JS 时内容可读、首屏即见核心信息与 CTA；动画只做增强。文本进 DOM 而非 canvas，保留标题层级与 SEO。
4. 实现动画：只动 `transform` 和 `opacity`，目标 60fps。
5. 移动端降级：检测后减少视差强度/图层数，低端可禁用。
6. 无障碍兜底：尊重 `prefers-reduced-motion`，不要劫持滚动（用 `scrub` 跟随而非 hijack），保留键盘可达与跳转链接。
7. 用 GSAP `markers: true` 与 Chrome DevTools Performance 面板调试，录制滚动找红帧、开 Paint flashing，并在真机/限频 CPU 上验证。

## 示例

GSAP ScrollTrigger 基础（scrub 把动画绑定到滚动位置）：
```javascript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

gsap.to('.element', {
  scrollTrigger: { trigger: '.element', start: 'top center', end: 'bottom center', scrub: true },
  y: -100, opacity: 1,
});
```

视差分层（背景慢、前景快，制造景深）：背景 0.2x、中景 0.5x、前景/正文 1.0x、漂浮元素 1.2x。
```javascript
gsap.to('.background', { scrollTrigger: { scrub: true }, y: '-20%' }); // 慢
gsap.to('.foreground', { scrollTrigger: { scrub: true }, y: '-50%' }); // 快
```

Pin 钉住 + 横向滚动面板：
```javascript
const sections = gsap.utils.toArray('.panel');
gsap.to(sections, {
  xPercent: -100 * (sections.length - 1), ease: 'none',
  scrollTrigger: {
    trigger: '.horizontal-container', pin: true, scrub: 1,
    end: () => '+=' + document.querySelector('.horizontal-container').offsetWidth,
  },
});
```

Framer Motion 滚动视差：
```jsx
import { motion, useScroll, useTransform } from 'framer-motion';
function ParallaxSection() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  return <motion.div style={{ y }}>Content moves with scroll</motion.div>;
}
```

CSS 原生（无 JS、移动端更稳）：
```css
.animate-on-scroll {
  animation: reveal linear;
  animation-timeline: view();
  animation-range: entry 0% cover 40%;
}
@supports (animation-timeline: scroll()) {
  .parallax { animation: parallax linear; animation-timeline: scroll(); }
}
```

CSS Sticky 钉住（容器留出滚动空间）：
```css
.sticky-container { height: 300vh; }
.sticky-element { position: sticky; top: 0; height: 100vh; }
```

## 注意事项

- **只动 transform / opacity / filter / clip-path**；避免动 width/height、top/left、margin/padding、font-size —— 这些触发 layout 造成卡顿。
- **60fps 是底线**，滚动卡顿等于体验崩坏。`will-change: transform` 与 `transform: translateZ(0)` 可强制 GPU 层，但 `will-change` 要少用。
- **节流滚动事件**：原生 scroll 监听必须用 `requestAnimationFrame` 配 `ticking` 标志位；GSAP ScrollTrigger 已自动处理，优先用它。
```javascript
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) { requestAnimationFrame(() => { heavyFunction(); ticking = false; }); ticking = true; }
});
```
- **必须支持 reduced motion**（高优先级无障碍项）：
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
JS 侧用 `window.matchMedia('(prefers-reduced-motion: reduce)').matches` 决定是否初始化动画。
- **移动端视差易碎**：iOS 动量滚动会冲突。用宽度判断 `window.innerWidth < 768` 比 UA 嗅探更可靠；iOS 加 `-webkit-overflow-scrolling: touch` 与图层的 `translate3d(0,0,0)` / `backface-visibility: hidden`。
- **不要劫持滚动**：让用户自然滚动，用 `scrub` 跟随；保留始终可见的导航、跳转到内容链接、明确退出点。
- **重区块懒加载**：`ScrollTrigger.create({ trigger, onEnter: initHeavyAnimation, onLeave: destroyHeavyAnimation })`，离开视口即销毁。
- 校验清单：缺 reduced-motion 支持（高）、未节流滚动（中）、动了 layout 属性（中）、检测到滚动劫持（中）、缺 will-change（低）。

## 互见

- `3d-web-experience`：滚动中嵌入 3D / WebGL 元素。
- `frontend`：React/Vue/Next 框架级实现。
- `ui-design` / `landing-page-design`：视觉设计与落地页结构。
- `performance-hunter`：专项性能优化。
- 组合工作流（沉浸式产品页）：设计产品故事结构 → 建 3D 模型 → 搭滚动揭示 → 加转化点 → 性能优化。

---
采编自 sickn33/antigravity-awesome-skills（源条目 scroll-experience，上游 vibeship-spawner-skills，Apache 2.0；MIT）。
