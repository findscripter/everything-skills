---
name: genomic-file-toolkit
title: 基因组文件处理（BAM/VCF/FASTQ）
description: 当需要读写或解析 SAM/BAM/CRAM 比对、VCF/BCF 变异、FASTA/FASTQ 序列并提取区间、计算覆盖度时使用；用 pysam（htslib）做区域抓取、pileup 深度统计、变异过滤与序列提取，产出过滤后文件或统计结果；不适用于纯文本表格清洗、对齐/变异检测算法本身的实现、非基因组数据。触发词：pysam、bam、vcf、fastq、cram、bcf、fasta、samtools、bcftools、tabix、pileup、coverage、覆盖度、测序比对、变异、基因组区间、reference sequence、NGS、生物信息
domain: 领域/science
triggers: [pysam, bam, vcf, fastq, cram, bcf, fasta, samtools, bcftools, tabix, pileup, coverage, 覆盖度, 测序比对, 变异, 基因组区间, reference sequence, NGS, 生物信息]
tags: [bioinformatics, genomics, pysam, bam, vcf, fastq, ngs, samtools, htslib, coverage]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [pysam, htslib, samtools, bcftools, tabix, Python]
requires: []
related: [single-cell-rnaseq-analysis, gene-set-enrichment-analysis, nextflow-pipeline-builder]
combines_with: [nextflow-pipeline-builder, gene-set-enrichment-analysis]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

当 Agent 需要处理高通量测序（NGS）相关文件时使用本条：

- 读写或筛选比对文件（SAM/BAM/CRAM），按区域抓取 reads、按 mapping 质量/flag 过滤。
- 解析遗传变异文件（VCF/BCF），访问位点、等位基因、基因型与 INFO/FORMAT 字段。
- 提取参考序列或基因区间（FASTA），顺序读取原始测序数据（FASTQ）。
- 用 pileup 计算逐碱基覆盖度/测序深度，做覆盖度统计与质控（QC）。
- 在 Python 中直接调用 samtools / bcftools 命令编排流程。

不该用的边界：
- 纯文本/表格类数据清洗（用 csv 类工具），非基因组的通用序列处理。
- 不负责比对算法（BWA/minimap2）或变异检测算法（GATK/bcftools call 的算法本身）的实现——pysam 是读写与解析层，可调用外部工具但不替代它们。
- 大规模分布式流水线编排（用 Nextflow/Snakemake 等），本条聚焦单机文件级操作。

## 步骤

1. 安装：`uv pip install pysam`（封装 htslib，自带 samtools/bcftools 绑定）。
2. 确认索引就绪（随机访问区域必需）：BAM 需 `.bai`，CRAM 需 `.crai`，FASTA 需 `.fai`，`vcf.gz` 需 `.tbi`，BCF 需 `.csi`。缺索引时只能 `fetch(until_eof=True)` 顺序读。
3. 按格式选择打开模式与类：`AlignmentFile`（SAM/BAM/CRAM）、`VariantFile`（VCF/BCF）、`FastaFile`（随机访问参考）、`FastxFile`（顺序读 FASTQ）。
4. 用 `fetch()` 按区域抓取、`pileup()` 做列式覆盖、`count()` 做计数；处理完显式 `close()` 释放资源。
5. 注意坐标系：pysam 内部为 0-based 半开区间；`fetch()` 的区域字符串走 samtools 的 1-based 约定。

## 指令

文件模式（打开时指定格式）：
- `"rb"` 读 BAM（二进制）、`"r"` 读 SAM（文本）、`"rc"` 读 CRAM。
- `"wb"` 写 BAM、`"w"` 写 SAM、`"wc"` 写 CRAM。

创建索引：`pysam.index("sorted.bam")`、`pysam.faidx("ref.fasta")`、`pysam.tabix_index("x.vcf.gz", preset="vcf")`。

在 Python 中调用命令行工具：
```python
pysam.samtools.sort("-o", "sorted.bam", "input.bam")
pysam.samtools.index("sorted.bam")
pysam.samtools.view("-b", "-o", "region.bam", "input.bam", "chr1:1000-2000")
pysam.bcftools.view("-O", "z", "-o", "output.vcf.gz", "input.vcf")
```
错误处理：捕获 `pysam.SamtoolsError`。

性能要点：随机访问务必用索引文件；列式分析用 `pileup()` 而非反复 `fetch()`；计数用 `count()`；独立区域可并行处理；无索引时用 `until_eof=True` 顺序处理。

## 示例

读取比对文件并按区域取 reads：
```python
import pysam
samfile = pysam.AlignmentFile("example.bam", "rb")
for read in samfile.fetch("chr1", 1000, 2000):
    print(f"{read.query_name}: {read.reference_start}")
samfile.close()
```

遍历变异：
```python
vcf = pysam.VariantFile("variants.vcf")
for variant in vcf:
    print(f"{variant.chrom}:{variant.pos} {variant.ref}>{variant.alts}")
vcf.close()
```

提取参考序列：
```python
fasta = pysam.FastaFile("reference.fasta")
sequence = fasta.fetch("chr1", 1000, 2000)
print(sequence)
fasta.close()
```

坐标系对照（同一区间两种写法）：
```python
samfile.fetch("chr1", 999, 2000)   # 0-based：位置 999-1999
samfile.fetch("chr1:1000-2000")    # 1-based 字符串：位置 1000-2000
```

## 注意事项

1. 坐标系混淆：0-based（pysam 内部）vs 1-based（region 字符串、VCF 文件格式）。注意 `VariantRecord.start` 是 0-based，而 `variant.pos` 是 1-based。
2. 缺索引：多数随机访问操作需先建索引，否则只能顺序读。
3. 边界部分重叠：`fetch()` 返回所有与区域有重叠的 reads，而非仅完全包含在内的 reads。
4. 迭代器作用域：需保持 pileup 迭代器引用存活，否则报 "PileupProxy accessed after iterator finished"。
5. 质量值编辑：改了 `query_sequence` 后不能就地改 `query_qualities`，需先复制。
6. 流限制：流式仅支持 stdin/stdout，不支持任意 Python file 对象。
7. 线程安全：I/O 时虽释放 GIL，但完整线程安全性尚未充分验证。

官方文档：https://pysam.readthedocs.io/

## 互见

- 区域抓取与覆盖统计（AlignmentFile / pileup）：源仓库 `references/alignment_files.md`。
- 变异与基因型（VariantFile / INFO / FORMAT）：源仓库 `references/variant_files.md`。
- 序列提取与 FASTQ（FastaFile / FastxFile / tabix）：源仓库 `references/sequence_files.md`。
- 多文件类型整合工作流（BAM+VCF、VCF+BED）：源仓库 `references/common_workflows.md`。

---
本条采编自 K-Dense-AI/scientific-agent-skills（MIT）。
