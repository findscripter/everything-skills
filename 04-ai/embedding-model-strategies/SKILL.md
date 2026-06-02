---
name: embedding-model-strategies
title: 嵌入模型选型与优化
description: 当为 RAG/向量检索选嵌入模型、调分块或评估检索质量时使用；做模型选型对照、分块/预处理/归一化/降维方案与 P@k、Recall、MRR、nDCG 评估并产出可落地管线代码；不适用于非向量检索的通用 NLP 或向量库部署运维。触发词：embedding、向量检索、RAG、分块、降维、多语言、检索评估
domain: 智能/rag
triggers: [选嵌入模型, embedding 选型, RAG 检索效果差, chunking 分块策略, 向量维度降维, 多语言嵌入, 检索质量评估, voyage/bge/e5 对比, Matryoshka 降维, text-embedding-3]
tags: [embedding, 向量检索, RAG, 分块, 检索评估, 智能]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [OpenAI Embeddings API, sentence-transformers, tiktoken, nltk, numpy]
requires: []
related: [hybrid-search-retrieval, vector-index-tuning, rag-pipeline-builder, transformers-js]
combines_with: [rag-implementation-workflow, production-llm-app-builder, agent-memory-systems]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：为 RAG/向量检索选嵌入模型、对比模型表现、设计分块策略、降低向量维度、处理多语言内容、针对代码/法律等领域微调或定制管线、用指标量化检索质量。

不该用（负边界）：
- 任务与嵌入/向量检索无关（如纯生成、分类不依赖检索）。
- 需要向量数据库（Pinecone/Milvus/pgvector 等）的部署、索引调参或运维——本条目只覆盖到生成向量为止。
- 把建议当成跳过环境实测的替代品；缺少输入/权限/成功标准时先停下来澄清。

## 步骤

1. 明确目标与约束：语料类型（散文/代码/多语言）、精度 vs 成本、本地 vs API、Token 上限、目标维度。
2. 按场景选模型（见对照表）。
3. 设计分块：选 Token/句子/语义分块/递归分块之一，保留语义边界，设置合理 overlap。
4. 预处理：清洗空白与特殊字符；按模型要求加前缀（BGE 查询前缀、E5 的 `query:`/`passage:`）。
5. 生成向量：批量调用、按需归一化（cosine 必做）、按需降维。
6. 评估：用 P@k、Recall@k、MRR、nDCG@k 量化检索质量并迭代。

### 模型选型对照

| 模型 | 维度 | 最大 Token | 适用 |
|------|------|-----------|------|
| text-embedding-3-large | 3072 | 8191 | 高精度 |
| text-embedding-3-small | 1536 | 8191 | 性价比 |
| voyage-2 | 1024 | 4000 | 代码、法律 |
| bge-large-en-v1.5 | 1024 | 512 | 开源 |
| all-MiniLM-L6-v2 | 384 | 256 | 快速轻量 |
| multilingual-e5-large | 1024 | 512 | 多语言 |

管线流向：`文档 → 分块(overlap/size) → 预处理(清洗/归一化) → 嵌入模型(API/本地) → 向量`

## 指令

- 先澄清目标、约束与必需输入，再给方案。
- 套用对应最佳实践并验证结果；给出可执行步骤与验证手段。
- 选型遵循「模型匹配场景」：代码/散文/多语言分开选，切勿混用不同模型（向量空间不兼容）。
- 需要更详尽的实现示例时，对应源仓库的 `resources/implementation-playbook.md`。

## 示例

OpenAI 批量嵌入 + Matryoshka 降维：

```python
from openai import OpenAI
client = OpenAI()

def get_embeddings(texts, model="text-embedding-3-small", dimensions=None):
    batch_size, out = 100, []
    for i in range(0, len(texts), batch_size):
        kwargs = {"input": texts[i:i+batch_size], "model": model}
        if dimensions: kwargs["dimensions"] = dimensions
        resp = client.embeddings.create(**kwargs)
        out.extend(item.embedding for item in resp.data)
    return out

# 降维（Matryoshka）：text-embedding-3 支持直接指定 dimensions
reduced = get_embeddings(["..."], dimensions=512)
```

本地嵌入（带模型专属前缀）：

```python
from sentence_transformers import SentenceTransformer
m = SentenceTransformer("BAAI/bge-large-en-v1.5", device="cuda")
# BGE 查询需加前缀
q = "Represent this sentence for searching relevant passages: 你的查询"
emb = m.encode([q], normalize_embeddings=True, convert_to_numpy=True)

# E5：查询用 query:，文档用 passage:
e5 = SentenceTransformer("intfloat/multilingual-e5-large")
qv = e5.encode("query: 你的查询")
dv = e5.encode("passage: 你的文档")
```

Token 分块（含 overlap）：

```python
import tiktoken
def chunk_by_tokens(text, chunk_size=512, chunk_overlap=50):
    tok = tiktoken.get_encoding("cl100k_base")
    ids, chunks, start = tok.encode(text), [], 0
    while start < len(ids):
        end = start + chunk_size
        chunks.append(tok.decode(ids[start:end]))
        start = end - chunk_overlap
    return chunks
```

检索质量评估（P@k / Recall@k / MRR / nDCG@k）：

```python
import numpy as np
def evaluate_retrieval_quality(relevant_docs, retrieved_docs, k=10):
    def p_at_k(rel, ret): return len(set(ret[:k]) & rel) / k
    def r_at_k(rel, ret): return len(set(ret[:k]) & rel) / len(rel) if rel else 0
    def mrr(rel, ret):
        for i, d in enumerate(ret):
            if d in rel: return 1/(i+1)
        return 0
    def ndcg(rel, ret):
        dcg = sum(1/np.log2(i+2) for i, d in enumerate(ret[:k]) if d in rel)
        idcg = sum(1/np.log2(i+2) for i in range(min(len(rel), k)))
        return dcg/idcg if idcg else 0
    rows = [(set(rel), ret) for rel, ret in zip(relevant_docs, retrieved_docs)]
    return {
        f"precision@{k}": np.mean([p_at_k(r, x) for r, x in rows]),
        f"recall@{k}":    np.mean([r_at_k(r, x) for r, x in rows]),
        "mrr":            np.mean([mrr(r, x) for r, x in rows]),
        f"ndcg@{k}":      np.mean([ndcg(r, x) for r, x in rows]),
    }
```

## 注意事项

应做：
- 模型匹配场景（代码/散文/多语言各选其优）。
- 分块保留语义边界；按句子/标题/递归切分而非硬截断。
- cosine 相似度前归一化向量。
- 批量请求而非逐条；缓存已算向量，避免重复计算。

不应做：
- 忽略 Token 上限——截断会丢信息。
- 混用不同嵌入模型——向量空间不兼容，无法直接比较。
- 跳过预处理——garbage in, garbage out。
- 过度分块——丢失上下文。

## 互见

- 参考基准：MTEB Leaderboard（huggingface.co/spaces/mteb/leaderboard）。
- 官方文档：OpenAI Embeddings、Sentence-Transformers（sbert.net）。
- 下游：向量数据库索引/检索（属本条目负边界，另见相关检索/RAG 条目）。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
