---
name: hybrid-search-retrieval
title: 向量与关键词混合检索
description: 当构建 RAG 检索、搜索引擎，单用向量或关键词召回不足时使用；做向量召回+关键词召回+融合排序（RRF/线性/重排）的混合检索方案，产出可落地的 PostgreSQL/Elasticsearch/自定义管道实现；不适用于无需检索召回的纯生成或与混合检索无关的任务；触发词：混合检索、RRF、重排、pgvector、BM25
domain: 智能/rag
triggers: [混合检索, hybrid search, RRF, 倒数排名融合, 向量+关键词, 重排 rerank, cross-encoder, pgvector 全文检索, BM25 与向量结合, RAG 召回不足, 提升检索召回率, Elasticsearch 混合检索]
tags: [RAG, 检索, 向量检索, 关键词检索, RRF, 重排, pgvector, Elasticsearch, BM25, 召回]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [PostgreSQL/pgvector, Elasticsearch, sentence-transformers (CrossEncoder), asyncpg, Python]
requires: []
related: [embedding-model-strategies, vector-index-tuning, rag-pipeline-builder, rag-implementation-workflow]
combines_with: [production-llm-app-builder, postgresql-optimization, agent-memory-systems]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 构建 RAG 系统，需要提升召回率，让语义理解与精确匹配互补。
- 查询里含专有名词、代码、ID、产品型号等需精确匹配的词。
- 领域专有词汇多，纯向量检索容易漏掉关键词命中。
- 需要把多路检索结果融合排序后再喂给 LLM。

不该用（负边界）：
- 任务与检索召回无关（纯生成、纯改写）。
- 数据量小到一次全量扫描即可，或单路检索已满足质量要求，引入混合检索只增加复杂度与延迟。
- 缺少向量库或全文索引基础设施且不打算搭建。

## 步骤

1. **明确目标与约束**：召回率目标、延迟预算、是否需要元数据过滤、可用的存储（pgvector / Elasticsearch / 自建）。
2. **双路并行检索**：向量相似度检索 + 关键词检索（BM25/全文），各取 `top_k * 3` 量级候选，保证融合前有足够覆盖。
3. **融合排序**：默认用 RRF（无需调参、通用稳健）；需要可调平衡时用归一化后的线性加权。
4. **可选重排**：用 cross-encoder 对融合后的前 N 候选重排，质量提升显著。
5. **验证**：记录两路原始分数便于调试，在真实数据上 A/B 测试调权重，覆盖空结果、单词查询等边界。

### 架构

```
Query → ┬─► 向量检索 ──► 候选 ─┐
        │                     │
        └─► 关键词检索 ─► 候选 ─┴─► 融合 ─► 结果
```

### 融合方法选型

| 方法 | 说明 | 适用 |
|------|------|------|
| **RRF** 倒数排名融合 | 只看排名不看分数尺度 | 通用首选 |
| **线性加权** | 归一化后加权求和 | 需可调平衡 |
| **Cross-encoder 重排** | 神经模型重排 | 质量最高 |
| **级联** | 先过滤再重排 | 追求效率 |

## 指令

- 先澄清目标、约束与必需输入，缺失成功标准/权限/边界时停下来确认。
- 默认 RRF 常数 `k=60`；向量与关键词候选各超额取 3 倍 `top_k`。
- 元数据过滤同时作用于两路子查询，避免融合后才过滤导致漏召回。
- 输出不能替代环境特定的验证、测试与专家审查。

## 示例

**RRF 融合（核心公式 `1 / (k + rank)`）**

```python
from collections import defaultdict

def reciprocal_rank_fusion(result_lists, k=60, weights=None):
    if weights is None:
        weights = [1.0] * len(result_lists)
    scores = defaultdict(float)
    for result_list, weight in zip(result_lists, weights):
        for rank, (doc_id, _) in enumerate(result_list):
            scores[doc_id] += weight * (1.0 / (k + rank + 1))
    return sorted(scores.items(), key=lambda x: x[1], reverse=True)
```

**线性加权（先归一化到 [0,1]，alpha 为向量权重）**

```python
def linear_combination(vector_results, keyword_results, alpha=0.5):
    def normalize(results):
        if not results:
            return {}
        scores = [s for _, s in results]
        min_s, max_s = min(scores), max(scores)
        range_s = max_s - min_s if max_s != min_s else 1
        return {d: (s - min_s) / range_s for d, s in results}
    vs, ks = normalize(vector_results), normalize(keyword_results)
    combined = {}
    for d in set(vs) | set(ks):
        combined[d] = alpha * vs.get(d, 0) + (1 - alpha) * ks.get(d, 0)
    return sorted(combined.items(), key=lambda x: x[1], reverse=True)
```

**PostgreSQL（pgvector + 全文检索）建表与索引**

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    embedding vector(1536),
    metadata JSONB DEFAULT '{}',
    ts_content tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED
);
-- 向量索引 HNSW
CREATE INDEX IF NOT EXISTS documents_embedding_idx
    ON documents USING hnsw (embedding vector_cosine_ops);
-- 全文索引 GIN
CREATE INDEX IF NOT EXISTS documents_fts_idx
    ON documents USING gin (ts_content);
```

混合查询用两个 CTE（向量距离 `embedding <=> $1` 取 `ROW_NUMBER` 排名；`websearch_to_tsquery` + `ts_rank` 做关键词），`FULL OUTER JOIN` 后用 RRF 打分：

```sql
COALESCE(1.0 / (60 + v.vector_rank), 0) * $4::float +
COALESCE(1.0 / (60 + k.keyword_rank), 0) * (1 - $4::float) AS rrf_score
```

**Cross-encoder 重排**

```python
from sentence_transformers import CrossEncoder
model = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
pairs = [(query, c["content"]) for c in candidates]
scores = model.predict(pairs)
reranked = sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)
```

**Elasticsearch 8.x 原生 RRF**：用 `sub_searches`（一路 `match`，一路 `knn`）配合 `rank.rrf`（`window_size`、`rank_constant: 60`）即可，无需手写融合。

## 注意事项

应做：
- 权重靠数据实测调，别假设一套权重通用。
- 简单场景优先 RRF，开箱即用。
- 加重排能显著提质。
- 同时记录向量分与关键词分，便于调试。
- 上线前 A/B 测真实用户影响。

不应做：
- 别跳过关键词检索——它处理精确匹配更好。
- 别过度取数——在召回与延迟间平衡。
- 别忽略边界——空结果、单词查询要单独处理。
- 别假设一刀切——不同查询需要不同权重。

## 互见

- RRF 论文：https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf
- Vespa 混合检索：https://blog.vespa.ai/improving-text-ranking-with-few-shot-prompting/
- Cohere Rerank：https://docs.cohere.com/docs/reranking

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
