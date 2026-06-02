---
name: networkx-graph-analysis
title: NetworkX 图与网络分析
description: 当处理社交/生物/交通/引文/知识图谱等实体关系网络，需用 NetworkX 建图、算中心性/最短路/社区、生成合成网络或读写多种图格式时使用；做从数据构图到分析、可视化、导出指标的完整流程产物；不适用于超大规模图（亿级边，应转 igraph/graph-tool/GraphFrames）、图数据库持久化查询（Neo4j/Cypher）或纯深度学习图任务（PyG/DGL）。触发词：networkx、图分析、中心性、最短路、社区检测、pagerank。
domain: 数据/analysis
triggers: [networkx, 图分析, 网络分析, 中心性, 最短路径, 社区检测, pagerank, 知识图谱, 图算法, 节点边, 邻接矩阵, graphml]
tags: [networkx, 图分析, 网络科学, python, 数据分析, 可视化, 算法]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, networkx, matplotlib, pandas, numpy, scipy]
requires: []
related: [matplotlib-visualization, plotly-interactive-viz, scikit-learn-ml]
combines_with: [matplotlib-visualization, polars-dataframe, plotly-interactive-viz]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当任务涉及「实体之间的关系」并需要结构化分析时使用本技能，典型场景：

- 建图与改图：从表格/边列表构造网络，给节点和边挂属性。
- 图分析：中心性、最短路径、聚类系数、社区发现、连通性。
- 图算法：Dijkstra、PageRank、最小生成树、最大流等标准算法。
- 网络生成：造随机/无标度/小世界等合成网络用于测试或仿真。
- 图 I/O：读写 edgelist、GraphML、GML、JSON、CSV、邻接矩阵。
- 可视化：用 matplotlib（或 Plotly/PyVis）绘制并定制网络图。

**不该用本技能的边界：**
- 超大规模图（百万节点 / 亿级边的高性能计算）——NetworkX 是纯 Python，性能受限，应转向 igraph、graph-tool 或 Spark GraphFrames。
- 需要持久化存储 + 在线图查询——用图数据库（Neo4j + Cypher），而非内存中的 NetworkX。
- 纯图神经网络 / 图表示学习训练——用 PyG、DGL（NetworkX 仅适合做预处理与特征工程）。
- 输入条件、权限、安全边界或成功标准缺失时，先停下来澄清，不要硬跑。

## 步骤

标准工作流为「建/载 → 看 → 析 → 画 → 导」五步：

1. **创建或加载图**：从零构造或从文件/DataFrame 载入。
2. **检查结构**：节点数、边数、密度、连通性，先对规模和形态有数。
3. **分析**：算中心性、聚类、找路径、检测社区。
4. **可视化**：选合适布局画图，验证直觉。
5. **导出结果**：保存图（GraphML 保属性）与指标表（CSV）。

## 指令

**安装与版本检查**（可选依赖用 `networkx[default]`）：

```python
import networkx as nx
print(nx.__version__)
# 终端安装：uv pip install networkx[default]
```

**四种图类型**：`Graph`（无向单边）、`DiGraph`（有向）、`MultiGraph`（无向多重边）、`MultiDiGraph`（有向多重边）。

**建图与挂属性**（节点可为任意可哈希对象）：

```python
G = nx.Graph()
G.add_node("protein_A", type='enzyme', weight=1.5)
G.add_nodes_from([2, 3, 4])
G.add_edge(1, 4, weight=0.8, relation='interacts')
G.add_edges_from([(1, 3), (2, 4)])
```

**核心算法**：

```python
# 最短路径（带权用 weight 参数）
nx.shortest_path(G, source=1, target=5)
nx.shortest_path_length(G, source=1, target=5, weight='weight')

# 中心性
nx.degree_centrality(G); nx.betweenness_centrality(G); nx.pagerank(G)

# 社区检测
from networkx.algorithms import community
community.greedy_modularity_communities(G)

# 连通性（有向图用 strongly_connected_components）
nx.is_connected(G); list(nx.connected_components(G))
```

**图生成器**（务必设 `seed` 保证可复现）：

```python
nx.erdos_renyi_graph(n=100, p=0.1, seed=42)        # ER 随机图
nx.barabasi_albert_graph(n=100, m=3, seed=42)      # BA 无标度
nx.watts_strogatz_graph(n=100, k=6, p=0.1, seed=42)# WS 小世界
nx.karate_club_graph()                             # 经典数据集
```

**读写**（GraphML 能保留属性，优先用于带属性的图）：

```python
G = nx.read_graphml('g.graphml'); nx.write_graphml(G, 'g.graphml')
# Pandas / NumPy / SciPy 互转
G = nx.from_pandas_edgelist(df, 'source', 'target', edge_attr='weight')
A = nx.to_numpy_array(G); G = nx.from_numpy_array(A)
A = nx.to_scipy_sparse_array(G)  # 大型稀疏图用稀疏矩阵
```

## 示例

从 DataFrame 构图，分析并出版级出图、导指标：

```python
import networkx as nx, pandas as pd, matplotlib.pyplot as plt

df = pd.DataFrame({'source':[1,2,3], 'target':[2,3,4], 'weight':[0.5,1.0,0.75]})
G = nx.from_pandas_edgelist(df, 'source', 'target', edge_attr='weight')

# 看结构
print(G.number_of_nodes(), G.number_of_edges(), nx.density(G), nx.is_connected(G))

# 析：用介数中心性驱动节点大小
cent = nx.betweenness_centrality(G)
sizes = [3000 * cent[n] for n in G.nodes()]

# 画：固定 seed 的力导向布局 + 出版级输出
plt.figure(figsize=(12, 8))
pos = nx.spring_layout(G, seed=42)
nx.draw(G, pos=pos, node_size=sizes, node_color='lightblue',
        edge_color='gray', with_labels=True, font_size=10)
plt.axis('off'); plt.tight_layout()
plt.savefig('network.png', dpi=300, bbox_inches='tight')
plt.savefig('network.pdf', bbox_inches='tight')  # 矢量格式

# 导：图存 GraphML，指标存 CSV
nx.write_graphml(G, 'analyzed.graphml')
pd.DataFrame({'node': list(cent), 'centrality': list(cent.values())}).to_csv('cent.csv', index=False)
```

布局可选：`spring_layout`（力导向，需 seed）、`circular_layout`、`kamada_kawai_layout`、`spectral_layout`。

## 注意事项

- **随机种子**：随机图生成和力导向布局都依赖随机数，务必传 `seed=42` 等固定值，否则结果不可复现。
- **浮点精度**：图含浮点权重时所有结果都是近似值，尤其影响最小/最大类计算的边界判断。
- **内存与性能**：脚本每次运行都要把整图载入内存。大图应：用稀疏矩阵、只载必要子图、用高效格式（pickle / 压缩）、用近似算法（如中心性的 `k` 采样参数）。
- **节点/边类型**：节点可为数字、字符串、元组、自定义对象等任意可哈希对象，用有意义的标识符；删节点会自动删除其所有关联边。
- 不要把输出当作环境特定验证、测试或专家评审的替代品。

## 互见

- 源技能 references 子文档（更深细节）：`graph-basics.md`（图类型与属性）、`algorithms.md`（全量算法）、`generators.md`（生成器）、`io.md`（全部格式）、`visualization.md`（含 Plotly/PyVis/3D）。
- 官方文档：https://networkx.org/documentation/latest/ ｜ 教程：https://networkx.org/documentation/latest/tutorial.html ｜ 画廊：https://networkx.org/documentation/latest/auto_examples/index.html
- 同域（数据/misc）：pandas 数据处理、matplotlib 可视化技能可作为前后置配套。

---
采编自 sickn33/antigravity-awesome-skills（仓库 MIT 许可）；NetworkX 库本身采用 3-clause BSD 许可，原始作者 K-Dense Inc.。本条目为适配重写，非逐字翻译。
