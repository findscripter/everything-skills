---
name: fastp-fastq-preprocessing
title: fastp FASTQ 质控与接头修剪
description: 当对 Illumina FASTQ（单端/双端、RNA-seq/WGS/WES/ChIP-seq/ATAC-seq）做比对前预处理时使用；用 fastp 一遍完成接头自动识别、质量/长度过滤、双端重叠校正、polyX 去尾，产出修剪后的 fastq.gz 和 HTML+JSON 质控报告，供 MultiQC 汇总；不适用于已比对 BAM/VCF 解析、需 FastQC 逐碱基详报或 Trimmomatic 滑窗精控的场景。触发词：fastp、FASTQ、接头修剪、adapter trimming、质控、QC、polyA、双端、MultiQC
domain: 领域/science
triggers: [fastp, FASTQ, 接头修剪, adapter trimming, 质控, QC, polyA, 双端, PE, MultiQC, 比对前预处理]
tags: [bioinformatics, genomics, fastp, fastq, qc, adapter-trimming, ngs, rnaseq, preprocessing, multiqc, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [fastp, multiqc, python, pandas, snakemake, conda, bash]
requires: []
related: [star-rnaseq-aligner, genomic-file-toolkit, gatk-variant-calling, nextflow-pipeline-builder]
combines_with: [star-rnaseq-aligner, gatk-variant-calling]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

当 Agent 需要在比对（STAR/BWA-MEM2/Salmon）之前对 Illumina 原始测序数据做一站式质控与接头修剪时使用本条，典型场景：

- 任何 NGS 流程（RNA-seq、WGS、WES、ChIP-seq、ATAC-seq）比对前去接头、去低质量碱基。
- 作为流程第一步，逐样本产出 HTML+JSON 质控报告，再交 MultiQC 汇总。
- 双端数据优先用重叠（overlap）自动识别接头，而非手动指定接头序列。
- 3′ 端富集 RNA-seq（QuantSeq、Smart-seq）去 polyA/polyX 尾。
- 按 UMI 或 index 拆分 FASTQ 用于解多路复用（demultiplexing）。

**不该用本条的边界：**

- 已比对/已变异的文件（BAM/CRAM/VCF）解析、覆盖度统计 → 用 genomic-file-toolkit。
- 需要 FastQC 那种逐碱基质量详细图随修剪一并产出 → 用 Trim Galore。
- 需要细粒度滑动窗口（sliding-window）裁剪步骤的精细控制 → 用 Trimmomatic。

fastp 比 Trim Galore / Trimmomatic 快 3–10×，单遍多线程，效果相当或更好，已是上述流程的标准预处理工具。

## 步骤

1. 检查与安装：先 `command -v fastp`，已在 pixi/conda 环境则跳过安装；pixi 项目里用 `pixi run fastp`。
2. 准备输入：单端或双端原始 FASTQ（`.fastq` / `.fastq.gz`）。
3. 单端：自动识别接头跑修剪（见示例）。
4. 双端：加 `--detect_adapter_for_pe` 启用重叠自动识别 + `--correction` 校正重叠区错配。
5. 调质量/长度阈值：按场景设 `--qualified_quality_phred` 与 `--length_required`（变异检测从严，普通流程从宽）。
6. RNA-seq 3′ 富集协议：加 `--trim_poly_x --poly_x_min_len 10` 去 polyA 尾。
7. 解析 JSON 做自动质量门禁（quality gate），批量时再用 MultiQC 汇总所有报告。

## 指令

关键参数（默认值 → 效果）：

| 参数 | 默认 | 作用 |
|---|---|---|
| `-i / -I` | 必填 | 输入 FASTQ（双端 R1 / R2） |
| `-o / -O` | 必填 | 输出修剪后 FASTQ（R1 / R2） |
| `-h / -j` | — | HTML / JSON 报告输出路径 |
| `--thread` | 3 | 线程数，8 较均衡 |
| `--qualified_quality_phred` | 15 | 最低碱基质量（Phred），20=1% 错误率 |
| `--length_required` | 15 | 修剪后最短读长，更短的丢弃 |
| `--correction` | 关 | 校正双端重叠区错配 |
| `--detect_adapter_for_pe` | 关 | 双端重叠法自动识别接头 |
| `--adapter_sequence` | 自动 | 显式指定 R1 接头，覆盖自动识别 |
| `--trim_poly_x` | 关 | 去 polyX 尾（polyA/polyT），用于 3′ 富集 RNA-seq |
| `--low_complexity_filter` | 关 | 过滤低复杂度读（默认 <30%） |
| `--split` | 关 | 每方向拆成 N 个文件，便于并行 |

安装与校验：

```bash
command -v fastp || conda install -c bioconda fastp   # 已有则跳过
# 或预编译二进制（Linux）
wget https://github.com/OpenGene/fastp/releases/download/v0.24.0/fastp
chmod +x fastp
fastp --version    # fastp 0.24.0
```

接头自动识别失败时显式指定（Illumina TruSeq）：

```bash
fastp -i R1.fq.gz -I R2.fq.gz \
  --adapter_sequence AGATCGGAAGAGCACACGTCTGAACTCCAGTCA \
  --adapter_sequence_r2 AGATCGGAAGAGCGTCGTGTAGGGAAAGAGTGT \
  -o R1.out.fq.gz -O R2.out.fq.gz
```

## 示例

双端：重叠法自动识别接头 + 校正（推荐默认）：

```bash
fastp \
    -i sample_R1.fastq.gz -I sample_R2.fastq.gz \
    -o sample_R1.trimmed.fastq.gz -O sample_R2.trimmed.fastq.gz \
    -h sample_qc.html -j sample_qc.json \
    --thread 8 \
    --correction --detect_adapter_for_pe \
    --qualified_quality_phred 20 --length_required 36
```

单端（自动识别接头）：

```bash
fastp -i sample.fastq.gz -o sample.trimmed.fastq.gz \
    -h sample_qc.html -j sample_qc.json \
    --thread 8 --qualified_quality_phred 20 --length_required 36
```

变异检测的从严过滤：

```bash
fastp -i R1.fastq.gz -I R2.fastq.gz \
    -o R1.filtered.fastq.gz -O R2.filtered.fastq.gz \
    -h qc.html -j qc.json --thread 8 \
    --qualified_quality_phred 25 --unqualified_percent_limit 20 \
    --length_required 50 --max_len1 150 --max_len2 150 \
    --low_complexity_filter --complexity_threshold 30
```

RNA-seq 去 polyA 尾（QuantSeq 3′ mRNA-seq）：

```bash
fastp -i quantseq_R1.fastq.gz -o quantseq_R1.trimmed.fastq.gz \
    -h quantseq_qc.html -j quantseq_qc.json --thread 8 \
    --trim_poly_x --poly_x_min_len 10 \
    --qualified_quality_phred 20 --length_required 25
```

解析 JSON 做质量门禁（自动卡通过率）：

```python
import json

def parse_fastp_json(path: str) -> dict:
    with open(path) as f:
        d = json.load(f)
    before, after = d["summary"]["before_filtering"], d["summary"]["after_filtering"]
    return {
        "reads_in":   before["total_reads"],
        "reads_out":  after["total_reads"],
        "pct_passed": after["total_reads"] / before["total_reads"] * 100,
        "q30_after":  after["q30_rate"] * 100,
        "adapter_trimmed": d["filtering_result"]["adapter_trimmed"],
    }

m = parse_fastp_json("sample_qc.json")
if m["pct_passed"] < 70:        # 通过率 <70% 报警
    print("WARNING: 通过率偏低，检查原始数据质量")
```

批量预处理 + 汇总（多样本循环 → MultiQC）：

```bash
SAMPLES=(ctrl_1 ctrl_2 treat_1 treat_2); DATA=data; OUT=trimmed; QC=qc/fastp
mkdir -p "$OUT" "$QC"
for s in "${SAMPLES[@]}"; do
  fastp -i "$DATA/${s}_R1.fastq.gz" -I "$DATA/${s}_R2.fastq.gz" \
        -o "$OUT/${s}_R1.fastq.gz" -O "$OUT/${s}_R2.fastq.gz" \
        -h "$QC/${s}.html" -j "$QC/${s}.json" --thread 8 \
        --correction --detect_adapter_for_pe \
        --qualified_quality_phred 20 --length_required 36
done
multiqc qc/fastp/ -o qc/ -n fastp_multiqc_report   # 汇总所有 JSON
```

Snakemake 规则（嵌入流程）：

```python
rule fastp_pe:
    input:  r1="data/{sample}_R1.fastq.gz", r2="data/{sample}_R2.fastq.gz"
    output: r1="trimmed/{sample}_R1.fastq.gz", r2="trimmed/{sample}_R2.fastq.gz",
            html="qc/{sample}_fastp.html", json="qc/{sample}_fastp.json"
    threads: 8
    shell:
        "fastp -i {input.r1} -I {input.r2} -o {output.r1} -O {output.r2} "
        "-h {output.html} -j {output.json} --thread {threads} "
        "--correction --detect_adapter_for_pe "
        "--qualified_quality_phred 20 --length_required 36"
```

## 注意事项

- **单端不要用 `--detect_adapter_for_pe`**：它依赖双端重叠，单端识别不到接头时改为显式 `--adapter_sequence AGATCGGAAGAGC`。
- **接头含量异常高（>50%）**：多为短插入文库（small RNA / miRNA）或建库差，核对文库协议，可用 `--overlap_len_require 10` 调重叠灵敏度。
- **过滤掉太多读（通过率 <60%）**：阈值过严或测序质量差，放宽 `--qualified_quality_phred` 到 15、`--length_required` 降到 25。
- **JSON 缺字段 / MultiQC 解析不到**：旧版 fastp 升级（`conda update fastp`）；MultiQC 要 `multiqc qc/` 而非 `multiqc .`，确认 `qc/*.json` 存在。
- **输出 FASTQ 为空**：阈值过极端或输入有误，先 `zcat sample.fq.gz | head -8` 验证输入，去掉 `--low_complexity_filter` 重试。
- **polyA 没去掉**：必须显式加 `--trim_poly_x --poly_x_min_len 10`，仅 3′ 富集协议需要。
- **大文件慢**：提高 `--thread` 到 8–12，输入放 SSD 等快速存储。
- 关键产物：`*.trimmed.fastq.gz`（修剪后读）、`*.html`（交互质控报告）、`*.json`（机读指标，供自动化/MultiQC）、stderr 日志（过滤统计）。

## 互见

- genomic-file-toolkit：fastp 产出的 fastq.gz 比对成 BAM 后，做区域抓取/覆盖度/变异解析时。
- nextflow-pipeline-builder / single-cell-rnaseq-analysis：把 fastp 作为预处理步嵌入 Nextflow 流程或上游接 scRNA-seq 分析时。
- gene-set-enrichment-analysis：下游 RNA-seq 定量后做富集分析时。

---

本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0），适配重写而非逐字翻译。
