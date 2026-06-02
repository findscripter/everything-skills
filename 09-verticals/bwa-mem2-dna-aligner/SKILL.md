---
name: bwa-mem2-dna-aligner
title: BWA-MEM2 短读 DNA 比对（WGS/WES/ChIP-seq）
description: 当需要把 Illumina 短读 DNA（50–250 bp，WGS/WES/ChIP-seq/ATAC-seq）比对到参考基因组、生成带 @RG 读组头的排序 BAM 供 GATK/Picard 变异检测或 peak calling 时使用；用 bwa-mem2 index 建索引、bwa-mem2 mem 比对并管道接 samtools sort/index、再 markdup 去重，产出 sorted/markdup BAM 与 flagstat 质控；不适用于跨剪接位点的 RNA-seq（用 star-rnaseq-aligner）、<50bp 极短读（用 BWA-backtrack）、长读（用 minimap2）。触发词：bwa-mem2、DNA 比对、短读、WGS、WES、ChIP-seq、ATAC-seq、@RG 读组、BAM、samtools sort、markdup、参考基因组比对
domain: 领域/science
triggers: [bwa-mem2, DNA 比对, 短读比对, WGS, WES, ChIP-seq, ATAC-seq, @RG 读组, read group, BAM, samtools sort, markdup, 去重, 参考基因组比对, alignment, fastq 比对]
tags: [bwa-mem2, bioinformatics, genomics, alignment, short-read, dna, wgs, wes, chip-seq, bam, samtools, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [bwa-mem2, samtools, Picard, Python, GATK]
requires: []
related: [star-rnaseq-aligner, samtools-bam-processing, fastp-fastq-preprocessing, gatk-variant-calling]
combines_with: [fastp-fastq-preprocessing, samtools-bam-processing, gatk-variant-calling]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

当需要把 Illumina 短读 DNA（50–250 bp）比对到参考基因组、产出可供下游变异检测或 peak calling 的排序 BAM 时使用本条。BWA-MEM2 是 BWA-MEM 的后继，结果一致但约快 2×，输出 GATK 所需的 `@RG` 读组头，并把嵌合/拆分读处理为补充（supplementary）比对。典型场景：

- WGS/WES Illumina 读比对到参考基因组，供 SNP/indel/SV 变异检测。
- ChIP-seq / ATAC-seq 的 DNA 比对，产出 BAM 供 MACS3 等 peak calling。
- 产出带 `@RG` 标签的 GATK 兼容 BAM。
- 把旧 FASTQ 重比对到更新的参考基因组装配版本。
- 读长 ≥ 50 bp 的短读比对。

不该用本条的边界：

- 跨剪接位点的 RNA-seq 读 → 用 `star-rnaseq-aligner`（剪接感知）。
- 极短读（< 50 bp）→ BWA-backtrack 更合适。
- 长读（PacBio/ONT）→ 用 minimap2，本条只管短读。
- 需要 local 比对或极致压小索引体积 → 可改用 Bowtie2（功能相当的替代）。
- 仅做 BAM/SAM 读写、区域抓取、覆盖度统计等文件级操作 → 用 `genomic-file-toolkit`，不必跑比对。

前置条件：bwa-mem2（conda 或预编译二进制）、samtools；参考基因组 FASTA（如 GRCh38、hg19、mm10）；人类基因组建索引约需 28 GB RAM（小鼠 6–8 GB）。**安装前先 `command -v bwa-mem2`**，已在 conda/pixi 环境则跳过安装；pixi 项目内用 `pixi run bwa-mem2`。conda 装：`conda install -c bioconda bwa-mem2 samtools`，`bwa-mem2 version` 验证。

## 步骤

1. **建索引（每基因组一次，约 25–35 min）**：`bwa-mem2 index GRCh38.fa`，生成 `.0123 / .amb / .ann / .bwt.2bit.64 / .pac` 五个文件。人类基因组约需 28 GB RAM。
2. **比对 + 排序（管道直连，省去中间 SAM）**：`bwa-mem2 mem` 必须带 `-R` 读组串（GATK 必需），输出管道接 `samtools sort`。`-t` 设 8–16 线程。
3. **建 BAM 索引**：`samtools index sample.sorted.bam`，生成 `.bai` 供 GATK/IGV 随机读取。
4. **标记 PCR/光学重复**：变异检测前去重。快路用 samtools `fixmate -m → sort → markdup`；GATK 最佳实践用 Picard `MarkDuplicates`（`REMOVE_DUPLICATES=false` 只标不删）。
5. **质控评估**：`samtools flagstat` 看总数/比对率/正确配对/重复率，`samtools coverage` 看覆盖度。比对率 < 85% 需排查基因组版本/污染/读质量。
6. **接入下游**：去重后的 `markdup.bam` 作为 GATK HaplotypeCaller 输入（先 BQSR）。

关键参数：`-t`（线程，生产 8–16）；`-R "@RG\tID:..\tSM:..\tPL:ILLUMINA\tLB:..\tPU:.."`（读组串，**GATK 必需**，ID=run、SM=样本名、PL=平台、LB=文库、PU=flowcell）；`-M`（把拆分读标为 secondary，Picard 兼容）；`-Y`（补充比对用 soft clip，GATK 推荐）；`-p`（交错配对 FASTQ）；`-k 19`（最小种子长，降低更敏感）；`-T 30`（最低比对分阈值）。

## 示例

建索引 + 配对比对 + 排序 + 建索引（最小可用）：

```bash
# 1. 建索引（一次性，约 28 GB RAM）
bwa-mem2 index GRCh38.fa

# 2. 配对比对 + 排序（管道直连）
bwa-mem2 mem -t 16 -R "@RG\tID:sample1\tSM:sample1\tPL:ILLUMINA" \
    GRCh38.fa sample1_R1.fastq.gz sample1_R2.fastq.gz \
    | samtools sort -@ 8 -o sample1.sorted.bam

# 3. 建 BAM 索引 + 看已比对读数
samtools index sample1.sorted.bam
echo "Mapped reads: $(samtools view -c -F 4 sample1.sorted.bam)"
```

标记重复（samtools 快路，比对后接 fixmate→sort→markdup）：

```bash
samtools fixmate -m sample1.sorted.bam - \
  | samtools sort -@ 8 \
  | samtools markdup -@ 8 - sample1.markdup.bam
samtools index sample1.markdup.bam
samtools flagstat sample1.markdup.bam | grep "duplicate"
```

完整 WGS 比对 → 变异检测一条龙（比对+去重+GATK）：

```bash
#!/bin/bash
GENOME="GRCh38.fa"; SAMPLE="sample1"; THREADS=16
R1="data/${SAMPLE}_R1.fastq.gz"; R2="data/${SAMPLE}_R2.fastq.gz"
OUTDIR="results/${SAMPLE}"; mkdir -p "$OUTDIR"

# 比对 + 排序
bwa-mem2 mem -t $THREADS \
    -R "@RG\tID:${SAMPLE}\tSM:${SAMPLE}\tPL:ILLUMINA\tLB:lib1\tPU:run1" \
    $GENOME $R1 $R2 \
    | samtools sort -@ 8 -o $OUTDIR/${SAMPLE}.sorted.bam
samtools index $OUTDIR/${SAMPLE}.sorted.bam

# 标记重复
samtools fixmate -m $OUTDIR/${SAMPLE}.sorted.bam - \
    | samtools sort -@ 8 \
    | samtools markdup -@ 8 - $OUTDIR/${SAMPLE}.markdup.bam
samtools index $OUTDIR/${SAMPLE}.markdup.bam

# GATK 变异检测（GVCF）
gatk HaplotypeCaller -R $GENOME -I $OUTDIR/${SAMPLE}.markdup.bam \
    -O $OUTDIR/${SAMPLE}.g.vcf.gz -ERC GVCF --native-pair-hmm-threads 4
```

批量多样本（循环比对，逐样本报比对率）：

```bash
GENOME="GRCh38.fa"; THREADS=12
for s in ctrl_1 ctrl_2 treat_1 treat_2; do
  bwa-mem2 mem -t $THREADS \
      -R "@RG\tID:${s}\tSM:${s}\tPL:ILLUMINA\tLB:lib1\tPU:run1" \
      $GENOME data/${s}_R1.fastq.gz data/${s}_R2.fastq.gz \
      | samtools sort -@ 4 -m 2G -o results/${s}.sorted.bam
  samtools index results/${s}.sorted.bam
  echo "$s: $(samtools view -c -F 4 results/${s}.sorted.bam) / $(samtools view -c results/${s}.sorted.bam) mapped"
done
```

用 Python 解析 flagstat 汇总比对指标：

```python
import subprocess, pandas as pd
rows = []
for s in ["ctrl_1", "ctrl_2", "treat_1", "treat_2"]:
    out = subprocess.run(["samtools", "flagstat", f"results/{s}.sorted.bam"],
                         capture_output=True, text=True).stdout
    st = {"sample": s}
    for line in out.splitlines():
        if "total" in line: st["total"] = int(line.split()[0])
        elif "mapped" in line and "%" in line:
            st["mapped"] = int(line.split()[0])
            st["pct_mapped"] = float(line.split("(")[1].split("%")[0])
        elif "properly paired" in line: st["properly_paired"] = int(line.split()[0])
    rows.append(st)
df = pd.DataFrame(rows).set_index("sample")
print(df); df.to_csv("alignment_metrics.tsv", sep="\t")
```

## 注意事项

- **比对率低（< 85%）**：基因组版本不符 / 污染 / 低质读 → 核对参考装配版本，跑 FastQC，用 Trim Galore 去接头。
- **GATK 报缺 `@RG` 头**：比对时漏了 `-R` → 带 `-R "@RG\tID:..\tSM:..\tPL:ILLUMINA"` 重比对。
- **建索引 OOM**：人类基因组约需 28 GB RAM，内存不足可退回经典 bwa（占内存更低）。
- **配对读数不平衡**：交错 FASTQ 或 R1/R2 文件错配 → 交错输入加 `-p`；`zcat r1.fq.gz | wc -l` 核对 R1/R2 读数。
- **`[E::bwa_idx_load_from_disk]`**：索引文件缺失或前缀错 → 重跑 `bwa-mem2 index genome.fa`，确认 `.0123`、`.bwt.2bit.64` 等都在。
- **比对慢**：线程太少或 I/O 慢 → 用 `-t 16+`，数据放 SSD，并直接管道接 `samtools sort` 避免落地 SAM。
- **补充比对干扰下游**：拆分读在某些工具出问题 → 加 `-M` 标为 secondary（Picard 兼容）；GATK 推荐 `-Y` 用 soft clip。
- **BQSR 缺已知位点**：从 NCBI 或 GATK resource bundle 下载对应基因组的 dbSNP VCF。
- **染色体命名一致**：BAM 与参考 FASTA 须同用 `chr1` 或 `1`，否则下游报错。

## 互见

- related：`star-rnaseq-aligner` —— RNA-seq 的剪接感知比对（DNA 用本条、RNA 用 STAR）；`genomic-file-toolkit` —— BAM/SAM/VCF 的读写、索引、区域抓取与覆盖度统计是本流程的输入/输出基础。
- combines_with：`gatk-variant-calling` —— 本条产出的去重 BAM 直接作为 GATK BQSR→HaplotypeCaller 的输入；`snpeff-variant-annotation` —— 比对→变异检测后的功能注释。
- combines_with：`nextflow-pipeline-builder` / `snakemake-workflow-engine` —— 把「建索引→比对→排序→去重→变异检测」各步包成可复现、可并行的工作流。

---

本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0），适配重写而非逐字翻译。
