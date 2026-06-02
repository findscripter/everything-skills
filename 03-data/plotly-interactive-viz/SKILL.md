---
name: plotly-interactive-viz
title: Plotly 交互式可视化
description: 当需要带悬停、缩放、平移或可嵌入网页的交互式图表（仪表盘、探索性分析、演示）时使用；用 Plotly Express/Graph Objects 产出 40+ 种图表并导出 HTML 或静态图；不适用于无交互的出版级静态图（用 matplotlib）；触发词：plotly、交互式图表、hover、仪表盘、HTML 图表
domain: 数据/analysis
triggers: [plotly, 交互式图表, hover, 缩放平移, 仪表盘, HTML 图表, plotly express, graph objects, candlestick, 3D 图表]
tags: [可视化, python, plotly, 交互图表, dashboard]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, plotly, pandas, kaleido, dash]
requires: []
related: [matplotlib-visualization, seaborn-statistical-charts, d3js-data-viz, kpi-dashboard-design]
combines_with: [polars-dataframe, kpi-dashboard-design, data-storyteller]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

需要**交互式**图表时用本技能：图表要支持悬停提示、缩放/平移、图例切换、框选，或要嵌入网页/仪表盘/演示。典型场景——探索性分析 notebook、仪表盘、时间序列 rangeslider、3D 曲面、金融 K 线。

**不该用的边界：**
- 要无交互的出版级静态图（论文 figure、PDF 矢量）→ 用 matplotlib，不是 Plotly。
- 要全栈交互 Web 应用（回调、表单、多页）→ Plotly 只负责画图，应用层用 Dash。
- 仅需 D3 级别完全自定义的浏览器原生可视化 → 见 `d3js-data-viz`。

## 步骤 / 指令

1. 安装：`uv pip install plotly`；需导出 PNG/PDF/SVG 再装 `uv pip install kaleido`。
2. **选 API**（关键决策）：
   - **Plotly Express（`px`）**——高层、1~5 行、直接吃 pandas DataFrame、自动配色与图例。标准图（scatter/line/bar/histogram…）首选。
   - **Graph Objects（`go`）**——低层、精细控制。用于 px 没有的图（3D mesh、isosurface、复杂金融图）、从零搭多 trace、自定义形状/注解。
   - 二者可混用：`px` 返回的就是 `go.Figure`，可继续 `fig.update_layout()` / `fig.add_hline()`。
3. 画图 → 调样式（`template`、`update_traces`、`update_xaxes`）→ 输出（`fig.show()` / `write_html` / `write_image`）。
4. 多图仪表盘用 `make_subplots`，并在 `specs` 里声明各格 `type`。

## 示例

最小起步（Plotly Express）：
```python
import plotly.express as px
import pandas as pd

df = pd.DataFrame({'x': [1, 2, 3, 4], 'y': [10, 11, 12, 13]})
fig = px.scatter(df, x='x', y='y', title='My First Plot')
fig.show()
```

常用工作流：
```python
# 带趋势线散点 / 相关性热力图
fig = px.scatter(df, x='temperature', y='yield', trendline='ols')
fig = px.imshow(corr, text_auto=True, color_continuous_scale='RdBu')

# 分布对比 / 箱线（全点）/ 小提琴
fig = px.histogram(df, x='values', color='group', marginal='box', nbins=30)
fig = px.box(df, x='category', y='value', points='all')
fig = px.violin(df, x='group', y='measurement', box=True)

# 时间序列 + rangeslider；动画
fig = px.line(df, x='date', y='price'); fig.update_xaxes(rangeslider_visible=True)
fig = px.scatter(df, x='x', y='y', animation_frame='year')
```

Graph Objects（px 覆盖不到的图）：
```python
import plotly.graph_objects as go
# 3D 曲面
fig = go.Figure(data=[go.Surface(z=z_data, x=x_data, y=y_data)])
# K 线
fig = go.Figure(data=[go.Candlestick(x=df['date'], open=df['open'],
    high=df['high'], low=df['low'], close=df['close'])])
```

多图仪表盘：
```python
from plotly.subplots import make_subplots
fig = make_subplots(rows=2, cols=2, subplot_titles=('Scatter','Bar','Histogram','Box'),
    specs=[[{'type':'scatter'},{'type':'bar'}],[{'type':'histogram'},{'type':'box'}]])
fig.add_trace(go.Scatter(x=[1,2,3], y=[4,5,6]), row=1, col=1)
fig.update_layout(height=800, showlegend=False)
```

交互定制与导出：
```python
fig.update_traces(hovertemplate='<b>%{x}</b><br>Value: %{y:.2f}<extra></extra>')
fig.write_html('chart.html')                          # 独立 HTML
fig.write_html('chart.html', include_plotlyjs='cdn')  # 体积更小
fig.write_image('chart.png')   # 需 kaleido；支持 .pdf / .svg
```

模板（统一样式）：`template='plotly_dark'`（内置 `plotly_white` `plotly_dark` `ggplot2` `seaborn` `simple_white`）。

嵌入 Web 应用（Dash）：
```python
import dash
from dash import dcc, html
app = dash.Dash(__name__)
app.layout = html.Div([html.H1('Dashboard'), dcc.Graph(figure=px.scatter(df, x='x', y='y'))])
app.run_server(debug=True)
```

## 注意事项

- **静态导出依赖 kaleido**：`write_image` 缺它会报错，先 `uv pip install kaleido`。
- **HTML 体积**：`include_plotlyjs='cdn'` 显著减小文件，但离线打开需联网拉 plotly.js；要完全离线就用默认（内联，约 3MB+）。
- **`hovertemplate` 必须以 `<extra></extra>` 结尾**才能隐藏右侧次要标签框。
- **`make_subplots` 的 `specs` type 要和 trace 类型对应**，否则 trace 加不进对应格子。
- 大数据量散点考虑 `px.scatter(render_mode='webgl')` 或 `go.Scattergl`，避免 SVG 渲染卡顿。
- 仅当任务确属交互式可视化范围时用本技能；缺少数据列/成功判据时先澄清，输出仍需在目标环境实测验证。
- 官方文档 https://plotly.com/python/ ；API 参考 https://plotly.com/python-api-reference/ 。

## 互见

- related：`d3js-data-viz` —— 需要浏览器原生、完全自定义的可视化时改用 D3。
- related：`guided-statistical-analysis` —— 统计分析产出的结果用 Plotly 画分布/箱线/小提琴图。
- combines_with：`csv-data-cleaner` —— 先清洗成规整 DataFrame，再喂给 Plotly Express 画图。
- combines_with：`kpi-dashboard-design` —— 先定指标与版式，再用 `make_subplots` 落地交互式仪表盘。

---
采编自 sickn33/antigravity-awesome-skills（MIT），原作者 K-Dense Inc.，适配重写并精简。
