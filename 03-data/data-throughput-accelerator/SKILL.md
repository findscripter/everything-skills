---
name: data-throughput-accelerator
title: 大规模数据吞吐加速（导入/回填/ETL）
description: 当大规模数据导入/回填/导出/ETL/数仓装载/清单追平/表同步需要在保证正确性的前提下显著提速时使用；做瓶颈分层定位与多变体基准对比，产出最快且行数/时间戳一致的可固化路径与硬核对账块；不适用于小数据量、单纯调度编排或与正确性无关的纯算力问题；触发词：回填、ETL提速、数仓装载
domain: 数据/pipeline
triggers: [大规模数据导入, 历史数据回填, ETL/管道提速, 数仓装载慢, 清单追平 catch-up, 表同步落后, 批量导出, backfill 跑得慢]
tags: [数据, pipeline, etl, 回填, 数仓, 性能优化, 幂等, 对账]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Edit, Bash, Grep, Glob]
requires: []
related: [data-pipeline-engineer, spark-job-optimization, dask-distributed-dataframes, data-quality-frameworks]
combines_with: [data-quality-validator, airflow-dag-builder, gl-subledger-reconciler]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
## 何时使用

当瓶颈是**搬运、转换或落盘大量数据**，且既要更快、又要数据正确落到正确位置并可证明时使用。典型场景：大规模导入、历史回填、批量导出、ETL、数仓装载、清单（manifest）追平、表同步。

目标不只是"快"，而是**更快地把正确数据落到正确位置，并留下证据**。

不该用的边界：
- 数据量很小、提速收益可忽略时——直接跑即可，别过度工程。
- 问题与正确性无关的纯算力/纯调度编排（这类用通用性能或调度方案）。
- 还没分清瓶颈层就盲目加 worker / 改批大小——先分层定位再动手。

## 步骤

1. **读契约**：先读清当前的源、目标、清单（manifest）三方契约。
2. **量积压**：统计外部文件数、清单行数、raw 行数、derived 行数、最小/最大时间戳、未处理计数。
3. **跑基准**：执行一次安全的小样本追平或采样基准，拿到可比数据。
4. **比变体**：横向对比——批大小、worker 数、数仓 SQL、文件分组、staging 形态、清单更新方式。
5. **只晋升最快且一致的路径**：行数与时间戳必须保持连贯，否则不采纳。
6. **固化**：把胜出路径沉淀为 CLI / 定时任务 / 工作流 / runbook。
7. **复算对账**：固化路径执行后，重新跑一遍最终对账。

## 指令

**先做这一层区分（优化前必做）**，把以下速度分开看，不要混为一谈：
- 源抽取速度；
- 网络传输速度；
- 数仓/装载速度；
- 转换（transform）速度；
- 服务表（serving table）新鲜度；
- 作业运行期间实时尾部（live tail）的增长。

> 一条管道可能本身"很快"，却仍显得落后——因为新数据到达的速度超过了最终追平窗口。

**快路径经验法则（Fast Path Heuristics）**：
- 把计算搬到数据已经在的地方（move compute to the data）。
- 对已落地的大文件，优先用数仓原生的扫描、join、append。
- 用 manifest / checkpoint 跳过已完成的文件或分区。
- 让分区与聚簇（partitioning / clustering）匹配读取与追加模式。
- 合并小文件、小请求、小写入（batch）。
- 通过唯一键、清单或可替换 staging 让写入**幂等**。
- raw、derived、serving 三类表分别独立核账。

## 示例

固化路径执行后，输出一个**硬核对账块**（correctness gate 不通过就不算完成）：

```text
Data throughput result:
- Source files discovered: 294
- Files processed this run: 294
- Raw rows added: 9,683,598
- Derived rows added: 8,917,585
- Remaining tail: 24 files at readback time
- Runtime: 38.7s
- Correctness gate: manifest counts and table max timestamps match
```

关键字段：发现文件数、本次处理文件数、raw/derived 新增行数、回读时刻的剩余尾部、运行时长，以及正确性闸门（清单计数与表最大时间戳一致）。

## 注意事项

- 不要为了让指标好看而删除 raw 数据。
- 不要静默跳过失败文件。
- 不要把历史回填的进度与实时尾部新鲜度混在一起。
- 在目标表与清单未达成一致前，不要宣布管道"完成"。
- 对金融、医疗、受监管或影响客户的数据：保留回放（replay）证据与审批闸门。

## 互见

- 同域：数据/pipeline 下的清单与幂等写入、数仓分区/聚簇优化条目（如有）。
- 上游：先用瓶颈分层定位确认是哪一层慢，再选对应加速手段。

---

采编自 affaan-m/everything-claude-code（MIT）。
