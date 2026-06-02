---
name: task-decomposition-planner
title: 任务拆解与依赖编排
description: 当需要把复杂任务拆给多 Agent 并行执行、设计任务依赖图、编写可验收任务描述或监控团队负载时使用；做任务分解、依赖图(blockedBy/blocks)设计、关键路径识别与负载再平衡，产出可分配的子任务与依赖关系；不适用于单 Agent 顺序执行的简单任务、纯代码实现或具体业务逻辑编写。触发词：任务拆解、任务分解、依赖编排、依赖图、关键路径、多 Agent 协作、负载均衡、task decomposition、dependency graph、critical path、blockedBy、workload balancing
domain: 协作/pm
triggers: [任务拆解, 任务分解, 依赖编排, 依赖图, 关键路径, 多 Agent 协作, 负载均衡, task decomposition, dependency graph, critical path, blockedBy, workload balancing]
tags: [task-coordination, multi-agent, dependency-graph, critical-path, workload-balancing, planning, pm]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [TaskCreate, TaskUpdate, TaskList, SendMessage]
requires: []
related: [multi-agent-orchestrator, agent-workflow-builder, agile-product-owner, enterprise-project-manager]
combines_with: [multi-agent-orchestrator, agent-workflow-builder, agile-product-owner]
license: MIT
source: wshobson/agents
source_license: MIT
---
## 何时使用

- 把一个复杂任务拆成可并行的多个子任务，分配给 Agent 团队执行。
- 设计任务之间的依赖关系（blockedBy / blocks），并识别关键路径（最长依赖链）。
- 为每个子任务编写带明确验收标准、文件归属和接口约定的任务描述。
- 监控团队成员负载，发现不均衡并做再平衡。

不该用的边界：

- 单 Agent 即可顺序完成、无需并行的简单任务，拆解只会增加协调开销。
- 需要的是具体代码实现、业务逻辑或调试，而非任务编排本身。
- 团队规模为 1 或任务间不存在可并行性时，直接顺序执行即可。

## 步骤

1. 选定拆解维度（见下方四种策略），将大任务切成职责清晰、文件不重叠的子任务。
2. 为每个子任务写描述：目标、归属文件、需求、接口契约、验收标准、范围外事项。
3. 用 TaskCreate 建任务，用 TaskUpdate 的 addBlockedBy 声明依赖，构造尽量宽而浅的依赖图。
4. 找出关键路径（最长依赖链），它决定最短完成时间，优先保障其上的任务。
5. 执行中用 TaskList 评估状态，按负载信号再平衡，并用 SendMessage 通知受影响成员。

## 指令

四种拆解维度（按场景选）：

- 按层（By Layer）：前端组件 / 后端 API / 数据库迁移与模型 / 测试。适合全栈特性、纵向切片。
- 按组件（By Component）：认证模块 / 用户资料模块 / 通知模块。适合微服务、模块化架构。
- 按关注点（By Concern）：安全评审 / 性能评审 / 架构评审。适合代码审查、审计。
- 按文件归属（By File Ownership）：`src/components/` 归实现者 1、`src/api/` 归实现者 2、`src/utils/` 归实现者 3。适合并行实现、规避冲突。

依赖图四原则：

1. 最小化链深：宽而浅优于深链。
2. 识别关键路径：最长链决定最短完成时间。
3. 节制使用 blockedBy：只加真正必需的依赖。
4. 杜绝循环依赖：A 阻塞 B、B 又阻塞 A 即死锁。

常见拓扑：独立型（A/B/C 并行 → 汇总，并行度最佳）、顺序型（A → B → C，必要依赖）、菱形型（A 分叉到 B、C，再汇合到 D，混合）。

任务描述必含六要素：目标（Objective，1-2 句）、归属文件（Owned Files，可改的文件/目录显式列出）、需求（Requirements，具体交付物或行为）、接口契约（Interface Contract，与他人工作的衔接方式）、验收标准（Acceptance Criteria，如何验证完成）、范围外（Out of Scope，明确不做什么）。

## 示例

声明依赖（#3 等待 #1 和 #2 都完成）：

```
TaskCreate: { subject: "Build API endpoints" }         → Task #1
TaskCreate: { subject: "Build frontend components" }    → Task #2
TaskCreate: { subject: "Integration testing" }          → Task #3
TaskUpdate: { taskId: "3", addBlockedBy: ["1", "2"] }  → #3 waits for #1 and #2
```

任务描述模板：

```
## Objective
Build the user authentication API endpoints.

## Owned Files
- src/api/auth.ts
- src/api/middleware/auth-middleware.ts
- src/types/auth.ts (shared — read only, do not modify)

## Requirements
- POST /api/login — accepts email/password, returns JWT
- POST /api/register — creates new user, returns JWT
- GET /api/me — returns current user profile (requires auth)

## Interface Contract
- Import User type from src/types/auth.ts (owned by implementer-1)
- Export AuthResponse type for frontend consumption

## Acceptance Criteria
- All endpoints return proper HTTP status codes
- JWT tokens expire after 24 hours
- Passwords are hashed with bcrypt

## Out of Scope
- OAuth/social login
- Password reset flow
- Rate limiting
```

## 注意事项

- 归属文件不重叠是规避并行冲突的核心；共享类型文件应标注「只读，勿改」。
- 负载失衡信号与应对：成员空闲而他人繁忙 → 重新分配待办；成员卡在单个任务 → 检查阻塞、提供帮助；全部任务被阻塞 → 优先解关键路径；某成员任务量是他人 3 倍 → 拆分或转派。
- 再平衡流程：TaskList 评估当前状态 → 识别空闲/过载成员 → TaskUpdate 转派任务 → SendMessage 通知受影响成员 → 持续观察吞吐是否改善。
- 加依赖前先确认其「真必需」，过度 blockedBy 会人为拉长关键路径、降低并行度。

## 互见

- skill-creator：编写与组织技能条目的方法。

本条采编自 wshobson/agents（MIT）。
