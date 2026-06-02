---
name: glsl-shader-programming
title: GLSL 着色器编程：写顶点/片元着色器与常见视觉特效
description: 当在 WebGL/Three.js/游戏引擎里写 GLSL 着色器、做后处理特效或 GPU 程序化纹理与几何时使用；产出可用的顶点/片元着色器代码与 uniform 接线、特效实现及黑屏排查清单；不适用于美术建模贴图、固定管线/无 shader 流程或非 GPU 的 CPU 图像处理；触发词：GLSL、着色器、shader、片元着色器、fragment shader、WebGL、Three.js、uniform、raymarching、SDF、后处理
domain: 创意/av
triggers: [GLSL, 着色器, shader, 片元着色器, fragment shader, 顶点着色器, vertex shader, WebGL, Three.js, uniform, varying, swizzling, raymarching, SDF, 后处理, post-processing]
tags: [glsl, shader, webgl, threejs, fragment-shader, vertex-shader, raymarching, sdf, gpu, visual-effects, creative, av]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [GLSL, WebGL, Three.js, GPU]
requires: []
related: [threejs-3d-web, algorithmic-art, unity-game-developer, unreal-engine-cpp]
combines_with: [threejs-3d-web, unity-game-developer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 在 WebGL、Three.js 或游戏引擎里写自定义着色器，做自定义视觉特效。
- 实现后处理（模糊、bloom、色彩校正等）。
- 在 GPU 上程序化生成纹理或几何（噪声、SDF、raymarching）。
- 优化图形渲染性能，把逐像素计算搬到 GPU。

不该用：
- 美术建模、贴图绘制等 DCC 工具流程——这是着色器代码，不是美术资产。
- 固定管线渲染或不写 shader 的引擎配置。
- 纯 CPU 端的图像处理（用对应的图像/数据技能）。

判据：任务核心是「写 GLSL 代码并把 CPU 数据接进 GPU」时用本技能。

## 步骤

1. 分清两类着色器与各自职责：
   - 顶点着色器：把 3D 坐标变换到屏幕空间，写出 `gl_Position`，逐顶点执行。
   - 片元着色器：决定每个像素颜色，写出 `gl_FragColor`（或现代 GLSL 的 `out` 变量），逐片元执行。
2. 接好数据通道：
   - `uniform`：CPU 传入、对所有顶点/片元恒定的数据（矩阵、时间、分辨率、颜色）。
   - `attribute`：逐顶点输入（位置、UV、法线）。
   - `varying`：顶点着色器输出、插值后传给片元着色器的数据（如 UV）。
3. 用 swizzling 和向量运算组织颜色/坐标：`color.rgb`、`color.zyx`（重排）等任意取分量。
4. 优先用 GPU 友好的内建函数替代手写分支：`mix()` 做线性插值、`step()`/`smoothstep()` 做阈值与软边，避免 `if`。
5. 调试黑屏：按「注意事项」的排查清单逐项核对。

## 示例

最小顶点 + 片元着色器：

```glsl
// 顶点着色器
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

```glsl
// 片元着色器
uniform vec3 color;
void main() {
    gl_FragColor = vec4(color, 1.0);
}
```

用 varying 把 UV 传下去并画渐变：

```glsl
varying vec2 vUv;
// 顶点着色器
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
// 片元着色器
void main() {
    gl_FragColor = vec4(vUv.x, vUv.y, 1.0, 1.0); // 基于 UV 的渐变
}
```

Raymarching 画一个 SDF 球（Shadertoy 风格 `mainImage`）：

```glsl
float sdSphere(vec3 p, float s) {
    return length(p) - s;
}
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
    vec3 ro = vec3(0.0, 0.0, -3.0);          // 射线起点
    vec3 rd = normalize(vec3(uv, 1.0));      // 射线方向
    float t = 0.0;
    for (int i = 0; i < 64; i++) {
        vec3 p = ro + rd * t;
        float d = sdSphere(p, 1.0);          // 球半径 1.0
        if (d < 0.001) break;
        t += d;
    }
    vec3 col = vec3(0.0);
    if (t < 10.0) {
        vec3 p = ro + rd * t;
        vec3 normal = normalize(p);
        col = normal * 0.5 + 0.5;            // 用法线上色
    }
    fragColor = vec4(col, 1.0);
}
```

## 注意事项

性能与写法（GPU 并行友好）：
- 用 `mix()` 做线性插值，别手写公式。
- 用 `step()`/`smoothstep()` 做阈值与软边，规避分支。
- 把数据打包进向量（`vec4`）减少访存。
- 循环内尽量避免重分支 `if-else`，它伤害 GPU 并行。
- 不在着色器里反复计算常量，常量提前在 CPU 算好用 uniform 传入。

黑屏排查清单（编译通过但屏幕全黑）：
- 检查 `gl_Position.w` 是否正确（通常为 1.0）。
- 确认宿主程序确实从 CPU 设置了用到的 uniform。
- 验证 UV 是否落在 [0, 1] 区间。

约束：本技能只覆盖着色器代码层面，不替代具体引擎的环境验证、渲染管线配置与真机测试；缺少必要输入（目标平台、坐标约定、GLSL 版本）时先确认再写。

## 互见

- related：`algorithmic-art` —— 同属 GPU/程序化视觉创作，用代码生成美学。
- related：`canvas-design` —— 不需要 GPU shader、只做平面/UI 设计时改用它。
- combines_with：`d3js-data-viz`、`animejs-web-animation` —— 把着色器特效嵌入网页交互/数据可视化时配合使用。

---

采编自 sickn33/antigravity-awesome-skills（MIT），原技能 `shader-programming-glsl`，本条目为中文适配重写，保留其关键代码、内建函数约束与黑屏排查要点。
