---
name: scikit-bio-sequence-toolkit
title: scikit-bio 序列与系统发育分析
description: 当需要用 Python 做生物序列处理、序列比对、系统发育树、微生物组多样性(alpha/beta、UniFrac)、PCoA 排序与 PERMANOVA 等生态统计，并读写 FASTA/FASTQ/Newick/BIOM 时使用；用 scikit-bio 跑标准生信流程并产出比对/进化树/距离矩阵/排序坐标/显著性结果；不适用于多序列比对建树的重活(用 MAFFT/IQ-TREE/RAxML)、单细胞表达分析(用 scanpy)、基因组比对/变异调用(用专用 NGS 工具)；触发词：scikit-bio、skbio、序列比对、系统发育树、UniFrac、多样性、PCoA、PERMANOVA、Newick、BIOM
domain: 领域/science
triggers: [scikit-bio, skbio, 序列比对, 系统发育树, UniFrac, 多样性, PCoA, PERMANOVA, Newick, BIOM, 微生物组, 距离矩阵]
tags: [scikit-bio, skbio, bioinformatics, phylogenetics, alignment, microbiome, diversity, ordination, permanova, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, scikit-bio, numpy, pandas, matplotlib, biom-format]
requires: []
related: [biopython-molecular-biology, single-cell-rnaseq-analysis, gene-set-enrichment-analysis, genomic-file-toolkit]
combines_with: [matplotlib-visualization]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
# scikit-bio 序列与系统发育分析

## 何时使用

当你需要用 Python 在一个库内完成「序列操作 → 比对 → 建树 → 多样性 → 排序 → 生态统计」这条生信链路时使用本条，典型场景：

- 处理 DNA/RNA/Protein 序列：反向互补、转录、翻译、找 motif、算 Hamming/k-mer 距离
- 成对序列比对（全局/局部/半全局），或用 `TabularMSA` 装载多序列比对
- 由距离矩阵建系统发育树（NJ、UPGMA、GME/BME），算 patristic / Robinson-Foulds 距离
- 微生物组多样性：alpha（Shannon、Chao1、Faith's PD）、beta（Bray-Curtis、Jaccard、UniFrac）
- 排序（PCoA/CCA/RDA）与生态统计检验（PERMANOVA、ANOSIM、Mantel、PERMDISP）
- 读写 FASTA/FASTQ/GenBank/Newick/BIOM/Clustal/PHYLIP 等 19+ 格式

**不该用本条的边界：**

- 大规模**从头**多序列比对 / 最大似然建树 → 用 MAFFT、IQ-TREE、RAxML（skbio 的比对器是成对动态规划，建树从距离矩阵起步）
- 单细胞表达探索（QC/聚类/UMAP）→ 用 scanpy（见 `single-cell-rnaseq-analysis`）
- 测序读段比对到参考、变异调用 → 用 BWA/minimap2/GATK 等专用 NGS 工具
- 仅做格式互转/索引的常规基因组文件操作 → 见 `genomic-file-toolkit`

## 步骤

1. 装环境：`uv pip install scikit-bio`（Python 3.10+，NumPy 2.0+；0.7+ 有预编译 wheel）
2. 读入数据：序列用 `skbio.DNA.read`，树用 `TreeNode.read`，BIOM 表用 `Table.read`
3. 选链路：序列处理 / 成对比对 / 建树 / 多样性 / 排序 / 统计检验（见下方各示例）
4. 计数表统一为**整数丰度**（非相对频率），样本×特征；可直接传 ndarray/DataFrame/BIOM/AnnData（0.7+ dispatch）
5. 系统发育多样性指标须同时传 `tree=` 与 `taxa=`（特征名→树叶映射）
6. 排序/检验吃 `DistanceMatrix`；显著性检验用 999+ 次置换
7. 写盘：`seq.write` / `tree.write` / `pcoa_results.write` / `dm.write`

## 指令

- 序列类：`DNA`/`RNA`/`Protein` 带字母表校验，`Sequence` 不限字母表；FASTQ 质量分自动进 positional metadata。
- 比对引擎是 0.7.0 引入的 `pair_align`（替代已移除的 SSW 与已弃用的纯 Python 比对器）；便捷封装 `pair_align_nucl`（类 BLASTN）、`pair_align_prot`（类 BLASTP，BLOSUM62）。
- `sub_score` 收 `(match, mismatch)` 元组或矩阵名（`'NUC.4.4'`、`'BLOSUM62'`）；`gap_cost` 收单值（线性）或 `(open, extend)`（仿射）。
- 建树：`nj`/`upgma` 经典法，大树用 `gme`/`bme` 并用 `nni` 精修；`cophenet()`（原 `tip_tip_distances`）出 patristic 距离矩阵；`compare_rfd` 是 Robinson-Foulds。
- 多样性 API 改名：旧 `otu_ids` → `taxa=`，`observed_otus` → `observed_features`/`sobs`；alpha 返回 `pandas.Series`，beta 返回 `DistanceMatrix`。

## 示例

```python
import skbio
from skbio import DNA, Protein, TreeNode, DistanceMatrix
from skbio.alignment import pair_align_nucl, pair_align_prot, pair_align, TabularMSA
from skbio.tree import nj
from skbio.diversity import alpha_diversity, beta_diversity
from skbio.stats.ordination import pcoa
from skbio.stats.distance import permanova, mantel

# 1. 序列操作
seq = DNA.read('input.fasta')
rc      = seq.reverse_complement()
protein = seq.transcribe().translate()
hits    = seq.find_with_regex('ATG[ACGT]{3}')
seq_ng  = seq.degap()

# 2. 成对比对
s1, s2 = DNA('ACTACCAGATTACTTACGGATCAGG'), DNA('CGAAACTACTAGATTACGGATCTTA')
aln  = pair_align_nucl(s1, s2)        # BLASTN-like
print(aln.score)
path = aln.paths[0]                   # PairAlignPath，repr 显示 CIGAR
gapped = path.to_aligned((s1, s2))
msa  = TabularMSA.from_path_seqs(path, (s1, s2))
aln_local = pair_align(s1, s2, mode='local')                       # Smith-Waterman
aln_aff   = pair_align(s1, s2, sub_score=(2, -3), gap_cost=(5, 2)) # 仿射 gap
aln_prot  = pair_align_prot(Protein('HEAGAWGHEE'), Protein('PAWHEAE'))

# 3. 建树（从距离矩阵）
tree = nj(distance_matrix)
lca  = tree.lca(['taxon1', 'taxon2'])
cophenetic_dm = tree.cophenet()
rf   = tree.compare_rfd(other_tree)

# 4. 多样性（系统发育指标需 tree + taxa）
shan = alpha_diversity('shannon', counts, ids=sample_ids)
fpd  = alpha_diversity('faith_pd', counts, ids=sample_ids, tree=tree, taxa=feature_ids)
bc   = beta_diversity('braycurtis', counts, ids=sample_ids)
uni  = beta_diversity('unweighted_unifrac', counts, ids=sample_ids,
                      tree=tree, taxa=feature_ids)

# 5. 排序 + 统计检验
res = pcoa(bc, dimensions=3)
pc1, pc2 = res.samples['PC1'], res.samples['PC2']
fig = res.plot(sample_metadata, column='bodysite')
pm  = permanova(bc, grouping, permutations=999)
print(pm['p-value'])
r, p = mantel(dm1, dm2, method='pearson', permutations=999)[:2]
```

典型微生物组工作流：读 BIOM 表 → 算 alpha/beta 多样性 → PCoA 排序 → PERMANOVA 检验。

```python
from skbio import Table
table = Table.read('table.biom')
import pandas as pd
df = pd.read_table('data.tsv', index_col=0)   # 样本×特征
bdiv = beta_diversity('braycurtis', df)        # dispatch，无需手动转换
```

## 注意事项

- **计数须为整数丰度**，不是相对频率；差异丰度检验（`dirmult_ttest`/`ancom`，在 `skbio.stats.composition`）也要喂原始计数以保留量级。
- **系统发育多样性必给 `tree=` + `taxa=`**（特征名→树叶映射），否则无法计算 Faith's PD / UniFrac。
- **PERMANOVA 对组间离散度敏感**：配合 `permdisp` 一起看；置换次数 ≥ 999 才有稳健 p 值。
- **PCoA `dimensions`**：传 int 限维数，传 (0,1] 的 float 限累计方差占比；大矩阵务必限维。
- **大文件用生成器**：`skbio.io.read(..., constructor=skbio.DNA)` 逐条处理省内存；大树优先 GME/BME 而非 NJ；beta 可用 `partial_beta_diversity`/`block_beta_diversity` 分块并行。
- **BIOM 选 HDF5** 而非 JSON 更高效；表行通常是样本、列是特征（OTU/ASV）。
- API 改名提醒：`tip_tip_distances→cophenet`、`lowest_common_ancestor→lca`(保留别名)、`DissimilarityMatrix→PairwiseMatrix`(保留弃用别名)、`otu_ids→taxa`。
- 与生态打通：序列经标准格式与 Biopython 互通；表与 pandas/polars/AnnData 互通；距离矩阵兼容 scikit-learn；与 QIIME 2 工件（BIOM/树/距离矩阵）无缝衔接。

## 互见

- related：`genomic-file-toolkit` —— 测序文件格式转换/索引等常规处理
- related：`single-cell-rnaseq-analysis` —— 单细胞表达探索另走 scanpy
- related：`protein-language-models` —— skbio 的 `ProteinEmbedding` 可把蛋白嵌入转距离矩阵/排序，对接此条
- related：`scientific-database-lookup` —— 查序列/物种/通路注释
- combines_with：`nextflow-pipeline-builder` —— 把本条分析步骤编排进可复现流水线
- combines_with：`gene-set-enrichment-analysis` —— 多样性/差异结果接富集分析

---

本条采编自 K-Dense-AI/scientific-agent-skills（MIT），适配重写而非逐字翻译。
