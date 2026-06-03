---
name: samtools-bam-processing
title: samtools BAM/SAM 处理
description: 当需对 SAM/BAM/CRAM 比对文件做排序、建索引、格式转换、FLAG/质量/区间过滤、QC 统计、去重或合并时使用；用 samtools CLI（view/sort/index/flagstat/stats/depth/markdup/merge）把比对器输出整理成可分析的已排序已建索引 BAM 并出质控指标；不适用于 Python 内编程式 BAM 操作（用 pysam/genomic-file-toolkit）、归一化 bigWig 覆盖轨（用 deeptools）、全基因组逐碱基深度（用 mosdepth）；触发词：samtools、BAM、SAM、CRAM、sort、index、flagstat、markdup、FLAG、view
domain: 领域/science
triggers: [samtools, BAM, SAM, CRAM, sort, index, flagstat, idxstats, stats, depth, coverage, markdup, 去重, PCR 重复, merge, view, FLAG, proper pair, mapping quality, fixmate, 排序, 建索引, 格式转换, 区间提取, 测序比对]
tags: [生物信息, 基因组学, ngs, 比对, bam, sam, cram, samtools, 质控, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [samtools, htslib, bgzip/tabix]
requires: []
related: [bcftools-variant-manipulation, genomic-file-toolkit, bwa-mem2-dna-aligner, gatk-variant-calling]
combines_with: [bwa-mem2-dna-aligner, gatk-variant-calling]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

当你拿到比对器（BWA、STAR、bowtie2 等）输出的 SAM/BAM/CRAM，需要把它整理成下游分析（变异检测、峰检测、覆盖度）能直接吃的「已坐标排序 + 已建索引」BAM，并产出质控指标时，用 samtools。它是 NGS 流程里位于「比对」与「下游」之间的近乎标配组件。典型场景：

- 比对后对 BAM 按坐标排序（建索引的前置），再建索引以支持区间随机查询。
- 在 SAM/BAM/CRAM 间转换以省存储（BAM 约省 75%，CRAM 再省 40-50%，需参考 FASTA）。
- 出比对 QC：mapping rate、insert size、每染色体读段数（flagstat / stats / idxstats / coverage）。
- 按 mapping quality、SAM FLAG 位、基因组区间或 BED 过滤读段。
- 变异检测前标记或移除 PCR 重复（collate→fixmate→sort→markdup）。
- 合并多 lane / 多样本 BAM；按 BED 限定目标区降低下游 I/O。

**不该用的边界**：需要在 Python 脚本里编程式读写 BAM/做 pileup，用 pysam（本库的 `genomic-file-toolkit`）；需要归一化 bigWig 覆盖轨与 ChIP/ATAC 信号图，用 deeptools；需要全基因组逐碱基深度（更快、并行），用 mosdepth；samtools 本身不做比对算法与变异/峰检测的统计建模。

## 步骤

1. **排序**：比对器常输出未排序文件，先 `samtools sort` 按坐标排序（fixmate/markdup 需要的是按 name 排序，用 `-n`）。
2. **建索引**：`samtools index` 生成 `.bai`（染色体 >512 Mbp 用 `-c` 生成 CSI）。**必须先排序再建索引**，否则失败或结果错误。
3. **QC**：先跑 `flagstat`（秒级，能及早发现低 mapping rate 等比对失败），再视需要 `stats` / `idxstats` / `coverage`。
4. **过滤**：用 `-q`（mapping quality）、`-f`/`-F`（FLAG 位）、区间字符串或 `-L bed` 提取所需子集。
5. **去重（可选）**：变异检测前走完整 collate→fixmate→sort→markdup，再建索引。
6. **合并/归档（可选）**：`samtools merge` 合并已排序 BAM；长期归档转 CRAM 并保留参考 FASTA。

## 指令

前置检查：环境里可能已装好（如 pixi/conda），先 `command -v samtools`，有路径就跳过安装；pixi 项目内用 `pixi run samtools` 而非裸 `samtools`。

```bash
conda install -c bioconda samtools   # 或 brew install samtools（macOS）
samtools --version | head -1         # 建议 1.17+
```

比对后典型流程（排序 → 建索引 → QC）：

```bash
samtools sort -@ 8 -o sorted.bam input.bam
samtools index sorted.bam
samtools flagstat sorted.bam
```

关键参数：

| 参数 | 子命令 | 默认 | 说明 |
|---|---|---|---|
| `-@` | 多数 | 0 | 额外压缩/IO 线程，近线性加速（I/O 密集） |
| `-m` | sort | 768M | 每线程排序内存，如 `2G`/`4G` |
| `-q` | view | 0 | 最低 mapping quality 过滤（0-60） |
| `-f` | view | 0 | 仅保留 FLAG **全部**置位的读段 |
| `-F` | view | 0 | 排除 FLAG **任一**置位的读段 |
| `-b`/`-C`/`-T` | view | — | 输出 BAM / 输出 CRAM（需 `-T ref.fa`） |
| `-L` | view | — | 仅 BED 区间内读段（靶向分析降 I/O） |
| `-n` | sort | — | 按 read name 排序（fixmate/markdup 前置） |
| `-c` | index | — | 生成 CSI 索引（染色体 >512 Mbp 必需） |
| `-d`/`-r` | markdup | 0 / — | 光学重复像素距离 / 移除而非仅标记重复 |

常用 SAM FLAG 位：`1`=paired、`2`=proper pair、`4`=unmapped、`8`=mate unmapped、`16`=反向链、`64`=R1、`128`=R2、`256`=secondary、`1024`=PCR 重复、`2048`=supplementary。

## 示例

格式转换与过滤：

```bash
samtools view -b -h input.sam -o output.bam                 # SAM→BAM（约省 75% 空间）
samtools view -C -T reference.fa input.bam -o output.cram   # BAM→CRAM（再省 40-50%）
samtools view -q 20 -F 4 input.bam -o filtered.bam          # MQ≥20 且排除未比对
samtools view -h sorted.bam "chr1:1000000-2000000" -o region.bam  # 区间提取（需索引，1-based）
samtools view -c -F 4 input.bam                             # 仅计数已比对读段
samtools view -F 2304 sorted.bam -o primary.bam             # 去 secondary+supplementary
```

排序与索引：

```bash
samtools sort -@ 8 -m 2G input.bam -o sorted.bam   # 坐标排序
samtools sort -n -@ 8 input.bam -o namesorted.bam  # 按 name 排序（markdup 前置）
samtools index sorted.bam                          # 生成 sorted.bam.bai
samtools index -c sorted.bam                        # 大染色体用 CSI
```

QC 统计：

```bash
samtools flagstat sorted.bam                        # 总数/已比对/proper pair（秒级）
samtools idxstats sorted.bam                         # 每染色体 mapped/unmapped
samtools stats -r reference.fa sorted.bam > full_stats.txt   # insert size/GC/碱基质量
samtools coverage sorted.bam                         # 每区/每染色体 min/max/mean 覆盖
samtools depth -b target_regions.bed sorted.bam > depth.txt  # 区间逐碱基深度
```

完整去重流程（变异检测前，给 GATK 等）：

```bash
samtools collate -@ 8 -o collated.bam aligned.bam
samtools fixmate -m -@ 8 collated.bam fixmated.bam   # -m 写 mate 信息，markdup 必需
samtools sort  -@ 8 -o dsorted.bam fixmated.bam
samtools markdup -@ 8 -s dsorted.bam deduped.bam     # -s 输出去重统计；-r 直接移除
samtools index deduped.bam
samtools flagstat deduped.bam | grep duplic          # WGS 约 3-15%，amplicon 10-30%
# NovaSeq 光学重复：samtools markdup -d 2500 dsorted.bam marked.bam
```

合并与下采样：

```bash
samtools merge -@ 8 merged.bam lane1.bam lane2.bam lane3.bam   # 所有输入须已排序
samtools merge -b bam_list.txt -@ 8 merged.bam                # 从清单合并（每行一个）
samtools view -b -s 0.30 input.bam -o down30.bam              # 随机下采样到 30%
```

## 注意事项

- **建索引失败 `fail to index`**：BAM 未坐标排序，先 `samtools sort -o sorted.bam input.bam`。
- **`BAI index too large`**：染色体 >512 Mbp，改用 CSI：`samtools index -c input.bam`。
- **`CRAM: reference not found`**：缺/错参考 FASTA，设 `REF_PATH` 或显式 `-T ref.fa`。
- **去重结果不对**：跳过了 fixmate，必须走完整 collate→fixmate→sort→markdup；直接对坐标排序 BAM 跑 markdup 会误判。
- **flagstat 显示 0% properly paired**：双端 BAM 缺 mate 信息，先 `samtools fixmate` 补 mate 坐标。
- **排序很慢**：每线程内存不足，加大 `-m 4G`；内存受限则减小 `-@`。
- **区间查询返空**：未建索引或坐标错；先 `samtools index`，并用 1-based 坐标 `chr1:1000-2000`。
- **打开失败 / 文件疑似损坏**：路径不对或文件坏，`samtools quickcheck file.bam` 自检；生产运行尽量都加 `-@` 提速。

## 互见

- requires：无
- related：`genomic-file-toolkit`（Python/pysam 编程式 BAM/VCF 操作，CLI 之外的脚本场景）、`star-rnaseq-aligner` 与 `gatk-variant-calling`（samtools 的上游比对与下游变异检测）、`deeptools-ngs-analysis`（覆盖轨/信号图）、`macs3-peak-calling`（峰检测，吃排序 BAM）
- combines_with：`fastp-fastq-preprocessing`（比对前 FASTQ 质控）、`gatk-variant-calling`（去重 BAM → 变异）、`deeptools-ngs-analysis`（BAM → bigWig）、`nextflow-pipeline-builder`（把这些步骤编排成可复现流程）
- 官方文档：htslib.org/doc/samtools.html ｜ 源码 github.com/samtools/samtools
- 文献：Danecek et al. (2021) "Twelve years of SAMtools and BCFtools", GigaScience 10(2)（DOI:10.1093/gigascience/giab008）；SAM 格式规范 samtools.github.io/hts-specs/SAMv1.pdf

---
采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0），源条目许可 MIT。
