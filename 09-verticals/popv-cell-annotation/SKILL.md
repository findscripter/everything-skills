---
name: popv-cell-annotation
title: popV 共识细胞类型注释
description: 当需要把参考图谱的细胞类型标签迁移到未标注 scRNA-seq 查询集，且想要多方法共识而非单模型判断、或要靠方法分歧识别新/过渡态时使用；用 popV 在带标注参考上跑 10+ 算法（KNN-Harmony/BBKNN/Scanorama/scVI、scANVI、CellTypist、ONCLASS、RF、XGBoost、SVM）多数投票，产出 popv_prediction 共识标签 + popv_agreement 一致度分；不适用于已有匹配预训练模型且求快（用 celltypist-cell-annotation）或只要单一概率深度模型（用 scvi-tools-single-cell）；触发词：popV、共识注释、细胞类型注释、标签迁移、参考图谱、majority voting、popv_agreement、ensemble annotation
domain: 领域/science
triggers: [popV, 共识注释, 细胞类型注释, 标签迁移, 参考图谱, majority voting, popv_agreement, ensemble annotation, ONCLASS, scANVI]
tags: [popv, single-cell, cell-annotation, label-transfer, ensemble, consensus, scrna-seq, bioinformatics, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [popv, python, scanpy, anndata, scvi-tools, harmonypy, bbknn, celltypist]
requires: []
related: [celltypist-cell-annotation, single-cell-rnaseq-analysis, scvi-tools-single-cell, anndata-data-structure]
combines_with: [single-cell-rnaseq-analysis, anndata-data-structure]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

当你要把一个**精标注参考图谱**的细胞类型标签迁移到**未标注查询数据集**，并希望得到**多方法共识**而非单模型判断时使用本条，典型场景：

- 标签迁移需要稳健共识：popV 跑 10+ 独立分类器多数投票，单方法失灵不影响最终结论
- 用方法分歧定位**新态/过渡态/罕见群**：`popv_agreement` 低的细胞即候选（不代表注释错，而是生物学上有意思）
- 注释存在大批次效应的大图谱（>100k 细胞），参考与查询间需跨批次校正
- 临床/监管等下游分析要**高置信标签**，需按一致度分层过滤
- 想对比各方法标签做注释可靠性基准、排查系统性分歧

**不该用本条的边界：**

- 已有匹配组织的**预训练模型且求快** → 用 `celltypist-cell-annotation`（popV 要在你的参考上训练多模型，慢）
- 只要**单一概率深度生成模型**+形式化不确定性，不需要集成 → 用 `scvi-tools-single-cell`（scANVI）
- 仅做 QC/聚类/找 marker 等上游分析 → 用 `single-cell-rnaseq-analysis`

## 步骤

1. 装环境：`pip install popv scvi-tools harmonypy bbknn celltypist`（需 `popv>=0.6, scanpy>=1.9, scvi-tools>=1.0`；Python 3.9+，scVI/scANVI 建议 GPU，自动回退 CPU；>200k 参考细胞建议 32GB 内存）。
2. 备数据：参考 `adata_ref`（obs 含细胞类型列）+ 查询 `adata_query`（无需标签）；**同物种、基因集有重叠**；`adata.X` 放**原始 counts**（popV 内部自归一化）。
3. 查基因重叠：`adata_ref.var_names.intersection(adata_query.var_names)`，建议 >70%；<50% 注释质量明显下降。popV 自动取交集子集。
4. 补 batch 列：popV 强制要求 batch，即使单批次也要 `adata.obs["batch"] = "ref_batch"`。
5. 预处理建联合对象：`popv.preprocessing.Process_Query(...)` 归一化 + 选 HVG + 建联合嵌入 + 训 scVI/scANVI（模型存盘可复用）。
6. 跑集成注释：`popv.annotation.annotate_data(adata, methods=[...])`，逐方法在 obs 加 `*_popv` 列 + 共识。
7. 取查询结果：用 `_dataset == "query"` 掩码读 `popv_prediction`（多数票共识）与 `popv_agreement`（赢家标签的方法占比，1.0=全体一致）。
8. 按一致度分层：`>=0.8` 高置信直接用；`<0.5` 低置信查各方法分歧、留人工复核。

## 指令

**方法选择**（`methods` 列表，全选最准但慢；求快剔掉 `scanvi_popv` 与 `onclass`）：

| 方法 | 批次校正 | 速度 | 适用 |
|---|---|---|---|
| `knn_harmony` | Harmony | 快 | 中等批次效应、大数据 |
| `knn_bbknn` | BBKNN | 快 | 多组织异质参考 |
| `knn_scanorama` | Scanorama | 快 | 多个异质批次 |
| `knn_scvi` | scVI VAE | 中 | 复杂批次、概率嵌入 |
| `scanvi_popv` | scVI+标签 | 慢 | 半监督，参考干净时最准 |
| `celltypist_popv` | 无（逻辑回归） | 快 | 免疫细胞，无需批次校正 |
| `rf` / `xgboost` / `svm` | 无 | 中 | 树/核方法，直接吃表达 |
| `onclass` | 无 | 中 | 本体感知（Cell Ontology），可预测参考里没有的邻近类型 |

**关键参数**（均传给 `Process_Query`，除 `methods`）：

| 参数 | 默认 | 范围 | 作用 |
|---|---|---|---|
| `ref_labels_key` | — | obs 列名 | 参考训练标签列 |
| `n_epochs_unsupervised` | 50 | 20–500 | scVI 训练轮数，大/复杂数据调高 |
| `n_epochs_semisupervised` | 20 | 10–100 | scANVI 微调轮数 |
| `hvg` | 4000 | 2000–8000 | HVG 数，供嵌入与 KNN |
| `use_gpu` | True | True/False | scVI/scANVI GPU，无则自动 CPU |
| `unknown_celltype_label` | "unknown" | 任意串 | 注释前查询细胞占位标签 |
| `popv_agreement`（输出） | — | 0.0–1.0 | 共识方法占比，`>=0.8` 视为高置信 |

**参考质量底线**：每类 ≥50–100 细胞（<20 易被 KNN 漏）；避免单类占 80% 的极度不平衡（树方法偏向多数类）；粗标签（~10 类）可靠，细标签（100+ 类）需更大匹配参考。

## 示例

最小端到端（参考标注列 `cell_type`）：

```python
import popv, scanpy as sc

adata_ref = sc.read_h5ad("reference_atlas.h5ad")   # obs["cell_type"] 存在
adata_query = sc.read_h5ad("query_dataset.h5ad")   # 无标签
if "batch" not in adata_query.obs.columns:
    adata_query.obs["batch"] = "query"

adata = popv.preprocessing.Process_Query(
    adata_ref, adata_query,
    ref_labels_key="cell_type",
    ref_batch_key="batch", query_batch_key="batch",
    unknown_celltype_label="unknown",
    save_path_trained_models="./popv_models/",
    n_epochs_unsupervised=100, n_epochs_semisupervised=30,
    use_gpu=True, hvg=4000,
)
popv.annotation.annotate_data(adata)               # 跑默认方法集

query_mask = adata.obs["_dataset"] == "query"
print(adata[query_mask].obs[["popv_prediction", "popv_agreement"]].head(10))
```

置信分层 + 新态检测：

```python
import pandas as pd
qobs = adata[adata.obs["_dataset"] == "query"].obs.copy()

# 一致度分层
qobs["tier"] = pd.cut(qobs["popv_agreement"], bins=[0, 0.5, 0.8, 1.01],
                      labels=["low<0.5", "mid0.5-0.8", "high>=0.8"], right=False)
print(qobs["tier"].value_counts())

# 高置信直接用
print(qobs[qobs["popv_agreement"] >= 0.8]["popv_prediction"].value_counts().head(10))

# 低置信看各方法分歧（候选新/过渡态）
mcols = [c for c in qobs.columns if c.endswith("_popv")
         and c not in ("popv_prediction", "popv_agreement")]
print(qobs[qobs["popv_agreement"] < 0.5][mcols + ["popv_prediction"]].head(10))
```

无 GPU 快速注释（跳过深度学习方法，适合 >500k 细胞）：

```python
adata = popv.preprocessing.Process_Query(
    adata_ref, adata_query, ref_labels_key="cell_type",
    ref_batch_key="batch", query_batch_key="batch",
    unknown_celltype_label="unknown", save_path_trained_models="./popv_models/",
    n_epochs_unsupervised=0, n_epochs_semisupervised=0,  # 跳过 scVI/scANVI 训练
    use_gpu=False, hvg=3000,
)
popv.annotation.annotate_data(adata, methods=[
    "knn_harmony", "knn_bbknn", "knn_scanorama", "rf", "xgboost", "svm", "celltypist_popv"])
```

把结果写回原查询对象并落盘：

```python
qann = adata[adata.obs["_dataset"] == "query"].obs[["popv_prediction", "popv_agreement"]].copy()
adata_query.obs = adata_query.obs.join(qann, how="left")
adata_query.write_h5ad("annotated_query.h5ad", compression="gzip")
```

## 注意事项

- **必须传原始 counts**：`Process_Query` 内部自做归一化；预归一化数据会扭曲 scVI/scANVI 潜空间。
- **`popv_agreement` 低 ≠ 注释错**：常是参考里没有的亚型/过渡态——要么把它们加进参考，要么接受共识落到最近父类型。
- **基因重叠 <50% 慎用**：质量大幅下降，换参考或对齐基因面板（先查重叠再跑）。
- **CUDA OOM**：scVI/scANVI 显存不够时 `use_gpu=False` 或调小 `n_epochs_unsupervised`。
- **`onclass` 小数据易崩**：参考 <10 类或每类 <500 细胞时从 `methods` 删 `"onclass"`。
- **极度不平衡导致全员同一标签**：先对优势类下采样 / 罕见类上采样再跑。
- **慢（>2h）**：多为大参考上训 scVI/scANVI；每类下采样到 50k、并剔除 `scanvi_popv`/`onclass`。
- **省事复用**：`save_path_trained_models` 存的 scVI/scANVI 模型，针对同一参考的新查询批次可复用免重训。
- 列名约定：各方法标签列以 `_popv` 结尾；UMAP 可用 `popv.visualization.predict_celltypes_umap(adata, save=...)` 或自绘 `popv_prediction` / `popv_agreement` 面板。

## 互见

- related：`celltypist-cell-annotation` —— 单模型预训练注释，更快但无集成不确定性；有匹配模型且求快时改用它
- related：`scvi-tools-single-cell` —— scANVI 单一概率深度模型标签迁移，偏好变分框架而非投票时用
- related：`harmony-batch-correction` —— `knn_harmony` 内部用的 Harmony 嵌入，理解它可调 KNN 类方法
- requires：`anndata-data-structure` —— 参考/查询都是 AnnData，先会构建/读写/拼接 .h5ad
- combines_with：`single-cell-rnaseq-analysis` —— 上游 QC/聚类产出 AnnData 输入，下游对共识标签做差异表达/轨迹
- combines_with：`cellxgene-census` —— 从 Census 拉取精标注参考图谱作为 popV 的 `adata_ref`

---

本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0），适配重写而非逐字翻译。popV 工具本身为 BSD-3-Clause。
