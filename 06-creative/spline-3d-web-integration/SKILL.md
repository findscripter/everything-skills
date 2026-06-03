---
name: spline-3d-web-integration
title: Spline 3D 集成：交互式 3D 场景嵌入网页
description: 当需要把 Spline.design 制作的交互式 3D 场景嵌入网页（原生 HTML/JS、React、Next.js、Vue 或 iframe）时使用；做技术栈选型、获取 .splinecode 场景 URL、运行时控制 API 接入并产出可运行嵌入代码；不适用于用 three.js/GLSL 手写 3D、纯静态图片或后端逻辑。触发词：Spline、splinecode、spline-viewer、react-spline、3D 场景嵌入
domain: 创意/design
triggers: [Spline, spline.design, splinecode, spline-viewer, react-spline, @splinetool/runtime, 3D 场景嵌入, 交互式 3D, 网页 3D 背景, vue-spline]
tags: [3D, Spline, 前端, React, Next.js, Vue, 交互设计, 创意, WebGL]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Spline, @splinetool/react-spline, @splinetool/runtime, @splinetool/vue-spline, JavaScript, React]
requires: []
related: [threejs-3d-web, glsl-shader-programming, scroll-driven-web-experience, animejs-web-animation]
combines_with: [high-end-visual-design, web-artifacts-builder, frontend-design]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
将 [Spline.design](https://spline.design)（浏览器内的 3D 设计工具，可理解为「3D 版 Figma」）制作的交互式 3D 场景嵌入网页。设计师在 Spline 编辑器里搭建对象、材质、动画、物理与事件，导出为托管的 `.splinecode` URL，本技能负责选对集成路径、接好运行时控制并产出沉浸式、有 wow 效果的高端 UI。

## 何时使用

适用场景：

- 需要把一个交互式 Spline 场景嵌入网页（英雄区背景、产品展示、互动元素）。
- 需要在原生 Web、React、Next.js、Vue 或 iframe（Webflow、Notion 等）中选对集成路径。
- 需要场景 URL 获取、运行时对象/相机控制、性能与移动端优化，或排查常见嵌入问题的指导。

不该用边界（负边界）：

- 用 three.js / GLSL 从零手写 3D 几何与着色器（应转 `threejs-3d-web` / `glsl-shader-programming`），本技能只做「嵌入既有 Spline 场景」。
- 一张静态图/视频或简单 CSS 就能满足，无需 3D 运行时。
- 纯后端、数据处理等与 3D 视觉无关的任务。
- 缺少场景文件、目标框架或成功标准时，先停下来澄清再动手。

## 步骤

1. **识别技术栈（STEP 1）**：先看项目文件判定框架，按下表选集成方式——
   | 技术栈 | 方式 |
   | --- | --- |
   | 原生 HTML/JS | `<spline-viewer>` Web Component，或 `@splinetool/runtime` |
   | React / Vite | `@splinetool/react-spline` |
   | Next.js | `@splinetool/react-spline/next` |
   | Vue | `@splinetool/vue-spline` |
   | iframe（Webflow、Notion 等） | 公开 URL iframe |

2. **获取场景 URL（STEP 2）**：让用户在 Spline 编辑器 → **Export** → **Code Export** 复制 `prod.spline.design` 链接：
   ```
   https://prod.spline.design/XXXXXXXXXXXXXXXX/scene.splinecode
   ```
   复制前提醒用户检查 **Play Settings**（URL 不会自动更新，改动后必须重新生成）：
   - 站点为深色/自定义背景时，开启 **Hide Background**。
   - 付费计划可开启 **Hide Spline Logo**。
   - **Geometry Quality** 设为 **Performance** 以加快加载。
   - 不需要时关闭 **Page Scroll**、**Zoom**、**Pan**，降低滚动/缩放被「劫持」的风险。
   - 任何设置改动后，点击 **Generate Draft** 或 **Promote to Production** 让 URL 生效。

3. **按需求接入运行时**：静态展示直接渲染；需交互则监听场景事件、用 runtime API 控制对象与相机（见示例）。

## 指令

- **创意硬性要求**：用本技能构建现代、有创意、视觉惊艳的 UI/UX，不要做平庸、安全、套路化的样式；把 Spline 场景与排版、布局结合，做出高沉浸的 premium 体验。
- **加载兜底**：3D 资源较大，务必为加载阶段提供 fallback（占位图/骨架/降级背景），避免白屏。
- **完成前自检**：集成收尾前过一遍常见坑（背景透明、滚动劫持、移动端性能、SSR 下的懒加载），这些问题往往只在生产环境暴露。

## 示例

原生 HTML/JS —— Web Component 最小嵌入：

```html
<script type="module" src="https://unpkg.com/@splinetool/viewer/build/spline-viewer.js"></script>
<spline-viewer url="https://prod.spline.design/XXXXXXXXXXXXXXXX/scene.splinecode"></spline-viewer>
```

React / Next.js —— 懒加载包装并带加载兜底（Next.js 改用 `@splinetool/react-spline/next`）：

```tsx
import { Suspense, lazy } from "react";
const Spline = lazy(() => import("@splinetool/react-spline"));

export default function Hero() {
  return (
    <Suspense fallback={<div className="hero-fallback" />}>
      <Spline
        scene="https://prod.spline.design/XXXXXXXXXXXXXXXX/scene.splinecode"
        onLoad={(app) => {
          // 运行时控制：app.findObjectByName(...) / 设置相机 / 触发事件
        }}
      />
    </Suspense>
  );
}
```

要点：`lazy` + `Suspense` 避免 3D 包阻塞首屏；`onLoad` 回调拿到 Spline 应用实例后即可做对象查找、相机与事件的运行时控制。

## 注意事项

- 性能：移动端慎用高几何精度，优先在 Play Settings 选 Performance，并实测真机帧率与加载时长。
- 背景透明：站点背景为深色/自定义时务必开 **Hide Background**，否则场景会盖上一层默认底色。
- 交互劫持：不需要时关闭 Page Scroll / Zoom / Pan，避免抢占页面滚动与缩放手势。
- SSR：Next.js 等服务端渲染场景用 `/next` 入口或客户端懒加载，避免在服务端引用 WebGL。
- 输出代码不能替代具体环境的验证、测试与专家评审；缺少必要输入或成功标准时先澄清再继续。

## 互见

- related：`threejs-3d-web` —— 需手写 3D 而非嵌入既有场景时转用；`glsl-shader-programming`、`high-end-visual-design`、`animejs-web-animation`、`glassmorphism-ui-design`。
- requires：`frontend-design` —— 先有前端工程与组件基础，再做 3D 嵌入更顺。
- combines_with：`web-artifacts-builder`、`tailwind-css-patterns` —— 与页面搭建/样式体系组合，落地完整的沉浸式落地页。

---
采编自 [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills)（MIT License）。
