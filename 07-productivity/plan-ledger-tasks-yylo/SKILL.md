---
name: plan-ledger-tasks-yylo
title: YYLO 需求规划与 Ledger 任务注册
description: 当用户明确要求规划或登记工作时使用；先把想法收敛为精简 PDR（目标/范围/排除/风险/验收）并固化为 artifact 回执，再经 yy ledger 拆分登记可独立实现与验证的任务、写入依赖与验收标准，产出 PDR Record ID 与任务 ID 列表；不适用于直接开始实现、任务执行期流转或非 YYLO 环境；触发词：需求规划、PDR、拆任务、任务注册、登记工作、yy ledger
domain: 协作/pm
triggers: [把需求转成实现级任务, 精简 PDR 起草与固化, yy ledger create 登记任务, 依赖与验收标准写入任务体, PDR Artifact Record, 显式规划请求才动手, 规划不等于开工, 返回任务 ID 与依赖摘要]
tags: [需求规划, PDR, 任务拆分, 项目管理, kanban, yylo, cli, 编码智能体]
level: 进阶
status: stable
agents: [claude-code, codex]
tools: [yy]
requires: []
related: [prd-spec-writer, task-decomposition-planner, ledger-tasks-yylo]
combines_with: [github-issue-writer, workflow-yylo]
license: MIT
source: yylo-dev/yylo-skills
source_license: MIT
---

# YYLO 需求规划与 Ledger 任务注册

采编自 yylo-dev/yylo-skills（MIT），由 YYLO 团队自荐并适配为本库格式。

## 何时使用

当用户**明确要求**"规划/登记一件事"（plan or register work）时使用：把一个想法收敛为一份精简 PDR，再拆成一条或多条实现级任务登记进 YYLO Ledger。规划完成即止——**不等于开工**：

- 产出：外部草稿 PDR → 固化为不可变 artifact 回执 → 登记任务（含依赖与验收标准）→ 返回任务 ID 与依赖/顺序摘要。
- **不该用**：未获单独请求就进入实现、建 worktree、push/部署；任务执行期的看板流转（用 `ledger-tasks-yylo`）；通用 PRD 写作方法本身（用 `prd-spec-writer`）。

## 步骤 / 指令

1. **读上下文**：读项目指令与相关产品代码；经控制器读取既有任务/规格元数据，不假设 `.juno_task/plan.md` 存在。
2. **起草 PDR**：一份精简 PDR 覆盖目标、现状、范围、排除、风险、依赖、验收标准与聚焦测试；写在**外部新文件**，不放进产品树或任务正文。
3. **固化回执**：预检 `yy ledger --help` 与 `yy ledger artifact --help`；将 PDR 存为带任务/请求来源的本地不可变 `report` Artifact Record，并校验 ID、digest、大小、保留策略、取回与历史。artifact API 不可用时**停**：保留外部草稿、请求升级，绝不回退到产品 `docs/`、任务正文或直接改存储。
4. **拆分规则**：只在各部分可**独立实现与验证**时才拆；并发任务必须显式声明路径所有权与依赖（blocked_by）。
5. **登记任务**：经路由后的 `yy ledger` 命令创建任务；任务正文写入精简耐久的需求与验收标准，PDR artifact ID 记入受支持的任务字段/来源；后续诉求新建关联任务，不重开已归档 ID。
6. **边界**：产品文档只是随产品发布的文档；绝不在产品/特性 worktree 内创建控制器私有任务、ledger、状态或回执。
7. **收尾**：变更类命令用 `--id`（非旧式 `--ID`）；最终返回任务 ID 与简短依赖/顺序摘要。

### 取回既有 PDR

预检 `yy ledger get --help`；用 `yy ledger get RECORD_ID -f json` 精确读回已知 PDR，不猜存储类型。未知 ID 走有界检索 `record search --projection summary --limit 20`，不做试错式盲查。元数据/历史≠字节级回执：用 `--content --max-content-bytes N` 验证取回文本并核对 digest/大小。

## 示例

```
# 1) PDR 草稿 → 固化（示意）
yy ledger artifact create --kind report --file pdr-draft.md --retention durable
# 2) 登记 PDR 引用的两条任务并声明依赖
yy ledger create "Add OAuth login flow" --status backlog --tags feature,auth
yy ledger create "E2E test OAuth flow" --status backlog --tags test
yy ledger deps add --id 16 --blocked-by 15
# 3) 摘要返回：任务 15/16，16 blocked_by 15
```

## 注意事项

- 规划与会话预算解耦：不在上下文里"记住"任务状态，一切以 Ledger 记录为准。
- 缺少原生命令时 fail closed 并要求 Ledger 升级，不猜参数、不直接调用内部实现。
- 不因"规划已完成"而推断实现/部署/生产变更的授权；各自需要用户单独请求。
- 采编边界：本条目只覆盖规划与登记；执行期看板操作见 `ledger-tasks-yylo`。

## 互见

- requires：无硬前置。
- related：`prd-spec-writer`（通用 PRD/功能规格写作方法）、`task-decomposition-planner`（多 Agent 任务分解与依赖图的通用方法）、`ledger-tasks-yylo`（同一看板的执行期生命周期：创建/流转/归档）。
- combines_with：`github-issue-writer`（把登记好的任务转写为标准 Issue）、`workflow-yylo`（把已验证的执行流程沉淀为 workflow Record 复用）。
