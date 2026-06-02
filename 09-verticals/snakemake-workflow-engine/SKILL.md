---
name: snakemake-workflow-engine
title: Snakemake 可复现生信流程引擎
description: 当需要用 Python 规则编排多步、可复现、可扩展的生信/计算流程（比对→排序→去重→变异调用，多样本批处理，本地到 SLURM/云无改代码）时使用；产出 Snakefile（rule/wildcard/expand/config/resources/conda 环境）、DAG 预览与集群 profile；不适用于 Nextflow/CWL/WDL 等其他引擎、纯 shell 循环或时序调度（用 Airflow/Prefect）；触发词：snakemake、Snakefile、rule、wildcards、expand、conda 环境、SLURM、DAG、可复现流程、NGS、变异调用。
domain: 领域/science
triggers: [snakemake, Snakefile, rule, wildcards, expand, conda 环境, SLURM, DAG, 可复现流程, NGS, 变异调用]
tags: [snakemake, bioinformatics, workflow, pipeline, reproducible, ngs, hpc, slurm, conda, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, snakemake, conda, mamba, singularity, graphviz]
requires: []
related: [nextflow-pipeline-builder, genomic-file-toolkit, gatk-variant-calling, star-rnaseq-aligner]
combines_with: [gatk-variant-calling, star-rnaseq-aligner]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

当用户需要做以下任一项时使用本条目，即使没明说「Snakemake」：

- 构建可复现的多步生信流程（比对 → 排序 → 去重 → 变异调用 → 注释）。
- 用基于文件的依赖让多个样本走同一套规则批量处理（wildcard 驱动）。
- 让同一流程从本地开发无改代码扩展到 SLURM/LSF/云（靠 profile 切执行器）。
- 增量重算：只重跑输入变了的步骤；执行前出 DAG / dry-run 预览。
- 给每条 rule 配独立 conda / Singularity 环境做工具隔离。

**不该用边界**：需要 Groovy DSL + dataflow 通道或 nf-core 社区流程库时用 `Nextflow`（见互见 `nextflow-pipeline-builder`）；只是简单 shell 循环就写 bash，Snakemake 只对「3+ 步且有分支」的串联才值得；数据工程的动态任务图 / 时序调度用 `Airflow`/`Prefect`。

## 步骤

1. **环境就绪**：`command -v snakemake` 先查是否已装；pixi 项目内用 `pixi run snakemake` 而非裸命令。需要 Python 3.11+，`graphviz` 用于画 DAG。
2. **写 Snakefile**：每个分析步骤一条 `rule`，声明 `input:`/`output:`（带 `{sample}` 通配符）+ 执行方式（`shell:`/`run:`/`script:`）。
3. **必写 `rule all`**：把所有最终产物用 `expand()` 收进 `rule all` 的 `input:`，否则只跑文件里第一条 rule。
4. **dry-run 先行**：`snakemake -n` 看清将跑哪些 rule、顺序对不对，确认 DAG 无误再真跑。
5. **本地执行**：`snakemake --cores 8`；需要环境隔离加 `--use-conda` / `--use-apptainer`。
6. **上集群**：写 `profiles/slurm/config.yaml`（`executor: slurm`），用 `--profile profiles/slurm` 提交，Snakefile 不动。
7. **配置外置**：样本列表、线程数、阈值放 `config.yaml`，`configfile:` 加载，别硬编码。

## 指令

安装与验证：

```bash
conda install -c conda-forge -c bioconda snakemake   # 含可选依赖（推荐）
pip install snakemake                                 # 最小安装
snakemake --version                                   # 8.x.x
```

核心 CLI：

| 命令 | 用途 |
|------|------|
| `snakemake --cores 8` / `--cores all` | 本地执行，限定/用满并发核数 |
| `snakemake -n` | dry-run：只列任务不执行（每次真跑前必做） |
| `snakemake --forceall` | 忽略已有产物，全量重跑 |
| `snakemake --rerun-incomplete` | 重跑产物不完整的 rule |
| `snakemake --use-conda` / `--use-apptainer` | 启用每 rule 的 conda / Singularity 环境 |
| `snakemake --dag \| dot -Tpdf > dag.pdf` | 导出 DAG 图 |
| `snakemake --profile profiles/slurm --cores 256` | 用 profile 提交到集群 |
| `snakemake --set-resources variant_calling:mem_mb=32000 --set-threads align=16` | 运行时覆盖资源/线程 |
| `snakemake --report report.html` | 完成后出交互报告 |

**关键约定**：`{sample}` 写在 rule 的 input/output 里是**通配符**，由 Snakemake 在执行时回填；`expand("results/{sample}.bam", sample=SAMPLES)` 是 **Python**，立即生成字符串列表（用在 `rule all`）。Snakemake 从目标**反向**推导 DAG——给定想要的产物，只跑生产它们所需的 rule。

特殊产物包装器：`temp(...)` 下游消费后自动删（省磁盘）；`protected(...)` 写保护最终产物；`directory(...)` 输出目录；`touch(...)` 仅排序用的空标记；`ensure("...", min_size=N)` 校验产物属性。

## 示例

最小两 rule 流程（Snakefile）：

```python
SAMPLES = ["sampleA", "sampleB"]

rule all:                                    # 目标 rule：声明最终产物
    input:
        expand("results/{sample}.sorted.bam", sample=SAMPLES)

rule align:
    input:
        fastq="data/{sample}.fastq",
        ref="refs/genome.fa"
    output:
        bam="results/{sample}.sorted.bam"
    threads: 4
    shell:
        "bwa mem -t {threads} {input.ref} {input.fastq} "
        "| samtools sort -@ {threads} -o {output.bam}"
```

```bash
snakemake -n            # 先 dry-run
snakemake --cores 8     # 再执行
```

每 rule 配 conda 环境 + 声明资源（供 SLURM profile 调度）：

```python
rule star_align:
    input:
        reads="data/{sample}.fastq",
        genome_dir="refs/star_index/"
    output:
        bam="star_out/{sample}/Aligned.sortedByCoord.out.bam"
    conda: "envs/star.yaml"     # channels: bioconda; deps: star=2.7.10b, samtools=1.17
    resources:
        mem_mb=16000, runtime=240    # MB / 最长墙钟分钟数
    threads: 8
    shell:
        "STAR --runThreadN {threads} --genomeDir {input.genome_dir} "
        "--readFilesIn {input.reads} --outSAMtype BAM SortedByCoordinate"
```

SLURM profile（`profiles/slurm/config.yaml`）+ 提交：

```yaml
executor: slurm
jobs: 100
default-resources: {mem_mb: 4000, runtime: 60}
use-conda: true
latency-wait: 30
rerun-incomplete: true
```

```bash
snakemake --profile profiles/slurm --cores 256 -n   # dry-run
snakemake --profile profiles/slurm --cores 256      # 提交
```

从目录自动发现样本（避免硬编码列表）：

```python
from pathlib import Path
SAMPLES = [p.stem.replace(".fastq", "") for p in Path("data/").glob("*.fastq")]
```

## 注意事项

- **必有 `rule all`**：缺它只跑第一条 rule；它汇集所有最终产物，反向驱动整条 DAG。
- **大中间文件用 `temp()`**：去重前 BAM、未排序 BAM、中间组装结果标 `temp()` 消费后自动删，省大量磁盘。
- **配置与代码分离**：样本/线程/路径/阈值进 `config.yaml`，硬编码使流程脆弱不可复用。
- **每个 shell rule 加 `log:`**：`2> {log}` 把工具 stderr/stdout 重定向到 per-rule 日志，否则集群作业失败几乎无法调试。
- **生产 rule 加 `benchmark:`**（`"benchmarks/{rule}/{sample}.txt"`）实测运行时与内存，是调 SLURM 资源申请的依据。
- **重算语义**：产物时间戳早于输入会触发重跑；意外重跑可 `snakemake --touch` 刷新时间戳或删除重跑。
- **常见报错**：`AmbiguousRuleException`（多 rule 命中同产物）→ 加 `wildcard_constraints:` 或 `ruleorder`；`MissingOutputException` → 查工作目录/产物路径/磁盘；`TargetFileException`（`rule all` 要的文件无 rule 能产）→ 核对 `expand()` 参数与通配符名，用 `-n` 追踪；conda 环境构建失败 → channel 顺序把 `conda-forge` 放 `bioconda` 前并钉版本。
- 官方文档：https://snakemake.readthedocs.io/ · 工作流目录：https://snakemake.github.io/snakemake-workflow-catalog/ · 论文 Mölder et al. (2021) F1000Research 10:33。

## 互见

- related：`nextflow-pipeline-builder` —— 另一可复现流程引擎，需 Groovy DSL/nf-core 时改用它，可对照编排思路。
- related：`genomic-file-toolkit` —— BAM/VCF 等文件处理常作为 Snakemake rule 的执行体。
- combines_with：`gene-set-enrichment-analysis` —— 流程跑出的定量结果接下游富集分析。
- combines_with：`single-cell-rnaseq-analysis` —— 把单细胞多步分析编排为可复现流程。

---

本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
