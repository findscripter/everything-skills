---
name: gene-set-enrichment-analysis
title: 通路与基因集富集分析
description: 当你手握一组基因（差异表达基因、CRISPR 筛选命中、聚类标志基因、蛋白质组命中）或带打分的排序基因表，想知道哪些生物学通路/GO 条目/基因集被显著富集时使用；做 ORA 过表征分析或 GSEA 富集分析并产出带 FDR 的结果表与点图；不适用于上游差异表达计算、纯 ID 查询或单接口通路抓取；触发词：通路富集、富集分析、基因集富集、GO 富集、KEGG、Reactome、GSEA、ORA、过表征、pathway enrichment、gene set enrichment、functional annotation
domain: 领域/science
triggers: [通路富集, 富集分析, 基因集富集, GO 富集, KEGG, Reactome, GSEA, ORA, 过表征, pathway enrichment, gene set enrichment, functional annotation]
tags: [bioinformatics, enrichment, gsea, ora, gene-set, pathway, go, kegg, reactome, msigdb, gseapy, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [gseapy, gprofiler-official, pandas, numpy, scipy, matplotlib, mygene, MSigDB, Enrichr]
requires: []
related: [single-cell-rnaseq-analysis, genomic-file-toolkit, nextflow-pipeline-builder, scientific-database-lookup]
combines_with: [single-cell-rnaseq-analysis, scientific-database-lookup]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

当用户已有一组基因或带打分的排序基因表，想知道「哪些生物学被富集」时使用。这是差异表达、筛选实验或聚类后的标准收尾步骤。典型场景：

- 在基因列表中查找富集的 GO / KEGG / Reactome / WikiPathways / MSigDB Hallmark 条目。
- 对 DESeq2、edgeR、limma 或 Scanpy `rank_genes_groups` 的输出跑 GSEA / 预排序 GSEA。
- 按样本/单细胞给通路活性打分（ssGSEA、GSVA）。
- 对富集结果做解读、去冗余、可视化，或产出发表级表格/图。
- 在 ORA 与 GSEA 之间抉择、选基因集库、定背景、修 gene-ID 问题。

不该用的边界：
- 上游差异表达本身的计算（属于 pydeseq2 / scanpy 等技能）。
- 只想做一次性 Enrichr 快查 —— `gget enrichr` 更轻量。
- 只想抓取原始通路/互作 API（Reactome、KEGG、STRING）—— 用 database-lookup 类技能。
- 本技能聚焦完整、可辩护、可发表的富集工作流。

## 步骤

### 1. 锁定输入并选方法（最关键的一步）

确认：哪些基因、什么物种、有没有每基因打分、代表什么比较（方向影响解读）。两种核心方法二选一：

- **ORA（过表征分析）**：拿**已阈值过滤**的基因列表（如 padj < 0.05），用 Fisher 精确/超几何检验看它与哪些基因集重叠超过随机。工具：Enrichr、g:Profiler。
- **GSEA（基因集富集分析）**：拿**完整排序列表**（不设阈值），检验每个基因集是否集中在排序的顶端或底端。预排序 GSEA 用每基因打分（如 DESeq2 的 `stat`）。当效应广泛而微弱时更优。

选型对照：

| 情形 | 方法 | 入口 |
|------|------|------|
| 离散命中列表（DE 基因、筛选命中、聚类标志） | ORA | `gp.enrichr(...)` 或 g:Profiler |
| 完整排序列表（每个检测基因 + 打分） | 预排序 GSEA | `gp.prerank(...)` |
| 表达矩阵 + 类别标签 | GSEA | `gp.gsea(...)` |
| 每样本/单细胞通路打分 | ssGSEA / GSVA | `gp.ssgsea(...)`、`gp.gsva(...)` |
| 自定义背景或 500+ 物种 | 带自定义域的 ORA | g:Profiler（`domain_scope='custom'`） |

经验法则：阈值列表 → ORA；带打分的排序表 → GSEA。**绝不要先阈值过滤再喂给 GSEA**，那会丢掉 GSEA 赖以工作的排序。

### 2. 把 gene-ID 转到正确命名空间

Enrichr/MSigDB 库以**基因符号**为键（人类大写，小鼠首字母大写）。若手头是 Ensembl/Entrez ID，先转换（`gp.Biomart`、g:Profiler `g:Convert`、`mygene`）。**ID 静默不匹配是「什么都不显著」的头号原因。**

### 3. 选匹配问题的基因集库

Hallmark（宽主题）→ GO:BP（机制）→ KEGG/Reactome/WikiPathways（精选通路）→ C7（免疫）等。别一口气跑 50 个库，挑 2–4 个贴合生物学的即可。库名会随时间变化，**别盲目硬编码**，先列出再选。

### 4. 设定背景全集（仅 ORA）

背景必须是你的实验**本可检测到**的基因（如所有表达/检测到的基因），而非整个基因组。背景错了会虚高显著性。Enrichr 用固定背景；当背景要紧时，用 g:Profiler 的 `domain_scope='custom'` + 你的 `background`，或 `gp.enrich()` 显式给背景。

### 5. 运行分析

用下方示例或封装好的 `scripts/run_enrichment.py`。GSEA 务必设 `seed` 并报告 `permutation_num`。

### 6. 按校正后 p 值过滤

用 `Adjusted P-value`（ORA，Benjamini–Hochberg）或 `FDR q-val`（GSEA），**不是原始 p 值**。常用阈值 0.05；同时看重叠/基因数，避免「命中」只是 2000 基因集里的 1 个。

### 7. 可视化

点图、条形图、富集图（enrichment map）、GSEA running-score 图，gseapy 内置：`gp.dotplot`、`gp.barplot`、`gp.enrichment_map`、`gp.gseaplot`。

### 8. 去冗余与解读

GO 尤其会返回大量近重复条目。用富集图（条目–条目相似度）、leading-edge 重叠或父条目折叠，只报代表性条目。

## 指令

安装：

```bash
uv pip install gseapy gprofiler-official
# gseapy 会带入 pandas/numpy/scipy/matplotlib。Enrichr、g:Profiler、MSigDB 下载需要联网。
# 完全离线 ORA 用本地 GMT 文件配 gp.enrich()。
```

核对并列出可用基因集库（库名会漂移，别硬编码）：

```python
import gseapy as gp
names = gp.get_library_name(organism="human")   # 200+ Enrichr 库
print([n for n in names if "Reactome" in n or "KEGG" in n or "Hallmark" in n])
```

封装脚本（自动处理符号清洗、去重、去 NA、从 DESeq2 表构造排序、逐库 FDR 过滤）：

```bash
# 从命中列表跑 ORA（每行一个基因符号）
python scripts/run_enrichment.py ora \
  --genes deg_symbols.txt \
  --libraries MSigDB_Hallmark_2020 GO_Biological_Process_2023 KEGG_2021_Human \
  --organism human --outdir results/

# 从 DESeq2 结果 CSV 跑预排序 GSEA（自动用 stat 构造排序）
python scripts/run_enrichment.py gsea \
  --deseq2 deseq2_results.csv \
  --libraries MSigDB_Hallmark_2020 GO_Biological_Process_2023 \
  --organism human --outdir results/ --seed 123

# 从显式两列排序文件（gene,score）跑预排序 GSEA
python scripts/run_enrichment.py gsea --rnk ranked_genes.csv --outdir results/
```

`--help` 查看全部选项（背景文件、FDR 阈值、min/max 集合大小、置换次数）。

## 示例

### ORA：对命中列表（gseapy + Enrichr）

```python
import gseapy as gp

# Enrichr 库要 HGNC 基因符号（人类大写）。需要时先映射 ID。
genes = [g.strip() for g in open("deg_symbols.txt") if g.strip()]

enr = gp.enrichr(
    gene_list=genes,
    gene_sets=["MSigDB_Hallmark_2020", "GO_Biological_Process_2023",
               "KEGG_2021_Human", "Reactome_2022"],
    organism="human",
    outdir=None,            # 内存模式；给路径则同时写表/图
)
res = enr.results
sig = res[res["Adjusted P-value"] < 0.05].sort_values("Adjusted P-value")
print(sig[["Gene_set", "Term", "Overlap", "Adjusted P-value", "Combined Score", "Genes"]].head(20))
```

### 预排序 GSEA：从 DESeq2 结果

```python
import gseapy as gp
import pandas as pd

res = pd.read_csv("deseq2_results.csv", index_col=0)   # index = 基因符号
# 按检验统计量排序（符号=方向，幅度=证据）。比按 log2FoldChange 更稳，
# 后者对低 count 基因噪声大。
rnk = res["stat"].dropna().sort_values(ascending=False)
rnk.index = rnk.index.str.upper()
rnk = rnk[~rnk.index.duplicated(keep="first")]

pre = gp.prerank(
    rnk=rnk,
    gene_sets=["MSigDB_Hallmark_2020", "GO_Biological_Process_2023"],
    min_size=15, max_size=500,        # 丢掉过小/过大的集合（噪声或太泛）
    permutation_num=1000, seed=123,   # seed = 可复现的 p 值
    threads=4, outdir=None,
)
out = pre.res2d.sort_values("FDR q-val")
print(out[["Term", "ES", "NES", "NOM p-val", "FDR q-val", "Lead_genes"]].head(20))
```

若没有 `stat` 列，用 `sign(log2FoldChange) * -log10(pvalue)` 构造排序。

## 注意事项

以下问题导致大多数错误或不可复现的结果：

1. **gene-ID / 物种不匹配** —— 符号 vs Ensembl、人类 vs 小鼠大小写。映射好 ID 并正确设 `organism`，否则匹配会静默掉到约零。
2. **背景错误（ORA）** —— 用整个基因组而非检测到/表达的基因集，会虚高 p 值。必要时设自定义背景。
3. **GSEA 前做了阈值过滤** —— GSEA 需要**完整**排序列表；只有 ORA 用切过的列表。
4. **仅按 log2FoldChange 给 GSEA 排序** —— 对低 count 基因不稳；优先 `stat` 或 `sign(LFC) * -log10(p)`。
5. **跨库多重检验** —— FDR 是在**单库内**计算的；跑多个库会成倍增加检验。报告逐库 FDR 并保守对待。
6. **冗余 GO 条目** —— 别报同一条目的 40 个变体；折叠并展示代表。
7. **显著 ≠ 相关** —— 检查重叠数和基因集大小；小集合轻易就显著。
8. **ORA 列表过短/过长** —— <10 基因功效不足；>2000 失去特异性（改用 GSEA）。
9. **缺复现元数据** —— Enrichr/GO 库有版本且会随时间漂移。记录库名+日期，并给 GSEA 设 `seed`。

## 互见

- 上游（基因来源）：差异表达（pydeseq2 的 DE 基因 + GSEA 用的 `stat`）、单细胞标志基因（scanpy `rank_genes_groups`）、筛选命中、蛋白质组命中。
- 数据库 / ID：Reactome、KEGG、STRING、Gene Ontology API；`gget enrichr` 快查、ID 映射。
- 下游：科学可视化（自定义图）、网络图（富集图）、科学写作/文献综述（解读与引用）、统计分析（多重检验细节）。

资源：gseapy 文档 https://gseapy.readthedocs.io/ ·仓库 https://github.com/zqfang/GSEApy ；g:Profiler https://biit.cs.ut.ee/gprofiler/ ；Enrichr https://maayanlab.cloud/Enrichr/ ；MSigDB https://www.gsea-msigdb.org/gsea/msigdb/ ；GSEA 方法 Subramanian et al. (2005) PNAS, DOI: 10.1073/pnas.0506580102。

---
本条采编自 K-Dense-AI/scientific-agent-skills（MIT 许可）。
