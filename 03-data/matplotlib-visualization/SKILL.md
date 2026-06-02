---
name: matplotlib-visualization
title: Matplotlib 数据可视化
description: 当需要用 Python/Matplotlib 绘制静态图表（折线、散点、柱状、直方、热力、等高线、箱线、3D 等）并导出 PNG/PDF/SVG 出版级图时使用；做用面向对象 API（fig, ax）构图、定制样式与多子图、按 dpi 保存产物；不适用于浏览器交互式可视化（用 d3js-data-viz）或统计图表高层封装（用 seaborn）。触发词：matplotlib、画图、绘图、可视化、subplots、savefig
domain: 数据/analysis
triggers: [matplotlib, pyplot, 画图, 绘图, 数据可视化, 折线图, 散点图, 柱状图, 直方图, 热力图, subplots, savefig, 子图, colormap, 3D 绘图]
tags: [matplotlib, 数据可视化, python, 图表, pyplot, 绘图, 数据]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, matplotlib, numpy]
requires: []
related: [seaborn-statistical-charts, plotly-interactive-viz, d3js-data-viz]
combines_with: [seaborn-statistical-charts, polars-dataframe, scikit-learn-ml]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 用 Python 生成静态图表/科研统计图：折线、散点、柱状/条形、直方、热力（imshow）、等高线、箱线、小提琴、3D 曲面/散点。
- 需要精细控制布局：多子图（subplots / subplot_mosaic / GridSpec）、自定义颜色样式标注、按 dpi 导出 PNG/PDF/SVG 出版级图。
- 触发词：matplotlib、pyplot、画图、绘图、可视化、subplots、savefig、热力图、3D 绘图。

不该用：
- 浏览器端交互式可视化（缩放/提示框/自定义网络图）→ 用 `d3js-data-viz`。
- 统计图表的高层一行封装（带分组/置信区间/调色板）→ 用 seaborn（其底层仍是 matplotlib）。
- 仅需 DataFrame 快速预览，`df.plot()` 已够，无需手写本流程。

## 步骤 / 指令

优先用**面向对象 API**（`fig, ax = plt.subplots()`），仅交互探索可用 pyplot 隐式接口。

1. 建图：`fig, ax = plt.subplots(figsize=(w, h), constrained_layout=True)`，显式建图而非依赖全局状态。
2. 绘数据：在 `ax` 上按图型调用（`ax.plot/scatter/bar/hist/imshow/contour/boxplot`），多条曲线带 `label`。
3. 定制：`ax.set_xlabel/set_ylabel/set_title`、`ax.legend()`、`ax.grid(True, alpha=0.3)`；按需 `plt.style.use(...)` 或 `plt.rcParams[...]`。
4. 多子图：规则网格用 `plt.subplots(nrows, ncols)`；不规则布局用 `subplot_mosaic`；最大控制用 `GridSpec`。
5. 保存：`plt.savefig(path, dpi=300, bbox_inches='tight')`，再按需 `plt.show()`。
6. 释放：批量生成多图时 `plt.close(fig)` 防内存泄漏。

选色原则：顺序数据用 viridis/plasma；有中心点的发散数据用 coolwarm/RdBu；分类数据用 tab10/Set3；避免 jet（非感知均匀）。可访问性优先 viridis/cividis 等色盲友好色图。

## 示例

最小可用（OO 接口 + 保存）：
```python
import matplotlib.pyplot as plt
import numpy as np

fig, ax = plt.subplots(figsize=(10, 6), constrained_layout=True)
x = np.linspace(0, 2*np.pi, 100)
ax.plot(x, np.sin(x), label='sin(x)')
ax.plot(x, np.cos(x), label='cos(x)')
ax.set_xlabel('x'); ax.set_ylabel('y'); ax.set_title('Trigonometric')
ax.legend(); ax.grid(True, alpha=0.3)
plt.savefig('plot.png', dpi=300, bbox_inches='tight')
```

多子图（规则网格）：
```python
fig, axes = plt.subplots(2, 2, figsize=(12, 10), constrained_layout=True)
axes[0, 0].plot(x, y1)
axes[0, 1].scatter(x, y2, s=sizes, c=colors, alpha=0.6, cmap='viridis')
axes[1, 0].bar(categories, values, color='steelblue', edgecolor='black')
axes[1, 1].hist(data, bins=30, edgecolor='black', alpha=0.7)
```

热力图带 colorbar：
```python
im = ax.imshow(matrix, cmap='coolwarm', aspect='auto')
plt.colorbar(im, ax=ax)
```

委托提示词（给 Agent 调用时）：
> 用 matplotlib 面向对象接口画 {图型}：建 `fig, ax = plt.subplots(constrained_layout=True)`，加坐标轴标签/标题/图例，色图选 {viridis/coolwarm}，最后 `savefig(dpi=300, bbox_inches='tight')` 导出 {png/pdf}。

## 注意事项

- 生产代码用 OO 接口，避免 pyplot 全局状态机踩坑（状态混乱、误画到上一张图）。
- `figsize` 单位是英寸不是像素：`像素 = dpi × 英寸`；dpi 取值——屏幕 72–100、网页 150、印刷/出版 300。
- 元素重叠用 `constrained_layout=True` 或 `tight_layout()`。
- 批量出图务必 `plt.close(fig)` 释放，否则内存累积。
- 大数据集在绘图调用加 `rasterized=True` 减小矢量文件体积，必要时先降采样。
- 透明主题下导出加 `facecolor='white'` 保证白底；需透明背景用 `transparent=True`。
- 缺字体告警可设 `plt.rcParams['font.sans-serif']`（中文标签建议显式指定中文字体并关 `axes.unicode_minus`）。

## 互见

- requires：无。
- related：`d3js-data-viz`（需浏览器端交互式可视化时改用）。
- combines_with：`csv-data-cleaner`（先清洗表格数据，再用本技能可视化）。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
