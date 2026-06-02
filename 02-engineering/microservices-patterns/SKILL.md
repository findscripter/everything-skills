---
name: microservices-patterns
title: 微服务架构模式
description: 当把单体拆分为微服务、设计服务边界与契约、选型服务间通信、处理分布式数据/事务、做韧性与可观测设计时使用；做出含边界划分、通信方式、Saga/熔断等模式与迁移步骤的架构方案；不适用于模块化单体可解决、纯原型或缺乏分布式运维能力的场景；触发词：微服务、服务拆分、Saga、熔断、事件驱动、API 网关。
domain: 研发/architecture
triggers: [微服务, 服务拆分, 服务边界, Saga, 熔断, circuit breaker, 事件驱动, API 网关, 分布式事务, 服务发现, microservices, 拆单体]
tags: [microservices, architecture, distributed-systems, resilience, engineering]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
---
name: microservices-patterns
title: 微服务架构模式
description: 当把单体拆分为微服务、设计服务边界与契约、选型服务间通信、处理分布式数据/事务、做韧性与可观测设计时使用；做出含边界划分、通信方式、Saga/熔断等模式与迁移步骤的架构方案；不适用于模块化单体可解决、纯原型或缺乏分布式运维能力的场景；触发词：微服务、服务拆分、Saga、熔断、事件驱动、API 网关。
domain: 研发/misc
tags: [microservices, architecture, distributed-systems, resilience, engineering]
level: 精通
status: stable
version: 0.1.0
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [code-reviewer]
combines_with: []
license: CC-BY-SA-4.0
---
# 微服务架构模式

## 何时使用

- 把单体（monolith）拆分为微服务，需要划定服务边界、明确各服务的领域与数据所有权时。
- 设计服务间通信（同步 REST/gRPC/GraphQL 或异步事件/消息）与 API 契约时。
- 处理分布式数据与跨服务事务（库表 per service、Saga、最终一致性）时。
- 构建韧性与可观测系统：熔断、重试退避、舱壁隔离、服务发现、健康检查、分布式追踪。
- 设计事件驱动架构。
- 触发词：微服务、服务拆分、服务边界、Saga、熔断、事件驱动、API 网关、分布式事务、服务发现。

**不该用的边界**：

- 系统规模小、用「模块化单体」即可满足 → 不要上微服务，避免无谓的分布式复杂度。
- 只需快速原型、不想承担网络/一致性/部署复杂度 → 留在单进程内。
- 团队没有分布式系统的运维能力（监控、CI/CD、容器编排、链路追踪）→ 先补运维底座，否则拆分弊大于利。
- 纯代码缺陷审查 → 用 `code-reviewer`，本技能只做架构方案，不逐行审代码。

## 步骤 / 指令

1. **划定领域边界与所有权**：按业务能力（OrderService / PaymentService / InventoryService）或 DDD 子域/限界上下文切分；每个服务独占一块领域与数据，职责单一、边界清晰。
2. **定义契约、数据所有权与通信方式**：
   - 契约要版本化、向后兼容。
   - 坚持「数据库 per service」，禁止共享库表。
   - 通信优先选异步事件，强一致/即时返回场景才用同步调用。
3. **设计韧性、可观测与部署策略**：为跨服务调用加熔断 + 重试退避 + 超时；分布式事务用 Saga（补偿动作）；接入分布式追踪、健康检查（liveness/readiness）、服务注册发现。
4. **给出迁移步骤与运维护栏**：从单体抽取优先用绞杀者模式（Strangler Fig）渐进迁移，新功能先落微服务、用代理在新旧系统间路由；明确回滚、灰度与监控告警边界。

规则：
- 拆分对齐业务能力，不按技术分层乱切。
- 「数据库 per service」是硬约束——任何共享库即退化为分布式单体。
- 能异步就异步：事件优先于直接调用，降低耦合、提升韧性。
- 每个跨服务调用都假设网络会失败：必须有超时、熔断与补偿逻辑。

## 示例

**模式 1：按业务能力拆分 + 事件解耦**（Python，节选）

```python
class OrderService:
    async def create_order(self, order_data: dict) -> Order:
        order = Order.create(order_data)
        # 发事件通知其他服务，而非直接调用
        await self.event_bus.publish(
            OrderCreatedEvent(order_id=order.id, customer_id=order.customer_id,
                              items=order.items, total=order.total))
        return order
# PaymentService / InventoryService 各自独立部署、独占数据，监听事件做响应
```

**模式 2：API 网关 + 熔断聚合**（节选）

```python
from circuitbreaker import circuit

class APIGateway:
    @circuit(failure_threshold=5, recovery_timeout=30)
    async def call_order_service(self, path, method="GET", **kwargs):
        resp = await self.http_client.request(method, f"{self.order_service_url}{path}", **kwargs)
        resp.raise_for_status()
        return resp.json()

    async def create_order_aggregate(self, order_id: str) -> dict:
        order, payment, inventory = await asyncio.gather(
            self.call_order_service(f"/orders/{order_id}"),
            self.call_payment_service(f"/payments/order/{order_id}"),
            self.call_inventory_service(f"/reservations/order/{order_id}"),
            return_exceptions=True)          # 容忍部分失败，做降级聚合
        result = {"order": order}
        if not isinstance(payment, Exception):   result["payment"] = payment
        if not isinstance(inventory, Exception): result["inventory"] = inventory
        return result
```

**模式 3：同步调用带重试退避**（节选）

```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3),
       wait=wait_exponential(multiplier=1, min=2, max=10))
async def get(self, path, **kwargs):
    resp = await self.client.get(f"{self.base_url}{path}", **kwargs)
    resp.raise_for_status()
    return resp.json()
```

**模式 4：Saga 编排（分布式事务 + 补偿）**（节选）

```python
class OrderFulfillmentSaga:
    # 每步都配一个补偿动作；任一步失败则按相反顺序补偿已完成步骤
    steps = [
        SagaStep("create_order",      action=create_order,      compensation=cancel_order),
        SagaStep("reserve_inventory", action=reserve_inventory, compensation=release_inventory),
        SagaStep("process_payment",   action=process_payment,   compensation=refund_payment),
        SagaStep("confirm_order",     action=confirm_order,     compensation=cancel_order_confirmation),
    ]

    async def execute(self, order_data):
        completed = []
        try:
            for step in self.steps:
                result = await step.action(context)
                if not result.success:
                    await self.compensate(completed, context)   # 回滚
                    return SagaResult(status=SagaStatus.FAILED, error=result.error)
                completed.append(step)
            return SagaResult(status=SagaStatus.COMPLETED)
        except Exception as e:
            await self.compensate(completed, context)
            return SagaResult(status=SagaStatus.FAILED, error=str(e))

    async def compensate(self, completed, context):
        for step in reversed(completed):     # 反向补偿
            try:
                await step.compensation(context)
            except Exception as e:
                log(f"补偿失败 {step.name}: {e}")   # 补偿失败需告警、可重试
```

**模式 5：熔断器三态**（CLOSED → OPEN → HALF_OPEN）

```python
class CircuitState(Enum):
    CLOSED = "closed"        # 正常放行
    OPEN = "open"            # 失败超阈值，快速拒绝
    HALF_OPEN = "half_open"  # 冷却后试探是否恢复
# failure_threshold 次失败 → OPEN；recovery_timeout 后转 HALF_OPEN；
# 连续 success_threshold 次成功 → 回到 CLOSED
```

## 注意事项

- **不要做分布式单体**：服务间高度耦合、必须同步发布，是最常见且最致命的反模式。
- **避免 chatty services**：一次业务流程触发大量跨服务调用，延迟与失败率叠加；用聚合/批量/事件削减往返。
- **共享数据库 = 隐性耦合**：任何两个服务读写同一张表都破坏边界，迁移时优先拆库。
- **同步皆耦合**：把一切都做成同步请求会导致级联失败与脆弱链路；强制超时 + 熔断 + 异步化。
- **不可忽略网络故障**：网络不可靠是默认前提，没有重试/补偿就会丢一致性。
- **没有补偿逻辑就别上 Saga**：失败事务无法回滚会留下脏数据。
- **不要过早微服务化**：一开始就拆微服务往往得不偿失，先模块化单体、按痛点演进。
- 本技能产出架构方案与代码骨架，**不替代**针对具体环境的验证、压测与专家评审；输入（边界、权限、安全约束、成功标准）缺失时应停下来澄清。

## 互见

- requires：无。
- related：`code-reviewer`（落地后的服务代码可交由其审查正确性与质量；本技能只负责架构层模式与边界设计）。
- combines_with：无。

---
本条目采编自 sickn33/antigravity-awesome-skills（MIT 许可），经适配重写为中文。
