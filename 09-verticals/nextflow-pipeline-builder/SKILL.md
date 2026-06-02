---
name: nextflow-pipeline-builder
title: Nextflow 生信流程构建
description: 当需要运行、开发、配置或调试 Nextflow / nf-core 数据流程（生信为主，也含任意可复现计算）时使用；产出可复现、可移植、可扩展的 DSL2 流程、模块/子工作流、nextflow.config 与 nf-test 用例，并能扩展到 HPC/云；不适用于 Snakemake/CWL/WDL 等其他工作流引擎或非流程类脚本；触发词：nextflow、nf-core、.nf、nextflow.config、DSL2、process/channel/operator、samplesheet、nf-test、生信流程、可复现流程、rnaseq、sarek。
domain: 领域/science
triggers: [nextflow, nf-core, .nf, nextflow.config, DSL2, process/channel/operator, samplesheet, nf-test, 生信流程, 可复现流程, rnaseq, sarek]
tags: [nextflow, nf-core, bioinformatics, workflow, dsl2, pipeline, reproducible, hpc, containers, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [nextflow, nf-core, java, docker, singularity, conda, nf-test]
requires: []
related: [genomic-file-toolkit, single-cell-rnaseq-analysis, gene-set-enrichment-analysis]
combines_with: [genomic-file-toolkit, gene-set-enrichment-analysis]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

当用户需要做以下任一项时使用本条目，即使没说出「Nextflow」三字：

- 运行 nf-core 或自定义 Nextflow 流程，或调试失败 / `-resume` 续跑的运行。
- 编写或修改 `.nf` 脚本、`nextflow.config`、profile、`nextflow_schema.json`。
- 编写或测试 nf-core 风格模块 / 子工作流（`main.nf`、`meta.yml`、`tests/`、nf-test）。
- 配置执行器、容器或资源；扩展到 HPC（SLURM/SGE/LSF/PBS）或云（AWS/Google/Azure Batch、Kubernetes）。
- 构建任何可复现的科研 / 生信工作流。

**不该用边界**：其他工作流引擎（Snakemake、CWL、WDL、Airflow）不适用本条目；与流程无关的一次性数据脚本、纯命令行工具调用也不必走 Nextflow。

## 步骤

1. **判定工作模式**（决定一切走向）：
   - 运行已有流程 → 参考源仓库 `references/running-pipelines.md`。
   - 开发新流程 / 模块 / 子工作流 → `references/language.md` + `references/developing.md`。
   - 配置 / 扩展（HPC、云、容器、资源）→ `references/configuration.md` + `references/containers.md`。
   - 测试 → `references/testing.md`。
2. **检查环境**：需 Bash 与 Java 17+（17–25），`java -version` 确认。
3. **冒烟测试优先**：真实数据前先跑 `-profile test,docker`（或 `singularity` / `conda`），用极小数据验证环境通畅。
4. **钉死版本**：流程修订 `-r`、引擎 `NXF_VER`、容器内工具版本全部固定，科研发布勿用 `latest`。
5. **开发流程**：复用已有模块（`nf-core modules install`）优先于新写；工具参数通过 `ext.args` 透传而非写死脚本；必带 `stub:` 块与 nf-test；提交前跑 `nf-core pipelines lint` 和 `prettier`。

## 指令

安装与版本：

```bash
curl -s https://get.nextflow.io | bash      # 生成 ./nextflow
sudo mv nextflow /usr/local/bin/             # 放入 PATH
nextflow info                                # 验证
conda create -n nf -c bioconda -c conda-forge nextflow nf-core   # 备选：附带托管 Java
pip install nf-core                          # nf-core 工具（Python）
export NXF_VER=24.10.0                        # 钉死引擎版本
```

核心 `nextflow` CLI：

| 命令 | 用途 |
|------|------|
| `nextflow run <pipeline> -profile <p> --outdir <dir>` | 运行流程（路径、`.nf` 或 `user/repo`） |
| `-resume` | 复用上次运行的缓存结果 |
| `-r <rev>` | 运行指定 git 修订 / tag / 分支 |
| `-params-file params.yml` | 从 YAML/JSON 提供参数 |
| `-c custom.config` | 叠加额外配置文件 |
| `-with-report -with-trace -with-timeline -with-dag flow.html` | 执行报告 / 跟踪 / 时间线 / DAG |
| `-stub-run` | 仅跑 `stub:` 块（管道空跑） |
| `nextflow log` / `clean -f -before <run>` | 查看历史 / 清理旧 `work/` |
| `nextflow pull / drop / list / info <repo>` | 管理缓存的远端流程 |

nf-core 工具（v3+ 子命令归入 `pipelines` / `modules` / `subworkflows`）：`nf-core pipelines list | create | launch <name> | download | lint | schema build`；`nf-core modules list/info/install/update/create/lint/test`；子工作流同生命周期。

**关键约定**：`-profile`（单横线）选内置配置 profile，可逗号组合如 `test,docker`，但容器/基建 profile（`docker`、`singularity`、`conda`）互斥只选其一；`--input`、`--genome`、`--outdir`（双横线）是流程参数，nf-core 流程吃 **samplesheet CSV** 而非散落文件。

## 示例

运行 nf-core 流程（先冒烟测试，再钉版本真跑）：

```bash
# 1. 验证环境（下载流程 + 极小测试数据）
nextflow run nf-core/rnaseq -profile test,docker --outdir results

# 2. 真实运行：钉修订(-r)、选容器引擎、传入 samplesheet
nextflow run nf-core/rnaseq -r 3.14.0 \
  -profile docker \
  --input samplesheet.csv \
  --genome GRCh38 \
  --outdir results \
  -resume
```

最小 DSL2 流程：

```nextflow
#!/usr/bin/env nextflow

process SAYHELLO {
    tag "$greeting"
    publishDir "results", mode: 'copy'

    input:
    val greeting

    output:
    path "${greeting}.txt"

    script:
    """
    echo '$greeting world' > ${greeting}.txt
    """
}

workflow {
    channel.of('hello', 'bonjour', 'hola') | SAYHELLO
}
```

```bash
nextflow run main.nf            # 重跑时加 -resume
```

## 注意事项

- **核心概念**：`process` 是运行脚本的工作单元，声明 `input:`/`output:`/指令/`script:`，每个 task 在独立 `work/xx/yy…` 目录隔离运行；`channel` 是连接 process 的异步队列（queue 通道可消费、value 通道单值可复用）；`operator`（`map`/`filter`/`collect`/`groupTuple`/`join`/`combine`/`mix`/`branch`/`splitCsv`/`view` 等）变换组合通道；DSL2 `workflow` 可声明 `take:`/`main:`/`emit:` 并作为子工作流被 `include`；无名 `workflow {}` 是入口。
- **meta map**（nf-core 约定）：输入输出 tuple 中随文件携带元数据 map（如 `[ id:'sample1', single_end:false ]`），让样本全程带标签。
- **`-resume` 缓存语义**：当 task 的输入、脚本或容器任一变化时该 task 才重跑；理解此点才能正确调试缓存命中。
- **资源右配**：用 `process_low/medium/high` 标签配合 `errorStrategy 'retry'` 与 `task.attempt` 动态扩容，而非一次申请巨量资源。
- **前向兼容语法**：strict-syntax 解析器将于 Nextflow 26.04 成为默认。优先小写 `channel.of(...)`、显式闭包参数 `{ v -> ... }`、所有变量用 `def`、输出用 `emit:` 命名；用 `nextflow lint` 校验。
- **一处一容器**：每个 process 用独立容器 / conda 环境，绝不依赖宿主机已装工具；参数通过 config / params-file 而非硬编码路径。
- 官方文档：Nextflow https://www.nextflow.io/docs/latest/ · nf-core https://nf-co.re/docs/ · 培训 https://training.nextflow.io/

## 互见

- rag-pipeline-builder：另一类「流程构建」技能，可对照流水线编排思路。
- dependency-auditor：钉死流程修订与容器/工具版本时，配合做依赖与版本审计。

---

本条采编自 K-Dense-AI/scientific-agent-skills（MIT）。
