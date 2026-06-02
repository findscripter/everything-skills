---
name: process-sop-documenter
title: 业务流程 SOP 文档化
description: 当需要把存在某人脑子里的业务流程正式落成标准作业程序（SOP）——梳理交接环节、用 RACI 厘清谁负责谁拍板、为审计或交接编写流程文档、并补齐异常与边界情形时使用；产出含目的/范围/RACI 矩阵/流程图/分步细则/异常处理/度量指标的完整 SOP；不适用于流程瓶颈量化分析、销售漏斗或一次性项目计划。触发词：SOP、标准作业程序、流程文档化、RACI、操作手册、流程交接、process doc、standard operating procedure
domain: 协作/knowledge
triggers: [SOP, 标准作业程序, 流程文档化, RACI, 操作手册, 流程交接, process doc, standard operating procedure]
tags: [sop, process, raci, documentation, handoff, audit, operations, runbook]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [technical-reference-builder, oncall-handoff-writer, operational-runbook-writer, support-kb-article-writer]
combines_with: [operational-runbook-writer, support-kb-article-writer, technical-reference-builder]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## 何时使用

当需要把一条"只在某人脑子里"的业务流程，正式落成可交接、可审计的标准作业程序（SOP）时使用。典型场景：

- 把口口相传的流程形式化，让新人照着就能跑通。
- 建 RACI 矩阵厘清每一步谁动手（Responsible）、谁拍板（Accountable）、问谁（Consulted）、告知谁（Informed）。
- 为某个交接点或审计需求编写正式 SOP。
- 把"通常做 X，但有时要 Y"这类异常与边界情形系统性记录下来——这往往是最有价值的部分。

**不该用的边界（先判断再调用）：**

- 流程瓶颈量化分析、周期时间 / 增值比测算 —— 用 `business-process-mapper`，本技能产出的是叙事性 SOP，不做数据建模。
- 销售漏斗 / 线索转化等对外增长流程 —— 本技能面向内部可重复流程。
- 一次性项目的任务计划与排期 —— 那是项目管理，不是可复用流程的文档化。
- 流程尚不存在、还在从零设计阶段 —— 本技能记录"现状如何运转（as-is）"，而非凭空发明。

## 步骤

引导式产出，先收集再结构化：

1. **粗收集（start messy）。** 让用户用任意形式描述：口头讲、贴现有文档、或只给流程名。不要求完美，由你来结构化。
2. **逐步追问补全。** 针对每一步问清四要素：谁做（Who/角色）、何时触发（When）、怎么做（How）、产出什么（Output）。点名当下实际负责的人，即使角色会变。
3. **建 RACI。** 对每个关键步骤标出 R/A/C/I。约束：每步**有且仅有一个** Accountable（A），避免"谁都负责=没人负责"。
4. **画流程。** 用 ASCII 流程图或分步描述呈现主路径与分支。
5. **挖异常与边界（最关键）。** 把"一般这样、但偶尔那样"的例外逐条列入异常表，附处理方式。藏起来的边界情形是 SOP 失效的主因。
6. **补度量与关联。** 给出衡量流程健康的指标（指标 / 目标 / 测量方法），并链接相关流程或政策文档。

## 指令

按以下固定模板产出 SOP（保留源结构）：

```markdown
## 流程文档：[流程名称]
**Owner：** [人/团队] | **最后更新：** [日期] | **复审周期：** [季度/年度]

### 目的
[流程为何存在、达成什么]

### 范围
[包含什么、不包含什么]

### RACI 矩阵
| 步骤 | Responsible 执行 | Accountable 担责 | Consulted 咨询 | Informed 知会 |
|------|------|------|------|------|
| [步骤] | [谁做] | [谁拍板] | [问谁] | [告知谁] |

### 流程图
[ASCII 流程图或分步描述]

### 分步细则
#### 步骤 1：[名称]
- **谁（Who）**：[角色]
- **何时（When）**：[触发条件或时点]
- **怎么做（How）**：[详细操作]
- **产出（Output）**：[本步产物]
#### 步骤 2：[名称]
[同上格式]

### 异常与边界情形
| 场景 | 如何处理 |
|------|------|
| [异常] | [处置方式] |

### 度量指标
| 指标 | 目标 | 测量方法 |
|------|------|------|
| [指标] | [目标值] | [方法] |

### 相关文档
- [相关流程或政策链接]
```

**若接入连接器：**

- 知识库（wiki）已接：先搜索是否已有同名 SOP，能更新就别新建重复；定稿后发布到 wiki。
- 项目跟踪器已接：把流程关联到相关项目与工作流，并为流程改进项创建任务。

## 示例

最小引导对话：

```
用户：帮我把"新供应商入库审批"流程写成 SOP，我们财务一直靠口头交接。
Agent：好。先粗讲一遍现状即可，我来追问补全 —— 第一步谁发起？通常要等谁审批？
       哪些情况会卡住或走例外（比如缺 W-9、金额超阈值）？
→ 收齐后产出：目的/范围 + RACI（发起=采购R、审批=财务经理A、合规C、申请人I）
  + ASCII 流程图 + 分步细则（每步 Who/When/How/Output）
  + 异常表（缺税表→退回补件；金额>5万→升级 CFO）+ 度量（平均审批时长、退回率）。
```

## 注意事项

- **从乱到整。** 不要等用户给出完美描述；先拿到"今天怎么跑的"，结构化是你的活。
- **例外即价值。** "通常 X、偶尔 Y" 是最该写进文档的内容，务必逼问出来。
- **点名真人。** 即便角色会变，知道当下谁做什么才能把流程画对。
- **单一 Accountable。** RACI 中每步只能有一个 A，否则担责落空。
- **记录现状优先。** 先文档化 as-is，再谈优化或 to-be。
- **本技能产出叙事性 SOP**，不含量化瓶颈分析；需要测周期时间 / 增值比请转 `business-process-mapper`。

## 互见

- related：`business-process-mapper` —— 量化版：SOP 定稿后想测瓶颈/周期时间时切换
- related：`oncall-handoff-writer` —— 同属交接文档化，聚焦值班场景
- related：`confluence-space-architect` —— SOP 成稿后归档发布到 wiki 空间
- combines_with：`enterprise-project-manager` —— 把流程改进动作转成可跟踪的项目任务

---

本条采编自 anthropics/knowledge-work-plugins（Apache-2.0）。
