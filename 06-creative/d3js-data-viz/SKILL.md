---
name: d3js-data-viz
title: D3.js 交互式数据可视化
description: 当需要用 D3.js 构建自定义、交互式、出版级数据可视化（网络图、地理投影、弦图、热力图、力导向图等标准图表库做不出的图形）时使用；做绑定数据到 DOM、用比例尺/坐标轴/形状生成器渲染 SVG 并加上过渡、缩放、提示框等交互；不适用于 3D（改用 Three.js）或现成图表库够用的简单图。触发词：D3.js、数据可视化、力导向图
domain: 创意/design
triggers: [D3.js, d3, 数据可视化, 交互式图表, 力导向图, 弦图, 热力图, SVG 图表, 比例尺, 坐标轴, 缩放平移, 网络图, 可视化]
tags: [d3js, 数据可视化, 前端, svg, 交互, 图表, javascript, 创意]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [JavaScript, D3.js v7, SVG, Canvas, ResizeObserver]
requires: []
related: [threejs-3d-web, algorithmic-art, plotly-interactive-viz, matplotlib-visualization]
combines_with: [web-artifacts-builder, data-storyteller, kpi-dashboard-design]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

用 D3.js（Data-Driven Documents）把数据绑定到 DOM 元素、做数据驱动的变换，生成对每个视觉元素都可精细控制的自定义、出版级可视化。技术不限框架，可用于原生 JS、React、Vue、Svelte 等。

适合用 D3.js：
- 需要独特视觉编码或布局的自定义图形
- 复杂的平移、缩放、刷选（brush）交互
- 网络/图可视化：力导向布局、树图、层级图、弦图
- 自定义投影的地理可视化
- 需要平滑、编排化过渡动画
- 出版级、精细样式控制的图形
- 标准图表库没有的新颖图表类型

不该用（边界）：
- 3D 可视化 -> 改用 Three.js
- 简单的标准图（基础柱/折线/饼），现成图表库（Chart.js、ECharts 等）够用且更省事时，不必上 D3
- 缺少明确输入、数据格式或成功标准时，先停下来问清楚，不要硬画

## 步骤

1. 引入 D3。模块化：`import * as d3 from 'd3';`；或 CDN（7.x）：`<script src="https://d3js.org/d3.v7.min.js"></script>`。所有模块（比例尺、坐标轴、形状、过渡等）都挂在 `d3` 命名空间下。

2. 选集成模式。
   - 模式 A（多数情况推荐）：直接 DOM 操作，用 `d3.select(...)` 命令式选取并操作元素，适配任何环境，配合过渡/交互/D3 全部能力。
   - 模式 B（带模板的框架）：只用 D3 算数据（比例尺、布局），元素由框架声明式渲染（React 的 `.map` -> `<rect>`、Vue 的 `v-for`）。简单图或框架偏好声明式时用它。

3. 用标准结构组织绘图函数（见下方「指令」骨架）：先空值校验并清空旧渲染 -> 定义尺寸与 margin -> 建带 margin 偏移的主 `g` 分组 -> 建比例尺 -> 建并 append 坐标轴 -> 用 `.data().join()` 绑定数据生成视觉元素。

4. 做响应式。用 `window` 的 `resize` 监听或 `ResizeObserver` 监听容器尺寸，重算 `getBoundingClientRect()` 后重绘；并返回清理函数（移除监听/`observer.disconnect()`），组件卸载时调用。

5. 加交互与动画：提示框（tooltip）、缩放平移（`d3.zoom`）、点击、过渡（`.transition()`）。

## 指令

标准绘图骨架（数据变化时调用）：

```javascript
function drawVisualization(data) {
  if (!data || data.length === 0) return;            // 1. 空值校验

  const svg = d3.select('#chart');
  svg.selectAll("*").remove();                        // 2. 清空旧渲染

  const width = 800, height = 400;
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const g = svg.append("g")                           // 3. 带 margin 的主分组
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.x)]).range([0, innerWidth]);
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.y)]).range([innerHeight, 0]); // y 轴反转

  g.append("g").attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale));
  g.append("g").call(d3.axisLeft(yScale));

  g.selectAll("circle").data(data).join("circle")     // 用 .join() 绑定
    .attr("cx", d => xScale(d.x))
    .attr("cy", d => yScale(d.y))
    .attr("r", 5).attr("fill", "steelblue");
}
```

比例尺速查：
- 定量：`scaleLinear` / `scaleLog`（指数数据）/ `scalePow().exponent(2)` / `scaleTime`
- 序数：`scaleBand().padding(0.1)`（柱状）/ `scalePoint`（折线/散点分类）/ `scaleOrdinal(d3.schemeCategory10)`（颜色）
- 顺序色：`scaleSequential(d3.interpolateBlues)`；发散色：`scaleDiverging(d3.interpolateRdBu)`

## 示例

柱状图核心（用 `scaleBand`）：

```javascript
const xScale = d3.scaleBand()
  .domain(data.map(d => d.category)).range([0, innerWidth]).padding(0.1);
const yScale = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.value)]).range([innerHeight, 0]);

g.selectAll("rect").data(data).join("rect")
  .attr("x", d => xScale(d.category))
  .attr("y", d => yScale(d.value))
  .attr("width", xScale.bandwidth())
  .attr("height", d => innerHeight - yScale(d.value))
  .attr("fill", "steelblue");
```

折线图用形状生成器：

```javascript
const line = d3.line()
  .x(d => xScale(d.date)).y(d => yScale(d.value))
  .curve(d3.curveMonotoneX);                    // 平滑曲线
g.append("path").datum(data)
  .attr("fill", "none").attr("stroke", "steelblue")
  .attr("stroke-width", 2).attr("d", line);
```

力导向网络（可拖拽，tick 里更新坐标）：

```javascript
const simulation = d3.forceSimulation(nodes)
  .force("link", d3.forceLink(links).id(d => d.id).distance(100))
  .force("charge", d3.forceManyBody().strength(-300))
  .force("center", d3.forceCenter(width / 2, height / 2));

simulation.on("tick", () => {
  link.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
  node.attr("cx", d => d.x).attr("cy", d => d.y);
});
// node 上 .call(d3.drag().on("start"/"drag"/"end", ...)) 配合 fx/fy 实现拖拽
```

提示框（tooltip，建在 SVG 外的 div，`pointer-events: none`）：

```javascript
circles
  .on("mouseover", function(event, d) {
    tooltip.style("visibility", "visible")
      .html(`<strong>${d.label}</strong><br/>Value: ${d.value}`);
  })
  .on("mousemove", (event) => tooltip
      .style("top", (event.pageY - 10) + "px")
      .style("left", (event.pageX + 10) + "px"))
  .on("mouseout", () => tooltip.style("visibility", "hidden"));
```

缩放平移：

```javascript
const zoom = d3.zoom().scaleExtent([0.5, 10])
  .on("zoom", (event) => g.attr("transform", event.transform));
svg.call(zoom);
```

源文件还附 `references/`（d3-patterns、scale-reference、colour-schemes）与 `assets/`（chart-template.js、interactive-template.js、sample-data.json），含弦图、热力图、饼图等完整范式，需要时按图查阅。

## 注意事项

- 数据预处理：先过滤无效值 `data.filter(d => d.value != null && !isNaN(d.value))`，需要排序时用 `[...data].sort(...)`，日期用 `d3.timeParse("%Y-%m-%d")` 解析。
- 性能（>1000 元素）：用 Canvas 取代 SVG；用 quadtree 做碰撞检测；用 `.join()` 取代分开的 enter/update/exit；自定义动画用 `requestAnimationFrame`；防抖 resize 处理器。
- 无障碍：给 svg 加 `role="img"` 与 `aria-label`，append `<title>`/`<desc>`，保证颜色对比度，为交互元素提供键盘导航与数据表替代。
- 常见坑：
  - 坐标轴不显示 -> 检查 domain 是否含 NaN、轴是否 append 到正确分组、transform 平移是否正确。
  - 过渡不生效 -> `.transition()` 要在改属性之前调用、元素需有唯一 key 保证数据绑定、确认 useEffect 依赖含所有变化数据。
  - 响应式失效 -> 用 ResizeObserver 或 resize 监听、确保 SVG 设了 width/height 或 viewBox。
- 不要把输出当作环境特定的验证、测试或专家评审的替代品。

## 互见

- 3D 可视化：改用 Three.js
- 简单标准图的轻量替代：Chart.js、Apache ECharts

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
