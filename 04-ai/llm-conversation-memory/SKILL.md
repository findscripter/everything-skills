---
name: llm-conversation-memory
title: LLM 对话持久记忆系统
description: 当为对话式 AI 设计跨会话记忆（短期/长期/实体记忆）时使用；做分层记忆的存储、检索、巩固与按用户隔离的方案落地；不适用于知识图谱构建、语义搜索/向量库底层实现或数据库运维。触发词：对话记忆、记住用户、长期记忆、chat history、memory persistence
domain: 智能/agents
triggers: [对话记忆, 记住用户偏好, 长期记忆, 跨会话记忆, 记忆持久化, 实体记忆, chat history, conversation memory, memory persistence, Mem0, LangChain Memory, 记忆巩固]
tags: [LLM, 记忆系统, 对话式AI, 短期记忆, 长期记忆, 实体记忆, 记忆检索, 记忆巩固, 用户隔离, Mem0, Redis, 智能]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Mem0, LangChain Memory, Redis]
requires: []
related: [agent-memory-systems, agent-memory-architecture, self-improving-memory-agent, context-compression]
combines_with: [rag-pipeline-builder, embedding-model-strategies, production-llm-app-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当你在构建对话式 AI、需要让模型在多轮乃至跨会话之间「记住」用户偏好、决策与事实时使用本技能。它覆盖四层记忆的设计、存储、检索、巩固与清理，以及按用户隔离的隐私保护。

适用场景：
- 用户提到/暗示：对话记忆、记住、记忆持久化、长期记忆、聊天历史。
- 需要记住关于人/地点/事物的具体事实（实体记忆）。
- 做带记忆上下文的 LLM 调用。

不该用（负边界）：
- 知识图谱构建。
- 语义搜索 / 向量检索的底层实现（属 rag-implementation）。
- 数据库管理 / 运维。

前置知识：LLM 对话模式、数据库基础、键值存储。推荐配合：context-window-management、rag-implementation。

## 步骤

1. 设计记忆分层（Buffer / 短期 / 长期 / 实体）。
2. 实现存储与检索（含语义搜索 + 相关性打分）。
3. 与上下文管理集成，把相关记忆注入提示词。
4. 增加巩固与清理（按时效/重要度），并强制用户隔离。

四层记忆职责：
- **Buffer**：当前会话，直接在上下文窗口内。
- **短期（shortTerm）**：近期交互，会话级。
- **长期（longTerm）**：跨会话持久化。
- **实体（entity）**：关于人、地点、事物、概念的事实。

## 指令

**分层记忆系统**（适用：构建任意对话式 AI）。每条消息：先入 Buffer，再抽取实体 upsert，最后判断是否「值得记忆」并打分入短期：

```ts
class TieredMemory implements MemorySystem {
  async addMessage(message: Message): Promise<void> {
    this.buffer.add(message);
    const entities = await extractEntities(message);
    for (const entity of entities) await this.entity.upsert(entity);
    if (await isMemoryWorthy(message)) {
      await this.shortTerm.add({
        content: message.content,
        timestamp: Date.now(),
        importance: await scoreImportance(message),
      });
    }
  }

  async consolidate(): Promise<void> {
    // 巩固：把重要的短期记忆迁入长期，其余清除
    const memories = await this.shortTerm.getOld(24 * 60 * 60 * 1000);
    for (const memory of memories) {
      if (memory.importance > 0.7 || memory.referenced > 2) {
        await this.longTerm.add(memory);
      }
      await this.shortTerm.remove(memory.id);
    }
  }

  async buildContext(query: string): Promise<string> {
    const parts: string[] = [];
    const lt = await this.longTerm.search(query, 3);
    if (lt.length) parts.push('## Relevant Memories\n' + lt.map(m => `- ${m.content}`).join('\n'));
    const es = await this.entity.getRelevant(query);
    if (es.length) parts.push('## Known Entities\n' + es.map(e => `- ${e.name}: ${e.facts.join(', ')}`).join('\n'));
    parts.push('## Recent Conversation\n' + formatMessages(this.buffer.getRecent(10)));
    return parts.join('\n\n');
  }
}
```

**实体记忆**（适用：需记住人/地点/事物的细节）。用 LLM 抽取实体与事实，upsert 时合并去重、累计提及次数：

```ts
async upsert(entity: ExtractedEntity, sourceId: string): Promise<void> {
  const existing = await this.store.get(entity.name.toLowerCase());
  if (existing) {
    for (const fact of entity.facts) {
      if (!this.hasSimilarFact(existing.facts, fact)) {
        existing.facts.push({ content: fact, confidence: 0.9, source: sourceId, timestamp: Date.now() });
      }
    }
    existing.lastMentioned = Date.now();
    existing.mentionCount++;
    await this.store.set(existing.id, existing);
  } else {
    await this.store.set(entity.name.toLowerCase(), {
      id: generateId(), name: entity.name, type: entity.type,
      facts: entity.facts.map(f => ({ content: f, confidence: 0.9, source: sourceId, timestamp: Date.now() })),
      lastMentioned: Date.now(), mentionCount: 1,
    });
  }
}
```

**记忆感知提示**（适用：带记忆上下文的 LLM 调用）：检索相关长期记忆 + 实体 + 近期上下文，拼成增强提示；响应后再把新记忆写回。

## 示例

智能检索（避免「检索到的记忆与当前 query 无关」）：先语义召回多倍候选，再用 LLM 给每条打 0-1 相关分，过滤后排序截断：

```ts
async function retrieveRelevant(query, memories, maxResults = 5) {
  const candidates = await memories.semanticSearch(query, maxResults * 3);
  const scored = await Promise.all(candidates.map(async (m) => {
    const score = await llm.complete(
      `Rate 0-1 how relevant this memory is to the query.\nQuery: "${query}"\nMemory: "${m.content}"\nReturn just the number.`);
    return { ...m, relevance: parseFloat(score) };
  }));
  return scored.filter(m => m.relevance > 0.5)
    .sort((a, b) => b.relevance - a.relevance).slice(0, maxResults);
}
```

重要度打分（存储前过滤，<0.3 不存）：偏好/决策/关于用户的事实/长度/用户消息分别加权求和。

## 注意事项

- **用户隔离（CRITICAL）**：绝不能让一个用户读到另一个用户的记忆。所有 key 用 `user:${userId}:memory:${memoryId}` 命名空间化；写入校验 userId、打标 userId；检索时强制 `filter: { userId }`；删除前校验归属；并提供 GDPR 导出/删除接口。缺失用户隔离即隐私漏洞，必须修复。
- **存储无界增长（HIGH）**：每条消息都存、无清理无巩固会导致检索变慢、成本飙升、延迟递增。设上限（短期 100 / 长期 10000）、存储前按重要度过滤、超限时巩固（保留高分 70%，importance>0.7 迁长期，其余删除）。
- **检索结果不相关（HIGH）**：简单关键词匹配、无相关性打分、全量注入会污染上下文。改用语义搜索 + LLM 相关性打分 + 阈值过滤。
- 校验清单：无用户隔离（CRITICAL）；无重要度过滤（WARNING，易记忆爆炸）；只存不取（WARNING，记忆白存）；无清理机制（INFO，按时效/重要度巩固清理）。

委派触发：context window / token → context-window-management；rag / retrieval / vector → rag-implementation；cache / caching → prompt-caching。

## 互见

- context-window-management：上下文窗口优化。
- rag-implementation：检索/向量系统底层实现。
- prompt-caching：缓存策略。
- llm-npc-dialogue：可配合使用。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。原条目上游来源 vibeship-spawner-skills（Apache 2.0）。
