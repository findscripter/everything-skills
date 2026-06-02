---
name: umap-dimensionality-reduction
title: UMAP 非线性降维与可视化
description: 当需要把高维数据非线性降到 2D/3D 做可视化、为聚类（如 HDBSCAN）做降维预处理、或做有监督/参数化 UMAP 特征工程时使用；用 umap-learn 拟合 manifold 嵌入并产出可复现的低维坐标与散点图；不适用于纯线性降维（用 PCA）、需保证全局距离严格保真的场景、未标准化的数据或仅做数据清洗。触发词：UMAP、降维、流形学习、可视化、HDBSCAN、t-SNE 替代
domain: 数据/analysis
triggers: [UMAP, 降维, 流形学习, manifold, 可视化, 嵌入, embedding, HDBSCAN, 聚类预处理, t-SNE替代, n_neighbors, min_dist, 参数化UMAP, 有监督降维]
tags: [umap, dimensionality-reduction, manifold-learning, visualization, clustering, hdbscan, python, scikit-learn, 数据/分析]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, umap-learn, scikit-learn, numpy, matplotlib, hdbscan]
requires: []
related: [scikit-learn-ml, matplotlib-visualization, plotly-interactive-viz, scientific-exploratory-data-analysis]
combines_with: [scikit-learn-ml, single-cell-rnaseq-analysis, scientific-exploratory-data-analysis]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

适用场景：

- 把高维数据**非线性降维**到 2D/3D 做可视化，同时兼顾局部与全局结构（比 t-SNE 快、可扩展，全局结构更稳）。
- 为密度聚类（HDBSCAN 等）做**降维预处理**，缓解维度灾难。
- 有标签时做**有监督/半监督降维**或度量学习，作为下游分类器的特征工程。
- 需要把训练好的嵌入器 `transform()` 到新数据，或用**参数化 UMAP**（神经网络映射）支持高效推断与反变换。
- 用 `AlignedUMAP` 比较时序/批次等相关数据集，保持坐标系一致。

不该用的边界：

- 只需**线性降维**或要可解释的主成分方向 → 用 PCA（也可先 PCA 再 UMAP 提速）。
- 需要**严格保真的全局距离/密度**做定量分析 → UMAP 不完全保距/保密度，可能制造伪聚类与伪间距。
- 数据**未标准化** → 先标准化再用（见步骤），否则量纲大的维度主导嵌入。
- 仅做数据清洗（缺失/去重/类型）→ 先用 `csv-data-cleaner`。
- 不能替代环境相关验证、聚类质量复核与专家判断；可视化轴本身**无可解释量纲**。

## 步骤 / 指令

**安装**（锁定已验证版本，需 Python 3.9+）：
```bash
uv pip install umap-learn==0.5.12
uv pip install hdbscan                       # 聚类时另装
uv pip install "umap-learn[parametric-umap]==0.5.12"   # 参数化UMAP，需TF 2.x
```

**通用流程**：

1. **标准化**（关键预处理）：`StandardScaler().fit_transform(data)`，让各维等权。
2. **按目的选参数**（可视化与聚类用不同配置，见下表）。
3. **拟合**：`reducer.fit_transform(scaled)`；复用模型则 `fit()` 后取 `reducer.embedding_`。
4. **务必设 `random_state=42`**：UMAP 是随机优化，不固定种子结果会抖动（注意设种子会关多线程、变慢）。
5. **诊断**：散点图按标签着色；聚类后用 ARI 等指标评估并人工探查。

**四个核心参数**：

| 参数 | 默认 | 作用 | 取值指引 |
|---|---|---|---|
| `n_neighbors` | 15 | 局部 vs 全局结构 | 低(2–5)重局部细节但易碎片；15–20 平衡（起点）；高(50–200)重全局拓扑 |
| `min_dist` | 0.1 | 低维点的最小间距/紧密度 | 0.0 利于聚类（点抱团）；0.1–0.3 可视化；0.5+ 松散保全局 |
| `n_components` | 2 | 输出维度 | 2–3 可视化；5–10 聚类预处理（比 2D 更保密度）；10–50 做特征工程 |
| `metric` | euclidean | 距离度量 | 数值用 `euclidean`；文本/文档向量用 `cosine`；二值用 `hamming`/`jaccard`；支持 Numba 自定义 |

**场景化配置**：

```python
# 可视化（重局部）
umap.UMAP(n_neighbors=15, min_dist=0.1, n_components=2, metric='euclidean')
# 聚类预处理：邻居调大、min_dist=0、维度5–10
umap.UMAP(n_neighbors=30, min_dist=0.0, n_components=10, metric='euclidean')
# 文档嵌入
umap.UMAP(n_neighbors=15, min_dist=0.1, n_components=2, metric='cosine')
# 保全局结构
umap.UMAP(n_neighbors=100, min_dist=0.5, n_components=2, metric='euclidean')
```

## 示例

**基础可视化**（遵循 sklearn 约定，可直接替代 t-SNE/PCA）：
```python
import umap, matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler

scaled = StandardScaler().fit_transform(raw_data)        # 标准化必做
reducer = umap.UMAP(n_neighbors=15, min_dist=0.1,
                    n_components=2, metric='euclidean', random_state=42)
emb = reducer.fit_transform(scaled)
plt.scatter(emb[:, 0], emb[:, 1], c=labels, cmap='Spectral', s=5)
plt.colorbar(); plt.title('UMAP'); plt.show()
```

**UMAP + HDBSCAN 聚类**（聚类与可视化分两套嵌入）：
```python
import umap, hdbscan
from sklearn.metrics import adjusted_rand_score

scaled = StandardScaler().fit_transform(data)
emb = umap.UMAP(n_neighbors=30, min_dist=0.0, n_components=10,
                random_state=42).fit_transform(scaled)   # 聚类用高维嵌入
labels = hdbscan.HDBSCAN(min_cluster_size=15, min_samples=5).fit_predict(emb)
print("ARI:", adjusted_rand_score(true_labels, labels))
print("噪声点:", sum(labels == -1))                       # -1 为噪声
```

**有监督 / 半监督降维**（半监督用 -1 标未标注点）：
```python
emb = umap.UMAP().fit_transform(data, y=labels)          # 有监督
semi = labels.copy(); semi[unlabeled_idx] = -1           # 半监督
emb = umap.UMAP().fit_transform(data, y=semi)
```

**transform 到新数据 + sklearn Pipeline**：
```python
from sklearn.pipeline import Pipeline
from sklearn.svm import SVC
pipe = Pipeline([('scaler', StandardScaler()),
                 ('umap', umap.UMAP(n_components=10, random_state=42)),
                 ('clf', SVC())])
pipe.fit(X_train, y_train); pipe.predict(X_test)
# 0.5.x 起支持 get_feature_names_out()
```

**参数化 UMAP / 反变换**：
```python
from umap.parametric_umap import ParametricUMAP
emb = ParametricUMAP().fit_transform(data)               # 学到映射，新数据可高效 transform
recon = reducer.inverse_transform(emb)                   # 反变换重建（凸包外不可靠）
```

## 注意事项

- **必须先标准化**：不标准化会让大量纲维度主导嵌入；全点塌成一团多半是没缩放或 `min_dist` 太小。
- **轴无意义**：UMAP 坐标无可解释量纲，簇间距离/簇大小**不可定量解读**；它不完全保密度，可能制造伪聚类——务必验证。
- **聚类要换参数**：默认 `n_neighbors=15` 太局部会造人工细簇；聚类用 `n_neighbors≈30, min_dist=0.0, n_components=5–10`。
- **可复现**：设 `random_state`，否则每次结果略有不同。
- **常见排错**：碎片化/断裂→调大 `n_neighbors`；簇太散→调小 `min_dist`；大数据慢→保持 `low_memory=True` 或先 PCA 降维；输入含 NaN/inf→先清洗（0.5.6+ 部分路径容忍，但仍建议干净输入）。
- **transform 假设训练/测试同分布**，不满足时改用参数化 UMAP；首次调用因 Numba JIT 编译会偏慢。
- **反变换**计算贵，仅在嵌入凸包内、簇间无大间隙处较准。
- 不能替代环境相关验证与专家复核；输出仅供参考。

## 互见

- requires：无。
- related：`scikit-learn-ml`（含 PCA 等线性降维与下游建模，与 UMAP 非线性降维互补）；`statsmodels-statistical-modeling`（侧重统计推断）。
- combines_with：`csv-data-cleaner`（降维前清洗脏数据）；`matplotlib-visualization`、`seaborn-statistical-charts`（嵌入散点图与诊断可视化）。

---

采编自 K-Dense-AI/scientific-agent-skills（MIT 许可）；原 umap-learn 技能署 K-Dense Inc.、原始声明 BSD-3-Clause，均可再分发。
