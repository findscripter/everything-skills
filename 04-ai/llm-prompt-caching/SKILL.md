---
name: llm-prompt-caching
title: LLM 提示词缓存策略
description: 当为 LLM 应用降本提速、复用稳定前缀或重复响应时使用；做提示词缓存/响应缓存/CAG 的选型与落地，产出可缓存的提示结构、失效策略与命中率监控方案；不适用于 CDN、数据库查询、静态资源缓存。触发词：提示词缓存、prompt caching、cache_control、CAG、响应缓存、cache 命中率
domain: 智能/prompting
triggers: [提示词缓存, prompt caching, cache prompt, cache_control, ephemeral 缓存, 响应缓存, response cache, CAG, cache augmented generation, 缓存命中率, cache_read_input_tokens, 降低 LLM 成本, Redis 缓存 LLM, 语义缓存, 缓存失效, TTL]
tags: [LLM, 缓存, 性能优化, 成本优化, Anthropic, 提示工程, CAG, Redis]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Anthropic Prompt Caching, OpenAI Caching, Redis]
requires: []
related: [context-window-management, context-compression, llm-model-router, claude-api]
combines_with: [production-llm-app-builder, rag-pipeline-builder, langfuse-llm-observability]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当需要为 LLM 应用降低成本、降低延迟、提高吞吐时，按三类缓存对症下药：

- **提示词缓存（Prompt Cache）**：调用 Claude/OpenAI 时存在稳定的长系统提示或大块静态上下文，且这些前缀在多次请求间不变。Anthropic 原生缓存可在命中时让缓存 token 降本约 90%、延迟最多快约 2 倍。
- **响应缓存（Response Cache）**：相同或高度相似的查询被反复提问，用 Redis 等缓存整段响应。
- **CAG（Cache Augmented Generation）**：文档语料稳定、总量能塞进上下文窗口，直接把文档预缓存进提示，替代 RAG 检索。

**不该用（负边界）：**
- CDN 缓存、数据库查询缓存、静态资源缓存——本技能只覆盖 LLM 专属缓存。
- 高温度（temperature > 0.5）非确定性输出，不应做响应缓存。
- 命中率长期低于 50% 的场景，缓存检查与写入的开销可能反而高于不缓存。
- 需要检索系统、上下文窗口优化、对话记忆时，转交 rag-implementation / context-window-management / conversation-memory。

## 步骤

1. **分析查询模式**：统计哪些前缀稳定、哪些查询高频，估算潜在命中率，再决定用哪类缓存。
2. **提示词缓存**：把"永不变/极少变"的系统提示与知识库放进 `system` 数组并打 `cache_control: { type: "ephemeral" }`；动态内容只放进 `messages`，绝不进缓存前缀。
3. **响应缓存**：对 prompt（含 model、temperature）做 SHA-256 哈希作 key，设置合理 TTL；可叠加语义相似缓存与温度感知缓存。
4. **CAG**：稳定语料预格式化为带标题的文档块缓存进 system，定期（如每小时）刷新；用决策矩阵判断该用 CAG 还是 RAG。
5. **监控与优化**：记录 `cache_read_input_tokens` / `cache_creation_input_tokens` 及命中/未命中率，持续调优前缀结构与 TTL。

## 指令

- 前缀必须**逐字节一致**才命中 Anthropic 缓存：禁止在缓存块里放时间戳、随机串等动态内容；保持消息顺序一致。
- 多组件前缀拼接前先排序，且只对最末一个完整前缀打 `cache_control`，保证缓存键稳定。
- 只缓存 `temperature <= 0.5` 的响应；任何缓存都要设 TTL，按数据新鲜度要求取值。
- 为缓存命中实现失效机制：版本号失效（key 加 `v{n}:` 前缀）、内容哈希失效（源内容变则丢弃）、事件/标签失效（源更新时按 `source:{id}` 清除）。
- 针对未命中优化，而非只优化命中：缓存查询设短超时（如 50ms）与 LLM 请求竞速，缓存写入异步进行、不阻塞响应。

## 示例

提示词缓存（关键是 `cache_control` 与动态/静态分离）：

```ts
import Anthropic from '@anthropic-ai/sdk';
const client = new Anthropic();

async function queryWithCaching(userQuery: string) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: [
      { type: "text", text: LONG_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
      { type: "text", text: KNOWLEDGE_BASE,     cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: userQuery }], // 动态部分
  });
  console.log(`Cache read: ${response.usage.cache_read_input_tokens}`);
  console.log(`Cache write: ${response.usage.cache_creation_input_tokens}`);
  return response;
}
```

响应缓存（哈希 key + TTL，温度感知）：

```ts
import { createHash } from 'crypto';
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

const hashPrompt = (p: string) => createHash('sha256').update(p).digest('hex');

async function getCachedWithParams(prompt: string, p: { temperature: number; model: string }) {
  if (p.temperature > 0.5) return null; // 仅缓存低温响应
  const key = hashPrompt(`${prompt}|${p.model}|${p.temperature}`);
  return await redis.get(`response:${key}`);
}
// 写入：redis.set(`response:${key}`, response, 'EX', 3600)
```

错误 vs 正确的可缓存前缀：

```ts
// 错误：动态内容进缓存前缀 -> 永远 miss
{ type: "text", text: `You are helpful. Current time: ${new Date()}`,
  cache_control: { type: "ephemeral" } } // BREAKS CACHE!

// 正确：静态进 system 并缓存，动态留在 messages
{ type: "text", text: STATIC_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }
```

CAG vs RAG 决策矩阵：

| 因素 | CAG 更优 | RAG 更优 |
|------|----------|----------|
| 语料规模 | < 100K tokens | > 100K tokens |
| 更新频率 | 低 | 高 |
| 延迟要求 | 关键 | 灵活 |
| 查询特异性 | 通用 | 具体 |

## 注意事项

- **未命中延迟尖峰（高危）**：缓存检查 + 写入的开销叠加，未命中时可能比不缓存还慢。命中率低于 50% 时优先用竞速 + 异步写入，或只对高频模式做选择性缓存（如某模式出现 >10 次才缓存）。
- **缓存响应过期变脏（高危）**：源数据变了但无失效机制、或动态数据 TTL 过长，会持续返回错误信息。务必上版本号/内容哈希/事件失效。
- **前缀变动导致不命中（中危）**：`cache_creation_input_tokens` 高而 `cache_read` 低，多因前缀含动态内容或消息顺序不一致。
- 校验清单：高温缓存（仅缓存 temp ≤ 0.5）、缺 TTL（按新鲜度设值）、缓存前缀含动态内容（移出 cache_control）、缺命中/未命中指标（补埋点与日志）。

## 互见

- context-window-management（上下文/token 优化）
- rag-implementation（检索系统，与 CAG 互为替代/补充）
- conversation-memory（对话记忆持久化）
- 高性能流水线：分析查询模式 → 稳定前缀做提示词缓存 → 高频查询做响应缓存 → 稳定语料考虑 CAG → 监控并优化命中率。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
