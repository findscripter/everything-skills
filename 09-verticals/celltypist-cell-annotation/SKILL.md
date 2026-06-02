---
name: celltypist-cell-annotation
title: CellTypist 单细胞自动注释
description: 当对已归一化的 scRNA-seq（AnnData）做参考库驱动的细胞类型自动注释时使用；用 CellTypist 预训练逻辑回归模型（45+：泛免疫/肺/脑/胎儿/肿瘤微环境）产出每细胞标签、簇级多数投票标签与置信度，并可训练自定义模型；不适用于需 VAE 概率标签迁移+批次校正（用 scVI/scANVI）或 10+ 方法集成共识（用 popV），也不替代手动 marker 注释；触发词：CellTypist、细胞类型注释、多数投票、majority_voting、置信度、Immune_All_Low、预训练模型
domain: 领域/science
triggers: [CellTypist, 细胞类型注释, 多数投票, majority_voting, 置信度, Immune_All_Low, 预训练模型, 自动注释]
tags: [celltypist, single-cell, scRNA-seq, cell-annotation, logistic-regression, majority-voting, anndata, scanpy, science, bioinformatics]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [celltypist, scanpy, anndata, python, leiden]
requires: []
related: [single-cell-rnaseq-analysis, scvi-tools-single-cell, anndata-data-structure, harmony-batch-correction]
combines_with: [single-cell-rnaseq-analysis, harmony-batch-correction]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

当你已有**归一化 + log1p**（target_sum=1e4）的 AnnData，需要快速、参考库驱动的细胞类型自动注释时使用本条，典型场景：

- 用单一标准参考模型注释 PBMC / 全血 / 淋巴结等免疫数据集
- 手动 marker 校验前先出一版「首过」注释
- 借簇级**多数投票**平滑噪声每细胞预测，得到生物学连贯的共识标签
- 跨多个组织特异模型对比注释结果，挑最相关的参考
- 为内置模型未覆盖的组织/物种，从带标签参考训练自定义模型
- 量化注释置信度，标记低置信细胞（conf_score < 0.5）供复核/剔除

**不该用本条的边界：**

- 需要 VAE 概率标签迁移 + 批次校正 + 不确定性量化 → 用 scVI/scANVI
- 想要 10+ 方法（含深度学习、KNN）的集成共识 → 用 popV
- 它**不替代**基于 canonical marker 的人工注释，只做首过/平滑
- 输入必须先归一化；直接喂原始计数会报 `adata.X does not appear to be log1p normalized`
- 物种/组织不匹配（如人模型跑鼠数据、免疫模型跑神经元）会产生虚假标签

## 步骤

1. 安装并下载/缓存预训练模型（首次需联网，~2 GB）
2. 数据准备：原始计数先备份，再 `normalize_total(1e4)` → `log1p`
3. 选模型：按组织/物种 + 注释分辨率匹配（用 `models.models_description()` 查表）
4. 注释：`celltypist.annotate(majority_voting=True, over_clustering="leiden")`
5. 回写结果：`predictions.to_adata()`，审查 `conf_score`，标记低置信细胞
6. 可视化校验：UMAP 上画标签 + canonical marker dotplot 复核

## 指令

环境（celltypist≥1.6，scanpy≥1.9）：

```bash
pip install celltypist "scanpy[leiden]" anndata
```

关键参数（`celltypist.annotate`）：

| 参数 | 默认 | 作用 |
|---|---|---|
| `model` | — | `.pkl` 文件名/路径，须匹配组织/物种 |
| `majority_voting` | `False` | `True` 时把每细胞标签平滑为簇级共识，需 `over_clustering` |
| `over_clustering` | `None` | 多数投票用的聚类列（`"leiden"`/`"louvain"`/任意 obs 键） |
| `p_thres` | `0.5` | 低于此概率标 `"Unassigned"`（仅 `mode="prob match"` 生效） |
| `mode` | `"best match"` | `best match` 取最高概率标签；`prob match` 应用 `p_thres` |
| `min_prop` | `0.0` | 多数投票时簇内共识标签最小占比，过低会抑制稀有标签 |

结果列：`predicted_labels`（每细胞最佳匹配）、`majority_voting`（簇共识）、`conf_score`（预测标签概率 0–1，>0.5 视为可信）。

模型选型速查：`Immune_All_Low.pkl`（98 型，泛免疫细亚型）、`Immune_All_High.pkl`（30 型，主谱系）、`Human_Lung_Atlas.pkl`（61，肺）、`Pan_Fetal_Human.pkl`（139，胎儿多器官）、`Developing_Human_Brain.pkl`（51，脑发育）、`Human_Colorectal_Cancer.pkl`（62，结直肠癌+TME）。

## 示例

```python
import celltypist
from celltypist import models
import scanpy as sc

# 0. 首次下载模型（之后本地缓存）
models.download_models(force_update=False)

# 1. 数据准备：先备份原始计数，再归一化 + log1p
adata = sc.read_h5ad("raw_counts.h5ad")
adata.layers["counts"] = adata.X.copy()
sc.pp.normalize_total(adata, target_sum=1e4)
sc.pp.log1p(adata)

# 2. 多数投票需先有聚类
sc.pp.highly_variable_genes(adata, n_top_genes=2000)
sc.pp.pca(adata); sc.pp.neighbors(adata, n_pcs=30)
sc.tl.leiden(adata, resolution=0.5, key_added="leiden")

# 3. 注释
predictions = celltypist.annotate(
    adata,
    model="Immune_All_Low.pkl",
    majority_voting=True,
    over_clustering="leiden",
    p_thres=0.5,
    mode="best match",
)
adata = predictions.to_adata()
print(adata.obs[["predicted_labels", "majority_voting", "conf_score"]].head())

# 4. 标记低置信细胞
low = adata.obs["conf_score"] < 0.5
adata.obs["high_conf"] = ~low
print(f"低置信细胞 {low.sum()} ({low.mean():.1%})")

# 5. marker 复核（注意 use_raw=False，用已归一化的 X）
markers = {"CD4+ T": ["CD3D","CD4","IL7R"], "B cells": ["MS4A1","CD79A"],
           "NK cells": ["GNLY","NKG7"], "CD14 Mono": ["CD14","LYZ"]}
sc.pl.dotplot(adata, var_names=markers, groupby="majority_voting",
              use_raw=False, standard_scale="var")
```

训练自定义模型（内置模型未覆盖你的组织/物种时）：

```python
new_model = celltypist.train(
    ref,                 # 归一化 + log1p 的带标签参考
    labels="cell_type",  # obs 中字符串标签列
    n_jobs=4, max_iter=200,
    use_SGD=False,       # <100k 细胞用全量 L-BFGS-B
    top_genes=500,
)
new_model.write("custom_tissue_model.pkl")
preds = celltypist.annotate(query, model="custom_tissue_model.pkl", majority_voting=True)
```

## 注意事项

- **输入必须归一化**：未做 `normalize_total(1e4)` + `log1p` 会直接报错；原始计数要单独存到 layer。
- **多数投票何时关**：簇内生物学异质（如过渡态）时关掉，避免把真实亚群抹平。
- **基因空间对齐**：模型按基因名取交集，缺失基因零填充；若数据含的模型基因 <~60%，注释质量会显著下降。
- **置信度阈值**：`mode="best match"` 不应用 `p_thres`，要让低概率细胞落 `"Unassigned"` 须用 `mode="prob match"`。
- **大数据集 MemoryError**（>50 万细胞）：概率矩阵占内存，可下采到 20 万注释后 KNN 迁移标签，或用 `mode="best match"` 跳过存全概率矩阵。
- **整体 conf_score 偏低**（中位 <0.4）说明参考模型不匹配数据，应训自定义模型或改用 popV 集成。
- **模型下载失败**：`models.download_models(force_update=True)`，名字用 `models.models_description()["model"].tolist()` 核对。

## 互见

- requires：`single-cell-rnaseq-analysis` —— 它产出 QC/归一化后的 AnnData，正是 CellTypist 的合规输入
- combines_with：`single-cell-rnaseq-analysis` —— 先 Scanpy 预处理+聚类，再 CellTypist 注释，形成完整注释流水线
- related：`gene-set-enrichment-analysis` —— 注释后按细胞类型做富集分析
- related：`genomic-file-toolkit`、`protein-language-models`、`scientific-database-lookup`

---

本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0），适配重写而非逐字翻译。
