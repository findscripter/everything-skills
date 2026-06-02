---
name: macs3-peak-calling
title: MACS3 ChIP/ATAC-seq 峰检测
description: 当需从 ChIP-seq/ATAC-seq/CUT&RUN 比对 BAM 中检测富集峰时使用；用 macs3 callpeak 以泊松模型相对 input/IgG 找富集区，产出 narrowPeak/broadPeak/summits 及信号轨；不适用于 RNA-seq 表达定量、变体检测或差异结合统计本身（交给 DiffBind/DESeq2）；触发词：MACS3、峰检测、ChIP-seq、ATAC-seq、narrowPeak、broadPeak
domain: 领域/science
triggers: [MACS3, 峰检测, call peak, callpeak, ChIP-seq, ATAC-seq, narrowPeak, broadPeak, 组蛋白修饰, 转录因子结合位点, CUT&RUN, CUT&TAG, summits, 信号轨, 开放染色质]
tags: [生物信息, 基因组学, 表观遗传, ChIP-seq, ATAC-seq, 峰检测, MACS3, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [macs3, samtools, bedGraphToBigWig, idr, python/pandas]
requires: []
related: [deeptools-ngs-analysis, star-rnaseq-aligner, snpeff-variant-annotation, gatk-variant-calling]
combines_with: [deeptools-ngs-analysis, gene-set-enrichment-analysis, nextflow-pipeline-builder]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

当你拿到 ChIP-seq、ATAC-seq、CUT&RUN 或 CUT&TAG 的已比对 BAM，需要识别读段显著富集的区域（峰）时使用 MACS3。它从双端片段长度分布或单端读段位移估计建模，再用泊松模型计算相对 input/IgG 对照的富集倍数，输出可在 IGV/UCSC 浏览的 BED 格式峰文件。典型场景：

- 转录因子结合位点检测（narrow 峰）；H3K4me3 等尖锐标记也用 narrow。
- ATAC-seq 开放染色质区域检测。
- H3K27me3、H3K9me3、H3K36me3 等弥散组蛋白标记的宽峰检测（`--broad`）。
- 生成 bedGraph/bigWig 信号轨用于浏览器可视化。
- 作为 DiffBind/DESeq2 差异结合分析的输入峰集；用 IDR 做重复一致性筛选。

**不该用的边界**：MACS3 只做峰检测，不负责 RNA-seq 表达定量、变体检测；差异结合的统计建模本身交给 DiffBind/DESeq2，MACS3 仅提供峰区。需要核小体分辨率的 ATAC 峰用 HMMRATAC（MACS3 内置）；替代工具有 SPP/HOMER，但 MACS3 是 ENCODE 推荐标准。

## 步骤

1. **准备 BAM**：MACS3 需要已排序、已建索引的 BAM。
2. **选模式调用 callpeak**：TF/尖锐标记走默认 narrow；弥散组蛋白标记加 `--broad`；ATAC-seq 必须 `--nomodel`。
3. **（可选）生成信号轨**：加 `-B --SPMR` 输出归一化 bedGraph，再转 bigWig。
4. **解析与注释峰**：读 narrowPeak，按 q 值过滤高置信峰，导出供下游注释。

## 指令

前置检查：环境里可能已装好（如 pixi/conda），先 `command -v macs3`，有路径就跳过安装；pixi 项目内用 `pixi run macs3` 而非裸 `macs3`。

```bash
pip install macs3        # 或 conda install -c bioconda macs3
macs3 --version          # 例：macs3 3.0.2
```

排序建索引：

```bash
samtools sort -@ 8 chip_raw.bam -o chip.bam
samtools sort -@ 8 input_raw.bam -o input.bam
samtools index chip.bam && samtools index input.bam
```

关键参数：

| 参数 | 默认 | 说明 |
|---|---|---|
| `-t/--treatment` | 必填 | ChIP/ATAC 处理组 BAM |
| `-c/--control` | — | input/IgG 对照；缺失时配 `--nolambda` |
| `-g/--gsize` | 必填 | 有效基因组大小：`hs`=2.7e9(人)、`mm`=1.87e9(鼠)、`ce`、`dm` 或整数 |
| `-q/--qvalue` | 0.05 | FDR 阈值 |
| `-p/--pvalue` | — | P 值阈值（IDR 用宽松值如 0.1） |
| `--broad` / `--broad-cutoff` | off / 0.1 | 宽峰模式及合并阈值 |
| `--nomodel` / `--extsize` | off / 200 | 跳过片段建模；ATAC 必须 |
| `--shift` | 0 | 读段位移；单端 ATAC 用 `-100` 配 `--extsize 200` |
| `--keep-dup` | 1 | `auto`(泊松)、`all`(ATAC) 或整数 |
| `-B/--bdg` / `--SPMR` | off | 输出 bedGraph / 每百万读段归一化 |

主要输出：`*_peaks.narrowPeak`(BED6+4)、`*_peaks.broadPeak`(BED6+3，加 `--broad` 时)、`*_summits.bed`(峰顶 1bp，做基序分析)、`*_treat_pileup.bdg`/`*_control_lambda.bdg`(加 `-B`)、`*_model.r`(片段模型，`Rscript` 出图)。

## 示例

TF ChIP-seq（narrow，带对照）：

```bash
macs3 callpeak -t chip.bam -c input.bam -f BAM -g hs \
    -n tf_chip --outdir peaks/ -q 0.05 --keep-dup auto
# 输出 peaks/tf_chip_peaks.narrowPeak 与 peaks/tf_chip_summits.bed
```

H3K27me3 宽峰：

```bash
macs3 callpeak -t h3k27me3.bam -c input.bam -f BAM -g hs \
    -n h3k27me3 --outdir peaks/ --broad --broad-cutoff 0.1 -q 0.05
```

ATAC-seq 双端（推荐）/ 单端：

```bash
# 双端 BAMPE
macs3 callpeak -t atac.bam -f BAMPE -g hs -n atac \
    --outdir peaks/ --nomodel --nolambda -q 0.05 --keep-dup all
# 单端：移位居中到 Tn5 切点
macs3 callpeak -t atac_se.bam -f BAM -g hs -n atac_se \
    --outdir peaks/ --nomodel --shift -100 --extsize 200 --keep-dup all
```

信号轨（SPMR 归一化）转 bigWig：

```bash
macs3 callpeak -t chip.bam -c input.bam -f BAM -g hs \
    -n chip_track --outdir tracks/ -B --SPMR --keep-dup auto
sort -k1,1 -k2,2n tracks/chip_track_treat_pileup.bdg > tracks/chip_sorted.bdg
bedGraphToBigWig tracks/chip_sorted.bdg genome/hg38.chrom.sizes tracks/chip.bw
```

解析与过滤高置信峰（pandas，narrowPeak 第 9 列为 -log10(q)）：

```python
import pandas as pd
cols = ["chrom","start","end","name","score","strand",
        "signalValue","pValue","qValue","peak"]
peaks = pd.read_csv("peaks/tf_chip_peaks.narrowPeak", sep="\t", header=None, names=cols)
high = peaks[peaks["qValue"] > 2].copy()          # -log10(q)>2 即 q<0.01
high.to_csv("high_confidence_peaks.bed", sep="\t", index=False, header=False,
            columns=["chrom","start","end","name","score","strand"])
```

IDR 重复一致性（先各重复用宽松 `-p 0.1` 调峰）：

```bash
idr --samples peaks/tf_rep1_peaks.narrowPeak peaks/tf_rep2_peaks.narrowPeak \
    --input-file-type narrowPeak --output-file peaks/tf_idr_peaks.txt \
    --idr-threshold 0.05 --plot
```

## 注意事项

- **峰太少**：q 值过严或测序深度低，放宽到 `-p 1e-3`，确认 ≥10M 比对读段。
- **峰太多（>10万）**：阈值过松或无对照，补 `-c input.bam`、用 `-q 0.01`、按 signalValue 过滤。
- **报 no reads**：BAM 未排序/未建索引，先 `samtools sort` + `index`。
- **ATAC 峰落在线粒体**：mtDNA 含量高，先过滤 `chrM`：`samtools view -h x.bam | grep -v chrM | samtools view -bS - > filtered.bam`。
- **片段建模失败**：读段太少或长度异常，加 `--nomodel --extsize 200`。
- **bedGraph 过大**：高覆盖未归一化，加 `--SPMR`。
- **gsize 配错**：hg19/hg38 用 `hs`，mm9/mm10 用 `mm`，或给精确整数。
- **`--broad` 漏掉尖峰**：信号本就尖锐（TF、H3K4me3）应改用 narrow。

## 互见

- MACS3 源码与文档：github.com/macs3-project/MACS
- 原始论文：Zhang Y et al. (2008) Genome Biology 9:R137（DOI:10.1186/gb-2008-9-9-r137）
- ENCODE ATAC-seq 标准流程：encodeproject.org/atac-seq
- IDR 框架：github.com/nboley/idr
- 下游：DiffBind/DESeq2 差异结合分析；HMMRATAC 核小体分辨率 ATAC 峰。

---
采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0），源条目许可 BSD-3-Clause。
