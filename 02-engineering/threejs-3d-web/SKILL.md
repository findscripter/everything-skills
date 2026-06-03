---
name: threejs-3d-web
title: Three.js 网页 3D 体验开发
description: 当为网页构建交互式 3D 场景、产品配置器、沉浸式作品集或滚动驱动 3D 时使用；做技术选型(Spline/R3F/Three.js)、模型优化、性能调优并产出可运行的 3D 网页代码与降级方案；不适用于纯 3D 游戏引擎(Babylon/Unity)或后端/CAD 建模。触发词：Three.js、React Three Fiber、WebGL、Spline、3D 网站、产品配置器
domain: 研发/frontend
triggers: [Three.js, React Three Fiber, R3F, WebGL, Spline, 3D 网站, 网页 3D, 产品配置器, GLTF/GLB, 滚动驱动 3D, GLSL shader, 沉浸式作品集]
tags: [frontend, 3d, three.js, react three fiber, webgl, 性能优化, 可视化, spline]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Three.js, @react-three/fiber, @react-three/drei, @splinetool/react-spline, gltf-transform, GSAP/ScrollTrigger, Blender]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

为网页带来「第三维度」：交互式 3D 场景、产品配置器、3D 作品集、沉浸式落地页、滚动驱动的 3D 动画。核心心法是「在 3D 真能增强体验时才用，而非炫技」，并始终在视觉冲击与性能、可用性之间取得平衡。

适用：网页内嵌 3D、Three.js / React Three Fiber (R3F) / Spline / WebGL / GLSL、3D 模型(GLB)集成与优化、滚动联动相机/模型。

不该用（负边界）：
- 重度 3D 游戏或物理沙盒 —— 用 Babylon.js / Unity / Godot，而非本技能。
- 后端 3D 渲染、CAD 精密建模、影视级离线渲染。
- 任务与 3D 无关，或仅需 2D 图表/动画（用对应前端可视化技能）。
- 缺少模型资产、目标设备、成功标准等必要输入时，先停下来澄清。

## 步骤

1. 技术选型：按下表与决策树选栈。
   - 快速原型/设计师友好 → Spline
   - React 应用/复杂场景 → React Three Fiber
   - 极致控制/非 React → Three.js 原生
   - 游戏/重度 3D → Babylon.js（超出本技能）

   | 工具 | 适合 | 学习曲线 | 控制力 |
   |------|------|---------|--------|
   | Spline | 快速原型、设计师 | 低 | 中 |
   | React Three Fiber | React、复杂场景 | 中 | 高 |
   | Three.js 原生 | 极致控制、非 React | 高 | 最高 |
   | Babylon.js | 游戏、重度 3D | 高 | 最高 |

2. 准备模型管线：Blender 建模 → 降面(网页 < 100K 面) → 烘焙贴图合并材质 → 导出 GLB → Draco + WebP 压缩 → 校验体积(理想 < 5MB)。格式优先 GLB/GLTF（体积最小），其次 OBJ；USDZ 用于 Apple AR。

3. 搭建场景：R3F 用 `<Canvas>` + `<Suspense>` + `useGLTF` 加载，加上灯光与 `OrbitControls`；Spline 直接嵌 `<Spline scene=.../>`。

4. 加交互/滚动：用 `ScrollControls` + `useScroll` + `useFrame` 联动，或 Three.js + GSAP `ScrollTrigger` 驱动相机。

5. 性能与降级：见「注意事项」，必须配 loading UI 与 WebGL 不支持时的静态图兜底。

## 指令

```bash
# 安装 gltf-transform 并压缩模型（Draco 几何压缩 + WebP 贴图压缩）
npm install -g @gltf-transform/cli
gltf-transform optimize input.glb output.glb \
  --compress draco \
  --texture-compress webp
```

## 示例

Spline（最快上手）：
```jsx
import Spline from '@splinetool/react-spline';
export default function Scene() {
  return <Spline scene="https://prod.spline.design/xxx/scene.splinecode" />;
}
```

R3F 加载模型 + loading 指示器（务必用 Suspense）：
```jsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, useProgress, Html } from '@react-three/drei';
import { Suspense } from 'react';

function Model() {
  const { scene } = useGLTF('/model.glb');
  return <primitive object={scene} />;
}
function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress.toFixed(0)}%</Html>;
}
export default function Scene() {
  return (
    <Canvas>
      <ambientLight />
      <Suspense fallback={<Loader />}>
        <Model />
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
}
```

滚动驱动（R3F ScrollControls）：
```jsx
import { ScrollControls, useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

function RotatingModel() {
  const scroll = useScroll();
  const ref = useRef();
  useFrame(() => { ref.current.rotation.y = scroll.offset * Math.PI * 2; });
  return <mesh ref={ref}>...</mesh>;
}
// <Canvas><ScrollControls pages={3}><RotatingModel /></ScrollControls></Canvas>
```

GSAP + Three.js 相机随滚动移动：
```javascript
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
gsap.to(camera.position, {
  scrollTrigger: { trigger: '.section', scrub: true },
  z: 5, y: 2,
});
```

移动端降配 + WebGL 兜底：
```jsx
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
// <Canvas dpr={isMobile ? 1 : 2} performance={{ min: 0.5 }} />
// 无 WebGL 时返回 <img src="/fallback.png" alt="3D preview" />
```

## 注意事项

性能目标（始终优化，3D 很贵）：

| 设备 | 目标帧率 | 最大三角面 |
|------|---------|-----------|
| 桌面 | 60fps | 500K |
| 移动 | 30-60fps | 100K |
| 低端 | 30fps | 50K |

提速要点：重复物体用 Instances；灯光尽量少（一个 ambientLight + 一个 directionalLight）；用 LOD 分级；模型懒加载。

常见校验项（落地前自查）：
- 【高】3D 内容必须有 loading 指示器：用 `<Suspense>` fallback 或 `useProgress`。
- 【中】必须有 WebGL 兜底：检测 WebGL 支持，不支持时回退静态图。
- 【中】模型必须压缩：用 gltf-transform Draco + 贴图压缩，否则体积过大。
- 【中】OrbitControls 勿吞滚动：设 `enableZoom={false}` 或妥善处理 scroll/touch 事件。
- 【中】移动端 DPR 勿过高：移动端限制 `dpr={1}`。

通用约束：本技能产出不替代环境内的真实测试与专家评审；输入、权限、安全边界或成功标准缺失时，先停下询问。

## 互见

- 滚动动画/视差/GSAP → 滚动体验技能。
- React/Next/前端集成 → frontend 技能。
- 帧率慢/性能瓶颈 → 性能优化技能。
- 带 3D 的产品落地页/营销页 → 落地页设计技能。
- 配套工作流：产品配置器（建模→R3F 场景→颜色/变体交互→接入产品页→移动端优化→兜底图）、沉浸式作品集（场景概念→Spline/R3F 搭建→滚动动画→接入作品集→移动端兜底→性能优化）。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
