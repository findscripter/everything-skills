---
name: cost-aware-llm-pipeline
title: 成本感知 LLM 管线（模型路由与预算控制）
description: 当构建调用 LLM API 的应用、批处理复杂度不一的条目、或需把 API 支出控制在预算内时使用；做的是按任务复杂度自动路由模型、用不可变追踪器记账、窄范围重试与提示词缓存，产出「质量不降、成本受控」的可组合管线；不适用于单次低频调用、无成本压力、或仅问某个 SDK 单一用法的场景。触发词：LLM 成本优化、模型路由、预算控制、Haiku Sonnet 选型、提示词缓存、API 支出、重试退避
domain: 智能/model-ops
triggers: [LLM 成本优化, 降低 API 费用, 模型路由怎么做, Haiku 还是 Sonnet, 按复杂度选模型, LLM 预算控制, API 支出超预算, 提示词缓存省钱, batch 调用太贵, cost aware llm pipeline, model routing by complexity, prompt caching]
tags: [LLM, 成本优化, 模型路由, 预算追踪, 提示词缓存, 重试退避, Anthropic, Claude API, 批处理, model-ops]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, anthropic]
requires: []
related: [llm-model-router, llm-prompt-caching, claude-api, production-llm-app-builder]
combines_with: [langfuse-llm-observability, mlops-model-productionizer]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
# 成本感知 LLM 管线（模型路由与预算控制）

## 何时使用

当你在**构建调用 LLM API（Claude / GPT 等）的应用**，且满足以下任一条件时使用：

- 要**批处理**一批复杂度参差不齐的条目，成本会累加。
- 需把 API 支出**卡在明确预算内**，宁可提前失败也不要超支。
- 想在**不牺牲复杂任务质量**的前提下压成本（让简单任务走便宜模型）。
- 多模型架构需要**智能路由**，或生产系统需要**预算护栏**。

把四件事组成一条可组合管线：按复杂度路由模型 + 不可变成本追踪 + 窄范围重试 + 提示词缓存。

**不该用于：**

- **单次、低频、无成本压力**的调用 —— 直接用默认模型即可，整套机制是过度工程。
- 只想问**某个 SDK 的单一用法**（如「怎么发一次 messages 请求」）—— 那是基础调用，不必引入路由/预算层。
- 任务**没有难易分层**、全部都必须用最强模型 —— 路由收益为零，只留预算追踪即可。

## 步骤

按 4 个核心组件依次落地，最后合成一个管线函数。

1. **按任务复杂度路由模型**：默认走最便宜的模型；仅当文本长度或条目数超过阈值时，才升级到更贵的模型。阈值要可配置、可调参。
2. **不可变成本追踪**：用冻结 dataclass 累计支出，每次调用返回**新的**追踪器而非原地修改状态（便于调试与审计）。批处理前设好 `budget_limit`，每轮检查 `over_budget`。
3. **窄范围重试**：只对**瞬时错误**（网络、限流、服务端 5xx）做指数退避重试；对认证 / 请求参数错误**立即失败**，不浪费预算。
4. **提示词缓存**：把长系统提示标记为可缓存，避免每次请求重复发送，省成本也省延迟（系统提示 >1024 token 时尤其值得）。
5. **合成管线**：`路由模型 → 检查预算 → 带重试+缓存调用 → 不可变记账`，返回 `(结果, 新追踪器)`。

## 指令

**组件 1 · 按复杂度路由模型**

```python
MODEL_SONNET = "claude-sonnet-4-6"
MODEL_HAIKU = "claude-haiku-4-5-20251001"

_SONNET_TEXT_THRESHOLD = 10_000  # 字符数
_SONNET_ITEM_THRESHOLD = 30      # 条目数

def select_model(text_length: int, item_count: int,
                 force_model: str | None = None) -> str:
    """按任务复杂度选模型。"""
    if force_model is not None:
        return force_model
    if text_length >= _SONNET_TEXT_THRESHOLD or item_count >= _SONNET_ITEM_THRESHOLD:
        return MODEL_SONNET  # 复杂任务
    return MODEL_HAIKU       # 简单任务（便宜 3~4 倍）
```

**组件 2 · 不可变成本追踪**

```python
from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class CostRecord:
    model: str
    input_tokens: int
    output_tokens: int
    cost_usd: float

@dataclass(frozen=True, slots=True)
class CostTracker:
    budget_limit: float = 1.00
    records: tuple[CostRecord, ...] = ()

    def add(self, record: CostRecord) -> "CostTracker":
        """返回追加记录后的新追踪器（不改 self）。"""
        return CostTracker(budget_limit=self.budget_limit,
                           records=(*self.records, record))

    @property
    def total_cost(self) -> float:
        return sum(r.cost_usd for r in self.records)

    @property
    def over_budget(self) -> bool:
        return self.total_cost > self.budget_limit
```

**组件 3 · 窄范围重试（只重试瞬时错误）**

```python
import time
from anthropic import APIConnectionError, InternalServerError, RateLimitError

_RETRYABLE_ERRORS = (APIConnectionError, RateLimitError, InternalServerError)
_MAX_RETRIES = 3

def call_with_retry(func, *, max_retries: int = _MAX_RETRIES):
    """仅对瞬时错误重试，其余立即失败。"""
    for attempt in range(max_retries):
        try:
            return func()
        except _RETRYABLE_ERRORS:
            if attempt == max_retries - 1:
                raise
            time.sleep(2 ** attempt)  # 指数退避
    # AuthenticationError / BadRequestError 等 → 直接抛出，不重试
```

**组件 4 · 提示词缓存（把不变的系统提示标 ephemeral）**

```python
messages = [{
    "role": "user",
    "content": [
        {"type": "text", "text": system_prompt,
         "cache_control": {"type": "ephemeral"}},  # 缓存这一段
        {"type": "text", "text": user_input},        # 可变部分
    ],
}]
```

**价格参考（2025~2026）**

| 模型 | 输入（$/1M token） | 输出（$/1M token） | 相对成本 |
|---|---|---|---|
| Haiku 4.5 | $0.80 | $4.00 | 1x |
| Sonnet 4.6 | $3.00 | $15.00 | 约 4x |
| Opus 4.5 | $15.00 | $75.00 | 约 19x |

## 示例

四件套合成单个管线函数：

```python
def process(text: str, config: Config, tracker: CostTracker) -> tuple[Result, CostTracker]:
    # 1. 路由模型
    model = select_model(len(text), estimated_items, config.force_model)

    # 2. 检查预算（超了就提前失败，不再发请求）
    if tracker.over_budget:
        raise BudgetExceededError(tracker.total_cost, tracker.budget_limit)

    # 3. 带重试 + 缓存调用
    response = call_with_retry(lambda: client.messages.create(
        model=model,
        messages=build_cached_messages(system_prompt, text),
    ))

    # 4. 不可变记账
    record = CostRecord(model=model, input_tokens=..., output_tokens=..., cost_usd=...)
    tracker = tracker.add(record)

    return parse_result(response), tracker
```

## 注意事项

最佳实践：

- **从最便宜模型起步**，仅当命中复杂度阈值时才升级到贵模型。
- **批处理前设显式预算上限**，宁可提前失败也别超支。
- **记录每次模型选择决策的日志**，以便用真实数据回调阈值。
- 系统提示 **>1024 token 就用提示词缓存**，同时省成本与延迟。
- **认证 / 参数校验错误不要重试** —— 只重试瞬时失败（网络、限流、服务端错误）。

要避免的反模式：

- 不分复杂度，所有请求都用最贵模型。
- 对**所有错误**一律重试 —— 永久性失败会把预算烧光。
- **原地修改**成本追踪状态 —— 难调试、难审计。
- 在代码各处**硬编码模型名** —— 用常量或配置集中管理。
- 重复系统提示却**不开提示词缓存**。

## 互见

- requires：无（本技能可独立落地）。
- related：`prompt-caching-optimization` —— 提示词缓存的深入实现；`token-budget-estimation` —— 调用前估算 token 与成本，喂给路由阈值。
- combines_with：`llm-batch-orchestration` —— 大规模批处理编排，本管线作为单条目处理单元嵌入；`retry-backoff-strategy` —— 通用瞬时错误重试策略。

---

采编自 affaan-m/everything-claude-code（MIT 许可证），原技能 `cost-aware-llm-pipeline`（origin: ECC）。本条为适配中文「技能大典」的重写版，保留其四大核心组件（按复杂度路由 `select_model`、不可变 `CostTracker` 追踪、窄范围 `call_with_retry` 重试、提示词缓存 `cache_control: ephemeral`）、合成管线 `process` 范式、2025~2026 价格表，以及「最便宜起步 / 提前设预算 / 只重试瞬时错误 / 不可变记账 / 不硬编码模型名」等关键约束与反模式。
