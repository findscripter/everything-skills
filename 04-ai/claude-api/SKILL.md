---
name: claude-api
title: Claude API 应用开发
description: 当用基于 Anthropic 官方 SDK 构建、调试、优化 Claude API 应用，或在模型版本间迁移代码时使用；做出含提示缓存、自适应思考、工具调用与流式的可运行 Claude 调用代码（产物：SDK 调用代码与配置）；不适用于 OpenAI/其他厂商 SDK、provider-neutral 代码或通用编程/ML 问题；触发词：Claude API、Anthropic SDK、anthropic、prompt caching、提示缓存、tool use、工具调用、Managed Agents、模型迁移、claude-opus-4-8、adaptive thinking
domain: 智能/model-ops
triggers: [Claude API, Anthropic SDK, anthropic, @anthropic-ai/sdk, prompt caching, 提示缓存, 缓存命中率, tool use, 工具调用, Managed Agents, 托管智能体, 模型迁移, claude-opus-4-8, adaptive thinking, 自适应思考, effort, batch, 流式 streaming]
tags: [claude-api, anthropic-sdk, llm, prompt-caching, tool-use, model-ops, managed-agents, streaming]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [anthropic (Python SDK), @anthropic-ai/sdk (TypeScript), curl/raw HTTP, WebFetch]
requires: []
related: [vercel-ai-sdk, github-copilot-sdk, pydantic-ai-agents, llm-prompt-caching]
combines_with: [llm-prompt-optimizer, context-window-management, langfuse-llm-observability]
license: Apache-2.0
source: anthropics/skills
source_license: Apache-2.0
---
本条目改写自 Anthropic 官方 `claude-api` 技能（Apache-2.0），保留其关键约束与默认值，面向 AI Agent 直接消费。

## 何时使用

满足以下任一条件时使用：
- 代码 import 了 `anthropic` / `@anthropic-ai/sdk`（或 `com.anthropic.*` 等官方 SDK）。
- 用户要求构建、调试或优化 Claude API / Anthropic SDK / Managed Agents 应用。
- 用户在文件中新增或调参某个 Claude 特性（缓存、思考、压缩 compaction、工具调用、批处理、文件、引用、记忆）或切换模型（Opus/Sonnet/Haiku）。
- 关于提示缓存 / 缓存命中率的问题。
- 在 Claude 模型版本间迁移代码（如 4.6→4.7→4.8，或替换已退役模型）。

不该用的边界（命中即停手并说明）：
- 文件 import 了 `openai` 或其它厂商 SDK，文件名形如 `*-openai.py` / `*-generic.py`，或代码刻意保持 provider-neutral——本技能只产出 Claude/Anthropic 代码，应先询问用户是否切换到 Claude，**不要**在非 Anthropic 文件里塞入 Anthropic 调用。
- 通用编程或 ML 问题，与 Claude API 无关。
- 切勿用 OpenAI 兼容垫片（compat shim）冒充 Claude 调用。

## 步骤

1. **入场扫描**：检查目标文件/项目是否含非 Anthropic 标记（`import openai`、`gpt-4/5`、`langchain_openai` 等）。命中则停手询问，不要继续。
2. **语言识别**：按项目文件推断语言并读取对应官方文档——`*.py`→Python，`*.ts/.js`→TypeScript（JS 共用 TS SDK），`*.java/.kt/.scala`→Java，`*.go`→Go，`*.rb`→Ruby，`*.cs`→C#，`*.php`→PHP。无法判断时询问用户，默认 Python。
3. **选对调用面（surface）**：
   - 单次调用（分类/摘要/抽取/问答、批处理、嵌入）→ Claude API 单请求。
   - 多步、由代码编排的流水线，或自带工具的自定义 Agent → Claude API + 工具调用（自己控制循环）。
   - 需要 Anthropic 托管 Agent 循环并提供 per-session 容器沙箱 → Managed Agents（仅一方 1P，Bedrock/Vertex/Foundry 不支持，这些平台一律用 Claude API + 工具调用）。
   - 默认从最简层级起步，只有任务确需开放式、模型自主探索时才上 Agent。
4. **写出 SDK 代码**：函数名、类名、方法签名、import 路径必须来自明确文档，不得凭 cURL 形状或别的语言 SDK 臆测；缺失绑定时先 WebFetch 官方仓库再写。
5. **默认就加提示缓存**（本技能产出的应用应包含缓存）。
6. **自检缓存与产物**：用 `usage.cache_read_input_tokens` 验证缓存是否命中。

## 指令（默认值，除非用户另有要求）

- **模型**：默认用 Claude Opus 4.8，模型串严格为 `claude-opus-4-8`。**只用文档表中的精确模型 ID，不要追加日期后缀**（用 `claude-sonnet-4-6`，不是 `claude-sonnet-4-6-20250514`）。绝不为省成本擅自降级——那是用户的决定。需要更老的模型时查 `shared/models.md`，不要自己拼。
- **思考**：Opus 4.8/4.7 仅支持自适应思考 `thinking: {type: "adaptive"}`；`{type: "enabled", budget_tokens: N}` 会返回 400（`budget_tokens`、`temperature`、`top_p`、`top_k` 均已移除）。Opus 4.6 / Sonnet 4.6 也用 adaptive，`budget_tokens` 已弃用。用户说"extended thinking / 思考预算 / budget_tokens"时，一律改用 Opus 4.8 + adaptive，不要切到老模型。
- **Effort**：`output_config: {effort: "low"|"medium"|"high"|"max"}`（在 `output_config` 内，非顶层），默认 `high`；`max` 仅 Opus 级；Opus 4.7/4.8 新增 `"xhigh"`，编码/智能体任务推荐。Sonnet 4.5 / Haiku 4.5 用 effort 会报错。
- **流式**：任何可能长输入、长输出或高 `max_tokens` 的请求默认流式，避免 HTTP 超时；用 `.get_final_message()` / `.finalMessage()` 取完整响应。128K 输出必须流式。
- **max_tokens**：非流式默认 `~16000`，流式默认 `~64000`；分类等场景才下调到 `~256`。不要 lowball，否则会截断需重试。
- **结构化输出**：用 `output_config: {format: {...}}`（旧 `output_format` 已弃用）；推荐 `client.messages.parse()` 自动校验。
- **Prefill 移除**：4.6/4.7/4.8 家族（含 Sonnet 4.6）最后一条 assistant 消息 prefill 会 400，改用结构化输出或 system 指令控制格式。

## 示例

最小 Python 调用（注意 `response.content` 是内容块列表，需判 `.type`）：

```python
import anthropic
client = anthropic.Anthropic()  # 读 ANTHROPIC_API_KEY

response = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=16000,
    thinking={"type": "adaptive"},
    messages=[{"role": "user", "content": "法国的首都是哪里？"}],
)
for block in response.content:
    if block.type == "text":
        print(block.text)
```

提示缓存（前缀匹配，渲染序为 `tools` → `system` → `messages`，把稳定内容放前、易变内容放最后一个断点之后）：

```python
response = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=16000,
    system=[{"type": "text", "text": "<大段共享系统提示>",
             "cache_control": {"type": "ephemeral"}}],
    messages=[{"role": "user", "content": "<每次都变的问题>"}],
)
print(response.usage.cache_read_input_tokens)  # 跨请求若恒为 0 说明有静默失效源
```

## 注意事项

- **提示缓存只认前缀**：前缀里任一字节变化（system 里插 `datetime.now()`、未排序的 JSON、变动的工具集）都会让后续全部失效。系统提示要冻结，动态上下文放到靠后的 message；工具按 name 排序、对话中途不改 tools/model。最小可缓存前缀约 1024 token，每请求最多 4 个断点。
- **不要静默截断输入**：内容超窗时告知用户并讨论分块/摘要，别偷偷砍。
- **解析工具入参**：4.6/4.7/4.8 家族工具调用 `input` 的 JSON 转义可能不同，务必 `json.loads()` / `JSON.parse()`，禁止对序列化串做裸字符串匹配。
- **Compaction（beta）**：长会话开启服务端压缩需 beta 头 `compact-2026-01-12`；每轮把整个 `response.content`（不只是文本）追加回 messages，否则压缩状态会静默丢失。
- **迁移先确认范围**：用户说"迁移我的代码库/升级到 X"但未指明文件/目录时，**先问范围再动手**。
- **不要重造 SDK**：用 `stream.finalMessage()`、SDK 类型（`Anthropic.MessageParam`/`Tool`/`Message`）与具名异常类（`RateLimitError` 等），别自定义等价类型或字符串匹配错误。
- **Managed Agents 流程固定**：Agent 创建一次（`model`/`system`/`tools` 在 Agent 上）→ 每次运行起 Session；保存 `agents.create` 返回的 ID 复用，**不要**在请求路径里反复创建。
- 遇到"最新/当前"信息或本条未覆盖的特性，用 WebFetch 查官方实时文档（源清单见 `shared/live-sources.md`）。

## 互见

- 设计 Claude 的提示词与少样本结构：见 prompt-template-designer。
- 把检索上下文喂给 Claude 做 RAG：见 rag-pipeline-builder。
- 把 Claude 工具/智能体能力封装为 MCP server：见 mcp-builder。
- 审查生成的 SDK 调用代码、排查依赖：见 code-reviewer、dependency-auditor。
