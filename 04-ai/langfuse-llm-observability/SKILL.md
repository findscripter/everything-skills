---
name: langfuse-llm-observability
title: Langfuse LLM 可观测
description: 当为 LLM/RAG/Agent 应用做追踪、提示词版本管理、评估打分与成本监控时使用；用 Langfuse SDK 埋点 trace/generation/score、托管提示词并跑数据集评估，产出可观测链路与质量指标；不适用于通用 APM/日志聚合或非 LLM 服务监控。触发词：langfuse、LLM 可观测、提示词管理、LLM 评估
domain: 智能/eval
triggers: [langfuse, LLM 可观测, LLM 追踪 tracing, 提示词版本管理, LLM 评估打分, 监控/调试 LLM, trace span generation, 数据集评估 LLM-as-judge]
tags: [langfuse, llm-observability, tracing, prompt-management, evaluation, 智能, misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Python SDK, JS/TS SDK, langfuse.openai, CallbackHandler, observe 装饰器]
requires: []
related: [llm-judge-evaluation, llm-agent-benchmarking, ai-engineering-toolkit, llm-model-router]
combines_with: [production-llm-app-builder, langgraph-agent-framework, claude-api]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 需要给 LLM 应用做生产级可观测：记录每次调用的输入/输出、模型、token 成本、延迟，并按 user/session 串联链路。
- 需要对输出做质量评估：人工打分、LLM-as-judge、或基于数据集的回归评估。
- 需要把提示词从代码里解耦，做版本化、按标签（production/staging）灰度部署。
- 已用 OpenAI / LangChain / LlamaIndex / Anthropic / Vercel AI SDK，想低改造接入追踪。

不该用的边界：

- 这不是通用 APM / 日志聚合 / 指标平台，不要拿它替代 Prometheus、ELK、Datadog 去监控非 LLM 的服务。
- 自托管需要自备基础设施；高吞吐场景需额外优化，实时看板有延迟，别用于强实时告警。
- 不替代环境内的真实测试与专家评审；评分逻辑（尤其 LLM-as-judge）本身需要校准。
- 缺少 API Key、账户或成功标准不明确时，先停下来确认，不要盲目埋点。

## 步骤

1. 准备：注册 Langfuse Cloud 或自托管，拿到 `public_key`/`secret_key`/`host`；安装 SDK（Python 或 JS/TS）。
2. 选择接入方式：
   - 最省事 → OpenAI 直接替换 `from langfuse.openai import openai`，调用即自动追踪。
   - 函数式应用 → 用 `@observe()` 装饰器，嵌套调用自动成为 span。
   - LangChain → 注入 `CallbackHandler` 到 `config={"callbacks": [...]}`。
   - 需要精细控制 → 手动 `trace()` → `generation()` → `generation.end()`。
3. 打分：用 `trace.score()` 记录质量/反馈指标（数值、布尔、或 LLM 评分）。
4. 提示词托管：UI/API 创建提示词，代码里 `get_prompt(...).compile(...)`，并把 `prompt` 传给 generation 关联版本。
5. 评估：建数据集 → 遍历 items 生成响应 → 打分 → `item.link(trace, run_name)`，对比提示词版本，部署最优。
6. 退出前 `langfuse.flush()`（serverless / 短生命周期进程必做，否则丢数据）。

## 指令

- 初始化客户端：`Langfuse(public_key, secret_key, host)`；环境变量已配则可空参 `Langfuse()`。
- 创建链路：`langfuse.trace(name, user_id, session_id, metadata, tags)`，`session_id` 用于聚合一组相关 trace。
- 记录生成：`trace.generation(name, model, model_parameters, input, prompt=...)`，结束时 `generation.end(output, usage={"input": prompt_tokens, "output": completion_tokens})`。
- 打分：`trace.score(name, value, comment, data_type="BOOLEAN")`；数值型用 0–1 标度，二值用 0/1。
- 装饰器内更新与打分：`langfuse_context.update_current_trace(...)`、`langfuse_context.score_current_trace(...)`。
- 提示词写入/读取：`create_prompt(name, prompt, config, labels=["production"])`；`get_prompt(name, label="production")`。

## 示例

OpenAI 一行接入（自动追踪，支持流式/异步）：

```python
from langfuse.openai import openai  # OpenAI 客户端的即插即用替换

response = openai.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello"}],
    name="greeting", session_id="session-123", user_id="user-456",
    tags=["test"], metadata={"feature": "chat"},
)
```

手动埋点 + 成本与打分：

```python
trace = langfuse.trace(name="chat-completion", user_id="user-123", session_id="session-456")
gen = trace.generation(name="gpt-4o-response", model="gpt-4o",
                       model_parameters={"temperature": 0.7},
                       input={"messages": [{"role": "user", "content": "Hello"}]})
resp = openai.chat.completions.create(model="gpt-4o",
                                      messages=[{"role": "user", "content": "Hello"}])
gen.end(output=resp.choices[0].message.content,
        usage={"input": resp.usage.prompt_tokens, "output": resp.usage.completion_tokens})
trace.score(name="user-feedback", value=1, comment="User clicked helpful")
langfuse.flush()  # serverless 退出前必须 flush
```

装饰器模式（嵌套自动成 span）：

```python
from langfuse.decorators import observe, langfuse_context

@observe()  # 创建 trace
def chat_handler(user_id, message):
    ctx = get_context(message)          # 子 span
    return generate_response(message, ctx)

@observe(as_type="generation")          # LLM 生成 span
def generate_response(message, context):
    r = openai.chat.completions.create(model="gpt-4o", messages=[
        {"role": "system", "content": f"Context: {context}"},
        {"role": "user", "content": message}])
    return r.choices[0].message.content
```

数据集评估（关联 expected_output 并对比版本）：

```python
dataset = langfuse.get_dataset("support-qa-v1")
for item in dataset.items:
    response = generate_response(item.input["question"])
    trace = langfuse.trace(name="eval-run")
    trace.generation(name="response", input=item.input, output=response)
    trace.score(name="similarity", value=calculate_similarity(response, item.expected_output))
    item.link(trace, "eval-run-1")  # 把 trace 挂到数据集项
```

## 注意事项

- flush 是高频踩坑点：serverless / 脚本 / 短进程结束前不调用 `langfuse.flush()` 会丢追踪数据。
- `session_id` 串联多轮对话，`user_id` 关联用户，二者是后续按会话/用户分析的基础，埋点时尽早带上。
- 打分标度要统一：同名 score 在数值/布尔间混用会让看板失真；用 `data_type` 明确类型。
- LLM-as-judge 用更便宜的模型（如 gpt-4o-mini）评估以控成本，但要对评分一致性做校准。
- 提示词用 `label`（production/staging/development）做环境隔离，并把 `prompt` 传入 generation 以追溯版本，便于做 A/B 与回归。
- 自托管落地需要基础设施投入；高 QPS 场景关注批量上报与采样，避免追踪本身拖慢主链路。

## 互见

- 智能/agent 相关：LangGraph / CrewAI（构建被监控的 Agent / 多智能体）。
- 智能/misc：结构化输出 structured-output（抽取流程的可观测与评估）。
- 典型编排：LangGraph Agent + Langfuse 回调全链路追踪；RAG 管线追踪检索与生成并对相关性/准确性打分；带数据集评估的 Agent 系统对比提示词版本后部署最优。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
