---
name: deeptools-ngs-analysis
title: deepTools NGS 覆盖度与信号可视化
description: 当处理 ChIP/ATAC/RNA-seq 等 NGS 比对数据、需要把 BAM 转成归一化覆盖度轨道、做样本质控或绘制特征区信号图时使用；做 BAM→bigWig（RPGC/CPM/RPKM）归一化、相关性/PCA/指纹质控、TSS/peak 附近热图与谱图等产物；不适用于读段比对（用 STAR/BWA/bowtie2）、peak calling（用 MACS2/HOMER）、BAM/VCF 编程操作（用 pysam）；触发词：bigWig、bamCoverage、computeMatrix、plotHeatmap、ChIP-seq、ATAC-seq
domain: 领域/science
triggers: [把 BAM 转成 bigWig 覆盖度轨道, ChIP-seq / ATAC-seq / RNA-seq 信号可视化, TSS 或 peak 附近画热图/谱图, 样本相关性、PCA、指纹质控, treatment vs input 的 log2 比值轨道, ATAC-seq Tn5 偏移校正, deeptools / bamCoverage / computeMatrix / plotHeatmap]
tags: [bioinformatics, NGS, deeptools, ChIP-seq, ATAC-seq, RNA-seq, bigWig, coverage, visualization, QC]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [bamCoverage, bamCompare, computeMatrix, plotHeatmap, plotProfile, multiBamSummary, plotCorrelation, plotPCA, plotFingerprint, alignmentSieve, samtools]
requires: []
related: [macs3-peak-calling, star-rnaseq-aligner, genomic-file-toolkit, snakemake-workflow-engine]
combines_with: [star-rnaseq-aligner, macs3-peak-calling]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
deepTools 是处理与可视化高通量测序数据的命令行工具集：把 BAM 比对转成归一化覆盖度轨道（bigWig），做质控（相关性、PCA、指纹），并在基因组特征（TSS、peak、基因体）周围生成热图与谱图。支持 ChIP-seq、RNA-seq、ATAC-seq、MNase-seq。

## 何时使用

适用：
- 把 BAM 转成归一化 bigWig 覆盖度轨道。
- 对比 ChIP treatment 与 input，生成 log2 比值轨道。
- 评估样本质量：重复间相关性、PCA、覆盖深度、ChIP 富集强度（指纹图）。
- 在 TSS、peak 或其它区间周围绘制热图与谱图。
- ATAC-seq 的 Tn5 偏移校正；RNA-seq 链特异性覆盖。

不该用（负边界）：
- 读段比对 → 用 STAR / BWA / bowtie2。
- peak calling → 用 MACS2 / HOMER。
- BAM/VCF 编程级操作（自定义过滤等）→ 用 pysam。

## 步骤

1. 安装并校验：`pip install deeptools`，`bamCoverage --version`。
2. 准备输入：BAM 必须已排序且建索引（存在 `.bai`，缺失则 `samtools index input.bam`）；区间用标准 3+ 列 BED。
3. 先做质控（相关性 + 指纹），富集差则别浪费时间往下走。
4. BAM→归一化 bigWig；必要时 `bamCompare` 生成比值轨道。
5. `computeMatrix` 计算特征区信号矩阵，再 `plotHeatmap` / `plotProfile` 出图。

## 指令

BAM→覆盖度（bamCoverage）：
```bash
# RPGC 归一化（ChIP/ATAC 推荐，需基因组有效大小）
bamCoverage --bam input.bam --outFileName output.bw \
    --normalizeUsing RPGC --effectiveGenomeSize 2913022398 \
    --binSize 10 --numberOfProcessors 8 \
    --extendReads 200 --ignoreDuplicates

# CPM 归一化（无需基因组大小，适合快速比较）
bamCoverage --bam input.bam --outFileName output.bw \
    --normalizeUsing CPM --binSize 10 -p 8

# RNA-seq 链特异性覆盖（切勿用 --extendReads，会跨剪接位点）
bamCoverage --bam rnaseq.bam --outFileName forward.bw \
    --filterRNAstrand forward --normalizeUsing CPM -p 8
```

样本比较（bamCompare）：
```bash
# log2 比值 treatment/control
bamCompare -b1 treatment.bam -b2 control.bam -o log2ratio.bw \
    --operation log2 --scaleFactorsMethod readCount --extendReads 200 -p 8
```

质控：
```bash
# 相关性热图（重复应聚类，r>0.9 为佳）
multiBamSummary bins --bamfiles rep1.bam rep2.bam rep3.bam \
    -o counts.npz --binSize 10000 -p 8
plotCorrelation -in counts.npz --corMethod pearson --whatToShow heatmap -o correlation.png
plotPCA -in counts.npz -o pca.png

# ChIP 富集指纹（曲线陡升=好；接近对角线=富集差）
plotFingerprint -b input.bam chip.bam -o fingerprint.png --extendReads 200 --ignoreDuplicates
```

热图与谱图：
```bash
# reference-point：TSS 周围信号
computeMatrix reference-point -S chip.bw -R genes.bed \
    -b 3000 -a 3000 --referencePoint TSS -o matrix.gz -p 8
# scale-regions：跨基因体信号
computeMatrix scale-regions -S chip.bw -R genes.bed \
    -b 1000 -a 1000 --regionBodyLength 5000 -o matrix.gz -p 8

plotHeatmap -m matrix.gz -o heatmap.png --colorMap RdBu --kmeans 3 --sortUsing mean
plotProfile -m matrix.gz -o profile.png --plotType lines --perGroup
```

读段过滤 / ATAC 校正（alignmentSieve）：
```bash
# 按比对质量与片段长度过滤
alignmentSieve --bam input.bam --outFile filtered.bam \
    --minMappingQuality 10 --minFragmentLength 150 --maxFragmentLength 700

# ATAC-seq Tn5 偏移校正（+4/-5 bp），随后必须重新索引
alignmentSieve --bam atac.bam --outFile shifted.bam --ATACshift
samtools index shifted.bam
```

关键概念——归一化方法：
| 方法 | 含义 | 何时用 | 依赖 |
|------|------|--------|------|
| RPGC | 1× 全基因组覆盖 | ChIP-seq、ATAC-seq | `--effectiveGenomeSize` |
| CPM | 每百万计数 | 任意、快速比较 | 无 |
| RPKM | 每 kb 每百万 | RNA-seq 基因水平 | 无 |
| BPM | 每百万 bins | 类似 CPM | 无 |

常用基因组有效大小：人 GRCh38=2,913,022,398；小鼠 GRCm38=2,652,783,500；斑马鱼 GRCz11=1,368,780,147；果蝇 dm6=142,573,017；线虫 ce11=100,286,401。

computeMatrix 两种模式：`reference-point`（围绕固定点 TSS/peak summit，参数 `-b`/`-a`/`--referencePoint`）；`scale-regions`（跨变长特征如基因体，参数 `-b`/`-a`/`--regionBodyLength`）。

## 示例

ChIP-seq 质控 + 可视化完整流程：
```bash
#!/bin/bash
CHIP="chip.bam"; INPUT="input.bam"; GENES="genes.bed"; PEAKS="peaks.bed"
GSIZE=2913022398; THREADS=8

# 1. 质控：相关性
multiBamSummary bins --bamfiles $INPUT $CHIP -o summary.npz -p $THREADS
plotCorrelation -in summary.npz --corMethod pearson --whatToShow heatmap -o correlation.png
# 2. 质控：富集指纹
plotFingerprint -b $INPUT $CHIP -o fingerprint.png --extendReads 200 --ignoreDuplicates
# 3. 归一化 bigWig
bamCoverage --bam $CHIP --outFileName chip.bw --normalizeUsing RPGC \
    --effectiveGenomeSize $GSIZE --extendReads 200 --ignoreDuplicates -p $THREADS
# 4. log2 比值轨道
bamCompare -b1 $CHIP -b2 $INPUT -o log2ratio.bw --operation log2 \
    --scaleFactorsMethod readCount --extendReads 200 -p $THREADS
# 5. TSS 热图
computeMatrix reference-point -S chip.bw log2ratio.bw -R $GENES \
    -b 3000 -a 3000 --referencePoint TSS -o tss_matrix.gz -p $THREADS
plotHeatmap -m tss_matrix.gz -o tss_heatmap.png --colorMap RdBu --kmeans 3
```

ATAC-seq 流程关键步骤：
```bash
# 1. Tn5 校正并索引
alignmentSieve --bam atac.bam --outFile shifted.bam --ATACshift -p 8
samtools index shifted.bam
# 2. RPGC 覆盖（小 binSize）
bamCoverage --bam shifted.bam --outFileName atac.bw \
    --normalizeUsing RPGC --effectiveGenomeSize 2913022398 --binSize 5 --extendReads -p 8
# 3. 核小体周期性（应见 ~200/400bp 峰）
bamPEFragmentSize -b shifted.bam -o fragsize.png --maxFragmentLength 1000 --binSize 1
```

## 注意事项

- ChIP-seq 务必扩展读段：`--extendReads 200`（或实际片段长度），ChIP 片段比读段长。
- RNA-seq 绝不扩展读段：`--extendReads` 会跨剪接位点产生伪影；若 exon 边界出现伪影，移除该参数。
- 同一比较内所有样本必须用相同归一化方法，反例混用会得到错误结论。
- 用 RPGC 必须给 `--effectiveGenomeSize`，否则静默产生错误结果。
- 调参先用 `--region chr1:1-10000000` 在单染色体上试跑，省下数小时。
- 几乎所有工具都支持 `-p / --numberOfProcessors`，用满可用核。
- 常见报错：`BAM index not found` → `samtools index`；内存溢出 → 增大 `--binSize` 或限定 `--region`；bigWig 过大 → 增大 binSize；指纹平坦 → ChIP 富集差（生物学问题，考虑重做实验）；BAM 与 BED 基因组版本不一致（hg38 vs hg19）会导致错误。

## 互见

- pysam-genomic-files — deepTools 之前用代码自定义过滤 BAM/VCF。
- matplotlib-scientific-plotting — 对 deepTools 出图做超出内置选项的定制。
- 官方文档：https://deeptools.readthedocs.io/ ；参考文献 Ramirez et al. (2016) deepTools2, NAR, https://doi.org/10.1093/nar/gkw257 。

---
采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
