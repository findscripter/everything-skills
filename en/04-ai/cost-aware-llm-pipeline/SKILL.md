---
name: cost-aware-llm-pipeline
title: コスト認識LLMパイプライン
description: LLM APIの使用量のコスト最適化パターン — タスクの複雑さによるモデルルーティング、予算追跡、リトライロジック、プロンプトキャッシング。
domain: 智能/model-ops
triggers: [cost aware llm pipeline, model routing by complexity, prompt caching]
tags: [llm, anthropic, claude api, model-ops]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [llm-model-router, llm-prompt-caching, claude-api, production-llm-app-builder]
combines_with: [langfuse-llm-observability, mlops-model-productionizer]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
# Cost-Aware LLM Pipeline

Patterns for controlling LLM API costs while preserving quality. A composable pipeline that combines model routing, budget tracking, retry logic, and prompt caching.

## When to Use

- Building applications that call LLM APIs (Claude, GPT, etc.)
- Batch-processing items that vary in complexity
- Needing to stay within a budget for API spending
- Optimizing cost without sacrificing quality on complex tasks

## Core Concepts

### 1. Model Routing by Task Complexity

Automatically pick a cheaper model for simple tasks, and reserve the expensive model for complex ones.

```python
MODEL_SONNET = "claude-sonnet-4-6"
MODEL_HAIKU = "claude-haiku-4-5-20251001"

_SONNET_TEXT_THRESHOLD = 10_000  # character count
_SONNET_ITEM_THRESHOLD = 30     # item count

def select_model(
    text_length: int,
    item_count: int,
    force_model: str | None = None,
) -> str:
    """Select a model based on task complexity."""
    if force_model is not None:
        return force_model
    if text_length >= _SONNET_TEXT_THRESHOLD or item_count >= _SONNET_ITEM_THRESHOLD:
        return MODEL_SONNET  # complex task
    return MODEL_HAIKU  # simple task (3-4x cheaper)
```

### 2. Immutable Cost Tracking

Track cumulative spending with a frozen dataclass. Each API call returns a new tracker — it never mutates state.

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
        """Return a new tracker with the record appended (does not mutate self)."""
        return CostTracker(
            budget_limit=self.budget_limit,
            records=(*self.records, record),
        )

    @property
    def total_cost(self) -> float:
        return sum(r.cost_usd for r in self.records)

    @property
    def over_budget(self) -> bool:
        return self.total_cost > self.budget_limit
```

### 3. Narrow Retry Logic

Retry only on transient errors. Fail fast on authentication or request errors.

```python
from anthropic import (
    APIConnectionError,
    InternalServerError,
    RateLimitError,
)

_RETRYABLE_ERRORS = (APIConnectionError, RateLimitError, InternalServerError)
_MAX_RETRIES = 3

def call_with_retry(func, *, max_retries: int = _MAX_RETRIES):
    """Retry only on transient errors; fail immediately on everything else."""
    for attempt in range(max_retries):
        try:
            return func()
        except _RETRYABLE_ERRORS:
            if attempt == max_retries - 1:
                raise
            time.sleep(2 ** attempt)  # exponential backoff
    # AuthenticationError, BadRequestError, etc. → raise immediately
```

### 4. Prompt Caching

Cache long system prompts so they aren't resent with every request.

```python
messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": system_prompt,
                "cache_control": {"type": "ephemeral"},  # cache this
            },
            {
                "type": "text",
                "text": user_input,  # the variable part
            },
        ],
    }
]
```

## Composition

Combine all four techniques into a single pipeline function:

```python
def process(text: str, config: Config, tracker: CostTracker) -> tuple[Result, CostTracker]:
    # 1. Route the model
    model = select_model(len(text), estimated_items, config.force_model)

    # 2. Check the budget
    if tracker.over_budget:
        raise BudgetExceededError(tracker.total_cost, tracker.budget_limit)

    # 3. Call with retry + caching
    response = call_with_retry(lambda: client.messages.create(
        model=model,
        messages=build_cached_messages(system_prompt, text),
    ))

    # 4. Track the cost (immutable)
    record = CostRecord(model=model, input_tokens=..., output_tokens=..., cost_usd=...)
    tracker = tracker.add(record)

    return parse_result(response), tracker
```

## Pricing Reference (2025-2026)

| Model | Input ($/1M tokens) | Output ($/1M tokens) | Relative cost |
|-------|---------------------|----------------------|---------------|
| Haiku 4.5 | $0.80 | $4.00 | 1x |
| Sonnet 4.6 | $3.00 | $15.00 | ~4x |
| Opus 4.5 | $15.00 | $75.00 | ~19x |

## Best Practices

- **Start with the cheapest model**, and route to an expensive one only when complexity thresholds are met
- **Set an explicit budget limit before batch processing** — fail early rather than overspend
- **Log model-selection decisions** so you can tune thresholds based on real data
- **Use prompt caching for system prompts over 1024 tokens** — it saves both cost and latency
- **Do not retry on authentication or validation errors** — only on transient failures (network, rate limits, server errors)

## Anti-Patterns to Avoid

- Using the most expensive model for every request regardless of complexity
- Retrying on every error (wasting budget on permanent failures)
- Mutating cost-tracking state (it makes debugging and auditing hard)
- Hardcoding model names throughout the codebase (use constants or configuration)
- Ignoring prompt caching for repeated system prompts

## When to Use

- Any application that calls Claude, OpenAI, or similar LLM APIs
- Batch-processing pipelines where costs add up
- Multi-model architectures that need intelligent routing
- Production systems that need budget guardrails
