---
name: event-sourcing-cqrs
title: 事件溯源与 CQRS 架构
description: 当需要完整审计轨迹、时间旅行查询或读写分离的事件驱动系统时使用；做事件存储、聚合/事件流、投影读模型、Saga 编排与版本演进的架构设计与落地；不适用于简单 CRUD、处处要求强一致、无法运维事件存储或投影的场景；触发词：事件溯源、CQRS、Saga
domain: 研发/architecture
triggers: [事件溯源, event sourcing, CQRS, 命令查询职责分离, 事件存储, event store, 投影, projection, 读模型, Saga, 流程管理器, process manager, 最终一致性, 审计轨迹, 时间旅行查询, 事件版本演进, 快照, snapshot, 事件驱动微服务]
tags: [架构设计, 事件溯源, cqrs, 事件驱动, 领域建模, 微服务, 最终一致性, 审计]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [cqrs-implementation, saga-orchestration, ddd-strategic-design, microservices-patterns]
combines_with: [ddd-context-mapping, distributed-tracing, backend-architecture-patterns]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用于以下场景：

- 系统需要**完整、不可篡改的审计轨迹**，要记录"发生了什么"而非仅"当前是什么"。
- 需要**时间旅行查询**：回放任意历史时刻的聚合状态（"X 时刻状态是什么"）。
- 需要**读写分离（CQRS）**以分别优化写入一致性与查询性能。
- 复杂业务工作流需要**补偿动作 / 跨聚合编排**（订单、支付、库存等长事务）。
- 构建**事件驱动微服务**，或需要撤销/重做、时间旅行调试。

不该用的边界（命中任一就应改用更简单方案）：

- 领域简单，**纯 CRUD 即可**满足，引入事件溯源只会增加复杂度。
- **处处要求强即时一致性**——事件溯源天然走最终一致性。
- 团队/平台**无法运维事件存储或投影重建**（缺少持久化、回放、监控能力）。

## 步骤 / 指令

1. **划定聚合边界与事件流**：以一致性边界确定聚合根，每个聚合对应一条事件流。
2. **将事件设计为不可变事实**：用过去时命名（如 `OrderPlaced`、`PaymentCaptured`），只记已发生的事，保持小而聚焦。
3. **实现命令处理与事件应用**：命令处理器校验业务规则后产出事件，聚合通过 `apply(event)` 重放事件重建状态。
4. **为查询需求构建投影（读模型）**：消费事件流物化出针对查询优化的视图；事件处理器必须**幂等**。
5. **为跨聚合工作流设计 Saga / 流程管理器**：编排多聚合协作并提供补偿动作；优先用**持久化执行**框架（如 DBOS）自动持久化工作流状态，使编排对崩溃可恢复。
6. **为长生命周期聚合实现快照（snapshotting）**：定期保存聚合状态，回放时从最近快照增量重放，避免全量回放性能退化。
7. **从第一天起建立事件版本演进策略**：为事件打版本，规划 schema 演进与向后兼容（upcasting）。
8. 全程使用 **correlation ID** 串联一次业务流程的所有事件与命令，便于追踪。

## 示例

电商下单流程的事件流与跨聚合编排：

- 写侧：`PlaceOrder` 命令 → 校验通过 → 追加 `OrderPlaced` 事件到订单流。
- Saga 监听 `OrderPlaced`，依次触发支付、扣减库存；任一步失败则发出补偿事件（如 `OrderCancelled`、`PaymentRefunded`）。
- 读侧：订单列表/详情投影消费事件，物化出查询视图；运营报表用独立投影。
- 时间旅行：回放某订单流到指定 offset，即可重建"当时"的订单状态用于审计或调试。

## 注意事项

安全红线：

- **生产环境绝不修改或删除已提交的事件**——事件是事实，只能追加。
- **投影重建先在 staging 验证**，确认无误再在生产执行。

最佳实践：

- 事件保持小而聚焦；从第一天就做事件版本化。
- 按最终一致性设计，不要假设投影即时可见。
- 事件处理器必须**幂等**，避免重复消费导致状态错乱。
- 为流程管理器/Saga 使用**持久化执行**，让跨聚合编排对崩溃具备韧性。
- 预先规划投影重建流程（可重放、可回滚、可监控）。

局限：本技能仅在任务明确落入上述范围时使用；产出不能替代针对具体环境的验证、测试与专家评审。若关键输入、权限、安全边界或验收标准缺失，应停下并澄清。

## 互见

- 配合使用：`saga-orchestration`（Saga 编排）、`architecture-patterns`（架构模式）、`dbos-*`（持久化执行/工作流）。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
