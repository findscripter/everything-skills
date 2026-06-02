---
name: pydantic-ai-agents
title: PydanticAI 智能体开发
description: 当用 Python 构建类型安全、可测试的生产级 LLM 智能体（结构化输出、工具调用、依赖注入、多模型切换）时使用；做出经 Pydantic 校验的 Agent 代码与单测；不适用于一次性裸提问、纯提示词设计或非 Python 栈；触发词：PydanticAI、Agent、result_type、@agent.tool、RunContext、ModelRetry、结构化输出。
domain: 智能/agents
triggers: [PydanticAI, Agent, result_type, @agent.tool, RunContext, ModelRetry, 结构化输出, TestModel, 依赖注入, 类型安全智能体]
tags: [pydantic-ai, ai-agents, llm, tool-use, structured-output, python]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, pydantic-ai]
requires: []
related: [langgraph-agent-framework, crewai-multi-agent, vercel-ai-sdk, agent-tool-builder]
combines_with: [claude-api, langfuse-llm-observability, multi-agent-system-designer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

用 Python 构建**类型安全、可测试**的 LLM 智能体时使用。PydanticAI 出自 Pydantic 团队，把 Pydantic 的校验保证带到 LLM 应用：结构化输出（Pydantic 模型校验）、工具调用、依赖注入、流式响应、多轮对话，统一覆盖 OpenAI / Anthropic / Gemini / Groq / Mistral / Ollama。

**该用**：
- 需要模型返回**校验过的强类型结构**而非裸字符串。
- 智能体要调用工具（查 DB、调 API）并产出结构化结果。
- 想**不打真实 LLM** 就为智能体逻辑写单测。
- 想在不重写业务代码的前提下切换模型供应商。
- 用户提到 `Agent`、`@agent.tool`、`RunContext`、`ModelRetry`、`result_type`。

**不该用（边界）**：
- 一次性裸提问、demo 脚本 → 直接调 SDK，别套框架。
- 任务只是设计/迭代提示词 → 用 `prompt-template-designer`。
- 需要文档/知识库检索增强 → 用 `rag-pipeline-builder`，再用本技能包装为 Agent。
- 非 Python 技术栈 → 本技能不适用。

## 步骤 / 指令

1. **安装**：按供应商装 extras。
   ```bash
   pip install pydantic-ai
   pip install 'pydantic-ai[openai]'      # OpenAI / Azure
   pip install 'pydantic-ai[anthropic]'   # Anthropic
   pip install 'pydantic-ai[gemini]'      # Gemini
   ```
2. **定输出契约**：用 `BaseModel` 定义 `result_type`，生产环境**不要返回裸字符串**。字段尽量用 `Optional`/`default`，过严 schema 会反复 `ValidationError`。
3. **建 Agent**：`Agent('供应商:模型', result_type=..., system_prompt=...)`；API Key 走环境变量，**勿写进 `Agent()` 参数**。
4. **挂工具**：`@agent.tool` 装饰函数，**docstring 必填**（会作为工具描述发给 LLM，缺了模型不会调）；需上下文时签名用 `RunContext[Deps]`。
5. **依赖注入**：用 `@dataclass` 定义 `Deps`，建 Agent 时传 `deps_type=Deps`；调用时 `agent.run(msg, deps=...)` **按次传入**，依赖不是全局的。
6. **业务校验/重试**：`@agent.result_validator` 里抛 `ModelRetry(...)` 触发模型重答；`Agent(..., retries=N)` 限制重试上限防死循环。
7. **测试**：单测用 `agent.override(model=TestModel())`，断言**结构**而非措辞；需确定性输出用 `FunctionModel`。
8. **流式 / 多轮**：长输出用 `run_stream`；多轮对话用 `result.all_messages()` 取历史，下一轮传 `message_history=`。

调用形式：同步 `agent.run_sync(...)`；异步 `await agent.run(...)`（FastAPI 路由里**直接 await，勿包 `asyncio.run()`**）；取结果用 `result.data`，取用量用 `result.usage()`。

## 示例

最小结构化输出 Agent：

```python
from pydantic import BaseModel
from pydantic_ai import Agent

class MovieReview(BaseModel):
    title: str
    year: int
    rating: float        # 0.0~10.0
    recommended: bool

agent = Agent('openai:gpt-4o', result_type=MovieReview,
              system_prompt='You are a film critic. Return structured reviews.')

review = agent.run_sync('Review Inception (2010)').data  # 强类型实例
print(f"{review.title} ({review.year}): {review.rating}/10")
```

工具 + 依赖注入（客服场景，节选）：

```python
from dataclasses import dataclass
from pydantic_ai import Agent, RunContext
from pydantic import BaseModel

@dataclass
class Deps:
    db: Database
    user_id: str

class SupportResponse(BaseModel):
    message: str
    escalate: bool

support_agent = Agent('openai:gpt-4o-mini', deps_type=Deps,
                      result_type=SupportResponse,
                      system_prompt='You are a support agent. Use the tools to help customers.')

@support_agent.tool
async def get_order_history(ctx: RunContext[Deps]) -> list[dict]:
    """Fetch recent orders for the current user."""   # docstring 即工具描述
    return await ctx.deps.db.get_orders(ctx.deps.user_id, limit=5)

async def handle(user_id: str, msg: str):
    deps = Deps(db=get_db(), user_id=user_id)
    return (await support_agent.run(msg, deps=deps)).data
```

业务校验触发重试：

```python
from pydantic_ai import ModelRetry

@agent.result_validator
async def validate(ctx, result: StrictJson) -> StrictJson:
    if result.value > 1000:
        raise ModelRetry('Value must be under 1000. Try again with a smaller number.')
    return result
```

不打真实 LLM 的单测：

```python
from pydantic_ai.models.test import TestModel

def test_escalates():
    with support_agent.override(model=TestModel()):
        r = support_agent.run_sync('I want to cancel',
                                   deps=Deps(db=FakeDb(), user_id='u-123'))
    assert isinstance(r.data, SupportResponse)
    assert isinstance(r.data.escalate, bool)   # 测结构，不测措辞
```

## 注意事项

- **API Key 走环境变量**（`OPENAI_API_KEY`/`ANTHROPIC_API_KEY`…），绝不硬编码、绝不写进 `Agent()` 参数。
- **工具 docstring 必写且具体**：它是发给 LLM 的工具描述，写空了模型不会调用。
- **依赖按次传 `deps=`**：`RunContext` 里 `deps` 为 `None`，多半是 `run()` 时漏传；依赖非全局。
- **结构化输出老是校验失败**：放宽 `result_type`，加 `Optional`/`default`，别堆过严字段。
- **`result_type` 优先于裸字符串**；用 `result_validator` 补 Pydantic 之外的业务规则；`retries=` 设上限防死循环。
- **会变更数据的工具**（写库、发邮件、调支付）生产环境应要求显式确认后再让 Agent 调用；对有后果的动作记录 `result.all_messages()` 做审计。
- **别广捕 `ValidationError`**：交给 `ModelRetry` 让框架重试可恢复的输出错误。
- **跨 async 任务勿共享单一 Agent 实例**（若 deps 不同）：按请求建实例或按次传 deps。
- **FastAPI 中直接 `await agent.run()`**，不要包 `asyncio.run()`。

## 互见

- related：`prompt-template-designer` —— 智能体的 `system_prompt` 与工具描述可由其产出更稳定的模板。
- combines_with：`rag-pipeline-builder` —— 把检索管道封装成工具挂到 Agent 上，得到带引用的检索增强智能体。

---

采编自 sickn33/antigravity-awesome-skills（MIT），适配重写。
