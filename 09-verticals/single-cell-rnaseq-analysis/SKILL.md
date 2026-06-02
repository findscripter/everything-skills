---
name: single-cell-rnaseq-analysis
title: 单细胞 RNA-seq 分析（Scanpy）
description: 当处理单细胞 RNA-seq 数据（.h5ad/10X/CSV）需做质控、归一化、降维聚类、找 marker 基因与可视化时使用；用 Scanpy/AnnData 跑标准探索流程并产出 UMAP/聚类/细胞类型注释与处理后 .h5ad；不适用于深度学习概率模型（用 scvi-tools）、跨条件严谨差异表达（先 pseudobulk 再用 pydeseq2）；触发词：单细胞、scRNA-seq、scanpy、anndata、UMAP、聚类、marker 基因、细胞类型注释
domain: 领域/science
triggers: [单细胞, scRNA-seq, scanpy, anndata, UMAP, 聚类, marker 基因, 细胞类型注释]
tags: [single-cell, rnaseq, scanpy, anndata, bioinformatics, clustering, umap, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [scanpy, anndata, python, leiden, scrublet, pydeseq2, dask]
requires: []
related: [gene-set-enrichment-analysis, genomic-file-toolkit, nextflow-pipeline-builder, scientific-database-lookup]
combines_with: [gene-set-enrichment-analysis, nextflow-pipeline-builder]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

当你需要对单细胞 RNA-seq 数据做标准探索性分析时使用本条，典型场景：

- 分析 .h5ad、10X Genomics、CSV 格式的 scRNA-seq 数据
- 质控（QC）过滤低质量细胞/基因、双胞（doublet）检测
- PCA / UMAP / t-SNE 降维与可视化
- Leiden 聚类、寻找 cluster marker 基因、注释细胞类型
- 轨迹推断 / 拟时序（PAGA、扩散拟时）
- 生成发表级单细胞图表

**不该用本条的边界：**

- 需要深度学习 / 概率生成模型、批次校正建模 → 用 scvi-tools
- 仅有 AnnData 数据结构与 I/O 问题 → 用 anndata 相关资料
- 跨条件/样本的**严谨**差异表达：不要把 `rank_genes_groups` 的每细胞 p 值当作严谨 DE（细胞非独立观测会膨胀 p 值），应先 pseudobulk 聚合再用 pydeseq2

## 步骤

1. 安装与配置环境（Python 3.12+，anndata ≥0.10）
2. 读入数据并理解 AnnData 结构
3. 质控：计算 QC 指标、可视化、按阈值过滤、（可选）双胞检测
4. 归一化与预处理：normalize_total → log1p → 备份 raw → 选高变基因 HVG → 回归混杂 → scale
5. 降维：PCA → 邻接图 neighbors → UMAP（或 t-SNE）
6. 聚类：Leiden（多分辨率试探）
7. Marker 基因：rank_genes_groups（仅探索性）
8. 细胞类型注释：marker 可视化 + cluster→类型映射
9. 保存结果与导出元数据

## 指令

环境（当前稳定版 scanpy 1.12.x，2026-01）：

```bash
uv pip install "scanpy[leiden]"        # [leiden] 装 python-igraph + leidenalg
# 可复现：uv pip install "scanpy[leiden]==1.12.1"
# 大数据/out-of-core 可加 dask（实验性）：uv pip install "scanpy[leiden]" dask
```

初始化（推荐用 settings 存图，逐图 `save=` 在 1.12 已弃用）：

```python
import scanpy as sc, pandas as pd, numpy as np
sc.settings.verbosity = 3
sc.settings.set_figure_params(dpi=80, facecolor='white')
sc.settings.figdir = './figures/'
sc.settings.autosave = True
```

读入：`sc.read_10x_mtx(...)` / `sc.read_10x_h5(...)` / `sc.read_h5ad(...)` / `sc.read_csv(...)`。
AnnData 关键字段：`adata.X`（细胞×基因表达）、`.obs`（细胞元数据）、`.var`（基因元数据）、`.obsm`（PCA/UMAP）、`.raw`（原始备份）、`.obs_names`/`.var_names`。

## 示例

```python
# 1. 质控
adata.var['mt'] = adata.var_names.str.startswith('MT-')
sc.pp.calculate_qc_metrics(adata, qc_vars=['mt'], inplace=True)
sc.pl.violin(adata, ['n_genes_by_counts','total_counts','pct_counts_mt'],
             jitter=0.4, multi_panel=True)
sc.pp.filter_cells(adata, min_genes=200)
sc.pp.filter_genes(adata, min_cells=3)
adata = adata[adata.obs.pct_counts_mt < 5, :]
# 双胞检测（在原始计数、归一化前；1.10 起进核心 API）
sc.pp.scrublet(adata)
adata = adata[~adata.obs['predicted_doublet'], :].copy()

# 2. 归一化与预处理
sc.pp.normalize_total(adata, target_sum=1e4)
sc.pp.log1p(adata)
adata.raw = adata                       # 先备份再过滤基因
sc.pp.highly_variable_genes(adata, n_top_genes=2000)
adata = adata[:, adata.var.highly_variable]
sc.pp.regress_out(adata, ['total_counts','pct_counts_mt'])
sc.pp.scale(adata, max_value=10)

# 3. 降维
sc.tl.pca(adata, svd_solver='arpack')
sc.pl.pca_variance_ratio(adata, log=True)   # 看肘部确定 n_pcs
sc.pp.neighbors(adata, n_neighbors=10, n_pcs=40)
sc.tl.umap(adata)

# 4. 聚类（Leiden 推荐；louvain 在 1.12 已弃用）
sc.tl.leiden(adata, resolution=0.5)
sc.pl.umap(adata, color='leiden', legend_loc='on data')
for res in [0.3, 0.5, 0.8, 1.0]:
    sc.tl.leiden(adata, resolution=res, key_added=f'leiden_{res}')

# 5. Marker（仅探索性）
sc.tl.rank_genes_groups(adata, 'leiden', method='wilcoxon')
sc.pl.rank_genes_groups_dotplot(adata, n_genes=5)
markers = sc.get.rank_genes_groups_df(adata, group='0')

# 6. 细胞类型注释
marker_genes = ['CD3D','CD14','MS4A1','NKG7','FCGR3A']
sc.pl.dotplot(adata, var_names=marker_genes, groupby='leiden')
cluster_to_celltype = {'0':'CD4 T cells','1':'CD14+ Monocytes',
                       '2':'B cells','3':'CD8 T cells'}
adata.obs['cell_type'] = adata.obs['leiden'].map(cluster_to_celltype)

# 7. 保存
adata.write('results/processed_data.h5ad')
adata.obs.to_csv('results/cell_metadata.csv')
```

跨条件严谨 DE 用 pseudobulk（再交给 pydeseq2）：

```python
pb = sc.get.aggregate(adata, by=['sample','cell_type'], func='sum', layer='counts')
```

轨迹推断（PAGA + 扩散拟时）：

```python
sc.tl.paga(adata, groups='leiden'); sc.pl.paga(adata, color='leiden')
adata.uns['iroot'] = np.flatnonzero(adata.obs['leiden']=='0')[0]
sc.tl.dpt(adata); sc.pl.umap(adata, color='dpt_pseudotime')
```

## 注意事项

- **先备份原始计数**：过滤基因前执行 `adata.raw = adata`；画基因表达图用 `use_raw=True` 显示 `.raw` 中归一化值。
- **认真看 QC 图**：阈值随数据质量调整。常用经验值——`min_genes` 200~500，`min_cells` 3~10，`pct_counts_mt` 5%~20%。
- **聚类用 Leiden**，`sc.tl.louvain` 在 1.12 已弃用；多试几个 `resolution`（0.4~1.2，越大簇越多）。
- **关键超参**：`target_sum`（默认 1e4）、`n_top_genes`（2000~3000）、`n_pcs`（看 variance ratio 肘部）、`n_neighbors`（10~30）。
- **DE 不要误用**：`rank_genes_groups` p 值仅供探索，跨条件请 pseudobulk + pydeseq2。
- **存图用 settings**：`sc.settings.autosave` + `figdir`，逐图 `save=` 已弃用；发表图设 `dpi=300, frameon=False`，`file_format_figs='pdf'`。
- **存检查点**：长流程易中途失败，关键步骤写中间结果；多用多个 marker 验证注释。
- 版本要求：Python 3.12+（1.12 已弃 ≤3.11），anndata ≥0.10。

## 互见

- rag-pipeline-builder：当需要把分析结论/文献检索接入检索增强流程时
- csv-data-cleaner：导出的 `cell_metadata.csv` / `gene_metadata.csv` 后续清洗时

---

本条采编自 K-Dense-AI/scientific-agent-skills（MIT），适配重写而非逐字翻译。
