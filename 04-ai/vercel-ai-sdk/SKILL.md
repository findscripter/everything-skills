---
name: vercel-ai-sdk
title: Vercel AI SDK 应用开发
description: 当用 React/Next.js 给应用加 AI 对话、流式文本、工具调用或结构化输出时使用；做基于 Vercel AI SDK 的 generateText/streamText/generateObject 服务端与 useChat 前端落地，产出可流式的 AI 功能；不适用于纯后端无 JS 栈、直接裸调 OpenAI/Anthropic 不要统一抽象、或非生成式的常规 Web 开发；触发词：Vercel AI SDK、streamText、useChat、generateObject、工具调用、流式响应。
domain: 智能/agents
triggers: [Vercel AI SDK, streamText, useChat, generateObject, 工具调用, 流式响应, ai sdk, generateText, toDataStreamResponse]
tags: [vercel, ai-sdk, nextjs, react, llm, streaming]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [typescript, ai, @ai-sdk/react, zod]
requires: []
related: [claude-api, github-copilot-sdk, pydantic-ai-agents, transformers-js]
combines_with: [agent-tool-builder, llm-prompt-caching, langfuse-llm-observability]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

用 React / Next.js 构建 AI 功能，且想用 **Vercel AI SDK** 这套统一抽象屏蔽 OpenAI/Anthropic/Gemini 等 provider 差异时使用。SDK 分两层：服务端 `ai`（`generateText` / `streamText` / `generateObject`）+ 前端 `@ai-sdk/react`（`useChat` / `useCompletion`）。

**该用**：给 React/Next.js 应用加 AI 对话或文本生成；把 LLM 响应流式推到前端 UI；实现工具调用（function calling）；用 `generateObject` 让 LLM 返回受 Zod 约束的结构化 JSON；构建生成式 UI（流式 React 组件）；从裸调 OpenAI/Anthropic 迁移到统一 SDK；排查 `useChat`/`streamText` 的流式问题。

**不该用（边界）：**
- 纯后端、非 JS/TS 技术栈 → 该 SDK 是 TS/JS 生态，换用对应语言的 provider SDK。
- 只调用一个 provider 且不需要统一抽象、流式或前端 hook → 直接用 `claude-api` 等原生 SDK 更轻。
- 非生成式的常规 Web 功能（CRUD、鉴权、路由）→ 与本技能无关。
- 复杂多 Agent 编排/状态机 → 用 `langgraph-agent-framework`、`crewai-multi-agent`，本技能聚焦单次/对话式生成。

## 步骤 / 指令

1. **装包**：`npm i ai @ai-sdk/react @ai-sdk/openai zod`（按 provider 换 `@ai-sdk/anthropic` 等）。用 `openai('gpt-4o')` / `anthropic('claude-3-5-sonnet-...')` 这种新版 provider 工厂，别用旧的 edge runtime 包装器。
2. **选 API**：一次性结果用 `generateText`；要流式推前端用 `streamText`；要结构化 JSON 用 `generateObject`（配 Zod schema）。
3. **建服务端路由**（Next.js App Router，`app/api/chat/route.ts`）：用 `streamText`，**必须** `return result.toDataStreamResponse()`，否则普通 JSON 响应会破坏分块流。
4. **设超时**：流式路由顶部加 `export const maxDuration = 30;`（Pro 可更高）。Vercel serverless 默认 10~15s，LLM 流式常超时被截断。
5. **接前端**：客户端组件 `useChat({ api: '/api/chat' })`，渲染 `messages`，用 `handleSubmit`/`handleInputChange`/`isLoading` 绑表单。
6. **加工具调用**（可选）：`streamText` 传 `tools: { name: tool({ description, parameters: z.object(...), execute }) }`，并设 `maxSteps: 5`，否则 LLM 拿到工具结果后无法继续生成最终回复。
7. **结构化输出**（可选）：`generateObject` 传清晰 `system` + 严格 Zod `schema`，`object` 自动按 schema 完整类型推断；仍要 `try/catch` 兜失败。
8. **验证**：本地跑通流式不中断、工具能被调用并回填、结构化输出符合 schema。

## 示例

服务端流式路由（`app/api/chat/route.ts`）：

```typescript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const maxDuration = 30; // 防 serverless 超时截断

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({
    model: openai('gpt-4o'),
    system: 'You are a friendly customer support bot.',
    messages,
  });
  return result.toDataStreamResponse(); // 必须，否则流式会断
}
```

前端对话组件（客户端，`app/page.tsx`）：

```tsx
'use client';
import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({ api: '/api/chat' });
  return (
    <form onSubmit={handleSubmit}>
      {messages.map((m) => (
        <div key={m.id}>{m.role}: {m.content}</div>
      ))}
      <input value={input} onChange={handleInputChange} disabled={isLoading} />
    </form>
  );
}
```

工具调用（服务端，需 `maxSteps`）：

```typescript
import { streamText, tool } from 'ai';
import { z } from 'zod';

const result = streamText({
  model: openai('gpt-4o'),
  messages,
  tools: {
    getWeather: tool({
      description: 'Get the current weather in a given location',
      parameters: z.object({
        location: z.string().describe('e.g. San Francisco, CA'),
        unit: z.enum(['celsius', 'fahrenheit']).optional(),
      }),
      execute: async ({ location, unit = 'celsius' }) => {
        const temp = location.includes('San Francisco') ? 15 : 22;
        return `The weather in ${location} is ${temp}° ${unit}.`;
      },
    }),
  },
  maxSteps: 5, // 让 LLM 看到工具结果后继续生成回复
});
```

结构化 JSON（`generateObject` + Zod）：

```typescript
import { generateObject } from 'ai';
import { z } from 'zod';

const { object } = await generateObject({
  model: openai('gpt-4o-2024-08-06'),
  system: 'Extract information from the receipt text.',
  prompt: receiptText,
  schema: z.object({
    storeName: z.string(),
    totalAmount: z.number(),
    items: z.array(z.object({ name: z.string(), price: z.number() })),
    date: z.string().describe('ISO 8601 date format'),
  }),
});
console.log(object.totalAmount); // 按 schema 完整类型推断
```

## 注意事项

- **流式路由必须 `return result.toDataStreamResponse()`**；返普通 JSON 会破坏分块。
- **`streamText` 配 `maxDuration = 30`**（或套餐上限）。聊天突然在 10~15s 截断 = serverless 超时，加这行即可。
- **有工具就设 `maxSteps`**（如 5）：`streamText` 在工具调用完成后会立即停止，不设它 LLM 拿到结果也无法回复用户。常见报错「Tool execution failed / 工具后无回复」即此因。
- **工具的 `description` 和 Zod 参数 `.describe()` 是 LLM 唯一依据**：写全、写准，否则模型不知道何时/如何调用。
- **`generateObject` 不可盲信**：Zod 只保证形状，仍用 `try/catch` 处理生成失败；配清晰 `system`。
- 用新版 provider 工厂（`@ai-sdk/openai` 等），别用旧 edge runtime 包装器。
- 选模型注意能力匹配：结构化输出选擅长此项的模型（如 `gpt-4o-2024-08-06`）。
- 本技能不替代环境特定的验证与测试；缺关键输入/权限/成功标准时先澄清。

## 互见

- related：`prompt-template-designer` —— `system` 提示词的设计与迭代由其产出，喂给 `generateText`/`streamText`/`generateObject` 更稳定。
- related：`frontend-design`、`react-state-management` —— `useChat` 之外的页面布局与客户端状态由它们承接。
- combines_with：`agent-tool-builder` —— 设计 `tool()` 的接口契约与执行体，配合本技能的工具调用编排。
- combines_with：`claude-api` —— 接 Anthropic provider 时，模型选型、prompt caching、token 用量等底层细节参考它。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
