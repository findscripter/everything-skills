---
name: anndata-data-structure
title: AnnData 单细胞数据结构
description: 当构建/读写/拼接单细胞带注释矩阵（X + obs/var/layers/obsm/uns），或处理超内存 .h5ad/.zarr 时使用；用 anndata 完成对象构建、I/O、子集视图、层与嵌入、按 obs/var 拼接并产出标准 AnnData/.h5ad，供 Scanpy/scvi-tools 消费；不适用于聚类/差异表达/可视化等分析（用 single-cell-rnaseq-analysis）与概率建模（用 scvi-tools）；触发词：anndata、h5ad、单细胞数据结构、obs、var、obsm、layers、concat、backed 模式
domain: 领域/science
triggers: [anndata, h5ad, 单细胞数据结构, obs, var, obsm, layers, concat, backed 模式, zarr]
tags: [anndata, single-cell, scverse, h5ad, zarr, sparse-matrix, bioinformatics, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [anndata, python, scipy, pandas, numpy, h5py, zarr]
requires: []
related: [single-cell-rnaseq-analysis, muon-multiomics-singlecell, scvi-tools-single-cell, cellxgene-census]
combines_with: [single-cell-rnaseq-analysis, harmony-batch-correction, scvi-tools-single-cell]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

当你需要在 scverse 生态里**组织、存取、拼接**单细胞带注释矩阵（observations×variables）时使用本条，典型场景：

- 从原始计数矩阵 + 细胞/基因元数据构建 AnnData 对象
- 读写 `.h5ad` / `.zarr`，或读 10X（`read_10x_h5` / `read_10x_mtx`）、Loom、CSV
- 按质控指标、基因集或元数据条件做子集（视图 vs 拷贝）
- 多批次按 obs 拼接、或多模态按 var 拼接（CITE-seq 等）
- 在一个对象里存多份表示：raw counts / normalized / scaled（layers）、降维（obsm）、图（obsp）
- 处理**超内存**数据集（backed 模式、惰性拼接、on-disk concat）
- 为 Scanpy / scvi-tools 流程准备数据

**不该用本条的边界：**

- 做**分析**（QC 流程、归一化策略、聚类、找 marker、可视化）→ 用 `single-cell-rnaseq-analysis`（Scanpy）
- **概率/深度生成模型**（scVI、scANVI、TOTALVI）→ 用 scvi-tools
- 本条只负责数据结构、I/O 与拼接这一件事

## 步骤

1. 装环境：`pip install "anndata>=0.10"`（按需加 `scanpy zarr h5py`）。
2. 构建对象：`ad.AnnData(X=..., obs=..., var=...)`；计数矩阵优先 `csr_matrix`（稀疏省 ~10x 内存）。
3. I/O：`read_h5ad` / `write_h5ad(compression="gzip")`；大文件用 `backed="r"`。
4. 子集：布尔掩码 / 名称 / 整数索引；**改动前必 `.copy()`**（否则视图触发 `ImplicitModificationWarning`）。
5. 富集结构：`layers`（同 X 形状）、`obsm`/`varm`（嵌入/载荷）、`obsp`/`varp`（稀疏图）、`uns`（自由字典）。
6. 拼接：`ad.concat([...], axis=0/1, join="inner"/"outer", label=, keys=, merge=)`。
7. 保存前：`strings_to_categoricals()` + 稀疏化 + 删 `uns` 大对象 + gzip。

## 指令

AnnData 各槽位（slot）速查：

| 槽位 | 形状 | 用途 | 常见键 |
|---|---|---|---|
| `X` | (n_obs, n_vars) | 主数据（表达计数） | — |
| `obs` | (n_obs, _) | 细胞元数据 | cell_type, batch, n_genes |
| `var` | (n_vars, _) | 基因元数据 | gene_name, highly_variable, mt |
| `layers` | 同 X | 备选表示 | counts, normalized, scaled |
| `obsm` / `varm` | (n_obs,_)/(n_vars,_) | 嵌入 / 载荷 | X_pca, X_umap / PCs |
| `obsp` / `varp` | (n_obs²)/(n_vars²) 稀疏 | 成对图 | connectivities, distances |
| `uns` | 非结构化 dict | 参数/元信息 | neighbors, *_colors |
| `raw` | 原始形状 | 过滤基因前快照 | — |

存储格式选择：`.h5ad`（默认，HDF5，支持 backed `"r"`/`"r+"` 与压缩）；`.zarr`（云存储/并行 I/O，目录式，不支持 backed）；`.h5`（10X，只读）；Loom/CSV（兼容性，CSV 无稀疏/元数据）。

`concat` 关键参数：`axis` 0=堆细胞 / 1=堆基因；`join` inner=共有特征 / outer=并集补 NaN/0；`merge` same/unique/first/only 控制非拼接注释；`label`+`keys` 给 obs 加来源列。

## 示例

构建 + I/O：

```python
import anndata as ad, numpy as np, pandas as pd
from scipy.sparse import csr_matrix

counts = csr_matrix(np.random.poisson(0.5, (500, 2000)).astype(np.float32))
obs = pd.DataFrame({"cell_type": np.random.choice(["T","B","NK"], 500)},
                   index=[f"cell_{i}" for i in range(500)])
var = pd.DataFrame(index=[f"ENSG{i:05d}" for i in range(2000)])
adata = ad.AnnData(X=counts, obs=obs, var=var)
adata.layers["raw_counts"] = counts.copy()
adata.write_h5ad("example.h5ad", compression="gzip")   # 500 cells x 2000 genes
```

子集（视图 vs 拷贝）：

```python
t = adata[adata.obs["cell_type"] == "T"]      # 视图，t.is_view == True
hq = adata[(adata.obs["n_genes"] > 200) & (adata.obs["pct_mito"] < 0.2)].copy()  # 改前必 copy
```

backed 模式（超内存）：

```python
big = ad.read_h5ad("large.h5ad", backed="r")            # 只读惰性
sub = big[big.obs["tissue"] == "brain"].to_memory()     # 仅载入子集
# 分块：for i in range(0, big.n_obs, chunk): big[i:i+chunk].to_memory()
```

拼接（多批次 / 多模态）：

```python
combined = ad.concat([a1, a2], axis=0, join="inner",
                     label="batch", keys=["B1","B2"], merge="same")
combined.obs_names_make_unique()                         # 跨批次同 barcode 去重
multimodal = ad.concat([rna, protein], axis=1)           # 按 var 拼，需 obs 对齐
# 超大惰性：from anndata.experimental import AnnCollection / concat_on_disk(...)
```

富集结构：

```python
adata.obsm["X_pca"]  = np.random.randn(adata.n_obs, 50).astype(np.float32)
adata.obsp["connectivities"] = csr_matrix(np.random.rand(adata.n_obs, adata.n_obs) > 0.99)
adata.uns["neighbors"] = {"params": {"n_neighbors": 15, "method": "umap"}}
```

## 注意事项

- **计数矩阵用稀疏**：scRNA 计数 90%+ 为零，`csr_matrix` 省约 10x 内存；存前 `if not issparse(adata.X): adata.X = csr_matrix(adata.X)`。
- **改视图前必 `.copy()`**：子集返回视图（共享内存），原地改触发 `ImplicitModificationWarning`。
- **超内存别硬读**：用 `backed="r"` → 按 obs/var 过滤 → `.to_memory()` 仅载子集；切勿直接 `read_h5ad` 50GB 文件（`MemoryError`）。
- **归一化前先存原始计数**：`adata.layers["counts"] = adata.X.copy()`——归一化后无法还原原始计数。
- **存前转 categorical**：重复字符串列（cell_type/batch）调 `strings_to_categoricals()` 省内存；gzip 压缩再省 2~5x（追求速度用 `lzf`）。
- **外部数据按索引对齐**：pandas 索引错位会静默插 NaN；赋值用 `series.reindex(adata.obs_names).values`。
- **拼接坑**：var 索引不一致用 `join="inner"` 或先 harmonize；`uns`/`obsm` 含不可序列化对象会 `IORegistryError`，存前清理。
- 版本：`anndata>=0.10`；`AnnCollection`/`AnnLoader`/`concat_on_disk` 属 `anndata.experimental`（接口可能变）。

## 互见

- related：`single-cell-rnaseq-analysis` —— 拿到 AnnData 后做 QC/聚类/marker/可视化的下游分析（Scanpy）
- related：`genomic-file-toolkit` —— 上游测序文件与 10X 输出的格式处理
- combines_with：`single-cell-rnaseq-analysis` —— 本条管「数据结构 + I/O + 拼接」，该条管「分析」，串成完整单细胞流程
- combines_with：`gene-set-enrichment-analysis` —— 注释/marker 结果接富集分析
- related：`nextflow-pipeline-builder` —— 把准备好的 .h5ad 纳入可复现批量流水线

---

本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0），适配重写而非逐字翻译。
