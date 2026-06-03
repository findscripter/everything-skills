---
name: vector-database-engineer
title: 向量数据库工程：Pinecone/Weaviate 与语义检索
description: 当为 RAG/语义检索/推荐做向量库选型与端到端落地，在 Pinecone/Weaviate/Qdrant/Milvus/pgvector 间权衡并设计分块、元数据与扩容时使用；产出选型对照、索引(HNSW/IVF/PQ)与元数据 schema 及上线清单；不适用于嵌入选型评估、纯索引调参或关系型/NoSQL 建模；触发词：向量数据库、Pinecone、Weaviate、Qdrant、Milvus、pgvector、语义检索、RAG、相似度搜索
domain: 数据/sql
triggers: [向量数据库, vector database, Pinecone, Weaviate, Qdrant, Milvus, pgvector, 语义检索, semantic search, RAG, 相似度搜索, similarity search, 向量库选型, 元数据过滤, metadata filtering, 文档分块, chunking, 推荐引擎, 图像相似检索, 百万级向量扩容]
tags: [vector-database, pinecone, weaviate, qdrant, milvus, pgvector, semantic-search, rag, similarity-search, embeddings]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Pinecone, Weaviate, Qdrant, Milvus, pgvector]
requires: []
related: [embedding-model-strategies, vector-index-tuning, hybrid-search-retrieval, nosql-distributed-db, postgresql-optimization]
combines_with: [rag-pipeline-builder, rag-implementation-workflow, embedding-model-strategies, hybrid-search-retrieval, data-pipeline-engineer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# 向量数据库工程：Pinecone/Weaviate 与语义检索

> domain：数据/sql｜name：vector-database-engineer｜status：stable
> agents：claude-code、codex、cursor、gemini-cli｜license：MIT

## 何时使用

- 搭建 RAG（检索增强生成）系统，需要为语义检索挑选并落地一个向量库。
- 在 **Pinecone / Weaviate / Qdrant / Milvus / pgvector** 之间做选型与架构决策。
- 构建语义搜索、推荐引擎、图像/音频相似度检索。
- 把向量检索从原型扩到百万～十亿级，并兼顾延迟与召回。
- 设计分块、元数据过滤（pre/post-filter）与混合检索（向量+关键词）的整体方案。

不该用的边界（避免与已有技能重叠）：

- **选嵌入模型、调分块、评估检索质量（P@k/Recall/MRR/nDCG）** → 用 `embedding-model-strategies`，本条不替你定 embedding。
- **单纯调索引参数**（HNSW 的 M/efSearch、量化 PQ、内存优化、基准压测）→ 用 `vector-index-tuning`。
- **设计向量+关键词的融合排序/重排**（RRF、cross-encoder）→ 用 `hybrid-search-retrieval`，本条只决定「要不要上混合检索」。
- 关系型 schema/范式设计、分布式宽列/KV 建模 → 用 `erd-schema-designer` / `nosql-distributed-db`。

本条聚焦**库选型 + 架构 + 端到端落地**：把上面这些子能力串成一条可上线的检索管线。

## 步骤

```
1. 分析数据特征与查询模式
   - 向量规模量级（万 / 百万 / 亿）、写入是否频繁、是否多租户
   - 查询模式：纯语义？需元数据过滤？需混合检索？延迟 SLO 与召回目标

2. 选定嵌入模型（委托 embedding-model-strategies）
   - 维度按用例取 384–1536；维度决定存储/内存与库的配置

3. 设计分块与预处理管线
   - 带 overlap 的分块；清洗、去重、归一化；为每块保留可过滤的元数据

4. 选向量库 + 索引类型（见下方选型表）
   - 托管省心 vs 自托管可控；HNSW（默认，高召回/高内存）/ IVF / PQ（省内存）

5. 设计元数据 schema 以支持过滤
   - 把高选择性字段（tenant、date、category）做成可过滤元数据
   - 优先 pre-filter 缩小搜索空间，避免 post-filter 召回塌陷

6. 按需引入混合检索（委托 hybrid-search-retrieval）
   - 纯向量召回不足时，叠加关键词召回 + 融合排序/重排

7. 优化延迟/召回权衡（委托 vector-index-tuning）
   - 调 efSearch / nprobe；测 recall vs latency 曲线；按需量化

8. 上线监控与重建策略
   - 监控 embedding 漂移、召回退化；规划索引重建/再索引；缓存高频查询
```

## 指令

选型与硬约束：

- **托管 vs 自托管**：Pinecone = 全托管、起步快、按量付费；Weaviate/Qdrant/Milvus = 可自托管、可控成本、支持本地化；pgvector = 已有 Postgres、向量量级不大（≤百万级）时复用现有库最省事。
- **维度即成本**：维度直接决定存储与内存；亿级向量优先考虑量化（PQ/标量量化）压内存。
- **过滤要 pre 不要 post**：先用元数据缩小候选集再做近邻搜索；post-filter 在高过滤率下会让 topK 召不满。
- **写便宜、读为王**：嵌入与索引一次写多次读，重点优化检索路径与召回。
- **分块务必带 overlap**：避免切断语义；块过大稀释相关性，过小丢上下文。
- **缓存高频查询**：相同/相似 query 命中缓存，省一次嵌入+检索。
- **规划重建**：embedding 模型升级或数据漂移时需重索引，提前设计灰度/双写切换。

各库速记：

- **Pinecone**：Serverless、namespace 做多租户、metadata filter 原生支持；无需运维。
- **Weaviate**：内置向量化模块、GraphQL、hybrid search（BM25+向量）一等公民。
- **Qdrant**：Rust、payload 过滤强、量化与磁盘索引成熟，自托管性价比高。
- **Milvus**：面向超大规模、丰富索引族（HNSW/IVF/DiskANN）、分布式部署。
- **pgvector**：在 Postgres 内做向量列，能和业务表 JOIN/事务，量级有限。

## 示例

向量库选型速查：

| 维度 | Pinecone | Weaviate | Qdrant | Milvus | pgvector |
| :-- | :-- | :-- | :-- | :-- | :-- |
| 部署 | 全托管 | 托管/自托管 | 托管/自托管 | 自托管为主 | 嵌在 Postgres |
| 规模 | 大 | 中-大 | 中-大 | 超大（亿级+） | 中（≤百万级） |
| 混合检索 | 需自建 | 内置 | 支持 | 支持 | 配全文检索 |
| 元数据过滤 | 原生 | 原生 | 强 | 支持 | SQL WHERE |
| 适合场景 | 快速上云 | 一体化语义栈 | 自托管性价比 | 极大规模 | 复用现有 PG |

最小检索骨架（Pinecone，伪代码——嵌入交给 embedding 层）：

```python
# 1. 上行：分块 + 嵌入 + 带元数据 upsert
chunks = chunk(doc, size=512, overlap=64)
vectors = [
    {"id": c.id, "values": embed(c.text),
     "metadata": {"tenant": c.tenant, "date": c.date, "source": c.src}}
    for c in chunks
]
index.upsert(vectors=vectors, namespace=tenant)

# 2. 检索：pre-filter（元数据）+ 向量近邻 + topK
res = index.query(
    vector=embed(user_query),
    top_k=8,
    namespace=tenant,
    filter={"date": {"$gte": "2025-01-01"}},   # pre-filter 缩小搜索空间
    include_metadata=True,
)
```

上线前核对清单：

```
[ ] 查询模式覆盖：纯语义 / 过滤 / 混合 是否都有对应方案？
[ ] 维度与成本：向量维度 × 数量的内存/存储预算算过了？是否需量化？
[ ] 过滤策略：高选择性字段已建为可过滤元数据，且走 pre-filter？
[ ] 召回 vs 延迟：efSearch/nprobe 调过，recall 与 P99 都达标？
[ ] 多租户：namespace / payload 隔离是否到位？
[ ] 漂移与重建：embedding 升级、数据漂移的再索引方案就绪？
[ ] 缓存：高频 query 是否有缓存层？
```

## 注意事项

- 本条是**选型与架构**层，嵌入/分块评估、索引参数细调、融合重排请下钻到对应技能，别在这里重复造。
- post-filter 在高过滤比例下会让 topK 召不满——优先 pre-filter；做不到时把 topK 放大再过滤。
- 维度选择牵一发动全身：384–1536 按用例定，先和 embedding 选型对齐再定库配置。
- 监控 embedding 漂移与召回退化；模型/数据更新时务必规划索引重建，别热切换硬扛。
- HNSW 召回高但吃内存；亿级或内存吃紧时考虑 IVF/PQ/磁盘索引换召回换延迟。
- 本条给的是心智模型与设计模式，不替代环境内的实测、压测与专家评审；缺关键输入（向量规模、查询模式、延迟/召回目标、一致性要求）时先停下来追问。

## 互见

- requires：无。
- related：`embedding-model-strategies` —— 嵌入选型与检索评估（本条的上游输入）；`vector-index-tuning` —— 索引参数与量化细调（本条选完库后的下钻）；`hybrid-search-retrieval` —— 向量+关键词融合排序；`nosql-distributed-db`、`postgresql-optimization` —— 非向量侧的建模/库优化对照。
- combines_with：`rag-pipeline-builder`、`rag-implementation-workflow` —— 把向量库接进完整 RAG 管线；`embedding-model-strategies`、`hybrid-search-retrieval` —— 组成「嵌入 + 检索库 + 混合召回」检索栈；`data-pipeline-engineer` —— 文档灌库/回填与增量索引由管道驱动。

---

本条采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
