---
name: scvi-tools-single-cell
title: scvi-tools 单细胞深度生成模型
description: 当需用深度生成模型（VAE）对单细胞组学做概率批次校正、半监督细胞注释、CITE-seq RNA+蛋白联合建模、参考→查询迁移学习或带不确定性的差异表达时使用；在 AnnData 原始计数上走 setup_anndata→train→get_* 统一 API，产出批次校正潜空间/去噪表达/细胞类型预测/概率 DE；不适用于无批次效应的常规聚类可视化（用 scanpy）或秒级线性批次校正（用 harmony）；触发词：scvi-tools、scVI、scANVI、totalVI、批次校正、CITE-seq、迁移学习、概率差异表达
domain: 领域/science
triggers: [scvi-tools, scVI, scANVI, totalVI, 批次校正, CITE-seq, 迁移学习, 概率差异表达, scARCHES, DestVI, doublet 检测]
tags: [single-cell, scvi-tools, deep-learning, vae, batch-correction, cite-seq, anndata, bioinformatics, science]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [scvi-tools, scanpy, anndata, python, pytorch]
requires: []
related: [single-cell-rnaseq-analysis, harmony-batch-correction, celltypist-cell-annotation, muon-multiomics-singlecell]
combines_with: [single-cell-rnaseq-analysis, anndata-data-structure, celltypist-cell-annotation]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

当需要用**深度生成模型（基于 PyTorch 的变分自编码器 VAE）** 对单细胞组学做概率建模时使用本条。所有模型共享统一 API：`setup_anndata()` 注册数据 → 实例化模型 → `train()` → `get_*()` 提取结果。典型场景：

- 多批次/多研究 scRNA-seq 概率批次校正，同时保留生物变异（scVI）
- 带不确定性量化与复合假设（非单纯 fold-change 阈值）的差异表达
- 从部分标注的参考集做半监督细胞类型注释（scANVI）
- CITE-seq RNA+蛋白联合建模，得去噪蛋白估计与联合嵌入（totalVI）
- 预训练模型适配到新查询集而无需全量重训（scARCHES 迁移学习）
- 空间转录组 spot 按 scRNA-seq 参考反卷积成细胞类型比例（DestVI）
- doublet 检测作为 QC 预处理步骤（Solo）

**不该用本条的边界：**

- 无批次效应、只做常规聚类/可视化/marker → 用 scanpy（`single-cell-rnaseq-analysis`），可把 scVI 潜空间作为 `sc.pp.neighbors(use_rep="X_scVI")` 输入
- 只需快速线性批次校正（秒级 vs 分钟级、无深度学习开销）→ 用 harmony
- 多模态 MuData 工作流（RNA+ATAC Multiome 联合对象）→ 用 muon
- 仅 AnnData 数据结构/IO 问题 → 用 anndata 相关资料

## 步骤

统一 4 步工作流（所有模型一致）：

1. **注册数据**：`ModelClass.setup_anndata(adata, layer="counts", batch_key=..., ...)` 告诉 scvi-tools 计数、批次、协变量在哪。
2. **实例化模型**：`model = ModelClass(adata, n_latent=..., ...)` 设架构超参。
3. **训练**：`model.train(max_epochs=..., early_stopping=True)`（自动检测 GPU）。
4. **提取结果**：`model.get_latent_representation()` / `get_normalized_expression()` / `differential_expression()` / `predict()`。

模型选型：

| 数据 | 模型 | 核心能力 | 何时用 |
|---|---|---|---|
| scRNA-seq | **scVI** | 批次校正+去噪 | 任何多批次 scRNA-seq 的默认起点 |
| scRNA-seq（部分标注） | **scANVI** | 细胞类型迁移 | 有参考标签、要注释查询集 |
| CITE-seq（RNA+蛋白） | **totalVI** | 联合 RNA+蛋白 | 10x CITE-seq、REAP-seq |
| 参考→查询 | **scARCHES** | 迁移学习 | 把新数据映射到已有图谱 |
| 空间 | **DestVI** | spot 反卷积 | 10x Visium、Slide-seq |
| scRNA-seq QC | **Solo** | doublet 检测 | 分析前 QC |

## 指令

环境（要求 `scvi-tools>=1.1`）：

```bash
pip install scvi-tools scanpy
pip install "scvi-tools[cuda12]"   # GPU 加速，>50k 细胞推荐；或 [cuda11]
```

**硬约束 — 必须用原始计数**：模型直接从原始数据学习计数分布，传入 log-归一化数据会**静默产出错误潜空间**。预处理前先备份原始计数：

```python
adata.layers["counts"] = adata.X.copy()   # 任何变换前先存原始计数
sc.pp.normalize_total(adata, target_sum=1e4); sc.pp.log1p(adata)
# 之后：setup_anndata(..., layer="counts")
```

`setup_anndata` 可额外注册协变量：`categorical_covariate_keys=["donor","protocol"]`、`continuous_covariate_keys=["percent_mito"]`。注册的批次/技术来源越全，潜空间与下游 DE 越干净。

## 示例

**scVI 多批次整合（最小流程）：**

```python
import scvi, scanpy as sc

adata.layers["counts"] = adata.X.copy()
sc.pp.normalize_total(adata, target_sum=1e4); sc.pp.log1p(adata)
sc.pp.highly_variable_genes(adata, n_top_genes=2000, batch_key="batch", subset=True)

scvi.model.SCVI.setup_anndata(adata, layer="counts", batch_key="batch")
model = scvi.model.SCVI(adata, n_latent=30, n_layers=2)
model.train(max_epochs=300, early_stopping=True, early_stopping_patience=15)

adata.obsm["X_scVI"] = model.get_latent_representation()
sc.pp.neighbors(adata, use_rep="X_scVI", n_neighbors=30)  # 用 scVI 潜空间而非 PCA
sc.tl.umap(adata); sc.tl.leiden(adata, resolution=0.5)
model.save("./scvi_model/", overwrite=True)
```

**scANVI 半监督注释（推荐 scVI→scANVI 两步）：**

```python
scvi.model.SCANVI.setup_anndata(adata, layer="counts", batch_key="batch",
    labels_key="cell_type", unlabeled_category="Unknown")  # 未标注细胞标 "Unknown"
scvi_model = scvi.model.SCVI(adata, n_latent=30); scvi_model.train(max_epochs=200, early_stopping=True)
model = scvi.model.SCANVI.from_scvi_model(scvi_model, unlabeled_category="Unknown")
model.train(max_epochs=20)                  # scVI 之上短微调

adata.obs["scANVI_pred"] = model.predict()
conf = model.predict(soft=True).max(axis=1)  # 每细胞置信度
adata.obs.loc[conf < 0.7, "scANVI_pred"] = "Unknown"  # 低置信度别硬取 argmax
```

**概率差异表达（复合假设：|LFC|>delta）：**

```python
de = model.differential_expression(groupby="cell_type", group1="CD4 T", group2="CD8 T",
    mode="change", delta=0.25, fdr_target=0.05, all_stats=True)
sig = de[de["is_de_fdr_0.05"] & (de["lfc_mean"].abs() > 0.5)]
# 关键列：lfc_mean、bayes_factor、proba_de
```

**totalVI（CITE-seq）：** 蛋白计数须放 `adata.obsm["protein_expression"]`（不是 X/layers）。

```python
scvi.model.TOTALVI.setup_anndata(adata, layer="counts", batch_key="batch",
    protein_expression_obsm_key="protein_expression")
model = scvi.model.TOTALVI(adata, latent_distribution="normal"); model.train(max_epochs=200, early_stopping=True)
adata.obsm["X_totalVI"] = model.get_latent_representation()
rna_norm, protein_norm = model.get_normalized_expression(n_samples=25, return_mean=True)
fg = model.get_protein_foreground_probability(n_samples=25, return_mean=True)  # 前景概率(信号>背景)
```

**scARCHES 参考→查询迁移：** 查询集基因须与参考完全一致。

```python
ref_scanvi = scvi.model.SCANVI.load("./reference_scanvi/", adata=ref_adata)
query_adata = query_adata[:, ref_adata.var_names]   # 对齐基因，训练后勿再 subset
query_adata.obs["cell_type"] = "Unknown"
qm = scvi.model.SCANVI.load_query_data(query_adata, ref_scanvi)
qm.train(max_epochs=100, plan_kwargs={"weight_decay": 0.0})  # 关键：防灾难性遗忘
q_latent, q_labels = qm.get_latent_representation(query_adata), qm.predict(query_adata)
```

**Solo doublet 检测（QC）：**

```python
solo = scvi.external.SOLO.from_scvi_model(vae); solo.train(max_epochs=200)
pred = solo.predict()  # {"singlet","doublet"} 概率 + prediction
adata = adata[solo.predict()["prediction"].values == "singlet"].copy()
```

**关键超参**：`n_latent`（默认 10，建议 20–30；>500k 大图谱可到 50）、`n_layers`(1–3)、`n_hidden`(64–256)、`gene_likelihood`("zinb"/"nb"/"poisson"，稀疏度低时 "nb" 更快)、`delta`(DE 最小 |LFC|，默认 0.25)、`n_samples`(后验采样，≥25 才稳定)。

## 注意事项

- **必存原始计数**：加载后立即 `adata.layers["counts"] = adata.X.copy()`，再做任何 `normalize_total`/`log1p`。`ValueError: adata must contain raw counts` 即此因。
- **训练前选 HVG**：`highly_variable_genes(n_top_genes=2000~4000, batch_key="batch")`，全基因极少更好却显著拖慢。
- **注册全部批次变量**：测序板、donor、protocol 等都进 `batch_key`/`categorical_covariate_keys`，未注册的批次效应会污染潜空间与 DE。
- **scANVI 用两步法**：`from_scvi_model()` 比从零训更快更稳；每类需 ≥50 个标注细胞，否则可能全预测同一标签；`unlabeled_category` 须精确匹配。
- **立即保存模型**：`model.save("./dir/")`，重载 `SCVI.load()` 是秒级 vs 重训分钟级（模型约 10–50MB）。
- **CUDA OOM**：减 `batch_size=64`、`n_hidden=64`，或减少 HVG；小数据可用 CPU（<50k 细胞 CPU 可跑，更大用 8GB+ GPU）。
- **训练 loss 震荡不降**：`lr=1e-4`；检查注册 layer 是否含负值/异常稀疏。
- **批次分离（UMAP 上不混合）**：确认 `batch_key` 列存在、增 `max_epochs`、加 `early_stopping=True`。
- **`load()` KeyError/shape mismatch**：查询集 `var_names` 须与训练数据完全一致，训练后勿再 subset 基因。
- DE 用 scVI 概率 DE 比 scanpy Wilcoxon 更准；潜空间后续聚类/marker 交给 scanpy。

## 互见

- related：`single-cell-rnaseq-analysis` —— Scanpy 标准 scRNA-seq 流程；把 scVI 潜空间作 `use_rep="X_scVI"` 输入做 UMAP/聚类/marker
- related：`genomic-file-toolkit` —— AnnData/.h5ad 等基因组文件的读写与转换
- related：`protein-language-models` —— 另一类生物深度生成/表征模型
- combines_with：`gene-set-enrichment-analysis` —— 对概率 DE 得到的显著基因做通路/富集分析
- combines_with：`scientific-database-lookup` —— 拉取参考图谱供 scANVI 标签迁移与 scARCHES 查询映射

---

本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0），适配重写而非逐字翻译。源技能原始 license 为 BSD-3-Clause（代码许可），文档内容按 CC-BY-4.0 署名采编。
