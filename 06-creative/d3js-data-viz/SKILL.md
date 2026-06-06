---
name: d3js-data-viz
title: D3.js Interactive Data Visualisation
description: Use D3.js to build custom, interactive, publication-quality data visualisations (networks, geo projections, chord diagrams, heatmaps, force-directed layouts) that standard chart libraries can't produce; bind data to the DOM, render SVG with scales/axes/shape generators, and add t
domain: 创意/design
triggers: [D3.js, d3, data visualisation, interactive chart, force-directed graph, chord diagram, heatmap, SVG chart, scales, axes, zoom and pan, network graph, data binding]
tags: [d3js, data-visualisation, frontend, svg, interactive, charts, javascript, creative]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [threejs-3d-web, algorithmic-art, plotly-interactive-viz, matplotlib-visualization]
combines_with: [web-artifacts-builder, data-storyteller, kpi-dashboard-design]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## When to use

Use D3.js (Data-Driven Documents) to bind data to DOM elements and apply data-driven transformations, creating custom, publication-quality visualisations with precise control over every visual element. The techniques work across any JavaScript environment, including vanilla JavaScript, React, Vue, Svelte, and other frameworks.

**Use d3.js for:**
- Custom visualisations requiring unique visual encodings or layouts
- Interactive explorations with complex pan, zoom, or brush behaviours
- Network/graph visualisations (force-directed layouts, tree diagrams, hierarchies, chord diagrams)
- Geographic visualisations with custom projections
- Visualisations requiring smooth, choreographed transitions
- Publication-quality graphics with fine-grained styling control
- Novel chart types not available in standard libraries

**Consider alternatives for:**
- 3D visualisations — use Three.js instead
- Simple standard charts (basic bar/line/pie) where a ready-made library (Chart.js, ECharts) is sufficient and lighter
- Stop and ask for clarification if required inputs, data format, or success criteria are missing — don't force a chart

## Steps

1. **Set up d3.js.** Import modules: `import * as d3 from 'd3';` or use the CDN (7.x): `<script src="https://d3js.org/d3.v7.min.js"></script>`. All modules (scales, axes, shapes, transitions, etc.) are accessible through the `d3` namespace.

2. **Choose the integration pattern.**
   - **Pattern A: Direct DOM manipulation (recommended for most cases).** Use d3 to select and manipulate DOM elements imperatively with `d3.select(...)`. Works in any JavaScript environment and unlocks d3's full transition/interaction capabilities.
   - **Pattern B: Declarative rendering (for frameworks with templating).** Use d3 only for data calculations (scales, layouts) and render elements via your framework (React's `.map` → `<rect>`, Vue's `v-for`). Use it for simpler visualisations or when your framework prefers declarative rendering.

3. **Structure the drawing function** (call when data changes): null-check and clear the previous render → define dimensions and margin → create a main `g` group with margin offset → create scales → create and append axes → bind data with `.data().join()` to create visual elements (see the skeleton below).

4. **Implement responsive sizing.** Listen to `window` `resize` or use a `ResizeObserver` on the container, recompute from `getBoundingClientRect()`, and redraw; return a cleanup function (remove listener / `observer.disconnect()`) to call when the component unmounts.

5. **Add interactivity and animation:** tooltips, zoom/pan (`d3.zoom`), click handlers, and transitions (`.transition()`).

### Standard drawing skeleton

```javascript
function drawVisualization(data) {
  if (!data || data.length === 0) return;       // 1. Null check

  const svg = d3.select('#chart');              // Select by ID, class, or DOM element
  svg.selectAll("*").remove();                  // 2. Clear previous render

  // 3. Define dimensions
  const width = 800, height = 400;
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // 4. Main group with margins
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // 5. Scales
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.x)]).range([0, innerWidth]);
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.y)]).range([innerHeight, 0]); // inverted for SVG coords

  // 6. Axes
  g.append("g").attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale));
  g.append("g").call(d3.axisLeft(yScale));

  // 7. Bind data and create visual elements
  g.selectAll("circle").data(data).join("circle")
    .attr("cx", d => xScale(d.x))
    .attr("cy", d => yScale(d.y))
    .attr("r", 5).attr("fill", "steelblue");
}
```

### Scales quick reference

- **Quantitative:** `scaleLinear` / `scaleLog` (exponential data) / `scalePow().exponent(2)` / `scaleTime`
- **Ordinal:** `scaleBand().padding(0.1)` (bars) / `scalePoint` (line/scatter categories) / `scaleOrdinal(d3.schemeCategory10)` (colours)
- **Sequential colour:** `scaleSequential(d3.interpolateBlues)`; **diverging:** `scaleDiverging(d3.interpolateRdBu)`

### Responsive sizing with ResizeObserver

```javascript
function setupResponsiveChartWithObserver(svgElement, data) {
  const observer = new ResizeObserver(() => {
    const { width, height } = svgElement.getBoundingClientRect();
    d3.select(svgElement).attr('width', width).attr('height', height);
    drawChart(data, d3.select(svgElement), width, height); // Redraw
  });
  observer.observe(svgElement.parentElement);
  return () => observer.disconnect(); // cleanup
}
```

## Example

**Bar chart core (using `scaleBand`):**

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

**Line chart with a shape generator:**

```javascript
const line = d3.line()
  .x(d => xScale(d.date)).y(d => yScale(d.value))
  .curve(d3.curveMonotoneX);                    // smooth curve
g.append("path").datum(data)
  .attr("fill", "none").attr("stroke", "steelblue")
  .attr("stroke-width", 2).attr("d", line);
```

**Force-directed network (draggable, update coords on tick):**

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

function dragstarted(event) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  event.subject.fx = event.subject.x; event.subject.fy = event.subject.y;
}
function dragged(event)  { event.subject.fx = event.x; event.subject.fy = event.y; }
function dragended(event){
  if (!event.active) simulation.alphaTarget(0);
  event.subject.fx = null; event.subject.fy = null;
}
// node.call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended));
```

**Tooltip (a `div` outside the SVG, `pointer-events: none`):**

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

**Zoom and pan:**

```javascript
const zoom = d3.zoom().scaleExtent([0.5, 10])
  .on("zoom", (event) => g.attr("transform", event.transform));
svg.call(zoom);
```

The source skill also ships `references/` (`d3-patterns.md`, `scale-reference.md`, `colour-schemes.md`) and `assets/` (`chart-template.js`, `interactive-template.js`, `sample-data.json`), with full recipes for chord diagrams, heatmaps, pie charts, and more — read them when detailed guidance for a specific pattern is needed.

## Notes

- **Data preparation:** filter invalid values with `data.filter(d => d.value != null && !isNaN(d.value))`; sort with `[...data].sort(...)` when order matters; parse dates with `d3.timeParse("%Y-%m-%d")`.
- **Performance (>1000 elements):** use Canvas instead of SVG; use a quadtree for collision detection; prefer `.join()` over separate enter/update/exit; use `requestAnimationFrame` for custom animations; debounce resize handlers.
- **Accessibility:** add `role="img"` and `aria-label` to the svg, append `<title>`/`<desc>`, ensure sufficient colour contrast, and provide keyboard navigation and a data-table alternative for interactive elements.
- **Common issues:**
  - Axes not appearing → check the domain for NaN, verify the axis is appended to the correct group, and confirm the transform translation.
  - Transitions not working → call `.transition()` before changing attributes, give elements unique keys for proper data binding, and ensure `useEffect` dependencies include all changing data.
  - Responsive sizing not working → use ResizeObserver or a window resize listener and ensure the SVG has width/height attributes or a viewBox.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.

## See also

- 3D visualisation → use Three.js
- Lightweight alternatives for simple standard charts → Chart.js, Apache ECharts
