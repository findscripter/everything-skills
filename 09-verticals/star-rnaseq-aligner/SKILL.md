---
name: star-rnaseq-aligner
title: STAR 剪接感知 RNA-seq 比对
description: 当需要把 bulk RNA-seq reads 比对到参考基因组、产出排序 BAM 与剪接位点表，供变异检测/IGV/deeptools/ENCODE 流程使用时用本条；用 STAR 建基因组索引、做（双轮）剪接感知比对，并可同步出基因计数，产出 Aligned.sortedByCoord.out.bam、SJ.out.tab、Log.final.out 与 ReadsPerGene.out.tab；不适用于只要转录本/基因定量而不需 BAM（用更快的 Salmon 伪比对）、单细胞 RNA-seq（用 scanpy）。触发词：STAR、RNA-seq、比对、aligner、剪接位点、splice junction、BAM、基因计数、GeneCounts、二轮比对、twopass、genomeGenerate、sjdbOverhang
domain: 领域/science
triggers: [STAR, RNA-seq, 比对, aligner, 剪接位点, splice junction, BAM, 基因计数, GeneCounts, 二轮比对, twopass, genomeGenerate, sjdbOverhang]
tags: [bioinformatics, genomics, rnaseq, star, alignment, splice-junction, bam, encode, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [STAR, samtools, python, pandas, pydeseq2]
requires: []
related: [fastp-fastq-preprocessing, deeptools-ngs-analysis, pydeseq2-differential-expression, genomic-file-toolkit]
combines_with: [fastp-fastq-preprocessing, pydeseq2-differential-expression]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

当需要把 bulk RNA-seq reads 比对到参考基因组并产出可下游使用的 BAM 时用本条，典型场景：

- 下游工具要求排序后 BAM（变异检测 GATK、IGV 可视化、deeptools 等）。
- 运行强制要求基因组比对的 ENCODE 兼容 RNA-seq 流程。
- 发现新的/注释内的剪接位点与可变剪接事件。
- 用 `--quantMode GeneCounts` 在比对的同时一步产出基因级计数表。
- 长读长或高错配率 reads（可调 `--outFilterMismatchNmax`）。

不该用的边界：

- 只需转录本/基因定量、不需要 BAM → 用 **Salmon** 伪比对，快 20–50 倍（见 `combines_with`）。
- 单细胞 RNA-seq → 用 `single-cell-rnaseq-analysis`（Scanpy）。
- BAM/VCF 读写、区域抓取、覆盖度统计 → 用 `genomic-file-toolkit`（pysam）。
- 跨条件严谨差异表达：STAR 只出计数矩阵，DE 交给 pydeseq2/DESeq2。

前置：STAR ≥ 2.7.0；基因组 FASTA + 同一 assembly 的 GTF 注释；人/鼠基因组建索引需约 30–32 GB RAM、约 25 GB 磁盘，每样本 BAM 约 5–10 GB。先 `command -v STAR` 探测，已在 pixi 环境则用 `pixi run STAR`。

## 步骤

1. 备参考：下载基因组 FASTA + 匹配版本 GTF（assembly 必须一致），解压。
2. 建索引（每「基因组 × 读长」一次）：`--runMode genomeGenerate`，`--sjdbOverhang = 读长 - 1`（默认 99 对应 100bp 读长）。小基因组降 `--genomeSAindexNbases`（约 `log2(基因组大小)/2 − 1`，如 E. coli 设 11）。
3. 比对：单端/双端 FASTQ → `--outSAMtype BAM SortedByCoordinate`，gzip 输入须加 `--readFilesCommand zcat`。
4. （可选，提灵敏度）二轮比对：`--twopassMode Basic`，用第一轮发现的剪接位点重比对，对新剪接位点更敏感。
5. 查统计：解析 `Log.final.out`，关注唯一比对率（应 > 60%）、多重比对率、错配未比对率。
6. （可选）计数：`--quantMode GeneCounts` 产出 `ReadsPerGene.out.tab`，按文库链特异性选列。
7. 索引 BAM：`samtools index`。

## 指令

关键参数：

| 参数 | 默认 | 说明 |
|---|---|---|
| `--runThreadN` | 1 | 线程数 |
| `--sjdbOverhang` | 99 | 设为 读长−1 |
| `--outSAMtype` | SAM | 用 `BAM SortedByCoordinate` |
| `--outFilterMismatchNmax` | 10 | 每 read 最大错配，调低更严格 |
| `--outFilterMultimapNmax` | 10 | 超过该位点数标为未比对 |
| `--quantMode` | – | `GeneCounts` / `TranscriptomeSAM` |
| `--twopassMode` | None | `Basic` 开二轮发现新剪接位点 |
| `--alignIntronMax` | 1000000 | 最大内含子长，细菌基因组调小 |
| `--genomeSAindexNbases` | 14 | 小基因组调小，否则建索引 OOM |

`ReadsPerGene.out.tab` 四列：`gene_id  unstranded  stranded_fwd  stranded_rev`，按文库链特异性取列（无链选第 2 列）。

## 示例

建索引（人基因组，约 32 GB RAM）：

```bash
STAR --runMode genomeGenerate \
     --runThreadN 16 \
     --genomeDir genome/star_index/ \
     --genomeFastaFiles GRCh38.primary_assembly.genome.fa \
     --sjdbGTFfile gencode.v47.primary_assembly.annotation.gtf \
     --sjdbOverhang 100
```

双端比对 + 二轮 + 计数一步到位：

```bash
STAR --runThreadN 8 \
     --genomeDir genome/star_index/ \
     --readFilesIn sample_R1.fastq.gz sample_R2.fastq.gz \
     --readFilesCommand zcat \
     --twopassMode Basic \
     --outSAMtype BAM SortedByCoordinate \
     --quantMode GeneCounts \
     --outSAMattributes NH HI AS NM MD \
     --outFileNamePrefix results/sample/
samtools index results/sample/Aligned.sortedByCoord.out.bam
```

多样本汇成计数矩阵（喂给 pydeseq2）：

```python
import pandas as pd
from pathlib import Path
samples = ["ctrl_1", "ctrl_2", "treat_1", "treat_2"]
col = {"unstranded": 1, "fwd": 2, "rev": 3}["unstranded"]  # 按链特异性选列
counts = {}
for s in samples:
    df = pd.read_csv(Path("results")/s/"ReadsPerGene.out.tab",
                     sep="\t", header=None, skiprows=4)   # 跳过前 4 行汇总
    counts[s] = df.set_index(0)[col]
matrix = pd.DataFrame(counts)
matrix = matrix[matrix.sum(axis=1) > 0]
matrix.to_csv("gene_count_matrix.tsv", sep="\t")
```

主要输出：`Aligned.sortedByCoord.out.bam`（排序 BAM）、`SJ.out.tab`（剪接位点表）、`Log.final.out`（比对统计）、`ReadsPerGene.out.tab`（基因计数）、`Unmapped.out.mate1/2`（加 `--outReadsUnmapped Fastx` 时）。

## 注意事项

- `--sjdbOverhang` 必须等于 读长−1；不匹配会损失剪接灵敏度。
- gzip 输入忘加 `--readFilesCommand zcat` 会报错或读不出内容。
- 唯一比对率 < 60%：多为基因组/物种不符或污染，核对 FASTA 物种、跑 FastQC 查过表达序列。
- `Fatal error: genome files not found`：`--genomeDir` 路径错或索引不全（应含 `Genome`、`SA`、`SAindex`），重跑 `genomeGenerate`。
- 建索引 OOM：人基因组要 ≥ 32 GB RAM；小基因组加 `--genomeSAindexNbases 13` 或更低。
- 多重比对率过高（> 20%）：重复性基因组，调低 `--outFilterMultimapNmax`，或 `--outSAMmultNmax 1` 每 read 只输出一条。
- `ReadsPerGene.out.tab` 读 pandas 时 `skiprows=4` 跳过前 4 行汇总统计；选列要匹配文库链特异性，否则计数严重偏低。
- ENCODE/Ensembl 提供预建索引，磁盘慢时优先复用、用 SSD。

## 互见

- related：`genomic-file-toolkit` —— 产出的 BAM 用 pysam 做区域抓取/覆盖度统计；`nextflow-pipeline-builder` —— 把建索引→比对→计数封装成可扩展流水线。
- combines_with：`gene-set-enrichment-analysis` —— 计数矩阵经差异表达后做富集分析；`nextflow-pipeline-builder` —— 批量样本编排。

---

本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0），适配重写而非逐字翻译。
