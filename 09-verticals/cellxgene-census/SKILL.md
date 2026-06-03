---
name: cellxgene-census
title: CELLxGENE Census 海量单细胞查询
description: 当需要从 CZ CELLxGENE Census（6100 万+ 标准化人/鼠单细胞观测）按细胞类型/组织/疾病/物种检索表达数据时使用；用 cellxgene_census Python API 做元数据查询、取 AnnData、out-of-core 流式处理或 PyTorch 训练，产出可下游分析的矩阵；不适用于分析自有 scRNA-seq 数据（用 scanpy）或操作 AnnData 对象（用 anndata）。触发词：cellxgene census、单细胞图谱查询、get_anndata
domain: 领域/science
triggers: [cellxgene census, CELLxGENE Census 查询, 单细胞图谱表达检索, get_anndata 取细胞, open_soma 连接 census, 按细胞类型/组织/疾病查单细胞, out-of-core 流式单细胞, Census PyTorch 训练]
tags: [science, genomics, single-cell, scrna-seq, cellxgene, census, tiledb-soma, anndata, pytorch]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [cellxgene_census, tiledbsoma, scanpy, anndata, pytorch]
requires: []
related: [single-cell-rnaseq-analysis, anndata-data-structure, celltypist-cell-annotation, scvi-tools-single-cell]
combines_with: [single-cell-rnaseq-analysis, anndata-data-structure, gget-genomic-databases]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

CZ CELLxGENE Census 通过编程方式提供 6100 万+ 条标准化的人类与小鼠 scRNA-seq 观测，支持按细胞类型、组织、疾病、供体等元数据做群体规模查询，返回 AnnData 或 PyTorch DataLoader。

适用：
- 跨组织/疾病/细胞类型从策展图谱检索单细胞表达数据
- 构建细胞类型分类、marker 基因发现的参考数据集
- 在大规模单细胞数据上训练 ML 模型（PyTorch 集成）
- 群体规模比较条件间表达（如 COVID-19 vs 健康）
- 探查某组织/疾病有哪些可用单细胞数据集

不该用（负边界）：
- 分析**自己的 scRNA-seq 数据** → 用 scanpy
- 操作 AnnData 对象（取子集、拼接）→ 用 anndata

## 步骤

1. **装包**：`pip install cellxgene-census`（注意是连字符）；ML 工作流加装 `pip install cellxgene-census[experimental]`。
2. **连接**：始终用上下文管理器 `with cellxgene_census.open_soma() as census:`；生产环境用 `census_version="YYYY-MM-DD"` 锁版本保证可复现。
3. **先估规模**：用 `get_obs(..., column_names=["soma_joinid"])` 数清细胞数，再决定取数方式。
4. **取数**：<100k 细胞用 `get_anndata` 直接拿 AnnData；>100k 用 `axis_query` 做 out-of-core 流式分块。
5. **过滤约束**：所有 `obs_value_filter` 务必带 `is_primary_data == True`，否则跨数据集重复细胞会膨胀计数、偏置分析。
6. **下游**：交给 scanpy 归一化、聚类、差异表达、可视化，或 `adata.write_h5ad()` 导出。

## 指令

- 连接探查：`open_soma()` 后读 `census["census_info"]["summary"]` / `["datasets"]`。
- 仅元数据查询（不下表达）：`get_obs(census, "homo_sapiens", value_filter=..., column_names=[...])`；基因元数据用 `get_var`。
- 取表达矩阵：`get_anndata(census=, organism=, obs_value_filter=, var_value_filter=, obs_column_names=)`。
- 流式：`census["census_data"][organism].axis_query(measurement_name="RNA", obs_query=soma.AxisQuery(...), var_query=...)`，遍历 `query.X("raw").tables()`。
- 检查基因覆盖：`get_presence_matrix(census, organism, var_value_filter=...)` →（n_datasets, n_genes）。
- PyTorch：`from cellxgene_census.experimental.ml import experiment_dataloader`。

**filter 语法**：`and`/`or` 组合；`feature_name in ['CD4','CD8A']` 多值；`cell_count > 1000` 比较。

**关键参数**：`organism`（"Homo sapiens"/"Mus musculus"）、`census_version`（锁版本）、`obs_value_filter`/`var_value_filter`、`obs_column_names`（只取需要的列减少传输）、`batch_size`(默认128)、`shuffle`。

**关键元数据字段**：`cell_type`(Cell Ontology 标签)、`tissue_general`(粗粒度，约30类，适合跨组织对比)、`tissue`(具体组织，数百值)、`disease`、`assay`、`is_primary_data`(永远过滤 True)、`donor_id`(批次效应)。

## 示例

取肺部 B 细胞（Quick Start）：

```python
import cellxgene_census

with cellxgene_census.open_soma() as census:
    adata = cellxgene_census.get_anndata(
        census=census,
        organism="Homo sapiens",
        obs_value_filter="cell_type == 'B cell' and tissue_general == 'lung' and is_primary_data == True",
        obs_column_names=["cell_type", "disease", "donor_id"],
    )
    print(f"Retrieved {adata.n_obs} cells × {adata.n_vars} genes")
    # 约 15000 cells × 60664 genes
```

大规模 out-of-core 流式统计：

```python
import cellxgene_census, tiledbsoma as soma

with cellxgene_census.open_soma() as census:
    query = census["census_data"]["homo_sapiens"].axis_query(
        measurement_name="RNA",
        obs_query=soma.AxisQuery(
            value_filter="tissue_general == 'brain' and is_primary_data == True"),
        var_query=soma.AxisQuery(
            value_filter="feature_name in ['FOXP2', 'TBR1', 'SATB2']"),
    )
    n_obs, total = 0, 0.0
    for batch in query.X("raw").tables():
        values = batch["soma_data"].to_numpy()
        n_obs += len(values); total += values.sum()
    print(f"Processed {n_obs:,} non-zero entries, mean={total/n_obs:.4f}")
```

导出心脏细胞子集为 h5ad：

```python
adata = cellxgene_census.get_anndata(
    census=census, organism="Homo sapiens",
    obs_value_filter="tissue_general == 'heart' and is_primary_data == True",
    obs_column_names=["cell_type", "disease", "donor_id", "assay"])
adata.write_h5ad("heart_cells.h5ad")
```

## 注意事项

- **务必 `is_primary_data == True`**：缺失会导致跨数据集重复细胞，膨胀计数并偏置结果。
- **先估规模再下数据**：`get_obs` 只取 `soma_joinid` 数细胞；>100k 改用 `axis_query` 流式，避免 `MemoryError`。
- **锁 `census_version`**：默认 "latest stable" 会周期变动，已发表分析必须 pin 版本。
- **只取所需列/基因**：传 `obs_column_names`、`var_value_filter`，避免为 3 个 marker 下载约 6 万基因全矩阵浪费带宽内存。
- **跨组织用 `tissue_general`**，具体组织用 `tissue`。
- **基因找不到**：注意大小写；可改用 Ensembl `feature_id`；用 `get_presence_matrix` 确认是否被测。
- **ConnectionError/超时**：1-2 分钟后重试，pin 具体版本更稳。
- 后端为 TileDB-SOMA 云端，无显式限速，但大查询请走 out-of-core；始终用上下文管理器释放资源。

## 互见

- **scanpy-scrna-seq** — Census 数据的下游分析（聚类、差异表达、可视化）
- **anndata-data-structure** — 操作 Census 查询返回的 AnnData 对象
- 官方文档：https://chanzuckerberg.github.io/cellxgene-census/ ；Web 浏览器：https://cellxgene.cziscience.com/

---

采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
