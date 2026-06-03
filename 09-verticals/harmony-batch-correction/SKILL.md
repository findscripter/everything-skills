---
name: harmony-batch-correction
title: Harmony 单细胞批次效应校正
description: 当需要整合来自不同样本/供体/测序批次的单细胞数据并消除技术性批次效应时使用；在 PCA 之后、UMAP 之前对嵌入做 Harmony 校正，产出 X_pca_harmony 校正嵌入及下游邻接图/UMAP/Leiden 聚类，不修改原始计数矩阵；不适用于需要概率式 VAE 校正(scVI)、纯图整合(BBKNN)或锚点式整合(Seurat CCA)的场景；触发词：批次校正、batch correction、Harmony、单细胞整合、harmonypy、批次效应
domain: 领域/science
triggers: [批次效应校正, 单细胞数据整合, Harmony, harmonypy, scRNA-seq 去批次, X_pca_harmony, harmony_integrate, RunHarmony, 多批次合并, batch correction]
tags: [单细胞, scrna-seq, 批次校正, harmony, scanpy, seurat, 生物信息学, 降维整合]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [scanpy, harmonypy, anndata, leidenalg, Seurat, harmony (R)]
requires: []
related: [scvi-tools-single-cell, single-cell-rnaseq-analysis, muon-multiomics-singlecell, anndata-data-structure]
combines_with: [single-cell-rnaseq-analysis, celltypist-cell-annotation, anndata-data-structure]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

适用场景：

- 整合来自不同样本、供体、测序运行或实验批次、但应包含相同细胞类型的 scRNA-seq（或 ATAC-seq 等有 PCA 类嵌入的组学）数据。
- 消除技术性变异（建库协议、10x 化学版本、测序深度/平台）的同时，保留细胞类型与处理条件之间的生物学差异。
- 百万级细胞规模下的快速、可扩展批次校正（深度生成模型训练过慢时）。
- 同时校正多个混杂变量（批次、供体、平台、组织处理协议）。
- 为 UMAP 可视化、Leiden 聚类或标签迁移准备校正后嵌入，且不改动基因表达计数矩阵。

不该用（负边界）：

- 需要变分自编码器的概率式校正、带不确定性的差异表达、或多模态整合（RNA+蛋白）→ 改用 scVI/scvi-tools。
- 想完全跳过构造校正嵌入、直接构建跨批次最近邻图 → 改用 BBKNN。
- 已在 Seurat 工作流中且偏好锚点式整合 → 改用 Seurat Integration / CCA。

## 步骤 / 指令

核心原理：Harmony 以 PCA 嵌入（细胞 × 主成分）为输入，通过迭代「软聚类 + 各簇内对批次变量的线性回归」，把批次特异方向回归扣除，输出同一 PC 空间下的校正嵌入。**原始计数矩阵始终不被修改**；下游邻接图/UMAP/聚类一律基于校正嵌入。

环境准备：

```bash
pip install harmonypy "scanpy[leiden]" anndata pandas matplotlib
```

前置数据：AnnData 含原始计数、`adata.obs` 内有批次/样本列、已算好 `adata.obsm["X_pca"]`。8GB 内存可处理约 50 万细胞，内存近似线性增长。

1. **QC 与预处理 → 算出 PCA**。关键约束：HVG 选择必须按批次进行，否则批次特异 HVG 会主导嵌入。

```python
import scanpy as sc
adata.layers["counts"] = adata.X.copy()          # 先存原始计数
sc.pp.normalize_total(adata, target_sum=1e4)
sc.pp.log1p(adata)
sc.pp.highly_variable_genes(adata, n_top_genes=3000, batch_key="batch")  # 按批次选 HVG
sc.pp.pca(adata, n_comps=50, use_highly_variable=True)
```

2. **运行 Harmony**（两种方式择一）。

scanpy 封装（推荐，内部调用 harmonypy，结果写入 `X_pca_harmony`）：

```python
sc.external.pp.harmony_integrate(
    adata, key="batch", basis="X_pca", adjusted_basis="X_pca_harmony",
    max_iter_harmony=20, theta=2.0, sigma=0.1, random_state=42,
)
```

harmonypy 直接调用（需要细粒度控制或拿到 HarmonyObject 时）：

```python
import harmonypy
ho = harmonypy.run_harmony(
    adata.obsm["X_pca"], adata.obs[["batch", "donor"]],
    vars_use=["batch"], theta=2.0, sigma=0.1,
    nclust=None,            # None → 自动 min(100, n_cells/30)
    max_iter_harmony=20, random_state=42, verbose=True,
)
adata.obsm["X_pca_harmony"] = ho.Z_corr.T   # (n_cells, n_PCs)
```

3. **基于校正嵌入构图 + UMAP**。**务必** `use_rep="X_pca_harmony"`，否则用的还是未校正 PCA。

```python
sc.pp.neighbors(adata, n_neighbors=15, use_rep="X_pca_harmony", random_state=42)
sc.tl.umap(adata, min_dist=0.3, random_state=42)
```

4. **Leiden 聚类 + marker 基因**（在校正图上做）。

```python
for r in [0.3, 0.5, 0.8]:
    sc.tl.leiden(adata, resolution=r, key_added=f"leiden_{r}")
adata.obs["leiden"] = adata.obs["leiden_0.5"]
sc.tl.rank_genes_groups(adata, groupby="leiden", method="wilcoxon", n_genes=50)
```

5. **评估**：分别按 batch 和按 cluster 给 UMAP 上色；与基于 `X_pca` 的未校正 UMAP 对比，确认批次混匀且生物结构保留。

R / Seurat 工作流：`RunHarmony(obj, group.by.vars="batch", dims.use=1:30, theta=2, max.iter.harmony=20)`，随后 `FindNeighbors/FindClusters/RunUMAP` 均用 `reduction="harmony"`。

关键参数：

| 参数 | 默认 | 范围 | 作用 |
|------|------|------|------|
| `theta` | 2.0 | 0–10 | 每个批次变量的多样性惩罚；越大混合越强，批次大小很不均时升到 4–6，0 关闭惩罚 |
| `sigma` | 0.1 | 0.01–0.5 | 软聚类高斯核带宽；越小簇分配越锐，通常无需改 |
| `nclust` | None(自动) | 5–200 | 软簇数；稀有细胞类型多时调大 |
| `max_iter_harmony` | 10 | 5–50 | 最大迭代；批次效应强/收敛慢时升到 20–30 |
| `tau` | 0 | 0–10 | 过聚类保护；小群被过度拆分时设 5 |
| `n_neighbors` | 15 | 5–50 | 后续图的邻居数；>10 万细胞可调大以稳聚类 |

## 示例

多变量同时校正（批次 + 供体 + 平台），每个变量可有独立 theta：

```python
ho = harmonypy.run_harmony(
    adata.obsm["X_pca"], adata.obs[["batch", "donor", "platform"]],
    vars_use=["batch", "donor", "platform"],
    theta=[2.0, 1.0, 2.0],   # 也可传标量对所有变量统一
    max_iter_harmony=30, random_state=42, verbose=True,
)
adata.obsm["X_pca_harmony"] = ho.Z_corr.T
```

保存/复用（避免重跑）：

```python
adata.write_h5ad("harmony_corrected.h5ad", compression="gzip")
# obsm 预期含 ['X_pca', 'X_pca_harmony', 'X_umap']
```

## 注意事项

- **校正嵌入而非计数**：差异表达分析仍用原始/归一化计数（`adata.layers["counts"]` 或 `adata.raw`），绝不用校正后的 PC。
- **PCA 须按批次选 HVG**：跳过 `batch_key` 会导致「校正前后聚类几乎不变」。
- 常见排错：
  - 校正后批次仍在 UMAP 上分离 → 调高 `theta` 到 3–4、用更多 PC（40–50）、确认 `sc.pp.neighbors` 里 `use_rep="X_pca_harmony"`。
  - 过校正（生物学上不同的群被合并）→ 降 `theta` 到 1.0、减少迭代、用 canonical marker 基因验证细胞类型特异性是否仍在。
  - 不收敛（达到最大迭代）→ `max_iter_harmony` 升到 30–50，检查 PCA 是否按批次选了 HVG。
  - `KeyError: 'X_pca_harmony'` → 还没跑 `harmony_integrate`。
  - `ValueError: vars_use not in meta_data` → 批次列名与 `adata.obs.columns` 不一致。
  - 大数据集（>100 万细胞）内存溢出 → 直接用 harmonypy 配分块 PCA；调参阶段可先下采样到约 20 万细胞。
- 诊断过校正的实用手段：在校正后 UMAP 上画 canonical marker（T 细胞 CD3D/CD3E/TRAC、B 细胞 MS4A1/CD79A、NK GNLY/NKG7、单核 LYZ/CD14 等），若 marker 表达弥散、细胞类型分不开，则降 theta 或减少迭代。

## 互见

- scVI / scvi-tools：概率式、多模态批次整合。
- BBKNN：直接构建跨批次最近邻图的图整合。
- Seurat Integration / CCA：R 工作流下的锚点式整合。
- 参考文献：Harmony 原文 Korsunsky et al., Nature Methods 2019 (doi:10.1038/s41592-019-0619-0)；harmonypy (github.com/slowkow/harmonypy)；harmony R 版 (github.com/immunogenomics/harmony)；单细胞最佳实践批次校正章节 (sc-best-practices.org)。

---
本条目采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0），适配重写。
