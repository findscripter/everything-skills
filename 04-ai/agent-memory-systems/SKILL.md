---
name: agent-memory-systems
title: AI 智能体记忆系统设计
description: 当为 AI 智能体设计跨会话记忆、长期记忆或 RAG 检索层时使用；做记忆类型分层（语义/情景/程序）、向量库选型、分块、后台记忆形成与衰减策略的可执行落地；不适用于生产级向量库运维、嵌入模型微调或知识图谱设计（应转交对应专家）。触发词：智能体记忆、长期记忆、向量库、RAG、情景记忆、跨会话记忆、LangMem、MemGPT
domain: 智能/agents
triggers: [智能体记忆, agent memory, 长期记忆, long-term memory, 记忆系统, 跨会话记忆, remember across sessions, 记忆检索, memory retrieval, 情景记忆, episodic memory, 语义记忆, semantic memory, 向量库, vector store, RAG, LangMem, MemGPT, Letta, Mem0, 对话历史, conversation history, 记忆衰减, 分块策略, chunking]
tags: [智能体, agents, 记忆系统, 向量数据库, rag, 嵌入, 检索增强, langmem, coala, 上下文工程]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Edit, Bash]
requires: []
related: [agent-memory-architecture, llm-conversation-memory, embedding-model-strategies, self-improving-memory-agent]
combines_with: [rag-pipeline-builder, vector-index-tuning, hybrid-search-retrieval]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：

- 需要让智能体「跨会话记住」用户偏好、历史对话或任务结果。
- 要为智能体设计长期记忆 / RAG 检索层，纠结记忆类型、向量库选型、分块大小。
- 检索质量差：检索回来的内容看似相关却没用，或新旧偏好打架、旧记忆覆盖新信息。
- 想在不拖慢对话的前提下提升记忆召回（后台异步形成记忆）。

不该用（应转交对应专家）：

- 生产级向量库的规模化运维（十亿级、分片、容灾）→ 数据工程。
- 端到端 RAG 流水线架构 → LLM 架构师。
- 嵌入模型选型 / 微调 / 自训练嵌入 → ML 工程。
- 知识图谱式记忆结构设计 → 知识工程。
- 多智能体共享记忆 → 多智能体编排。

核心心智：记忆质量 = 检索质量，而非存储数量。存一百万条事实，检索不出对的那条就等于没有。

## 步骤

1. 选记忆类型（CoALA 框架）：把信息映射到三类记忆，别一锅烩进一个向量库。
   - 语义记忆：事实与知识（用户画像、领域知识），存为结构化 profile 或非结构化集合。
   - 情景记忆：带时间戳的经历事件（过往对话、任务结果），用于经验学习。
   - 程序记忆：怎么做（规则、技能、工作流），常以 few-shot 示例落地。
2. 选向量库：按规模 / 过滤能力 / 成本权衡（见下表），原型期可用 ChromaDB，已有 PostgreSQL 用 pgvector，需复杂元数据过滤选 Qdrant。
3. 分块（chunk for retrieval, not for storage）：多数场景 256–512 token；按内容类型调整，加 10–20% overlap，必要时上下文化分块。
4. 写入：每条向量必须带元数据（user_id、type、timestamp、embedding_model），否则检索退化成纯词匹配。
5. 检索：先按元数据过滤，再做语义搜索；设 top_k 上限并做 token 预算；考虑时间衰减重排。
6. 后台形成与衰减：对话结束 / 空闲后异步抽取记忆并去重合并；定期按效用分剪枝旧记忆。
7. 上线前测召回率（Recall@k），别凭感觉定分块大小。

向量库决策矩阵：

|          | Pinecone | Qdrant | Weaviate | ChromaDB | pgvector |
|----------|----------|--------|----------|----------|----------|
| 规模     | 十亿级   | 1亿+   | 1亿+     | 100万    | 100万    |
| 托管     | 是       | 两者   | 两者     | 自托管   | 自托管   |
| 过滤     | 基础     | 最强   | 良好     | 基础     | SQL      |
| 混合检索 | 否       | 是     | 最强     | 否       | 是       |
| 成本     | 高       | 中     | 中       | 免费     | 免费     |
| 延迟     | 5ms      | 7ms    | 10ms     | 20ms     | 15ms     |

按内容类型的分块大小参考（字符）：documentation=512、code=1000、conversation=256、articles=768。

## 指令

- 永远先按元数据过滤再语义搜索；纯语义搜索是缺陷。
- 每个向量都要带 `user_id`、`type`、`timestamp`、`embedding_model`。
- 查询必须带 `user_id` 过滤，防止跨用户数据泄漏（ERROR 级）。
- 索引和查询必须用同一个嵌入模型，否则相似度是垃圾（ERROR 级）。
- 生产环境禁用内存态存储，用 Postgres / Qdrant / Pinecone 持久化（ERROR 级）。
- 检索必须设 top_k 上限并做 token 预算，防止挤掉系统提示和近期消息。
- 分块加 overlap；分块大小需测过再定，不要硬编码 1000。
- 偏好类可变事实用「更新 / 版本化」而非追加，避免旧值覆盖新值。

## 示例

LangMem 三类记忆写入（语义 / 情景 / 程序）：

```python
from langmem import MemoryStore
memory = MemoryStore(connection_string=os.environ["POSTGRES_URL"])

# 语义：用户画像
await memory.semantic.upsert(
    namespace="user_profile", key=user_id,
    content={"name": "Alice",
             "preferences": ["dark mode", "concise responses"],
             "expertise_level": "developer"})

# 情景：过往交互
await memory.episodic.add(
    namespace="conversations",
    content={"timestamp": datetime.now(),
             "summary": "Helped debug authentication issue",
             "outcome": "resolved",
             "key_insights": ["Token expiry was root cause"]},
    metadata={"user_id": user_id, "topic": "debugging"})

# 程序：学到的模式
await memory.procedural.add(
    namespace="skills",
    content={"task_type": "debug_auth",
             "steps": ["Check token expiry", "Verify refresh flow"]})
```

运行时组装上下文（先过滤后搜索）：

```python
async def prepare_context(user_id, query):
    profile = await memory.semantic.get(namespace="user_profile", key=user_id)
    similar = await memory.episodic.search(
        namespace="conversations", query=query,
        filter={"user_id": user_id}, limit=3)
    skills = await memory.procedural.search(
        namespace="skills", query=query, limit=2)
    return {"profile": profile, "past_experiences": similar, "relevant_skills": skills}
```

上下文化分块（Anthropic 方案，检索失败率降约 35%）：存原文，嵌入上下文化版本：

```python
def add_context_to_chunk(chunk, document_summary):
    return f"Document summary: {document_summary}\n\nThe following is a chunk from this document:\n{chunk}"

for chunk in chunks:
    contextualized = add_context_to_chunk(chunk, summary)
    embedding = embed(contextualized)
    store(chunk, embedding)  # 存原始 chunk，嵌入上下文化版本
```

效用衰减剪枝（MIRIX 思路，72h 半衰期）：

```python
def calculate_memory_utility(memory):
    now = datetime.now()
    hours = (now - memory.last_accessed).total_seconds() / 3600
    recency = 0.5 ** (hours / 72)
    frequency = min(memory.access_count / 10, 1.0)
    importance = memory.metadata.get("importance", 0.5)
    return 0.4 * recency + 0.3 * frequency + 0.3 * importance

async def prune_low_utility_memories(threshold=0.2):
    for mem in await memory.list_all():
        if calculate_memory_utility(mem) < threshold:
            await memory.archive(mem.id)
```

后台异步形成记忆（对话空闲 5 分钟后触发，无时间压力，质量更高）：

```python
@on_conversation_idle(timeout_minutes=5)
async def process_conversation(thread_id):
    conversation = await load_conversation(thread_id)
    insights = await llm.invoke("Analyze this conversation and extract key facts, "
                                "preferences, tasks, behavior patterns...\n" + conversation)
    for insight in insights:
        await memory.semantic.upsert(namespace="user_insights",
            key=generate_key(insight), content=insight,
            metadata={"source_thread": thread_id})
```

## 注意事项

常见踩坑（按严重度）：

- CRITICAL：分块把信息从上下文里割裂——检索到的片段单看无意义（「该函数返回 X」却不知是哪个函数）。解法：上下文化分块；或分层分块（256/512/1024 多粒度并存，按查询选层级）。
- HIGH：分块大小与查询模式不匹配——事实查询要小而具体的块，概念查询要大上下文，代码要按函数边界。先用 Recall@5 跑 256/512/768/1024 选最优，别默认 1000。
- HIGH：语义搜索返回不相关结果——相似不等于相关（「用户喜欢 Python」与「Python 是编程语言」语义相似但类型迥异）。解法：元数据过滤 + 混合检索（RRF 融合）+ cross-encoder 重排。
- HIGH：旧记忆覆盖现状——向量库默认无时间感知，一年前的记忆和今天权重相同。解法：时间衰减打分（similarity*0.7 + time_score*0.3）；偏好用「先删后写」更新；事实显式版本化（version / supersedes / valid_from）。
- MEDIUM：矛盾记忆被一起检索——「喜欢深色」和「喜欢浅色」同框，回答前后矛盾。解法：写入时检测冲突（相似度>0.9 时用 LLM 判矛盾，replace 或标记 superseded）；定期合并去重。
- MEDIUM：检索内容撑爆上下文窗口——top_k 太大或块太大，挤掉系统提示和近期消息。解法：按记忆类型做 token 预算，按块均长动态算 max_k 并逐条裁剪。
- MEDIUM：查询与文档嵌入来自不同模型——升级或混用嵌入模型导致相似度全乱。解法：元数据记 embedding_model 版本，检索按版本过滤，迁移时用独立 collection 重嵌后切换。

校验红线（落地前自检）：内存态存储用于生产（ERROR）；向量 upsert 缺元数据（WARNING）；查询缺 user_id 过滤（ERROR）；硬编码未论证的分块大小（INFO）；分块无 overlap（WARNING）；纯语义搜索无过滤（WARNING）；检索无 top_k 上限（WARNING）；嵌入未记模型版本（WARNING）；文档与查询用不同嵌入模型（ERROR）。

## 互见

- 配套技能：自主智能体、多智能体编排、LLM 架构、智能体工具构建。
- 转交触发：规模化向量库运维 → 数据工程；嵌入优化 / 微调 → ML 工程；知识图谱记忆 → 知识工程；端到端 RAG → LLM 架构师；多智能体共享记忆 → 多智能体编排。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
