---
name: bulk-rnaseq-orchestrator
title: Bulk RNA-seq 端到端流程编排
description: 当你手握 bulk RNA-seq 原始 FASTQ 或定量输出、要走「可复现可辩护」的完整差异表达研究时使用；做实验设计/QC 把关→比对定量（nf-core/rnaseq 或 STAR/Salmon 两条路）→基因级计数矩阵→分发给差异表达/富集/作图的流程编排，产出计数矩阵+元数据模板+各阶段交接；不适用于单细胞（用 single-cell-rnaseq-analysis）、只做 DE 统计（用 pydeseq2）或只做富集；触发词：RNA-seq、bulk、FASTQ to DESeq2、nf-core/rnaseq、STAR、Salmon、计数矩阵、链特异性、QC、流程编排
domain: 领域/science
triggers: [RNA-seq, bulk, FASTQ to DESeq2, nf-core/rnaseq, STAR, Salmon, featureCounts, 计数矩阵, 链特异性, QC 把关, 差异表达流程, 流程编排]
tags: [rnaseq, bulk-rnaseq, orchestration, nf-core, star, salmon, counts-matrix, qc, bioinformatics, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [nextflow, STAR, salmon, featureCounts, fastqc, fastp, multiqc, python, pytximport, pandas]
requires: []
related: [star-rnaseq-aligner, nextflow-pipeline-builder, snakemake-workflow-engine, pydeseq2-differential-expression]
combines_with: [fastp-fastq-preprocessing, gene-set-enrichment-analysis, genomic-file-toolkit]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

当用户手里有 **bulk RNA-seq 原始 reads（FASTQ）或定量输出**，想要一条**完整、可复现、可辩护**的差异表达研究链路时用本条。本条是**编排器/路由**，不重复造轮子：把已有的各阶段技能按正确顺序串起来，补上唯一的真空地带（原始 reads → 基因级计数矩阵），并守住决定结果可信度的**设计与 QC 决策**。典型请求：「分析我的 RNA-seq」「FASTQ 到 DESeq2」「跑 nf-core/rnaseq」「STAR/Salmon 定量」「为 DESeq2 构计数矩阵」「从 reads 到差异基因和富集通路」。

「可辩护」= 三件事贯穿始终：**可复现**（钉死管线/工具版本、容器、记录参数、固定随机种子）、**QC 把关**（定量前中后都看 QC，不跳过）、**统计可靠**（足够重复、设计匹配生物学、计数正确处理、FDR 控制）。

**不该用的边界：**
- 单细胞 / 单核 RNA-seq → 用 `single-cell-rnaseq-analysis`（Scanpy），样本即细胞、模型不同。
- 只做 DE 统计（已有计数矩阵）→ 直接用 `pydeseq2-differential-expression`。
- 只做通路 / GSEA 富集 → 用 `gene-set-enrichment-analysis`。
- 单步比对器细节（建索引、二轮比对参数）→ 用 `star-rnaseq-aligner`、`fastp-fastq-preprocessing`。

## 步骤

自上而下，**别跳设计/QC 阶段——bulk RNA-seq 最常翻车在这里**。流程总览：`FastQC/trim → 比对定量(STAR/Salmon) → 计数 → DE(pydeseq2) → 富集 → 作图`。

1. **设计与样本表**：确认每组 ≥3 生物学重复，识别批次/混杂，定清比较组；构建 samplesheet 并校验（`scripts/validate_samplesheet.py`）。
2. **原始 reads QC**：逐文件 FastQC，MultiQC 聚合；看每碱基质量、接头含量、重复率、过表达序列。
3. **去接头**：`fastp` 或 `Trim Galore` 去接头与低质量尾，再跑一次 FastQC 确认（Path A 自动做）。
4. **比对/定量**：STAR（基因组比对 + `--quantMode GeneCounts`）和/或 Salmon（转录本伪比对，decoy-aware）。**务必确定链特异性——极易搞错且会悄悄砍掉约一半计数**；用 Salmon `-l A` 自动推断并核对已分配 reads 比例。
5. **构建计数矩阵**：定量输出 → 基因×样本整数矩阵 + 元数据模板（`scripts/build_counts_matrix.py`）。
6. **差异表达** → 交 `pydeseq2-differential-expression`：载 `counts.csv`+`metadata.csv`，设计如 `~batch + condition`，拟合 + FDR 检验；看 PCA 与 p 值直方图做 QC。
7. **富集** → 交 `gene-set-enrichment-analysis`：GSEA 用**全量**基因按 DESeq2 `stat` 列预排序；ORA 用阈值命中表（padj<0.05，可加 |log2FC|>1）。**先把 Ensembl ID 映射成 symbol**。
8. **作图**：火山图、MA 图、样本距离热图、PCA、富集点图，配合 MultiQC 报告讲 QC 故事。

## 指令

**两条上游路径——选一条走到底**（产出等价的基因计数）：

| 选 **Path A — nf-core/rnaseq** | 选 **Path B — 单机工具** |
|---|---|
| 要领域标准、可审计、可引用的管线，一条命令 | 样本少、想逐步学习/检查每一步 |
| 样本多、要上 HPC/云 | 无 Nextflow/容器，或受限环境 |
| 看重可复现 + 完整 MultiQC 报告 | 需要管线不暴露的非标准步骤 |
| → 经 `nextflow-pipeline-builder` 驱动 | → 跟单机配方逐步跑 |

**拿不准就选 Path A**：它已把 FastQC→去接头→STAR/Salmon→定量→tximport→MultiQC 用审阅过的默认参数串好，最可辩护。两条路都汇到**基因级计数矩阵**，之后流程一致。

环境安装：
```bash
# 本条胶水（桥接 + 交接）
uv pip install pytximport pandas
# 下游技能自装依赖：pydeseq2 / gseapy gprofiler-official
# Path B 单机工具（bioconda，钉版本保可复现）
conda create -n rnaseq -c bioconda -c conda-forge \
  fastqc fastp trim-galore "star=2.7.11b" "salmon=1.10.3" subread multiqc
```
**记录确切版本**（管线 revision、工具版本、参考基因组+注释 release）——它们进 methods 段、决定可复现性。

**计数→DE 桥（本条独占的关键胶水）**：`scripts/build_counts_matrix.py` 把定量输出转成 `pydeseq2` 恰好要的格式——
- **Salmon**（`--from salmon`）：用 `pytximport` 按 `counts_from_abundance="length_scaled_tpm"` 聚到基因级（基因级 DE 的正确选择），需 `tx2gene` 映射。
- **STAR**（`--from star`）：读各 `ReadsPerGene.out.tab`，按 `--strandedness`（unstranded/forward/reverse）选列。
- **featureCounts**（`--from featurecounts`）：解析合并矩阵。

产出 `counts.csv`（基因×样本整数）+ `metadata_template.csv`。**Salmon/RSEM 计数是估计值（非整数），会被四舍五入成整数**——因为 PyDESeq2 要求整数计数，配 `length_scaled_tpm` 时这是可接受的。

## 示例

**Path A — nf-core/rnaseq（推荐）**：
```bash
# 0. 先校验 samplesheet（提前捕获最常见失败）
python scripts/validate_samplesheet.py --samplesheet samplesheet.csv
# 1. 用内置微型数据冒烟测试环境
nextflow run nf-core/rnaseq -r 3.26.0 -profile test,docker --outdir test_results
# 2. 正式跑：钉 revision、选 aligner、传 samplesheet + 参考
nextflow run nf-core/rnaseq -r 3.26.0 -profile docker \
  --input samplesheet.csv --genome GRCh38 \
  --aligner star_salmon --outdir results -resume
```
nf-core/rnaseq 内部跑 tximport，计数**已合并**，**无需桥接脚本**；DE 直接用 `results/star_salmon/salmon.merged.gene_counts_length_scaled.tsv`。

**Path B — 单机 STAR/Salmon（缩略）**：
```bash
fastqc -o qc/ reads/*.fastq.gz                          # 1. QC 原始 reads
fastp -i s1_R1.fq.gz -I s1_R2.fq.gz \
      -o s1_R1.trim.fq.gz -O s1_R2.trim.fq.gz \
      --thread 4 -j s1.fastp.json                       # 2. 去接头/低质量
salmon quant -i salmon_index -l A \
      -1 s1_R1.trim.fq.gz -2 s1_R2.trim.fq.gz \
      --gcBias --seqBias -p 8 -o quant/s1               # 3. 逐样本定量
# Path B 专用：汇成计数矩阵 + 元数据模板
python scripts/build_counts_matrix.py --from salmon \
  --quant-dir quant/ --tx2gene tx2gene.tsv --output-dir counts/
```

## 注意事项

致使结果错误/不可复现的高频坑：
1. **重复太少**：每组 <3 生物学重复几乎无功效、离散度估计不稳；加重复比测更深更值。
2. **批次与条件混杂**：若处理组与对照组分别在不同天/lane 处理，效应不可恢复；要随机化并建模已知批次（`~batch + condition`）。
3. **链特异性搞错**：选错 STAR 列、featureCounts `-s` 或 Salmon 文库类型会悄悄丢约一半 reads；用 `-l A` 或推断，并核对已分配比例。
4. **把 TPM/FPKM 喂给 DESeq2**：DESeq2 要原始（或 length-scaled）**计数**，绝不能传 TPM/FPKM/已归一化值——桥脚本会处理。
5. **非整数计数**：PyDESeq2 要整数，Salmon 估计值需四舍五入（桥脚本已做）。
6. **基因 ID 不匹配进富集**：DESeq2 输出常是 Ensembl ID，Enrichr/MSigDB 要 symbol；进富集前先映射，否则「啥都不显著」。
7. **跳过定量后 QC**：信 DE 前必看 PCA 与样本距离热图——它们暴露标签互换、离群与隐藏批次。
8. **跨样本混用比对器**：每个样本用同一工具、版本、参考、参数。
9. **不钉版本**：「latest」管线/基因组不可复现；钉 `-r`、工具版本、基因组/注释 release。

## 互见

- combines_with：`pydeseq2-differential-expression` —— 本条产出的计数矩阵 + 元数据的标准下游 DE 引擎。
- combines_with：`gene-set-enrichment-analysis` —— DE 结果按 `stat` 预排序做 GSEA / 命中表做 ORA。
- combines_with：`nextflow-pipeline-builder` —— Path A 的执行底座，驱动 nf-core/rnaseq、上 HPC/云/容器。
- related：`star-rnaseq-aligner`、`fastp-fastq-preprocessing` —— Path B 单步比对/去接头的细节技能。
- related：`single-cell-rnaseq-analysis` —— 相关但不同，单细胞走它；`genomic-file-toolkit` —— BAM/计数表 I/O；`snakemake-workflow-engine` —— 另一种流水线封装选择。

---

本条采编自 K-Dense-AI/scientific-agent-skills（MIT），适配重写而非逐字翻译。
