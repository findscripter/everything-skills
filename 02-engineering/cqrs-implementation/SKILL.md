---
name: cqrs-implementation
title: CQRS 读写职责分离架构实现
description: 当要把读写模型拆分、独立扩展查询性能或构建事件溯源系统时使用；产出命令/查询双总线、读模型投影与最终一致性同步的可执行方案；不适用于简单 CRUD、无法运维独立读写库或处处要求强一致的场景。触发词：CQRS、读写分离、命令查询职责分离、事件溯源、读模型投影、最终一致性
domain: 研发/architecture
triggers: [CQRS, 读写分离, 命令查询职责分离, 事件溯源, 读模型投影, 命令总线, 查询总线, 最终一致性, 读写模型拆分]
tags: [架构, CQRS, 事件溯源, 读写分离, 后端, 性能优化]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Edit, Bash]
requires: []
related: [event-sourcing-cqrs, saga-orchestration, microservices-patterns, ddd-strategic-design]
combines_with: [event-sourcing-cqrs, microservices-patterns, ddd-context-mapping]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：

- 需要把「写」（命令/状态变更）与「读」（查询/报表）职责分离，各自独立演进与扩展。
- 读负载远大于写负载，需要独立扩展读侧、对读模型做反范式化以优化查询性能。
- 构建事件溯源（Event Sourcing）系统，以事件流作为唯一事实来源。
- 复杂查询、高性能报表场景，读写数据模型天然不同。

不该用（负边界）：

- 领域简单、CRUD 已足够，引入 CQRS 只会增加复杂度。
- 无法运维独立的读/写存储与同步链路。
- 处处都要求强即时一致性（读写之间不能容忍任何传播延迟）。

## 步骤

1. 梳理读/写工作负载与一致性需求：明确哪些操作改状态、哪些只读，能容忍多大读延迟（定义一致性 SLA）。
2. 划清命令模型与查询模型边界：命令表达「修改意图」，查询表达「取数请求」，二者用各自的总线与处理器，schema 不耦合。
3. 实现读模型投影与同步：由投影器（Projector）消费事件、更新反范式化读模型，并维护 checkpoint 支持续传与重建。
4. 处理最终一致性：对需要「读己之写」的场景，按期望版本号轮询读模型，超时则返回带 stale 警告的旧数据。
5. 验证性能、恢复与故障模式：投影失败重试/跳过、投影重建、事件版本化演进。复杂模式见下方模板。

## 指令

- 命令侧：`Command` -> `CommandBus.dispatch()` -> `CommandHandler.handle()`，在处理器内校验后再产生事件并 `event_store.append_events()`。
- 查询侧：`Query` -> `QueryBus.dispatch()` -> `QueryHandler.handle()`，仅从读模型取数，返回反范式化视图（如 `OrderView`、`PaginatedResult`）。
- API 路由约定：写用 POST/PUT/DELETE 走命令总线，读用 GET 走查询总线，二者物理隔离。
- 同步：`ReadModelSynchronizer.run()` 持续投影；`rebuild_projection()` 清空数据、重置 checkpoint 后从头重放重建。

## 示例

命令基础设施与处理器（Python）：

```python
@dataclass
class CreateOrder(Command):
    customer_id: str
    items: list
    shipping_address: dict

class CommandBus:
    def __init__(self):
        self._handlers: Dict[Type[Command], CommandHandler] = {}
    def register(self, command_type, handler):
        self._handlers[command_type] = handler
    async def dispatch(self, command: Command) -> Any:
        handler = self._handlers.get(type(command))
        if not handler:
            raise ValueError(f"No handler for {type(command).__name__}")
        return await handler.handle(command)

class CreateOrderHandler(CommandHandler[CreateOrder]):
    async def handle(self, command: CreateOrder) -> str:
        if not command.items:                       # 在命令处理器内校验
            raise ValueError("Order must have at least one item")
        order = Order.create(customer_id=command.customer_id,
                             items=command.items,
                             shipping_address=command.shipping_address)
        await self.event_store.append_events(        # 持久化事件
            stream_id=f"Order-{order.id}", stream_type="Order",
            events=order.uncommitted_events)
        return order.id
```

FastAPI 中写命令 / 读查询物理分离：

```python
@app.post("/orders")            # 命令：改状态
async def create_order(request, command_bus=Depends(get_command_bus)):
    order_id = await command_bus.dispatch(CreateOrder(**request.dict()))
    return {"order_id": order_id}

@app.get("/orders/{order_id}")  # 查询：只读读模型
async def get_order(order_id, query_bus=Depends(get_query_bus)):
    result = await query_bus.dispatch(GetOrderById(order_id=order_id))
    if not result:
        raise HTTPException(status_code=404, detail="Order not found")
    return result
```

读己之写的最终一致性等待（按版本轮询，超时降级）：

```python
async def query_after_command(self, query, expected_version, stream_id, timeout=5.0):
    start = time.time()
    while time.time() - start < timeout:
        if await self._get_projection_version(stream_id) >= expected_version:
            return await self.execute_query(query)
        await asyncio.sleep(0.1)
    return {"data": await self.execute_query(query), "_warning": "Data may be stale"}
```

## 注意事项

应做（Do）：

- 命令模型与查询模型分离，各按需设计；读模型反范式化以优化查询。
- 接受最终一致性与传播延迟，并明确定义可接受的滞后 SLA。
- 在命令处理器中完成校验，先校验后改状态。
- 对事件做版本化，支持 schema 演进。

不应做（Don't）：

- 不要在命令中执行查询（命令只负责写）。
- 不要耦合读/写 schema，二者应独立演进。
- 不要过度设计，从简单做起。
- 不要忽视一致性 SLA。
- 投影出错时记录日志并按策略重试或跳过，不要让整条同步链路崩溃。

关键组件职责：命令=改状态意图；命令处理器=校验并执行；事件=状态变更记录；查询=取数请求；查询处理器=从读模型取数；投影器=用事件更新读模型。

## 互见

- CQRS 模式（Martin Fowler）：https://martinfowler.com/bliki/CQRS.html
- 微软 CQRS 指南：https://learn.microsoft.com/azure/architecture/patterns/cqrs
- 相关：事件溯源、领域驱动设计（DDD）、读模型/物化视图、最终一致性。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
