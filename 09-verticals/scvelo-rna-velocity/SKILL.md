---
name: scvelo-rna-velocity
title: scVelo RNA 速率分析
description: 当已有含 spliced/unspliced 层的单细胞 RNA-seq（AnnData）需从快照数据推断分化方向、细胞命运、潜伏时间与驱动基因时使用；用 scVelo 跑 stochastic/dynamical 速率流程并产出 UMAP 速率流线图、latent_time、rank_velocity_genes 与处理后 .h5ad；不适用于无 unspliced 层的数据（先跑 velocyto/STARsolo）、常规聚类注释（用 single-cell-rnaseq-analysis）、命运概率建模（用 CellRank）；触发词：RNA 速率、RNA velocity、scvelo、剪接动力学、latent time、velocyto、轨迹方向、驱动基因
domain: 领域/science
triggers: [RNA 速率, RNA velocity, scvelo, 剪接动力学, latent time, velocyto, 轨迹方向, 驱动基因]
tags: [rna-velocity, scvelo, single-cell, trajectory, anndata, velocyto, bioinformatics, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [scvelo, scanpy, anndata, python, velocyto, numpy, matplotlib]
requires: []
related: [single-cell-rnaseq-analysis, scvi-tools-single-cell, anndata-data-structure, celltypist-cell-annotation]
combines_with: [harmony-batch-correction, umap-dimensionality-reduction, muon-multiomics-singlecell]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

当你需要从单细胞 RNA-seq 的「快照」数据推断细胞状态的**变化方向**（而非仅静态聚类）时使用本条。scVelo 用未剪接（unspliced, pre-mRNA）与已剪接（spliced, mature mRNA）丰度之比，建模剪接动力学，从而判断每个细胞中基因是在上调还是下调，无需 time-course 数据即可重建分化轨迹。典型场景：

- 轨迹方向推断：判断细胞往哪个方向分化（UMAP 上加方向箭头/流线）
- 细胞命运预测：识别祖细胞及其下游命运
- 驱动基因识别：找出动力学最能解释观测轨迹的基因
- 潜伏时间（latent time）/速率拟时：沿剪接动力学给细胞排序
- 发育生物学：造血、神经发生、上皮间充质转化（EMT）等过程

**不该用本条的边界：**

- 数据**没有 unspliced/spliced 层** → 先用 velocyto / STARsolo / kallisto|bustools / alevin-fry 生成（见下）
- 只做常规质控、聚类、marker、注释 → 用 `single-cell-rnaseq-analysis`（Scanpy）
- 自动化细胞类型注释 → 用 `celltypist-cell-annotation`
- 严谨的命运概率/吸收概率建模 → 用 CellRank（在 scVelo 之上扩展）
- 细胞数过少（< ~2000）→ 速率噪声大，结论不可靠

## 步骤

1. **前置数据**：确保 AnnData 含 `layers["spliced"]` 与 `layers["unspliced"]`，可视化还需 `obsm["X_umap"]`。
2. **加载/合并**：直接读 loom，或把 velocyto loom 与 Scanpy 已处理 AnnData（含 UMAP/聚类）`scv.utils.merge` 合并。
3. **预处理**：`filter_and_normalize` → `pp.moments`（一阶/二阶矩，需先 neighbors）。
4. **估计速率**：探索用 `stochastic`（快）；定稿/找驱动基因用 `dynamical`（先 `recover_dynamics`，慢，10K 细胞约 10–30 min）。
5. **构建速率图**：`velocity_graph`（细胞-细胞转移概率）。
6. **下游**（dynamical 专属）：`latent_time` 潜伏时间、`rank_velocity_genes` 驱动基因。
7. **质量**：`velocity_confidence`（速度/相干性）。
8. **可视化**：`velocity_embedding_stream`（流线，最清晰）/ `velocity_embedding`（箭头）/ phase portraits。
9.（可选）`velocity_pseudotime`、`paga`（速率加权轨迹图）。

## 指令

安装：`pip install scvelo`。前置 unspliced/spliced 计数由以下任一生成：velocyto CLI（`velocyto run10x` / `velocyto run`）、STARsolo（`--soloFeatures Gene Velocyto`）、kallisto|bustools（`lamanno` 模式）、alevin-fry/simpleaf。

初始化与加载：

```python
import scvelo as scv, scanpy as sc, numpy as np
scv.settings.verbosity = 3
scv.settings.presenter_view = True
scv.settings.set_figure_params('scvelo')

# A) 直接读 velocyto loom
adata = scv.read("cellranger_output.loom", cache=True)
# B) 合并已处理 AnnData(含 UMAP/聚类) + velocyto loom
adata = scv.utils.merge(sc.read_h5ad("processed.h5ad"), scv.read("velocyto.loom"))
print(adata)   # 须见 layers: 'spliced','unspliced'；obsm: 'X_umap'
```

## 示例

完整流程（dynamical 推荐）：

```python
# 1. 预处理
scv.pp.filter_and_normalize(adata, min_shared_counts=20, n_top_genes=2000)
sc.pp.neighbors(adata, n_neighbors=30, n_pcs=30)   # moments 前需 knn
scv.pp.moments(adata, n_pcs=30, n_neighbors=30)

# 2A. 探索：stochastic（快，精度中等）
scv.tl.velocity(adata, mode='stochastic')
scv.tl.velocity_graph(adata)

# 2B. 定稿：dynamical（慢，精度高，可出驱动基因）
scv.tl.recover_dynamics(adata, n_jobs=4)           # 计算密集
scv.tl.velocity(adata, mode='dynamical')
scv.tl.velocity_graph(adata)

# 3. 潜伏时间（仅 dynamical）
scv.tl.latent_time(adata)
scv.pl.scatter(adata, color='latent_time', color_map='gnuplot', size=80)
top_genes = adata.var['fit_likelihood'].sort_values(ascending=False).index[:300]
scv.pl.heatmap(adata, var_names=top_genes, sortby='latent_time',
               col_color='leiden', n_convolve=100)

# 4. 驱动基因 + 置信度
scv.tl.rank_velocity_genes(adata, groupby='leiden', min_corr=0.3)
print(scv.DataFrame(adata.uns['rank_velocity_genes']['names']).head(10))
scv.tl.velocity_confidence(adata)
scv.pl.scatter(adata, c=['velocity_length','velocity_confidence'],
               cmap='coolwarm', perc=[5, 95])

# 5. 可视化（流线最清晰）
scv.pl.velocity_embedding_stream(adata, basis='umap', color='leiden',
                                 smooth=0.8, min_mass=4)
scv.pl.velocity(adata, ['Cpe','Gnao1','Ins2'], ncols=3, figsize=(16,4))  # phase portraits

# 6.（可选）速率拟时 + PAGA
scv.tl.velocity_pseudotime(adata); scv.pl.scatter(adata, color='velocity_pseudotime', cmap='gnuplot')
scv.tl.paga(adata, groups='leiden'); scv.pl.paga(adata, basis='umap')
```

关键输出字段（写回 AnnData）：`layers['velocity']`（每基因每细胞速率）、`layers['fit_t']`（拟合潜伏时间）、`obsm['velocity_umap']`（2D 速率向量）、`obs['latent_time' / 'velocity_pseudotime' / 'velocity_length' / 'velocity_confidence']`、`var['fit_likelihood']`（模型拟合质量）、`var['fit_alpha'/'fit_beta'/'fit_gamma']`（转录/剪接/降解率）、`uns['velocity_graph']`（转移概率矩阵）。

## 注意事项

- **模型选择**：`stochastic` 快、精度中等，用于探索/大数据集；`deterministic` 适合简单线性动力学；`dynamical` 慢但精度高，发表级且能识别驱动基因——先探索后定稿。
- **必须有 unspliced 层**：缺层先重跑 velocyto，或 STARsolo 加 `--soloFeatures Gene Velocyto`。
- **unspliced 覆盖度要够**：短读（< 100 bp）可能漏掉内含子覆盖，导致速率基因极少。
- **细胞数 ≥ 2000**：太少则速率噪声大。
- **k-NN 带宽很关键**：邻居太少→速率噪声大；太多→过度平滑。箭头乱、看似随机时调 `n_neighbors` 或换模型。
- **生物学合理性自检**：箭头应符合已知生物学；根细胞（祖细胞）对 marker 基因应有高 unspliced/spliced 比；dynamical 模型要求存在清晰的动力学状态（明确分化过程效果最佳）。
- **常见排错**：速率基因极少→降 `min_shared_counts`、查测序深度；dynamical 内存溢出→`n_jobs=1`、减 `n_top_genes`；处处负速率→检查 spliced/unspliced 两层是否被搞反。
- **延伸**：命运预测/吸收概率用 CellRank（扩展 scVelo）；代谢标记替代方案用 dynamo。
- 参考：Bergen et al. (2020) Nature Biotechnology, PMID 32747759；文档 https://scvelo.readthedocs.io/

## 互见

- requires：`single-cell-rnaseq-analysis` —— 速率分析前通常先用 Scanpy 做质控、聚类、UMAP，再把 velocyto loom 合并进来
- related：`celltypist-cell-annotation` —— 给轨迹两端的细胞群做类型注释
- related：`genomic-file-toolkit` —— 处理上游测序/比对文件
- combines_with：`gene-set-enrichment-analysis` —— 对 `rank_velocity_genes` 找到的驱动基因做通路富集，解释轨迹的生物学含义
- combines_with：`nextflow-pipeline-builder` —— 把 velocyto/STARsolo 预处理串成可复现流水线再喂给 scVelo

---

本条采编自 K-Dense-AI/scientific-agent-skills（MIT），适配重写而非逐字翻译。
