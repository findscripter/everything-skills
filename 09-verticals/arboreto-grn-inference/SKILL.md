---
name: arboreto-grn-inference
title: Arboreto 基因调控网络推断
description: 当需要从基因表达矩阵推断转录因子-靶基因调控网络（GRN）时使用；用 GRNBoost2（梯度提升）或 GENIE3（随机森林）输出 TF-target-importance 三元组并保存为网络/邻接表（pySCENIC 第 1 步）；不适用于已有网络的下游 regulon 识别与活性打分（交给 pySCENIC）、单细胞预处理（用 scanpy）。触发词：GRN、基因调控网络、GRNBoost2、GENIE3、arboreto、SCENIC 邻接矩阵
domain: 领域/science
triggers: [基因调控网络推断, GRNBoost2 / GENIE3, arboreto, 转录因子靶基因关系, pySCENIC 邻接矩阵 Step 1, 单细胞 GRN, consensus 调控网络]
tags: [science, genomics-bioinformatics, single-cell, gene-regulation, scenic, machine-learning]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [arboreto, pandas, dask, distributed, scikit-learn, networkx, matplotlib]
requires: []
related: [arboreto-gene-regulatory-networks, single-cell-rnaseq-analysis, anndata-data-structure, scvi-tools-single-cell]
combines_with: [gene-set-enrichment-analysis, jaspar-tfbs-database]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
采编自 jaechang-hits/SciAgent-Skills（详见结尾）。

## 何时使用

适用场景：

- 从 bulk RNA-seq 表达数据推断转录因子（TF）到靶基因的调控关系。
- 从单细胞 RNA-seq 计数矩阵（行=细胞，列=基因）构建调控网络。
- 生成 pySCENIC 分析流程的邻接矩阵（SCENIC 第 1 步）。
- 跨实验条件（如对照 vs 处理）比较调控网络结构。
- 多随机种子运行得到 consensus（共识）调控网络。
- 用 GRNBoost2 与 GENIE3 在同一数据集上互相验证 GRN 结果。

不该用（负边界）：

- 已有邻接矩阵后的 regulon 识别与细胞活性打分 → 用 pySCENIC（ctx / aucell）。
- 单细胞上游 QC、归一化、聚类、HVG 选择 → 用 scanpy 等预处理工具。
- importance 不是 p 值，不能当显著性检验结果解读；它只是树模型的特征重要度。

## 步骤 / 指令

核心思路：对每个靶基因训练一个回归模型，以其它基因（或指定 TF 列表）为特征，提取特征重要度，输出 `TF, target, importance` 三元组。计算由 Dask 并行化，从笔记本核到 HPC 集群均可扩展。GRNBoost2（梯度提升，快）与 GENIE3（随机森林，经典）签名与输入输出格式完全一致。

环境准备：

```bash
pip install arboreto distributed networkx matplotlib
# 依赖：arboreto pandas numpy dask distributed scikit-learn scipy；Python 3.8+
```

关键约束：作为脚本运行时必须把 arboreto 调用包进 `if __name__ == '__main__':`，因为 Dask 用 multiprocessing 派生 worker 进程；缺少 main guard 会导致进程无限派生。Jupyter notebook 中无需此守卫。

步骤：

1. 加载表达矩阵：pandas DataFrame（推荐）或 NumPy 数组；行=观测（细胞/样本），列=基因，基因名为列头。
2. 加载 TF 列表（可选）：限定调控者为已知 TF，降低计算量并提升生物学相关性；省略则所有基因都作为潜在调控者。务必核对 TF 名称与表达矩阵列名一致（注意大小写）。
3. 配置 Dask Client（可选）：默认用全部本地核；需要资源控制/监控/集群部署时显式创建。
4. 运行推断：调用 `grnboost2()`（默认推荐）或 `genie3()`，务必设 `seed` 保证可复现。
5. 过滤结果：按 importance 阈值，或每个靶基因取 top-N。
6. 保存网络：TSV 三列；供 pySCENIC 使用时去掉表头（`header=False`）。
7. 可视化（可选）：用 networkx + matplotlib 画 top 链接有向图。

关键参数：

| 参数 | 默认 | 取值 | 作用 |
|------|------|------|------|
| `expression_data` | 必填 | DataFrame / ndarray | 表达矩阵，观测 x 基因 |
| `tf_names` | `'all'` | str 列表或 `'all'` | 限定调控者为已知 TF |
| `gene_names` | `None` | str 列表 | 输入为 NumPy 数组时必填 |
| `client_or_address` | `'local'` | Client / 地址 / `'local'` | Dask client 或调度器地址 |
| `seed` | `None` | int | 随机种子，可复现必设 |
| `verbose` | `False` | bool | 打印推断进度 |

算法选择：先用 GRNBoost2（速度快、内存低、适合 1 万+观测的单细胞规模）；仅在复现已发表 GENIE3 分析或独立验证时改用 GENIE3。

## 示例

最小可运行示例（单块完成 GRN 推断）：

```python
import pandas as pd
from arboreto.algo import grnboost2
from arboreto.utils import load_tf_names

if __name__ == '__main__':
    # 加载表达矩阵（观测 x 基因）
    expression_matrix = pd.read_csv('expression_data.tsv', sep='\t')
    tf_names = load_tf_names('tf_list.txt')  # 可选 TF 过滤

    # 推断 GRN（默认使用全部本地核）
    network = grnboost2(expression_data=expression_matrix,
                        tf_names=tf_names, seed=777)

    # 过滤高置信链接并保存
    top_network = network[network['importance'] > 1.0]
    top_network.to_csv('grn_output.tsv', sep='\t', index=False, header=False)
    print(f"Inferred {len(network)} links, kept {len(top_network)} above threshold")
    # 示例：Inferred 185432 links, kept 12876 above threshold
```

显式 Dask client + 完整调用：

```python
from distributed import LocalCluster, Client
from arboreto.algo import grnboost2

if __name__ == '__main__':
    cluster = LocalCluster(n_workers=8, threads_per_worker=1, memory_limit='4GB')
    client = Client(cluster)               # threads_per_worker=1 避免 sklearn GIL 争用
    print(f"Dashboard: {client.dashboard_link}")

    network = grnboost2(
        expression_data=expression_matrix,
        tf_names=tf_names,                 # 无 TF 列表则用 'all'
        client_or_address=client,
        seed=777, verbose=True
    )
    print(network.head())
    #     TF  target  importance
    # 0  MYC    CDK4       3.214
    # 1  MYC   CCND1       2.871

    network.to_csv('full_network.tsv', sep='\t', index=False)
    client.close(); cluster.close()        # 显式创建的需手动清理
```

过滤策略：

```python
# 策略 1：importance 阈值
filtered = network[network['importance'] > 1.0]

# 策略 2：每个靶基因取 top-N
top_per_target = (network.groupby('target')
                  .apply(lambda g: g.nlargest(10, 'importance'))
                  .reset_index(drop=True))
```

多种子 consensus 网络（提升鲁棒性，保留多次运行中一致出现的链接）：

```python
seeds = [42, 123, 456, 789, 1001]
all_networks = []
for seed in seeds:
    net = grnboost2(expression_data=expression_data, tf_names=tf_names,
                    client_or_address=client, seed=seed)
    net['seed'] = seed
    all_networks.append(net)

combined = pd.concat(all_networks, ignore_index=True)
consensus = (combined.groupby(['TF', 'target'])
             .agg(mean_importance=('importance', 'mean'),
                  n_seeds=('seed', 'nunique'))
             .reset_index())
consensus = consensus[consensus['n_seeds'] >= 3].sort_values('mean_importance', ascending=False)
consensus.to_csv('consensus_network.tsv', sep='\t', index=False)
```

集群分布式（50k+ 细胞、20k+ 基因，单机放不下时）：

```bash
# head 节点启动调度器
dask-scheduler                 # 输出 Scheduler at tcp://10.x.x.x:8786
# 各计算节点启动 worker
dask-worker tcp://10.x.x.x:8786 --nprocs 4 --nthreads 1 --memory-limit 16GB
```

```python
client = Client('tcp://10.x.x.x:8786')
network = grnboost2(expression_data=expression_data, tf_names=tf_names,
                    client_or_address=client, seed=42, verbose=True)
```

pySCENIC 衔接（arboreto 产出邻接矩阵 = SCENIC 第 1 步）：

```python
adjacencies = grnboost2(expression_data=expression_matrix,
                        tf_names=load_tf_names('allTFs_hg38.txt'), seed=777)
adjacencies.to_csv('adjacencies.tsv', sep='\t', index=False, header=False)
# 第 2、3 步用 pySCENIC CLI：
# pyscenic ctx adjacencies.tsv hg38_ranking.feather \
#     --annotations_fname motifs-v10nr.hgnc-m0.001-o0.0.tbl --output regulons.csv
# pyscenic aucell scrna_expression.tsv regulons.csv --output auc_matrix.csv
```

预期产物：`full_network.tsv`（TF, target, importance 完整表）、`filtered_network.tsv`（阈值/top-N 子集）、`consensus_network.tsv`（多种子聚合，含 mean_importance、n_seeds）、`adjacencies.tsv`（pySCENIC 输入，无表头）、`grn_network.png`。

## 注意事项

常见问题与排查：

| 问题 | 原因 | 解决 |
|------|------|------|
| `RuntimeError: freeze_support()` 或进程无限派生 | 缺少 `if __name__ == '__main__':` 守卫 | 把所有 arboreto 调用包进 main guard；Jupyter 不需要 |
| 推断时 `MemoryError` | 表达矩阵超出可用内存 | 先过滤低方差基因，降到 top 5-10k 基因，或用分布式集群 |
| 网络为空或近空 | TF 名称与表达矩阵列名不匹配 | 核对 TF 与 `expression_matrix.columns` 重叠，检查大小写 |
| 推断极慢 | 大数据用了 GENIE3，或 Dask worker 太少 | 改用 GRNBoost2；显式创建更多 worker 的 Dask client |
| `ModuleNotFoundError: No module named 'arboreto'` | 未安装 | `pip install arboreto` |
| importance 全为 0 或全相同 | 表达矩阵无方差（如过滤后全 0） | 检查数据质量，确保矩阵含有方差的非零表达值 |
| NumPy 数组输入报 `TypeError` | 缺 `gene_names` 参数 | 传 `gene_names=` 列表，长度匹配数组列数 |

其它要点：

- 输出 DataFrame 三列 `TF / target / importance`，按 importance 降序；importance 是树模型特征重要度，非 p 值。
- 用 `LocalCluster(threads_per_worker=1)` 避免 scikit-learn 的 GIL 争用。
- 显式创建的 client/cluster 用完要 `client.close()` 与 `cluster.close()`。

## 互见

- scanpy 单细胞预处理（QC、归一化、HVG）：GRN 推断的上游。
- scvi-tools：批次校正与插补，网络推断前的深度生成模型。
- pySCENIC：用 arboreto 邻接矩阵做下游 regulon 识别与细胞活性打分。
- networkx 图分析：对推断网络做中心性、社团等图论分析。
- 参考文献：Moerman et al. (2019) Bioinformatics 35(12):2159-2161（GRNBoost2/Arboreto）；Aibar et al. (2017) Nature Methods 14:1083-1086（SCENIC）；[arboreto GitHub](https://github.com/aertslab/arboreto)、[Dask distributed 文档](https://distributed.dask.org/)。

---

采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。源条目 license 标注为 BSD-3-Clause（arboreto 工具本体许可）。
