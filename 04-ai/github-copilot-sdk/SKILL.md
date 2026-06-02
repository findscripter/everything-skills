---
name: github-copilot-sdk
title: GitHub Copilot SDK 编程集成
description: 当需要在 Node.js/Python/Go/.NET 应用里通过代码驱动 GitHub Copilot（会话、自定义工具、钩子、MCP、流式、BYOK）时使用；做出可运行的 SDK 集成代码与会话配置；不适用于普通聊天补全或非 Copilot 的 LLM 接入；触发词：copilot-sdk、CopilotClient、createSession
domain: 智能/agents
triggers: [GitHub Copilot SDK, copilot-sdk, CopilotClient, createSession, Copilot 编程集成, sendAndWait, Copilot BYOK, Copilot 自定义工具, Copilot MCP]
tags: [github-copilot, sdk, agent, mcp, byok, streaming, tool-use, nodejs, python, go, dotnet]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [copilot CLI, Node.js, Python, Go, .NET]
requires: []
related: [claude-api, vercel-ai-sdk, pydantic-ai-agents, autonomous-coding-agent-patterns]
combines_with: [agent-tool-builder, mcp-builder, langfuse-llm-observability]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

需要在自己的程序里以代码方式驱动 GitHub Copilot 时使用。SDK 通过 JSON-RPC 封装 Copilot CLI，提供会话管理、自定义工具、生命周期钩子、MCP 服务集成与流式输出，支持 Node.js / Python / Go / .NET。

典型场景：构建 Copilot 智能体应用、给 Copilot 注册业务工具、用钩子做权限管控、接入 MCP 服务、用 BYOK 接自有模型、需要会话持久化或长会话。

不该用的边界：
- 只想做普通聊天补全、或接入非 Copilot 的 LLM（直接用对应厂商 SDK）。
- 没有 Copilot CLI 或未认证、且不打算用 BYOK。
- 任务与「程序化驱动 Copilot」无关。

## 步骤

1. 装好并认证 Copilot CLI（`copilot --version` 校验），运行时满足 Node.js 18+ / Python 3.8+ / Go 1.21+ / .NET 8.0+。
2. 安装对应语言 SDK 包。
3. 按「客户端 → 会话 → 消息」三步走：建 client、建 session、发消息。
4. 按需叠加能力：流式、自定义工具、钩子、MCP、BYOK、会话持久化。
5. 用完调用 `stop()`/`destroy()` 释放进程与会话。

## 指令

安装（择一语言）：

| 语言 | 包 | 安装 |
|------|----|----|
| Node.js | `@github/copilot-sdk` | `npm install @github/copilot-sdk` |
| Python | `github-copilot-sdk` | `pip install github-copilot-sdk` |
| Go | `github.com/github/copilot-sdk/go` | `go get github.com/github/copilot-sdk/go` |
| .NET | `GitHub.Copilot.SDK` | `dotnet add package GitHub.Copilot.SDK` |

认证优先级：① 构造器显式 `githubToken` → ② 环境变量 `COPILOT_GITHUB_TOKEN` → `GH_TOKEN` → `GITHUB_TOKEN` → ③ `copilot auth login` 存储的 OAuth → ④ `gh auth` 凭证。

外接独立 CLI 服务（不自动托管进程）：先 `copilot --headless --port 4321`，再用 `new CopilotClient({ cliUrl: "localhost:4321" })`。

## 示例

核心三步（Node.js）：

```typescript
import { CopilotClient } from "@github/copilot-sdk";
const client = new CopilotClient();
const session = await client.createSession({ model: "gpt-4.1" });
const response = await session.sendAndWait({ prompt: "What is 2 + 2?" });
console.log(response?.data.content);
await client.stop();
```

Python 等价（注意需 `await client.start()`）：

```python
client = CopilotClient()
await client.start()
session = await client.create_session({"model": "gpt-4.1"})
response = await session.send_and_wait({"prompt": "What is 2 + 2?"})
print(response.data.content)
await client.stop()
```

流式输出：建会话时 `streaming: true`，订阅增量事件。

```typescript
const session = await client.createSession({ model: "gpt-4.1", streaming: true });
session.on("assistant.message_delta", (e) => process.stdout.write(e.data.deltaContent));
session.on("session.idle", () => console.log());
await session.sendAndWait({ prompt: "Tell me a joke" });
```

自定义工具：

```typescript
import { defineTool } from "@github/copilot-sdk";
const getWeather = defineTool("get_weather", {
  description: "Get the current weather for a city",
  parameters: { type: "object",
    properties: { city: { type: "string", description: "The city name" } },
    required: ["city"] },
  handler: async ({ city }) => ({ city, temperature: "72°F", condition: "sunny" }),
});
const session = await client.createSession({ model: "gpt-4.1", tools: [getWeather] });
```

钩子做工具权限管控（在 `onPreToolUse` 返回 deny）：

```typescript
const session = await client.createSession({
  hooks: {
    onPreToolUse: async (input) => {
      if (["shell", "bash"].includes(input.toolName)) {
        return { permissionDecision: "deny", permissionDecisionReason: "Shell access not permitted" };
      }
      return { permissionDecision: "allow" };
    },
  },
});
```

钩子触发点：`onPreToolUse`（工具前，权限/改参）、`onPostToolUse`（工具后，转换/日志）、`onUserPromptSubmitted`（用户发消息，改写/过滤）、`onSessionStart` / `onSessionEnd`、`onErrorOccurred`（自定义错误处理/重试）。`onPreToolUse` 输出字段：`permissionDecision`（allow|deny|ask）、`permissionDecisionReason`、`modifiedArgs`、`additionalContext`、`suppressOutput`。

MCP 集成（远程 HTTP 与本地 stdio）：

```typescript
const session = await client.createSession({
  mcpServers: {
    github: { type: "http", url: "https://api.githubcopilot.com/mcp/" },
    filesystem: { type: "local", command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", "/allowed/path"], tools: ["*"] },
  },
});
```

BYOK（自带 Key，免 Copilot 订阅）：

```typescript
const session = await client.createSession({
  model: "gpt-5.2-codex",
  provider: { type: "openai", baseUrl: "https://your-resource.openai.azure.com/openai/v1/",
    wireApi: "responses", apiKey: process.env.FOUNDRY_API_KEY },
});
```

会话持久化：建会话传自定义 `sessionId`，重启后 `client.resumeSession(id)` 恢复；管理用 `client.listSessions()` / `client.deleteSession(id)` / `session.destroy()`。长会话防超限：`infiniteSessions: { enabled: true, backgroundCompactionThreshold: 0.80, bufferExhaustionThreshold: 0.95 }`。

## 注意事项

- 调用顺序差异：Python/Go 需先 `start()`，Node.js/.NET 在 `createSession` 时隐式启动。
- BYOK 恢复会话时 **必须重新提供 `provider` 配置**，密钥不会持久化。
- `wireApi`：GPT-5 系列用 `"responses"`，其余用默认 `"completions"`。
- BYOK provider type 映射：OpenAI/Azure AI Foundry/Ollama → `"openai"`（Ollama 本地无需 key），Azure OpenAI 原生 → `"azure"`（baseUrl 不要带 `/openai/v1`），Anthropic/Claude → `"anthropic"`。
- 调试：`new CopilotClient({ logLevel: "debug" })`。常见报错：`CLI not found`→装 CLI 或设 `cliPath`；`Not authenticated`→`copilot auth login` 或给 `githubToken`；`Session not found`→`destroy()` 后勿再用；`Connection refused`→检查 CLI 进程、开 `autoRestart`。
- 关键 API 速查：Node `createSession/sendAndWait/stop`；Python `create_session/send_and_wait/stop`；Go `CreateSession/SendAndWait/Stop`；.NET `CreateSessionAsync/SendAndWaitAsync/DisposeAsync`。

## 互见

- GitHub Copilot SDK: https://github.com/github/copilot-sdk
- Copilot CLI 安装: https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli
- MCP 协议规范: https://modelcontextprotocol.io
- 同域可参考：claude-api（Anthropic SDK 集成对照）。

---
采编自 sickn33/antigravity-awesome-skills（MIT），原技能 `copilot-sdk`。
