---
name: vector-index-tuning
title: 向量索引调优
description: 当向量检索延迟高、召回不达标或内存占用过大时使用；做 HNSW 参数（M/efConstruction/efSearch）、量化策略与索引类型选型，产出可基准验证的索引配置与监控指标；不适用于嵌入模型选型、检索结果重排或召回链路的语义优化（属 RAG 上层）。触发词：HNSW、量化、召回率
domain: 智能/rag
triggers: [向量索引调优, HNSW 参数, efSearch, efConstruction, 向量量化, 标量量化, 乘积量化 PQ, 二值量化, 召回率 recall, 向量检索延迟, Qdrant 索引配置, IVF DiskANN, 亿级向量扩展, 索引内存优化]
tags: [向量检索, RAG, HNSW, 量化, 性能调优, Qdrant, 召回率, 智能]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [hnswlib, qdrant-client, numpy, scikit-learn]
requires: []
related: [embedding-model-strategies, hybrid-search-retrieval, rag-pipeline-builder, postgresql-optimization]
combines_with: [rag-implementation-workflow, production-llm-app-builder, agent-memory-systems]
license: MIT
source: wshobson/agents
source_license: MIT
---
## 何时使用

需要在生产环境平衡向量检索的**延迟、召回与内存**时使用，典型场景：

- 调 HNSW 参数（M / efConstruction / efSearch）
- 引入量化（INT8 标量 / PQ 乘积 / 二值）压缩内存
- 降低检索延迟、按目标召回率回退参数
- 数据规模从百万扩到亿级，需要换索引类型
- 为 Qdrant 等向量库做面向 recall/speed/memory 的配置

**不该用的边界：**

- 嵌入模型选型、向量维度设计 —— 属上游表示问题
- 检索结果重排（rerank）、查询改写、语义召回质量 —— 属 RAG 上层链路
- 还没做基准、不知道瓶颈在哪 —— 先 profile，别盲目调参（见注意事项）

## 步骤

1. **按规模选索引类型**（先定大方向，再调细节）：

   | 数据规模 | 推荐索引 |
   |---|---|
   | < 10K | Flat（暴力精确检索） |
   | 10K – 1M | HNSW |
   | 1M – 100M | HNSW + 量化 |
   | > 100M | IVF + PQ 或 DiskANN |

2. **从默认值起步，按需调 HNSW 三参数**：

   | 参数 | 默认 | 作用 |
   |---|---|---|
   | M | 16 | 每节点连接数，↑ 召回更好、内存更大 |
   | efConstruction | 100 | 构建质量，↑ 索引更好、构建更慢 |
   | efSearch | 50 | 检索质量，↑ 召回更好、检索更慢 |

   经验起点：< 100K 用 M=16/efc=100；< 1M 用 M=32/efc=200；≥ 1M 用 M=48/efc=256。efSearch 按目标召回回退：≥0.99 取 256，≥0.95 取 128，否则 64。

3. **用真实查询基准**，记录 build_time、search_time(ms)、recall@k、memory_mb 四项，网格扫 M × efConstruction × efSearch 取帕累托最优。

4. **超内存预算时引入量化**（按每维字节数估算）：FP32=4 / FP16=2 / INT8=1 / PQ≈32–64 字节总量 / Binary=维度/8 字节。

5. **配置向量库**（如 Qdrant，按 recall/speed/memory/balanced 选档），并**持续监控** p50/p95/p99 延迟、QPS 与召回，防止数据漂移导致召回衰减。

## 指令

- 量化内存估算：`vector_bytes = num_vectors × dimensions × bytes_per_dim`，bytes_per_dim 取 `{fp32:4, fp16:2, int8:1, pq:0.05, binary:0.125}`；HNSW 图开销 `≈ num_vectors × M × 2 × 4` 字节。
- recall@k 定义：`correct = Σ |pred[:k] ∩ truth[:k]|`，`recall = correct / (n_queries × k)`。
- PQ 约束：维度必须能被子向量数整除（`dim % n_subvectors == 0`）。

## 示例

HNSW 参数网格基准（hnswlib）：

```python
import hnswlib, time
index = hnswlib.Index(space='cosine', dim=dim)
index.init_index(max_elements=n, M=m, ef_construction=ef_construction)
index.add_items(vectors)                 # 记录 build_time
index.set_ef(ef_search)                  # 检索前必须设 efSearch
labels, distances = index.knn_query(queries, k=10)
recall = calculate_recall(labels, ground_truth, k=10)
```

Qdrant 按目标分档建集合 + 检索参数：

```python
hnsw_configs = {
    "recall":   models.HnswConfigDiff(m=32, ef_construct=256),  # 不量化
    "speed":    models.HnswConfigDiff(m=16, ef_construct=64),   # INT8, always_ram
    "balanced": models.HnswConfigDiff(m=16, ef_construct=128),  # INT8
    "memory":   models.HnswConfigDiff(m=8,  ef_construct=64),   # PQ x16
}
# 召回≥0.99：hnsw_ef=256 且 quantization.ignore=True + rescore=True（检索绕过量化精排）
# 召回≥0.95：hnsw_ef=128 + rescore=True + oversampling=2.0
```

## 注意事项

**该做：**

- 用**真实查询**做基准，合成数据未必代表生产分布。
- **持续监控召回**，数据漂移会让召回悄悄下滑。
- **从默认值起步**，确有需要再调。
- 善用**量化**省内存，并考虑冷热分层存储。

**不该做：**

- 不要过早优化 —— **先 profile 定位瓶颈**再动手。
- 不要忽视**构建时间** —— 索引更新有成本。
- 不要忘了**重建索引**的运维计划。
- 不要跳过**预热** —— 冷索引检索很慢。

## 互见

- RAG 检索链路上层：rerank / 查询改写 / 召回质量评估
- 向量库部署与分片扩展、亿级规模容量规划

---

采编自 wshobson/agents（MIT 许可）。
