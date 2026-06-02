---
name: temporal-workflow-python
title: Temporal 持久工作流编排（Python）
description: 当用 Temporal Python SDK 编排长时运行/分布式事务/Saga 补偿/人审介入/多步管道时使用；做出确定性工作流、幂等 Activity、重试与超时策略、信号查询、时间跳跃测试与 Worker 部署的可执行方案与代码；不适用于无状态请求-响应、简单定时任务（cron 即可）、单机短脚本或纯前端。触发词：Temporal、工作流编排、durable workflow、Saga、Activity、Worker、信号查询、确定性、时间跳跃测试
domain: 研发/backend
triggers: [Temporal, 工作流编排, durable workflow, 持久工作流, Saga 补偿, 分布式事务, Activity, Worker, task queue, workflow.defn, activity.defn, 信号 signal, 查询 query, 确定性 determinism, workflow.now, RetryPolicy, 时间跳跃测试, WorkflowEnvironment, replay 测试, 幂等 Activity, child workflow, 人审介入]
tags: [temporal, workflow-orchestration, durable-execution, saga, distributed-transaction, python, backend, engineering, retry, idempotency]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, temporalio, docker]
requires: []
related: [saga-orchestration, async-python-patterns, fastapi-async-api, bullmq-job-queue]
combines_with: [microservices-patterns, event-sourcing-cqrs, distributed-tracing]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# Temporal 持久工作流编排（Python）

## 何时使用

适用（长时运行 + 需崩溃恢复/精确一次语义的编排）：
- 跨微服务的分布式事务、Saga 模式（带补偿回滚）。
- 长周期业务流程（小时到数年）：订单履约、支付处理、SLA 升级。
- 人审介入（human-in-the-loop）审批流；实体工作流（购物车/账户/库存）。
- 多步数据处理管道、基础设施自动化编排。
- 触发词：Temporal、工作流编排、durable workflow、Saga、Activity、Worker、信号查询、确定性。

不该用（负边界）：
- 无状态的请求-响应、普通 CRUD —— 直接写 service 即可，别引入 Worker/集群。
- 简单定时任务 —— 用 cron / 调度器，不必上 Temporal。
- 单机短脚本、一次性批处理 —— 编排开销不划算。
- 纯前端，或不需要持久状态/重试/恢复的场景。

核心心智模型：**Workflow = 编排（确定性、可重放）；Activity = 与外部世界交互（可重试、需幂等）**。工作流代码靠事件历史重放恢复，因此必须确定性；副作用一律放进 Activity。

## 步骤 / 指令

```
1. 建模：识别编排逻辑（→ Workflow）与外部副作用（→ Activity）。
   - Workflow 用 @workflow.defn，入口方法 @workflow.run（async def）。
   - Activity 用 @activity.defn，从 workflow 内只能用 workflow.execute_activity 调用。
2. 选 Activity 执行模型（关键反模式：阻塞异步事件循环 → 串行化）：
   - 异步 I/O（API/异步 DB）→ async Activity（asyncio）。
   - 阻塞 I/O（同步 DB 客户端/文件/旧库）→ 同步 Activity + ThreadPoolExecutor。
   - CPU 密集（数据处理/ML 推理）→ 同步 Activity + ProcessPoolExecutor。
3. 配超时与重试（超时是必填项，不是可选）：
   - start_to_close_timeout（单次尝试上限，几乎总要设）。
   - schedule_to_close_timeout（含重试的总时长上限）。
   - heartbeat_timeout（长 Activity 检测卡死，配合 activity.heartbeat()）。
   - RetryPolicy(initial_interval, backoff_coefficient, maximum_interval,
     maximum_attempts, non_retryable_error_types)。
4. 保证确定性（见“注意事项”清单），保证 Activity 幂等（重试可能重复执行）。
5. Saga：为每步登记补偿动作；任一步失败按逆序执行补偿。
6. 信号/查询：@workflow.signal 收外部事件改状态；@workflow.query 只读快照。
7. 启动 Worker：注册全部 workflows + activities，绑定 task_queue（须与 client 一致）。
8. 测试：用 time-skipping 的 WorkflowEnvironment（sleep 瞬时跳过）+ mock Activity；
   CI 跑 replay 测试校验确定性。
9. 部署：容器化 Worker，水平扩容，优雅停机，监控队列深度/成功率，做 workflow 版本治理。
```

硬规则：
- 工作流内**禁止** `datetime.now()` / `random.random()` / 线程锁 / 全局可变状态 / 直接外部调用 —— 否则重放破裂。
- 改工作流逻辑用 `workflow.get_version()` 做版本门，保证旧历史可重放。
- 单参数 payload ≤ 2MB；超限改传引用（如对象存储 key）。
- 区分瞬时失败（让重试）与永久失败（`ApplicationError(non_retryable=True)`）。

## 示例

最小工作流 + Activity（确定性时间、显式超时与重试）：
```python
from datetime import timedelta
from temporalio import workflow, activity
from temporalio.common import RetryPolicy

@activity.defn
async def charge_payment(order_id: str, amount: int) -> str:
    # 幂等：用 order_id 做去重键，重试不会重复扣款
    return f"txn-{order_id}"

@workflow.defn
class OrderWorkflow:
    def __init__(self) -> None:
        self._approved = False

    @workflow.run
    async def run(self, order_id: str, amount: int) -> str:
        # 用 workflow.now() 而非 datetime.now()，保证可重放
        started = workflow.now()
        txn = await workflow.execute_activity(
            charge_payment, args=[order_id, amount],
            start_to_close_timeout=timedelta(seconds=30),
            retry_policy=RetryPolicy(
                initial_interval=timedelta(seconds=1),
                backoff_coefficient=2.0,
                maximum_interval=timedelta(seconds=60),
                maximum_attempts=5,
                non_retryable_error_types=["CardDeclined"],
            ),
        )
        return txn

    @workflow.signal
    def approve(self) -> None:        # 外部事件：人审通过
        self._approved = True

    @workflow.query
    def is_approved(self) -> bool:    # 只读状态快照
        return self._approved
```

Saga 补偿（任一步失败逆序回滚）：
```python
@workflow.run
async def run(self, order):
    compensations = []
    try:
        await workflow.execute_activity(reserve_inventory, order, start_to_close_timeout=timedelta(seconds=10))
        compensations.append(release_inventory)
        await workflow.execute_activity(charge_payment, order, start_to_close_timeout=timedelta(seconds=30))
        compensations.append(refund_payment)
        await workflow.execute_activity(ship_order, order, start_to_close_timeout=timedelta(seconds=10))
    except Exception:
        for comp in reversed(compensations):   # 逆序补偿
            await workflow.execute_activity(comp, order, start_to_close_timeout=timedelta(seconds=10))
        raise
```

等待人审信号（带超时）：
```python
@workflow.run
async def run(self, doc_id):
    try:
        await workflow.wait_condition(lambda: self._approved, timeout=timedelta(days=3))
    except TimeoutError:
        return "auto-rejected"
    return "approved"
```

启动 Worker（注册 + 绑定 task queue）：
```python
from temporalio.client import Client
from temporalio.worker import Worker

async def main():
    client = await Client.connect("localhost:7233")
    async with Worker(client, task_queue="orders",
                      workflows=[OrderWorkflow],
                      activities=[charge_payment]):
        await asyncio.Event().wait()   # 常驻；生产中接优雅停机
```

时间跳跃测试（月级 sleep 瞬时执行 + mock Activity）：
```python
from temporalio.testing import WorkflowEnvironment

async def test_order():
    async with await WorkflowEnvironment.start_time_skipping() as env:
        async with Worker(env.client, task_queue="t",
                          workflows=[OrderWorkflow], activities=[charge_payment]):
            result = await env.client.execute_workflow(
                OrderWorkflow.run, args=["o1", 100],
                id="wf-1", task_queue="t")
            assert result.startswith("txn-")
```

本地起 Temporal 做集成测试：`temporal server start-dev`（或 Docker Compose）。

## 注意事项

确定性违规（最常见的崩溃源，工作流内一律禁止）：
- `datetime.now()` → 用 `workflow.now()`；`random.random()` → 用 `workflow.random()`。
- 线程/锁/全局可变状态；从工作流直接发 HTTP/查 DB（必须经 Activity）。
- 非纯函数逻辑；依赖迭代顺序不稳定的结构。

Activity 实现：
- **必须幂等**——重试会重复执行；用业务键去重，外部写操作要可安全重放。
- 漏配超时 = 隐患；长 Activity 要 `activity.heartbeat()` 否则 worker 卡死无法检测。
- 别在 async Activity 里跑阻塞/重计算代码，会冻结事件循环 → 改用同步 Activity + 线程/进程池。
- 单参数 payload ≤ 2MB。

测试与部署：
- 不用 time-skipping 环境 → 测一个 30 天工作流真等 30 天；务必用 `start_time_skipping()`。
- 工作流测试要 mock Activity，只验编排逻辑。
- CI 必须跑 replay 测试，用生产历史校验代码改动不破坏确定性。
- Worker 上必须注册全部用到的 workflow/activity，且 `task_queue` 与 client 严格一致，否则任务永远 pending。
- 改工作流逻辑用 `workflow.get_version()` 灰度，避免在途实例重放失败；部署做优雅停机。

通用约束：本技能输出不替代针对具体环境的验证、测试与专家评审；关键输入（领域边界、权限、超时/重试预算、成功标准）缺失时先停下澄清。

官方参考：python.temporal.io、docs.temporal.io/workflows、docs.temporal.io/develop/python/testing-suite。

## 互见

- related：`async-python-patterns`（Activity 的 async/await 与 executor 选型基础）、`saga-orchestration`（Saga 模式与补偿设计的更深展开）、`event-sourcing-cqrs`（同属持久化/事件回放范式，对比取舍）、`distributed-tracing`（为工作流/Activity 加可观测性）。
- combines_with：`microservices-patterns`（用 Temporal 编排跨服务事务）、`backend-architecture-patterns`（在基础设施层引入持久化执行而不增加架构复杂度）。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
