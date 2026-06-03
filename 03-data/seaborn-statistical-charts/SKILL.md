---
name: seaborn-statistical-charts
title: Seaborn 统计图表
description: 当需要用 Seaborn 从 DataFrame 直接画统计图（散点/折线/分布/箱线/小提琴/热力图/回归/分面网格）并要出版级美观默认时使用；做选图型→建图→分面/语义映射→调主题配色→存图的可执行流程，产出图像文件；不适用于交互式/Web 图表（Plotly/Bokeh）、纯 matplotlib 底层绘制、地理/网络专用图。触发词：seaborn、统计图、热力图、分布图、分面、出版级配图
domain: 数据/analysis
triggers: [seaborn, 统计图表, 热力图, 分布图, 箱线图, 小提琴图, 分面网格, 回归图, 出版级配图, 数据可视化]
tags: [seaborn, 数据可视化, 统计图表, matplotlib, python, eda]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, seaborn, matplotlib, pandas]
requires: []
related: [matplotlib-visualization, plotly-interactive-viz, statsmodels-statistical-modeling]
combines_with: [polars-dataframe, statsmodels-statistical-modeling, scikit-learn-ml]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：

- 拿到 tidy 表格数据（DataFrame），要直接画出版级统计图：散点、折线、分布（直方/KDE/ECDF）、分类对比（箱线/小提琴/柱状）、回归、相关性热力图、配对/联合图。
- 需要按类别做语义映射（颜色 hue / 尺寸 size / 样式 style）或自动分面（小多图）。
- 想要 Seaborn 内建的统计聚合与置信区间（如 lineplot/barplot 自动算均值与 CI），并省去 matplotlib 样板代码。

不该用（负边界）：

- 交互式 / Web 图表（缩放、悬浮提示）→ 用 Plotly / Bokeh / Altair。
- 需要逐像素底层控制、自定义图元 → 直接用 matplotlib（Seaborn 只是其上层）。
- 地图 / 地理空间（geopandas）、网络图（networkx）、专业金融 K 线等专用图。
- 海量数据点（百万级）逐点散点会卡 → 先聚合/抽样或改用 datashader。

## 步骤 / 指令

按序决策与执行：

1. 备数据：整理成 long-form（每变量一列、每观测一行）。这是首选格式，几乎所有函数都吃它。宽表用 `df.melt(var_name=..., value_name=...)` 转长表；相关矩阵/热力图等才用宽表。列名要有意义（用 `data=df, x='列名'`，别传裸数组，否则丢轴标签）。

2. 选图型（按变量类型）：
   - 连续 x · 连续 y → `scatterplot` / `lineplot` / `regplot` / `kdeplot`
   - 连续 x · 分类 y → `boxplot` / `violinplot` / `stripplot` / `swarmplot` / `barplot`
   - 单连续变量 → `histplot` / `kdeplot` / `ecdfplot`
   - 矩阵 / 相关性 → `heatmap` / `clustermap`
   - 全局两两关系 → `pairplot` / `jointplot`

3. 选层级（关键区分）：
   - axes-level（`scatterplot`/`histplot`/`boxplot`/`heatmap`…）：画到单个 `Axes`，接受 `ax=`，能嵌进自定义 matplotlib 布局。组合多种图型、要 matplotlib 级控制时用它。
   - figure-level（`relplot`/`displot`/`catplot`/`lmplot`/`jointplot`/`pairplot`）：管整张图，内建 `col`/`row` 分面，用 `height`/`aspect` 调尺寸（按每个子图），返回 `FacetGrid`/`JointGrid`/`PairGrid`。要分面/小多图、快速探查时用它；它不能塞进已有 figure。

4. 加语义映射 / 分面：`hue`（颜色）、`size`（尺寸）、`style`（样式）编码额外维度；figure-level 用 `col`/`row` 自动分面，`col_wrap=N` 控制换行。

5. 调主题配色：`set_theme(style=..., palette=..., context=...)`。分类用 `deep`/`colorblind`，有序用 `rocket`/`viridis`，发散（带中心）用 `vlag`/`coolwarm` 并设 `center=0`。

6. 控统计估计（按需）：`lineplot`/`barplot` 默认算均值 + 95% CI；用 `estimator='median'`、`errorbar='sd'` 或 `errorbar=('ci', 95)` 改。

7. 存图：axes-level 用 `plt.savefig`；figure-level 用返回的 grid `.savefig(...)`。出版用 `dpi=300, bbox_inches='tight'`，矢量用 `.pdf`。

## 示例

快速上手：

```python
import seaborn as sns
import matplotlib.pyplot as plt

df = sns.load_dataset('tips')
sns.scatterplot(data=df, x='total_bill', y='tip', hue='day')
plt.show()
```

多语义映射 + 自动分面（figure-level）：

```python
# 散点叠加 hue/size/style 三维编码
sns.scatterplot(data=df, x='total_bill', y='tip', hue='time', size='size', style='sex')

# 按 col/row 自动分面
sns.relplot(data=df, x='total_bill', y='tip', col='time', row='sex',
            hue='smoker', kind='scatter', height=3, aspect=1.2)
```

分类对比与分布：

```python
sns.violinplot(data=df, x='day', y='total_bill', hue='sex', split=True)
sns.barplot(data=df, x='day', y='total_bill', hue='sex',
            estimator='mean', errorbar='ci')          # 均值 + 自助法 CI
sns.histplot(data=df, x='total_bill', hue='time', stat='density', multiple='stack')
sns.kdeplot(data=df, x='total_bill', y='tip', fill=True, levels=5, thresh=0.1)
```

相关性热力图：

```python
corr = df.corr(numeric_only=True)
sns.heatmap(corr, annot=True, fmt='.2f', cmap='coolwarm', center=0, square=True)
```

把多种 axes-level 图拼进自定义网格：

```python
fig, axes = plt.subplots(2, 2, figsize=(10, 10))
sns.scatterplot(data=df, x='total_bill', y='tip', ax=axes[0, 0])
sns.histplot(data=df, x='total_bill', ax=axes[0, 1])
sns.boxplot(data=df, x='day', y='total_bill', ax=axes[1, 0])
sns.kdeplot(data=df, x='total_bill', y='tip', ax=axes[1, 1])
plt.tight_layout()
```

出版级图（主题 + 分面 + 存盘）：

```python
sns.set_theme(style='ticks', context='paper', font_scale=1.1)
g = sns.catplot(data=df, x='day', y='total_bill', col='time',
                kind='box', height=3, aspect=1.2)
g.set_axis_labels('Day', 'Total Bill')
g.set_titles('{col_name}')
sns.despine(trim=True)
g.savefig('figure.pdf', dpi=300, bbox_inches='tight')
```

现代声明式接口（seaborn.objects，类 ggplot2，做复杂分层/可编程图时用）：

```python
from seaborn import objects as so
(
    so.Plot(data=df, x='total_bill', y='tip')
    .add(so.Dot(), color='day')
    .add(so.Line(), so.PolyFit())
)
```

## 注意事项

- long-form 优先：宽表只适合简单时序、相关矩阵、热力图；其余先 `melt` 转长表，否则语义映射受限。
- 传 `data=df` + 列名字符串，别传裸数组——裸数组会丢失轴标签。
- axes-level 用 `ax=` 嵌入已有 figure；figure-level 不能塞进已有 figure，要调大用 `height`/`aspect` 而非 `figsize`。
- 默认统计：`lineplot`/`barplot` 自动聚合 + 算 CI，别误以为画的是原始值；需要时显式改 `estimator`/`errorbar`。
- figure-level 图例默认放在图外，要挪进图内用 `g._legend.set_bbox_to_anchor((0.9, 0.5))`。
- 标签重叠：`plt.xticks(rotation=45, ha='right')` + `plt.tight_layout()`。
- 配色不够区分：换 `set_palette('bright')` 或 `color_palette('husl', n_colors=类别数)`；配色无障碍用 `colorblind`。
- KDE 太平滑/太毛刺：调 `bw_adjust`（>1 更平滑，<1 更细节）。
- 发散色板（相关性等）务必配 `center=0`，否则零点偏色误导。
- 仅在任务明确属于上述范围时使用；输出不替代针对具体环境的验证；缺少必要输入或成功标准时停下澄清。

## 互见

- requires：无。
- related：`csv-data-cleaner`（画图前先清洗/规整数据）、`sql-query-builder`（从库里取数后再可视化）。
- combines_with：与 pandas 数据处理、matplotlib 底层定制搭配使用——Seaborn 出图、matplotlib 微调、pandas 备数据。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。上游 seaborn 技能原始许可为 BSD-3-Clause。
