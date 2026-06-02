---
name: muon-multiomics-singlecell
title: muon 多模态单细胞多组学分析
description: 当对同一批细胞的两种及以上组学（10x Multiome RNA+ATAC、CITE-seq RNA+蛋白等）做联合分析时使用；用 muon/MuData 按模态分别预处理（ATAC 走 TF-IDF/LSI、蛋白走 CLR）并构建 WNN 联合嵌入、聚类、MOFA+ 因子分析，产出联合 UMAP/聚类/跨模态 marker；不适用于单一 RNA 模态（用 scanpy）、需深度概率批次校正（用 scvi-tools MultiVI/totalVI）；触发词：muon、MuData、多组学、CITE-seq、10x Multiome、WNN、ATAC、CLR、MOFA
domain: 领域/science
triggers: [muon, MuData, 多组学, CITE-seq, 10x Multiome, WNN, ATAC, CLR, MOFA, 联合嵌入]
tags: [muon, mudata, multiomics, single-cell, cite-seq, multiome, wnn, atac, mofa, science]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [muon, scanpy, anndata, python, mofapy2, leidenalg]
requires: []
related: [single-cell-rnaseq-analysis, anndata-data-structure, scvi-tools-single-cell, macs3-peak-calling]
combines_with: [harmony-batch-correction, celltypist-cell-annotation, single-cell-rnaseq-analysis]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

当你需要对**同一批细胞同时测得的两种及以上组学**做联合分析时使用本条，典型场景：

- 10x Genomics Multiome：同一细胞核的 RNA + ATAC 配对数据
- CITE-seq：RNA + 表面蛋白（ADT）配对数据
- 通过 WNN 把 2 种及以上模态的信号整合成一张联合 UMAP / 聚类
- 对 ATAC 模态做专门预处理（TF-IDF 归一化 + LSI 降维）
- 对表面蛋白做 CLR（中心化对数比）归一化
- 跨模态特征关联、或对多组学层用 MOFA+ 做因子分析

核心数据结构 `MuData` = 多个 `AnnData`（每模态一个：rna/atac/protein…）+ 共享的 obs/var 轴，可对所有模态做协调操作。

**不该用本条的边界：**

- 只有单一 RNA 模态、无共测组学 → 用 `single-cell-rnaseq-analysis`（Scanpy）
- 需要深度生成式概率模型做跨样本/跨模态批次校正 → 用 scvi-tools 的 MultiVI（RNA+ATAC）或 totalVI（CITE-seq）
- 纯 AnnData 结构 / I/O 问题 → 看 AnnData 资料；MuData 的每个模态就是标准 AnnData

## 步骤

1. 装环境：`pip install "muon[all]" "scanpy[leiden]" anndata`，MOFA 需 `pip install mofapy2`。Python 3.9+，>50k 细胞需 16GB+ RAM
2. 构建 MuData：从 `mu.read_10x_h5(...)` 读 Multiome，或用 `mu.MuData({"rna": rna, "atac": atac})` 从分模态 AnnData 组装（各模态需共享 `obs_names`）
3. RNA 模态：标准 Scanpy 流程（QC → `normalize_total` → `log1p` → HVG → `pca`），结果写回 `mdata.mod["rna"]`
4. ATAC 模态：`mu.atac.pp.tfidf()` → `mu.atac.tl.lsi()`，**丢弃 LSI 第 1 主成分**（捕获测序深度而非生物信号）
5. 蛋白模态：`mu.prot.pp.clr()` 做 CLR 归一化，**不要**用 `normalize_total`+`log1p`
6. 对齐：分模态 QC 后细胞数会不一致，WNN 前必须 `mu.pp.intersect_obs(mdata)`
7. WNN 联合图：`mu.pp.neighbors(mdata, key_added="wnn", use_rep={"rna":"X_pca","atac":"X_lsi"})`
8. 下游一律传 `neighbors_key="wnn"`：`sc.tl.umap` → `sc.tl.leiden(key_added="leiden_wnn")`
9. （可选）MOFA+ 因子分析 `mu.tl.mofa(...)`；把联合聚类标签拷回各模态再做模态特异差异分析

## 示例

最小 RNA + ATAC WNN 流程：

```python
import muon as mu, scanpy as sc

# mdata = mu.read_10x_h5("filtered_feature_bc_matrix.h5")  # 真实数据

# RNA 预处理
sc.pp.normalize_total(mdata["rna"], target_sum=1e4)
sc.pp.log1p(mdata["rna"])
sc.pp.highly_variable_genes(mdata["rna"], n_top_genes=3000, flavor="seurat_v3")
sc.pp.pca(mdata["rna"], n_comps=50, use_highly_variable=True)

# ATAC 预处理：TF-IDF + LSI
mu.atac.pp.tfidf(mdata["atac"], scale_factor=1e4)
mu.atac.tl.lsi(mdata["atac"], n_comps=50)

# WNN 联合嵌入（对齐 → 联合图 → UMAP → Leiden）
mu.pp.intersect_obs(mdata)
mu.pp.neighbors(mdata, key_added="wnn",
                use_rep={"rna": "X_pca", "atac": "X_lsi"},
                n_neighbors=30, random_state=42)
sc.tl.umap(mdata, neighbors_key="wnn", random_state=42)
sc.tl.leiden(mdata, neighbors_key="wnn", resolution=0.5, key_added="leiden_wnn")

# 联合 UMAP 上按模态前缀着色（如 "rna:CD3E"）
sc.pl.umap(mdata, color=["leiden_wnn", "rna:CD3E"], use_raw=False, vmax="p99")
```

CITE-seq 关键差异：蛋白模态用 `mu.prot.pp.clr(mdata["protein"])`，再 `sc.pp.pca`，WNN 用 `use_rep={"rna":"X_pca","protein":"X_pca"}`。

把联合标签拷回各模态做模态特异 DE：

```python
for mod in mdata.mod:
    adata = mdata[mod]
    adata.obs["leiden_wnn"] = mdata.obs.loc[adata.obs_names, "leiden_wnn"].values
sc.tl.rank_genes_groups(mdata["atac"], groupby="leiden_wnn",
                        method="wilcoxon", use_raw=False)  # 差异可及峰
```

## 注意事项

- **WNN 前必对齐 obs**：分模态过滤后细胞集合不同，漏掉 `mu.pp.intersect_obs(mdata)` 会触发 `ValueError: obs_names mismatch`
- **ATAC 丢弃 LSI 第 1 维**：与 `log_total_counts` 相关性 >0.9 时，用 `X_lsi[:, 1:]` 再进 WNN
- **`neighbors_key="wnn"` 要贯穿到底**：所有 `umap`/`leiden`/`paga` 都显式传，否则会静默用错默认图 `"neighbors"`
- **蛋白用 CLR 不用 log-normalize**：ADT 噪声模型与 RNA 不同；CLR 对全零细胞会产 NaN，先 `filter_cells(min_genes=1)`
- **归一化前存原始 RNA 计数**：`mdata["rna"].layers["counts"]=mdata["rna"].X.copy()` 并 `.raw=`，供 DE 与 scvi-tools 用
- **WNN 各模态嵌入维度宜相当**（如都取 30 或 50），维度悬殊会下压小模态权重
- **大 ATAC 矩阵内存**：50k+ 峰 × 10k+ 细胞先选 top 峰或分块；TF-IDF 报稀疏矩阵错时先转 `csr_matrix(...astype(float))`
- 转 scvi-tools：用 `ad.concat([rna, atac], axis=1, merge="unique")` 并在 `var["modality"]` 标注模态身份，再喂 `MULTIVI.setup_anndata`

## 互见

- related：`single-cell-rnaseq-analysis` —— 单一 RNA 模态分析，是 muon 中 RNA 子流程的基础
- related：`genomic-file-toolkit`、`scientific-database-lookup`
- combines_with：`gene-set-enrichment-analysis` —— 对 WNN 聚类的 marker 做富集解读
- combines_with：`nextflow-pipeline-builder` —— 上游测序数据到计数矩阵的批量流水线

---
采编自 jaechang-hits/SciAgent-Skills（源许可 BSD-3-Clause，本条以 CC-BY-4.0 再分发）。
