---
name: arboreto-gene-regulatory-networks
title: Arboreto 基因调控网络推断
description: 当你有基因表达矩阵（bulk/单细胞 RNA-seq，细胞或样本×基因）需推断转录因子→靶基因调控网络（GRN）时使用；用 GRNBoost2 或 GENIE3 跑可分布式的树集成回归，产出 TF/target/importance 三列网络表；不适用于上游表达定量与质控、cisTarget 调控子剪枝（用 pySCENIC）、单细胞标准探索流程（用 scanpy）；触发词：基因调控网络、GRN、转录因子、GRNBoost2、GENIE3、arboreto、pySCENIC、调控关系推断
domain: 领域/science
triggers: [基因调控网络, GRN, 转录因子, GRNBoost2, GENIE3, arboreto, pySCENIC, 调控关系推断]
tags: [bioinformatics, gene-regulatory-network, grnboost2, genie3, arboreto, pyscenic, transcription-factor, dask, rnaseq, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [arboreto, python, pandas, numpy, scipy, scikit-learn, dask, distributed]
requires: []
related: [arboreto-grn-inference, single-cell-rnaseq-analysis, gene-set-enrichment-analysis, string-ppi-database]
combines_with: [anndata-data-structure]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

当你手握基因表达矩阵，想知道**哪些转录因子（TF）调控哪些靶基因**时使用本条，典型场景：

- bulk RNA-seq、单细胞 RNA-seq 的表达矩阵（行=观测/细胞/样本，列=基因）
- 推断 TF→target 共表达调控关系，得到带重要性打分的边表
- 大规模数据需并行/分布式（本地多核或远程 Dask 集群）
- 作为 pySCENIC 的上游 GRN 推断步骤，先出共表达模块再做 cisTarget 剪枝

**不该用本条的边界：**

- 上游表达定量、归一化、质控、聚类 → 用 single-cell-rnaseq-analysis（Scanpy）
- 完整 SCENIC 流程（cisTarget motif 剪枝、调控子定义、AUCell 打分） → 用 pySCENIC，arboreto 只负责其中的共表达推断这一步
- importance 分数**不是**统计显著性或因果，需阈值过滤 / 置换检验另行判定

## 步骤

1. 安装 arboreto 及其 Dask 依赖
2. 准备输入：DataFrame / `numpy.ndarray` / `scipy.sparse.csc_matrix`，**行=观测，列=基因**；数组/稀疏输入必须显式传 `gene_names`
3.（可选）载入 TF 列表 `load_tf_names(...)` 以限制候选调控因子
4. 选算法：默认 **GRNBoost2**（快，适合 10k+ 观测）；需对照/验证时用 GENIE3
5.（可选）配置分布式 client 提速；设 `seed` 保证可复现
6. 运行推断，得到 TF/target/importance 三列网络，过滤后落盘

## 指令

安装：

```bash
uv pip install arboreto
# 或 conda install -c bioconda arboreto
```

依赖：`dask[complete]` `distributed` `numpy` `pandas` `scikit-learn` `scipy`。上游版本 PyPI 0.1.6。

**关键约束**：脚本必须包 `if __name__ == '__main__':` 守卫——Dask 用 spawn 启动新进程，缺守卫会在 Windows/macOS 报错或无限递归。

算法选型：

| 算法 | 内核 | 适用 |
|---|---|---|
| GRNBoost2（推荐） | 梯度提升 | 默认；大数据集快 |
| GENIE3 | 随机森林 | 经典法，用于对照/验证 |

```python
from arboreto.algo import grnboost2, genie3
net = grnboost2(expression_data=matrix)   # 快，推荐
net = genie3(expression_data=matrix)      # 经典，慢
```

## 示例

最小可用流程（基因为列）：

```python
import pandas as pd
from arboreto.algo import grnboost2

if __name__ == '__main__':
    expr = pd.read_csv('expression_data.tsv', sep='\t')   # 行=观测, 列=基因
    network = grnboost2(expression_data=expr, seed=777)
    # 三列：TF, target, importance（无表头）
    network.to_csv('network.tsv', sep='\t', index=False, header=False)
```

限制 TF + 取全局 Top-N：

```python
from arboreto.utils import load_tf_names
from arboreto.algo import grnboost2

if __name__ == '__main__':
    expr = pd.read_csv('rnaseq_tpm.tsv', sep='\t')
    tfs  = load_tf_names('human_tfs.txt')
    network = grnboost2(expression_data=expr, tf_names=tfs, seed=123, limit=5000)
    network.to_csv('tf_target_network.tsv', sep='\t', index=False)
```

自定义本地集群 / 连远程集群（控资源、提速）：

```python
from distributed import LocalCluster, Client
if __name__ == '__main__':
    cluster = LocalCluster(n_workers=10, memory_limit='8GB')
    client = Client(cluster)
    network = grnboost2(expression_data=matrix, client_or_address=client, seed=42)
    client.close(); cluster.close()
# 远程：client = Client('tcp://scheduler:8786')
```

接 pySCENIC / AnnData：

```python
expr_df = adata.to_df()           # cells x genes，AnnData 转 DataFrame
network = grnboost2(expression_data=expr_df, tf_names=tf_list, limit=5000)
# 下游：pySCENIC ctx 剪枝 → 调控子 → AUCell
```

多 seed 共识（鲁棒性）：

```python
combined = pd.concat([
    grnboost2(expression_data=matrix, client_or_address=client, seed=s)
    for s in [42, 123, 777]
])
consensus = (combined.groupby(['TF', 'target'], as_index=False)['importance']
             .mean().query('importance > 0.5'))
```

## 注意事项

- **守卫必加**：`if __name__ == '__main__':` 是硬要求，Dask spawn 多进程依赖它。
- **数据方向**：基因必须是**列**；TF 名要与表达矩阵列名完全匹配，否则结果为空。
- **可复现**：务必传 `seed`，否则每次结果不同；鲁棒性分析跑多 seed 取共识。
- **过滤策略**：推断时 `limit=N` 取全局 Top-N；事后按 `importance` 阈值（如 >0.5）；或 `groupby('target')` 取每靶基因 Top；统计显著性需另做置换检验。
- **稀疏输入**：用 `scipy.sparse.csc_matrix` 并传匹配的 `gene_names`（arboreto 0.1.6 / pySCENIC 0.11+ 支持）。
- **内存/慢**：过滤低方差基因、用 GRNBoost2 而非 GENIE3、缩小 TF 列表、启用分布式 client。
- **importance ≠ 因果/显著性**：它只是树集成回归的特征重要性打分，需下游验证。
- **与 pySCENIC 关系**：pySCENIC 0.12+ 默认走无 Dask 的 `arboreto_with_multiprocessing.py`；需要 Dask 扩展时用独立 arboreto。

## 互见

- combines_with：`single-cell-rnaseq-analysis` —— Scanpy 出处理后的表达矩阵（`adata.to_df()`），喂给 arboreto 推 GRN
- combines_with：`gene-set-enrichment-analysis` —— 对调控网络下游靶基因集做通路富集解读
- related：`scientific-database-lookup` —— 查 TF 列表 / 基因注释
- related：`nextflow-pipeline-builder` —— 把 GRN 推断编进可复现工作流
- related：`genomic-file-toolkit` —— 上游基因组文件处理

---

本条采编自 K-Dense-AI/scientific-agent-skills（MIT），适配重写而非逐字翻译。源 license：BSD-3-Clause（arboreto 库本身）。
