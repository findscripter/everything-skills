---
name: agent-tool-builder
title: AI 智能体工具设计与构建
description: 当为 AI 智能体设计/编写可调用工具（function calling、tool schema、MCP server）时使用；产出清晰的 JSON Schema、描述文案、输入校验与错误处理方案；不适用于多智能体编排、智能体记忆、纯 API 设计或提示词工程；触发词：agent tool、function calling、tool schema、MCP、input_schema、tool_use
domain: 智能/agents
triggers: [智能体工具, function calling, 工具 schema, tool schema, MCP server, MCP tool, tool_use, input_schema, tool_result, 给智能体造工具, 工具描述, 工具错误处理, 并行工具调用]
tags: [agents, 智能体, function-calling, tool-schema, mcp, json-schema, tool-validation, error-handling, anthropic-sdk]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Anthropic SDK, OpenAI Functions, MCP, JSON Schema, Zod, Vercel AI SDK, LangChain Tools]
requires: []
related: [agent-tool-design, mcp-builder, pydantic-ai-agents, autonomous-coding-agent-patterns]
combines_with: [langgraph-agent-framework, multi-agent-system-designer, ai-native-cli-design]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
工具是 AI 智能体与世界交互的接口。一个设计良好的工具，决定了智能体是能稳定工作，还是会幻觉、静默失败、或多花 10 倍 token。

> 核心洞察：**工具描述比工具实现更重要**。LLM 永远看不到你的代码，它只看到 schema 和 description。

## 何时使用

适用：
- 为智能体定义任意新工具（function calling / tool use）。
- 编写或评审 tool 的 JSON Schema、描述文案、参数说明。
- 构建可跨平台复用的 MCP（Model Context Protocol）工具/服务器。
- 设计工具的输入校验与错误返回，让 LLM 能自我恢复。

不该用（应转交对应技能）：
- 需要协调多个工具/多智能体协作 → 多智能体编排（multi-agent-orchestration）。
- 工具调用间需要持久化状态/记忆 → 智能体记忆系统（agent-memory-systems）。
- 纯后端 REST/API 设计 → API 设计（api-designer）。
- 调优给 LLM 的提示词本身 → 提示词工程（prompt-engineering）。

## 步骤

1. **写描述（最重要）**：说清「做什么、何时用、返回什么、不做什么」。描述至少 100 字符；过短会显著降低调用准确率。
2. **逐参数说明**：每个参数都要写「是什么 + 期望格式 + 示例值 + 边界/限制」。
3. **能枚举就枚举**：用 `enum` 把取值约束到合法集合，减少 LLM 自由发挥。
4. **显式区分必填/选填**：用 `required` 数组声明必填，并加 `additionalProperties: false` 开启严格模式。
5. **必要时加输入示例**（Anthropic Beta `input_examples`）：对嵌套对象/格式敏感的复杂工具，给 1-5 个真实示例，覆盖「最小/部分/完整」三种填写形态——能把复杂操作准确率从 ~72% 提升到 ~90%。
6. **加错误处理**：每个会失败的工具都要 try/except，返回**信息丰富**的错误并带 `is_error: true`。
7. **返回字符串而非对象**：用 `json.dumps()` / `JSON.stringify()`，LLM 处理的是文本。
8. **用 LLM 实测**：不要只跑单元测试，要让真实模型调用一遍验证描述是否够清晰。

## 指令

设计原则（务必遵守）：
- 描述质量 > 实现质量（对 LLM 准确率而言）。
- 工具总数尽量 **少于 20 个**，过多会造成选择混乱。
- 每个工具都要显式错误处理——**静默失败会毒化整个智能体**。
- 返回字符串，不返回对象。
- 执行前先校验输入：拒绝、修正或上报，**绝不静默失败**。

错误分类（都要覆盖）：
1. 输入校验错误：缺必填参数、格式非法、越界。
2. 外部服务错误：API 不可用、限流、超时。
3. 业务逻辑错误：资源不存在、权限不足、冲突/重复。
4. 内部错误：未预期异常、数据损坏。

自动化校验清单（评审工具时逐条核对）：
- 工具描述 ≥ 100 字符（WARNING）。
- 每个参数都有 description（WARNING）。
- schema 显式声明 `required`（INFO）。
- 工具函数有 try/except（ERROR）。
- 错误结果带 `is_error: true`（WARNING）。
- 返回字符串而非 dict（WARNING）。
- 执行前有输入校验（WARNING）。
- SQL 用参数化查询，**绝不**拼接用户输入（ERROR）。
- 外部调用带 timeout（WARNING）。
- MCP 工具必须有 `inputSchema`（ERROR）。

## 示例

**反例 vs 正例（描述）**

```json
// 差：太模糊
{ "name": "get_stock_price", "description": "Gets stock price",
  "input_schema": { "type": "object", "properties": { "ticker": {"type": "string"} } } }

// 好：完整
{
  "name": "get_stock_price",
  "description": "获取给定股票代码的当前价格。代码须为 NYSE/NASDAQ 等美国主要交易所上市公司的有效代码，返回最新成交价（USD）。当用户询问当前/近期股价时使用。不提供历史数据、公司信息或预测。",
  "input_schema": {
    "type": "object",
    "properties": {
      "ticker": { "type": "string", "description": "股票代码，如 AAPL 代表 Apple Inc." }
    },
    "required": ["ticker"],
    "additionalProperties": false
  }
}
```

**信息丰富的错误返回**

```json
// 差： {"error": "Failed"} / {"error": true}
// 好：
{
  "error": true,
  "error_type": "not_found",
  "message": "未找到地点 'Atlantis'，请提供真实城市名，如 'San Francisco, CA'。",
  "suggestions": ["San Francisco, CA", "Los Angeles, CA"]
}
```

Anthropic tool_result 形式：

```json
{ "type": "tool_result", "tool_use_id": "toolu_01A...",
  "content": "Error: Location 'Atlantis' not found...", "is_error": true }
```

**错误处理实现模式（Python）**

```python
from dataclasses import dataclass

@dataclass
class ToolResult:
    success: bool
    content: str
    error_type: str = None
    suggestions: list[str] = None

    def to_response(self) -> dict:
        if self.success:
            return {"content": self.content}
        return {"content": f"Error ({self.error_type}): {self.content}", "is_error": True}

def get_weather(location: str) -> ToolResult:
    if not location or len(location) < 2:
        return ToolResult(False, "Location must be at least 2 characters", "validation_error")
    try:
        data = weather_api.fetch(location)
        return ToolResult(True, f"Temperature: {data.temp}°F, {data.conditions}")
    except LocationNotFound:
        return ToolResult(False, f"Location '{location}' not found", "not_found",
                          weather_api.suggest_locations(location))
    except RateLimitError:
        return ToolResult(False, "Rate limit exceeded. Try again in 60 seconds.", "rate_limit")
    except Exception as e:
        return ToolResult(False, f"Unexpected error: {e}", "internal_error")
```

**MCP 工具（TypeScript，stdio 传输）**

```ts
import { Server } from "@modelcontextprotocol/sdk/server";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";

const server = new Server({ name: "weather-server", version: "1.0.0" });

server.setRequestHandler("tools/list", async () => ({
  tools: [{
    name: "get_weather",
    description: "获取某地点当前天气，返回温度、状况、湿度。用于具体城市的天气查询。",
    inputSchema: {
      type: "object",
      properties: {
        location: { type: "string", description: "城市与州，如 'San Francisco, CA'" },
        unit: { type: "string", enum: ["celsius", "fahrenheit"], default: "fahrenheit" }
      },
      required: ["location"]
    }
  }]
}));

server.setRequestHandler("tools/call", async (request) => {
  const { name, arguments: args } = request.params;
  if (name === "get_weather") {
    try {
      const weather = await fetchWeather(args.location, args.unit);
      return { content: [{ type: "text", text: JSON.stringify(weather) }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
  throw new Error(`Unknown tool: ${name}`);
});

await server.connect(new StdioServerTransport());
```

**Tool Runner（Anthropic SDK Beta，自动管理调用循环）**

```python
import anthropic, json
from anthropic import beta_tool

client = anthropic.Anthropic()

@beta_tool
def get_weather(location: str, unit: str = "fahrenheit") -> str:
    '''Get the current weather in a given location.
    Args:
        location: The city and state, e.g. San Francisco, CA
        unit: Temperature unit, 'celsius' or 'fahrenheit'
    '''
    return json.dumps({"temperature": "72°F", "conditions": "Sunny"})

runner = client.beta.messages.tool_runner(
    model="claude-sonnet-4-5", max_tokens=1024, tools=[get_weather],
    messages=[{"role": "user", "content": "What's the weather in Paris?"}])
for message in runner:
    print(message.content[0].text)
# 或直接拿最终结果： final = runner.until_done()
```

TypeScript + Zod 可获得类型安全的 `betaZodTool({ name, description, inputSchema: z.object({...}), run })`，配合 `anthropic.beta.messages.toolRunner({...})` 使用。

**并行工具执行**

Claude 默认可在一次响应里返回多个 `tool_use` 块，独立操作并行能大幅降延迟。关键约束：

```python
import asyncio
async def execute_tools_parallel(tool_uses):
    return await asyncio.gather(*[execute_tool(t) for t in tool_uses])

# 正确：所有结果放进【同一条】 user 消息
messages.append({"role": "user", "content": tool_results})
# 错误：拆成多条 user 消息会破坏并行模式
```

鼓励并行——在 system prompt 加：「For maximum efficiency, whenever you need to perform multiple independent operations, invoke all relevant tools simultaneously rather than sequentially.」

需要关闭并行：`tool_choice={"type": "auto", "disable_parallel_tool_use": True}`。

## 注意事项

- LLM 看不到实现，只看 schema + description；描述写不好，再好的代码也救不回准确率。
- 工具数量克制在 20 个以内。
- 静默失败是最大隐患：宁可返回带 `is_error` 的明确错误，也不要吞掉异常。
- SQL 必须参数化，外部调用必须带 timeout——这两条是安全/可靠性红线。
- 输出本技能内容不能替代环境内的实测、校验与专家评审；若缺少必要输入、权限、安全边界或成功标准，应先停下来澄清。

## 互见

- 多智能体编排（multi-agent-orchestration）：跨智能体的工具编排。
- 智能体记忆系统（agent-memory-systems）：工具调用间的状态管理。
- 语音智能体（voice-agents）：音频/语音相关工具需求。
- 计算机操控智能体（computer-use-agents）：桌面自动化工具。
- 智能体评测（agent-evaluation）：工具测试与评估。
- 配合良好：api-designer、llm-architect、backend。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
