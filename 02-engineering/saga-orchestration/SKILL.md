---
name: saga-orchestration
title: Saga 分布式事务编排
description: 当需要跨多个服务协调一个无法用单一 ACID 事务保证一致性的长流程（下单履约、审批流、多步业务工作流）、并要在任一步失败时按反向顺序执行补偿（refund/release/cancel）时使用；做 Saga 编排型/协同型设计、状态机建模与补偿逻辑实现，产出可落地的编排器代码与失败回滚方案；不适用于单库本地事务、强一致同步调用，或无补偿语义的只读流程。触发词：saga、分布式事务、补偿事务、最终一致、订单履约、长流程编排
domain: 研发/architecture
triggers: [saga, 分布式事务, 补偿事务, compensating transaction, 最终一致性, 订单履约, 长流程编排, 审批流, rollback 回滚, 多服务事务协调]
tags: [saga, 分布式事务, 微服务, 补偿, 工作流编排, 最终一致性, 事件驱动, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [编排器/状态存储（saga store）, 事件总线/消息队列（event bus / publisher）, 定时调度器（scheduler，用于超时）, 持久化执行框架（如 DBOS，可选）]
requires: []
related: [event-sourcing-cqrs, cqrs-implementation, microservices-patterns, temporal-workflow-python]
combines_with: [ddd-context-mapping, distributed-tracing, error-handling-patterns]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当一个业务流程跨多个服务/数据库，无法用单一 ACID 事务保证一致性，需要把它拆成一串可独立提交的步骤，并为每步配一个**补偿动作**（失败时反向回滚），实现最终一致性时使用。典型场景：

- 协调多服务事务（如订单：扣库存→扣款→发货→通知）。
- 需要补偿事务（refund / release / cancel）。
- 长时间运行的业务工作流、审批流。
- 分布式系统中的失败处理与部分失败回滚。

不该用（负边界）：

- 单库本地事务能搞定，直接用数据库事务，别上 Saga。
- 需要**强一致**（不能容忍中间态被读到）的场景，Saga 只保证最终一致。
- 步骤无法定义补偿语义（如已发出的物理邮件、不可撤销的外部调用）——要么避免放进 Saga，要么改为"道歉/对冲"式补偿并接受副作用。
- 纯只读、无副作用的流程。

## 步骤

1. **建模步骤**：把流程拆成有序步骤，每步定义 `action`（正向命令）+ `compensation`（补偿命令）。
2. **选编排方式**：
   - **编排型 Orchestration**：中心编排器驱动各步、追踪状态，逻辑集中、易观测、易调试（推荐复杂流程）。
   - **协同型 Choreography**：各服务订阅事件、自治响应，无中心节点，耦合低但全局流程难追踪。
3. **设计状态机**：Started → Pending →（失败时）Compensating → Completed / Failed。
4. **实现补偿**：失败时从当前步**反向**逐个补偿已完成的步骤。
5. **加可靠性**：步骤幂等、correlation ID 贯穿、超时检测、全程日志。
6. **测补偿**：把补偿路径当一等公民测，这是最容易出错也最关键的部分。

## 指令

- 明确目标、约束与必需输入（哪些服务、各步的正/反向接口、是否需要超时）。
- 按上面的步骤套用编排器模板，验证正向成功路径**和**补偿回滚路径。
- 产出可执行的编排器代码 + 失败处理方案，并附验证方式。
- 评估是否改用**持久化执行框架**（见注意事项）以省去自建基建。

## 示例

核心状态枚举与编排器骨架（编排型）：

```python
class SagaState(Enum):
    STARTED = "started"; PENDING = "pending"
    COMPENSATING = "compensating"; COMPLETED = "completed"; FAILED = "failed"

@dataclass
class SagaStep:
    name: str; action: str; compensation: str
    status: str = "pending"; result: Optional[Dict] = None

class SagaOrchestrator(ABC):
    @abstractmethod
    def define_steps(self, data: Dict) -> List[SagaStep]: ...

    async def handle_step_failed(self, saga_id, step_name, error):
        saga = await self.saga_store.get(saga_id)
        # 标记失败 → 置 COMPENSATING → 反向补偿
        saga.state = SagaState.COMPENSATING
        await self.saga_store.save(saga)
        await self._compensate(saga)

    async def _compensate(self, saga):
        # 反向遍历已完成步骤，逐个发补偿命令
        for i in range(saga.current_step - 1, -1, -1):
            step = saga.steps[i]
            if step.status == "completed":
                step.status = "compensating"
                await self.event_publisher.publish(
                    step.compensation,
                    {"saga_id": saga.saga_id, "step_name": step.name,
                     "original_result": step.result, **saga.data})
```

订单履约 Saga 的步骤定义（每步正/反向成对出现）：

```python
class OrderFulfillmentSaga(SagaOrchestrator):
    def define_steps(self, data):
        return [
          SagaStep("reserve_inventory", "InventoryService.ReserveItems",
                   "InventoryService.ReleaseReservation"),
          SagaStep("process_payment",   "PaymentService.ProcessPayment",
                   "PaymentService.RefundPayment"),
          SagaStep("create_shipment",   "ShippingService.CreateShipment",
                   "ShippingService.CancelShipment"),
          SagaStep("send_confirmation", "NotificationService.SendOrderConfirmation",
                   "NotificationService.SendCancellationNotice"),
        ]
```

各服务侧：执行成功发 `SagaStepCompleted`，失败发 `SagaStepFailed`，补偿完成发 `SagaCompensationCompleted`，由编排器接管状态流转。协同型则改为各服务订阅 `OrderCreated/InventoryReserved/PaymentProcessed/...` 事件链式推进，并订阅 `PaymentFailed/ShipmentFailed` 触发反向补偿（release/refund）。

超时：进入步骤时设 `timeout_at`，用 scheduler 调度 `_check_timeout`；若到点仍 `executing`，调用 `handle_step_failed(..., "Step timed out")` 转入补偿。

## 注意事项

要点（Do's）：

- **步骤幂等**——消息可能重投，正/反向都要可安全重试。
- **认真设计补偿**——补偿必须真的能撤销，且要单独测试。
- **用 correlation ID（saga_id）**贯穿全链路做追踪。
- **设超时**，不要无限等待。
- **全程日志**，便于排查失败。

禁忌（Don'ts）：

- 别假设瞬时完成——Saga 是耗时的，处处要考虑异步与中间态。
- 别跳过补偿测试——这是最关键的部分。
- 别让服务强耦合——用异步消息通信。
- 别忽略部分失败——优雅处理。

**持久化执行替代方案**：上面的模板需自建 saga store、事件发布、补偿追踪等基建。DBOS 等**持久化执行框架**能省掉大量样板：运行时自动把状态持久化到数据库、自动重试失败步骤、崩溃后从最近检查点恢复，并提供 exactly-once 语义。当你想要 Saga 级可靠性又不想自己维护协调基建时，优先考虑它——把"写一个带步骤的工作流函数"交给框架处理持久化与崩溃恢复。

局限：本技能输出不能替代针对具体环境的验证、测试与专家评审；若必需输入、权限、安全边界或成功标准缺失，先停下来澄清。

## 互见

- 配合使用：`event-sourcing-architect`（事件溯源）、`workflow-automation`（工作流自动化）、`dbos-*`（持久化执行）。
- 参考资料：[Saga Pattern (microservices.io)](https://microservices.io/patterns/data/saga.html)、《Designing Data-Intensive Applications》。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可证），已按「技能大典」体例适配重写。
