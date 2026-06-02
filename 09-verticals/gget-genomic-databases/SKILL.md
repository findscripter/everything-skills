---
name: gget-genomic-databases
title: gget 统一基因组数据库接口
description: 当需要用一个统一的 Python/CLI 接口（gget）跨 Ensembl、UniProt、NCBI、BLAST/BLAT、AlphaFold、Enrichr、OpenTargets、CELLxGENE、cBioPortal/COSMIC、ARCHS4 等 20+ 基因组数据库做基因查询、取序列、比对、结构预测、富集与疾病/药物关联时使用；做选模块、调 gget 取数并产出 DataFrame/JSON/FASTA/PDB 结果；不适用于大批量或高级 BLAST 参数（用 biopython）与带限速的多库 SDK 编排（用 bioservices）；触发词：gget、Ensembl 查基因、gget search/info/seq、BLAST、AlphaFold、Enrichr、OpenTargets、CELLxGENE、cBioPortal
domain: 领域/science
triggers: [gget, Ensembl 查基因, gget search, gget info, gget seq, BLAST, BLAT, AlphaFold, Enrichr 富集, OpenTargets, CELLxGENE, cBioPortal, ARCHS4, 参考基因组下载]
tags: [bioinformatics, genomics, gget, ensembl, blast, alphafold, enrichr, opentargets, cellxgene, cbioportal, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [gget, python, pandas]
requires: []
related: [uniprot-protein-database, scientific-database-lookup, opentargets-database, clinvar-database]
combines_with: [uniprot-protein-database, gene-set-enrichment-analysis, single-cell-rnaseq-analysis]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

需要用**一个统一接口**（`gget`，CLI 与 Python 同构）跨 20+ 基因组数据库取数与做轻量分析时使用，典型场景：

- 跨物种从 Ensembl 按关键词搜基因、查基因元数据（名称/ID/描述，融合 Ensembl+UniProt+NCBI）。
- 取 Ensembl 基因/转录本的核酸或蛋白序列；下载某物种参考基因组与注释（GTF/cDNA/DNA/CDS/PEP）。
- 对参考库跑 BLAST/BLAT 远程检索，或做多序列比对（Muscle5）与本地快速比对（DIAMOND）。
- 用 AlphaFold2 从氨基酸序列预测 3D 结构；下载 PDB 结构；找线性基序（ELM）。
- 用 Enrichr 做基因集富集（GO/KEGG/疾病等）；用 OpenTargets 查靶点的疾病/药物/成药性关联。
- 查 CELLxGENE 单细胞数据、ARCHS4 组织表达与共表达基因、Bgee 直系同源。
- 经 cBioPortal/COSMIC 查癌症突变与拷贝数变异。

**不该用的边界：**
- **大批量处理或高级 BLAST 参数** → 用 `biopython`（本技能的 BLAST 是远程便捷封装）。
- **带内建限速的多数据库 SDK 编排**（UniProt/KEGG/ChEMBL 等程序化工作流）→ 用 `bioservices`。
- 只需对单个公开库发 REST 请求取原始 JSON、不想装 gget → 用 `scientific-database-lookup`。
- 深度富集/自定义基因集库分析、上游差异表达计算不在此 → 见 `gene-set-enrichment-analysis`。
- gget 查的是远程库，不做大规模本地数据集统计建模。

## 步骤 / 指令

1. **装包**：`pip install gget`（建议干净虚拟环境）。部分模块首次用前需 `gget setup <module>`：`alphafold`（约 4GB 参数 + OpenMM）、`cellxgene`、`elm`。
2. **按域选模块**（Python 调 `gget.<module>()`，CLI 调 `gget <module>`）：

| 域 | 模块 | 主要数据库 |
|---|---|---|
| 基因参考/检索 | `ref` `search` `info` `seq` | Ensembl, UniProt, NCBI |
| 序列比对 | `blast` `blat` `muscle` `diamond` | NCBI BLAST, UCSC, 本地 |
| 蛋白结构 | `pdb` `alphafold` `elm` | RCSB PDB, AlphaFold2, ELM |
| 表达 | `archs4` `cellxgene` `bgee` | ARCHS4, CZ CELLxGENE, Bgee |
| 疾病/药物 | `opentargets` `enrichr` | OpenTargets, Enrichr |
| 癌症 | `cbio` `cosmic` | cBioPortal, COSMIC |
| 工具 | `mutate` `setup` | 本地 |

3. **校正标识符**：基因检索用 `gget.search(...)` 得 Ensembl ID（`ENSG...`），下游 `info`/`seq`/`opentargets` 复用之。**注意物种**：默认 `homo_sapiens`，可用 `species="mouse"` 等简写。
4. **调用取数**：Python 返回 DataFrame/dict（加 `json=True` 出 JSON、`save=True` 落盘）；CLI 默认 JSON（`-csv` 出 CSV、`-o file` 存盘）。序列出 FASTA，结构出 PDB，单细胞出 AnnData。
5. **限速**：远程库（BLAST/BLAT/info）批量调用要在循环里 `time.sleep(2)`；`gget.info()` 单次 ≤ 约 1000 个 Ensembl ID。
6. **钉版本保证可复现**：`gget.ref(..., release=112)`、`gget.cellxgene(..., census_version="2023-07-25")`，并记录 `gget.__version__`。

**Enrichr 库简写**：`'pathway'`=KEGG_2021_Human、`'transcription'`=ChEA_2016、`'ontology'`=GO_Biological_Process_2021、`'diseases_drugs'`=GWAS_Catalog_2019、`'celltypes'`=PanglaoDB_Augmented_2021；也可直接传任意 Enrichr 库名（如 `"Jensen_TISSUES"`）。

**OpenTargets resource**：`diseases` / `drugs` / `tractability` / `pharmacogenetics` / `expression` / `depmap` / `interactions`。

## 示例

基因检索 → 信息 → 序列 → 富集（Python）：

```python
import gget

# 1. 按关键词搜基因
results = gget.search(["BRCA1", "tumor suppressor"], species="homo_sapiens")
gene_ids = results["ensembl_id"].tolist()[:10]

# 2. 取详细信息（Ensembl + UniProt + NCBI），单次 ≤ ~1000 ID
info = gget.info(gene_ids)

# 3. 取蛋白序列
seqs = gget.seq(gene_ids, translate=True)

# 4. 富集分析（GO 生物学过程）
enr = gget.enrichr(["ACE2", "AGT", "AGTR1", "TMPRSS2", "DPP4"], database="ontology")
print(enr[["Term", "Adjusted P-value"]].head())
```

远程比对加限速、靶点验证（Python）：

```python
import gget, time

# BLAST 对 SwissProt（远程，批量循环里要 sleep）
hits = gget.blast("MKWMFKEDHSLEHRCV...", database="swissprot", limit=10)
time.sleep(2)

# 靶点的疾病/药物/成药性关联
g = "ENSG00000169194"
diseases = gget.opentargets(g, resource="diseases", limit=20)
drugs    = gget.opentargets(g, resource="drugs")
```

下载 RNA-seq 参考文件（CLI，钉 release）：

```bash
gget ref -w gtf -w cdna -d -r 112 homo_sapiens   # GTF + cDNA
gget ref -w dna -d homo_sapiens                   # 基因组 DNA
```

结构预测前先查 PDB（`gget.pdb()` 秒级，AlphaFold 需数分钟到数小时）：

```python
import gget
pdb = gget.pdb("7S7U", save=True)  # 已有就别白跑 AlphaFold
structure = gget.alphafold("MKWMFK...", plot=True, show_sidechains=True, relax=True)
```

## 注意事项

- **先查 PDB 再跑 AlphaFold**：`pdb()` 即时，AlphaFold 耗时极长；蛋白过长会 GPU OOM，拆结构域或缩短序列。`gget setup alphafold` 需 Python 3.8–3.10。
- **限速与上限**：远程库批量调用要 `time.sleep()`；`gget.info()` 超量会超时，单次 ≤ 约 1000 ID 并分批。
- **保持更新**：数据库约每两周变结构，定期 `pip install --upgrade gget` 防 schema 变更导致报错；同一查询不同时间结果可能不同——**钉版本**（`release=112` / `census_version`）。
- **CELLxGENE 基因符号大小写敏感**：人用 `'ACE2'`、鼠用 `'Ace2'`，须精确匹配。
- **COSMIC 需账号 + 本地库**：首次 `gget.cosmic(..., download_cosmic=True, email=..., password=...)`；认证报错时重填凭据并查账号状态。
- **BLAST 空结果**：序列太短或无匹配——换更长序列、换库或 `megablast_off=True`。
- **接口选择**：流水线用 Python（返回可链式处理的 DataFrame），快速探查用 CLI（`-csv`）。
- **cBioPortal 缓存**：重复分析用 `data_dir="./cache"` 避免重复下载大数据集。

## 互见

- related：`scientific-database-lookup` —— 不想装 gget、只需对公开库发 REST 请求取原始 JSON 时。
- related：`single-cell-rnaseq-analysis`、`genomic-file-toolkit`、`protein-language-models`
- combines_with：`gene-set-enrichment-analysis` —— gget 取基因列表/共表达基因后做深度通路富集。
- combines_with：`nextflow-pipeline-builder` —— 用 `gget ref` 下载参考文件喂入 RNA-seq 比对流水线。

---
本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
