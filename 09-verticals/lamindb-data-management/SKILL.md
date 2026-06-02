---
name: lamindb-data-management
title: LaminDB 生物数据治理
description: 当为生物数据集（scRNA/AnnData/DataFrame/Zarr）做版本管理、谱系追踪、本体校验与可查询数据湖时使用；用 lamindb（含 bionty）以 track()/finish() 包裹分析，注册 Artifact、按 key/feature/本体过滤查询、用 Bionty 标准化细胞/基因术语并产出 FAIR 的可溯源 artifact；不适用于单细胞分析流程（聚类/差异表达用 single-cell-rnaseq-analysis）与纯本体查表（用 bionty 即可）；触发词：lamindb、lamin、artifact、谱系/lineage、ln.track、bionty、数据治理、FAIR、数据湖、本体校验
domain: 领域/science
triggers: [lamindb, lamin, artifact, 谱系, lineage, ln.track, bionty, 数据治理, FAIR, 数据湖, 本体校验, 数据版本]
tags: [lamindb, bionty, data-management, lineage, provenance, FAIR, ontology, single-cell, bioinformatics, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [lamindb, bionty, python, anndata, pandas]
requires: []
related: [anndata-data-structure, cellxgene-census, single-cell-rnaseq-analysis, scvi-tools-single-cell]
combines_with: [single-cell-rnaseq-analysis, muon-multiomics-singlecell]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

当你需要把生物数据集变成**可查询、可溯源、FAIR** 的资产时使用本条，典型场景：

- 管理与版本化数据集（scRNA、空间、流式、多模态：AnnData / DataFrame / Zarr / MuData / 任意文件）
- 追踪计算谱系（哪段代码 / 哪次运行产生了哪份数据），保证可复现
- 用生物本体（细胞类型 / 基因 / 组织 / 疾病）校验、标准化、策展元数据
- 跨多个实验构建可查询的数据湖（按 key 前缀 / feature / 注释过滤）
- 与工作流（Nextflow、Snakemake）或 MLOps（W&B、MLflow、scVI）集成时统一数据登记

**不该用本条的边界：**

- 做**单细胞分析**（QC、聚类、找 marker、差异表达、可视化）→ 用 `single-cell-rnaseq-analysis`（Scanpy）
- 只做**本体查表**而不管理数据 → 直接用 bionty（`bt.CellType.search(...)`）
- 本条只负责「数据登记 + 版本 + 谱系 + 本体校验 + 查询」这一件事

## 步骤

1. 装环境并初始化实例（**必须先 init，否则 `InstanceNotSetupError`**）：
   - `pip install 'lamindb[bionty,zarr,fcs]'`
   - `lamin login` → `lamin init --storage ./my-data --name my-project`（云端用 `s3://...` + `--db postgresql://...`）
2. **用 `ln.track()` / `ln.finish()` 包裹整个分析**——区块内所有 artifact 自动挂到本次 run，捕获代码/环境/用户。缺它则无谱系。
3. 登记数据为 Artifact：`from_df` / `from_anndata` / `from_mudata` / `Artifact("path")`，给**层级 key**（`project/exp/datatype/file.ext`）后 `.save()`。
4. 加注释：`artifact.features.add_values({...})`；需要严格校验时走 `ln.curators.AnnDataCurator(adata, schema).validate()`。
5. 本体标准化：`bt.CellType.validate([...])` 查合法性，`bt.CellType.standardize(...)` 归一术语。
6. 查询：**先 `.filter(...).df()` 看元数据，再 `.load()`/`.open()` 取数据**；大文件用 backed 模式 `.open()` 流式子集。
7. 版本与谱系：改数据用 `revises=old_artifact` 出新版（**别换 key 复制**）；`artifact.view_lineage()` 看血缘。

## 指令

核心实体模型：

| 实体 | 作用 |
|---|---|
| `Artifact` | 版本化数据对象（`counts.h5ad`、`results.parquet`） |
| `Run` | 单次代码执行 |
| `Transform` | 代码定义（notebook / script / pipeline） |
| `Feature` | 带类型的元数据字段（tissue、condition、batch） |
| `Collection` | 一组相关 artifact，批量操作 |
| `ULabel` | 自定义通用标签（high_quality、pilot） |

关键参数：`key`=层级存储键；`description`=人读说明；`revises`=上一版（做版本而非复制）；`params`=本次 run 参数（入谱系）；`organism`（`bt.Gene.import_source` 用 "human"/"mouse"）；`permanent`（`.delete()`，默认 False=归档，True=永久删）。

过滤后缀：`__startswith`（key 前缀）、`__gte`/`__lte`、`__contains`，以及 `features__<字段>=值`。`get()` 精确取（缺失抛错），`filter(...).one_or_none()` 缺失返回 None。

Bionty 本体（搭 source）：`bt.Gene`(Ensembl)、`bt.Protein`(UniProt)、`bt.CellType`(CL)、`bt.Tissue`(Uberon)、`bt.Disease`(Mondo)、`bt.Pathway`(GO)、`bt.Organism`(NCBItaxon)。用前 `import_source()`。

## 示例

最小闭环（登记 + 查询）：

```python
import lamindb as ln, pandas as pd

ln.track()                                  # 起谱系：捕获代码/环境/用户
df = pd.DataFrame({"gene": ["TP53","BRCA1"], "score": [0.95, 0.87]})
art = ln.Artifact.from_df(df, key="results/gene_scores.parquet",
                          description="Gene importance scores").save()
print(art.uid, art.size)

hits = ln.Artifact.filter(key__startswith="results/").df()   # 先看元数据
print(len(hits))
ln.finish()
```

AnnData 登记 + 注释 + 版本：

```python
import lamindb as ln, anndata as ad
ln.track()
adata = ad.read_h5ad("counts.h5ad")
art = ln.Artifact.from_anndata(adata, key="scrna/batch1.h5ad",
                               description="scRNA-seq batch 1").save()
art.features.add_values({"tissue": "PBMC", "condition": "treated", "batch": 1})
art_v2 = ln.Artifact.from_anndata(adata, key="scrna/batch1.h5ad", revises=art).save()
print(art_v2.is_latest)                     # 版本化：用 revises，不换 key
ln.finish()
```

本体校验 + 标准化 + 严格策展：

```python
import bionty as bt, lamindb as ln
bt.CellType.import_source()
ok = bt.CellType.validate(adata.obs["cell_type"].unique())   # [True, True, False...]
if not all(ok):
    adata.obs["cell_type"] = bt.CellType.standardize(adata.obs["cell_type"])
curator = ln.curators.AnnDataCurator(adata, schema)
try:
    curator.validate()
    art = curator.save_artifact(key="curated/validated.h5ad")
except ln.errors.ValidationError as e:
    print(f"校验失败: {e}")
```

跨实验查询数据湖 + 流式大文件：

```python
treated = ln.Artifact.filter(key__startswith="scrna/",
    features__tissue="PBMC", features__condition="treated").all()
combined = ad.concat([a.load() for a in treated])            # 命中后再 load
big = ln.Artifact.get(key="large.h5ad").open()               # backed，超内存流式
subset = big[big.obs["cell_type"] == "B cell"]
```

## 注意事项

- **务必 init 实例**：未 init 调用即 `InstanceNotSetupError`，先 `lamin init --storage ... --name ...`。
- **务必 track/finish 包裹**：缺它 artifact 无 provenance；`ln.track()` 需在 notebook/script 内，纯 REPL 会失败（或显式传 `transform`）。
- **版本用 `revises=`，不要换 key 复制**：同 key 重复登记会 key 冲突；复制数据是反模式。
- **先查元数据再取数**：`.filter().df()` 看清楚再 `.load()`；大文件用 `.open()`（backed）流式，别盲目全量载入。
- **本体标准化跨数据集可比**：自由文本（"T helper cell"）映射到本体术语（CL:0000912），才能跨集查询；`import_source` 失败多为网络或 organism 没指定。
- **删除分两步**：`.delete(permanent=False)` 先归档，确认后再 `permanent=True`。
- 云端 artifact 未同步时 `.cache()` 可能 `FileNotFoundError`，改用 `.load()` 走内存。

## 互见

- related：`anndata-data-structure` —— LaminDB 管理的单细胞数据主容器；先建/读 AnnData 再登记
- related：`cellxgene-census` —— 公共单细胞数据源，可登记进 LaminDB 实例做治理
- combines_with：`single-cell-rnaseq-analysis` —— 本条管「数据/谱系/版本」，该条管「分析」，串成可复现单细胞流程
- combines_with：`scvi-tools-single-cell` —— 模型训练的数据与产物登记、版本与谱系追踪
- combines_with：`nextflow-pipeline-builder` —— 在流水线各步 track/get/save，自动连起输入到输出的血缘
- related：`gene-set-enrichment-analysis` —— 校验/标准化后的注释结果接下游富集分析

---

本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0），适配重写而非逐字翻译。
