---
name: context-window-management
title: LLM 上下文窗口管理策略
description: 当构建多轮对话/长上下文 LLM 应用、上下文逼近或超出 token 上限时使用；做 token 计数、预算分配、分层路由、按重要性摘要与序位优化，产出可控的上下文拼装方案；不适用于 RAG 检索实现、模型微调、嵌入模型细节。触发词：上下文窗口、token 限制、上下文溢出。
domain: 智能/prompting
triggers: [上下文窗口, token 限制, 上下文管理, 上下文工程, 长上下文, 上下文溢出, context window, token limit]
tags: [llm, 上下文工程, token预算, 摘要压缩, 提示工程, 对话系统]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [tiktoken, LangChain, Claude API]
requires: []
related: [context-compression, llm-prompt-caching, llm-prompt-optimizer, llm-model-router]
combines_with: [production-llm-app-builder, rag-pipeline-builder, claude-api]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用于：

- 构建任意多轮对话系统，需要在固定 token 上限内稳定拼装上下文。
- 上下文逼近或超出模型窗口，需要做摘要、裁剪、路由或预算分配。
- 出现「上下文溢出 / token 超限 / 上下文腐化（context rot）」，或希望对长上下文做序位优化。

不该用（负边界）：

- RAG 检索系统的具体实现、向量库与召回细节 → 见 `rag-implementation`。
- 模型微调、嵌入模型选型。
- 本技能聚焦上下文优化策略本身，不绑定某一框架的落地代码。

前置：了解 LLM 基础、分词（tokenization）、提示工程。

## 步骤

1. 先数 token：发送前用 tiktoken 等统计各部分 token，绝不盲发（否则触发 WARNING：未计数易超限）。
2. 分配预算：按比例为 system / 关键上下文 / 历史 / 当前 query / 响应预留切分总预算。
3. 选策略路由：按总 token 落入分层（full → summarize → rag），同时选择匹配的模型。
4. 压缩历史：超预算时按「重要性」而非单纯「时间」做智能摘要，保留用户偏好与决策。
5. 序位拼装：把系统指令与关键上下文放最前（primacy），当前请求与关键约束放最后（recency）。
6. 回收余量：各部分裁剪后若有剩余预算，优先回补给历史（对话价值最高）。

## 指令

- 始终先 `countTokens` 再构建，禁止无预算直发。
- 裁剪历史时用摘要替代直接删除，避免丢失关键上下文（WARNING：朴素截断有损）。
- token 上限按模型从配置读取，不要硬编码（INFE：硬编码上限）。
- 摘要提示词须显式要求保留：用户偏好/决策、后续可能被引用的关键事实、对话整体脉络。
- 摘要后恢复原始时间顺序（按 timestamp 排序）。
- 委派触发：retrieval/rag/search → `rag-implementation`；memory/persistence → `conversation-memory`；cache → `prompt-caching`。

## 示例

分层路由 + 策略选择（核心骨架）：

```ts
interface ContextTier { maxTokens: number; strategy: 'full' | 'summarize' | 'rag'; model: string; }

const TIERS: ContextTier[] = [
  { maxTokens: 8000,     strategy: 'full',      model: 'claude-3-haiku' },
  { maxTokens: 32000,    strategy: 'full',      model: 'claude-3-5-sonnet' },
  { maxTokens: 100000,   strategy: 'summarize', model: 'claude-3-5-sonnet' },
  { maxTokens: Infinity, strategy: 'rag',       model: 'claude-3-5-sonnet' },
];

async function prepareContext(messages: Message[]): PreparedContext {
  const tokens = await countTokens(messages);
  const tier = TIERS.find(t => tokens <= t.maxTokens) ?? TIERS.at(-1)!;
  switch (tier.strategy) {
    case 'full':      return { messages, model: tier.model };
    case 'summarize': return { messages: [await summarizeOldMessages(messages), ...recentMessages(messages)], model: tier.model };
    case 'rag':       return { messages: [...await retrieveRelevant(messages), ...recentMessages(messages)], model: tier.model };
  }
}
```

token 预算分配（按比例切分总窗口）：

```ts
function allocateBudget(totalTokens: number): TokenBudget {
  return {
    system:          Math.floor(totalTokens * 0.10), // 系统提示 10%
    criticalContext: Math.floor(totalTokens * 0.15), // 关键上下文 15%
    history:         Math.floor(totalTokens * 0.40), // 历史 40%
    query:           Math.floor(totalTokens * 0.10), // 当前 query 10%
    response:        Math.floor(totalTokens * 0.25), // 响应预留 25%
  };
}
```

序位优化：`[系统指令] → [## 关键上下文] → [## 早期对话(摘要)] + [## 最近消息] → [## 当前请求] → [关键约束提醒]`。历史超 10 条时，将较早的 N-5 条摘要、保留最近 5 条原文。

按重要性摘要：综合 `importance + (hasCriticalInfo?0.5:0) + (referenced?0.3:0)` 排序，高分原样保留（累计至 `targetTokens*0.7`），低分进入摘要池统一压缩为一条 `[Earlier context: ...]` system 消息，最后按时间序还原。

## 注意事项

- 利用 LLM 的首末加权效应：开头放系统/关键信息，结尾复述关键要求与约束。
- 摘要按「重要性」分级，别只按时间砍尾巴。
- 预算可弹性回收，避免窗口浪费；响应区一定要预留，否则生成会被挤掉。
- 输出非环境特定验证的替代品，关键链路仍需测试与人工复核；缺少必需输入/权限/成功标准时应先澄清再动手。

## 互见

- `rag-implementation`：大语料检索召回。
- `conversation-memory`：长期记忆与持久化。
- `prompt-caching`：缓存优化降本提速。
- 完整上下文系统工作流：设计上下文策略 → 大语料接 RAG → 接入记忆持久化 → 加缓存提升性能。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
