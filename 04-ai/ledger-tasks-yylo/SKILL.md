---
name: ledger-tasks-yylo
title: YYLO Ledger 任务看板与依赖管理
description: 当编码智能体需要用命令行管理任务看板（创建/检索/流转/依赖/归档）时使用；驱动 yy ledger 完成任务全生命周期，含 blocked_by 依赖图、ready/order 并行编排与跨目录合并，产出结构化任务记录与回执；不适用于代码重构本身或非任务管理场景；触发词：task board、kanban、任务看板、依赖管理、yy ledger、topological order
domain: 智能/agents
triggers: [管理编码智能体的任务看板, 创建和检索任务, yy ledger 命令, blocked_by 依赖图, 找出可安全开始的任务, 拓扑排序并行执行, 任务归档与冷存档, 多目录任务合并, kanban CLI]
tags: [任务管理, kanban, 依赖图, 编码智能体, yylo, cli, 并行编排]
level: 进阶
status: stable
agents: [claude-code, codex]
tools: [yy]
requires: []
related: [autonomous-coding-agent-patterns, multi-agent-workflow-designer]
combines_with: [dmux-multi-agent-workflows, parallel-agent-hub]
license: MIT
source: yylo-dev/yylo-skills
source_license: MIT
---

# YYLO Ledger 任务看板与依赖管理

采编自 yylo-dev/yylo-skills（MIT），由 YYLO 团队自荐并适配为本库格式。

## 何时使用

当智能体要在多任务环境下推进编码工作、需要比"记在上下文里"更可靠的任务状态时使用：

- 创建/检索/流转任务（backlog → todo → in_progress → done / archive）。
- 维护 blocked_by 依赖图：谁阻塞谁、哪些任务现在可以安全开始。
- 规划并行执行顺序（拓扑排序），或合并散落在多个子目录的任务库。
- **不该用**：一次性问答、与任务生命周期无关的代码重构本身。

## 步骤 / 指令

1. **预检**：`yy ledger --version` 与 `yy ledger --help`（命令 help 为当前运行时的权威说明）。
2. **创建**：`yy ledger create "Task description" --status backlog --tags feature,backend`
3. **检索**：`yy ledger list --status todo --sort asc`；`yy ledger search --tag backend --open`；`yy ledger get TASK_ID`。
4. **状态流转**（`--response` 必填，记录做了什么、怎么验证）：
   `yy ledger mark in_progress --id TASK_ID --response "Starting work"`
   `yy ledger mark done --id TASK_ID --response "Completed X, tested Y" --commit abc123def`
5. **依赖**：`yy ledger deps add --id TASK_ID --blocked-by BLOCKER1 BLOCKER2`；`yy ledger deps TASK_ID` 查看阻塞关系（自动环检测）。
6. **可开始任务 / 并行排序**：`yy ledger ready --tag backend`；`yy ledger order --scores`。
7. **内联标记**（任务正文里声明依赖与关联，创建/更新时自动解析）：
   ```
   [blocked_by]TASK_ID[/blocked_by]
   [task_id]RELATED_ID[/task_id]
   ```
8. **归档**：`yy ledger archive TASK_ID`（软删除，保留数据）；冷存档包（archive-pack plan/create）需单独的属主授权。
9. **跨目录合并**：先 `yy ledger merge ./sub1/.juno_task ./sub2/.juno_task --into ./.juno_task --dry-run --plan-file plan.json`，人工审阅后仅按该计划 `--apply-plan` 执行并保留回执。
10. **输出格式**：所有命令支持 `-f json|ndjson|xml|table`，`-p` 美化、`--raw` 紧凑。

## 示例

```
yy ledger create "Add OAuth login" --status backlog --tags feature,auth
yy ledger deps add --id 14 --blocked-by 12 13
yy ledger ready
yy ledger order --scores
yy ledger mark done --id 14 --response "Implemented + tested" --commit abc123def
```

## 注意事项

- 先读当前任务状态再变更；保留变更回执；绝不手改 Ledger 存储文件或绕过控制器路由。
- 缺少所需的原生命令组时 fail closed 并要求 Ledger 升级，而不是猜测参数或直接调用内部实现。
- 归档维护、push/deploy、生产变更各自需要单独授权，不能从实现批准中推断。
- 跨项目路由默认关闭，需在源项目显式启用并列出 allowedProjects；路由失败不会回退到源看板。

## 互见

- requires：无硬前置。
- related：`autonomous-coding-agent-patterns`（自主编码智能体的设计模式，任务看板是其工作记忆的落地工具）、`multi-agent-workflow-designer`（工作流形态选型）。
- combines_with：`dmux-multi-agent-workflows`（并行面板执行时用任务板分派与回收）、`parallel-agent-hub`（`yy task start TASK_ID` 为每个任务创建专属 worktree，配合并行智能体执行）。
