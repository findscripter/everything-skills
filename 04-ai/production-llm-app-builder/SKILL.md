---
name: production-llm-app-builder
title: 生产级 LLM 应用与 RAG 系统构建
description: 当需要构建/优化生产级 LLM 应用、RAG 检索系统或智能体编排时使用；做端到端架构设计与可观测、可控成本、带护栏的工程落地（含向量检索、混合检索、重排、多智能体、流式推理）并产出可上线代码与评测方案；不适用于无 LLM 的纯数据科学/传统 ML、与 AI 无关的纯 UI 改动、或无数据源与部署目标时；触发词：RAG、向量检索、智能体编排、LLM 上线、Prompt 工程、多模态
domain: 智能/rag
triggers: [构建 RAG 系统, LLM 应用上线, 向量检索优化, 智能体编排, Prompt 工程, 混合检索与重排, 多智能体协作, LLM 成本与延迟优化, AI 安全护栏, 多模态文档理解]
tags: [智能, rag, llm, 向量检索, 智能体, prompt工程, 可观测性, ai安全]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [LangChain/LangGraph, LlamaIndex, 向量数据库(Pinecone/Qdrant/Weaviate/pgvector), FastAPI, LangSmith/Phoenix, OpenAI/Anthropic SDK]
requires: []
related: [rag-implementation-workflow, rag-pipeline-builder, mlops-model-productionizer, ai-engineering-toolkit]
combines_with: [hybrid-search-retrieval, langfuse-llm-observability, multi-agent-system-designer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 构建或改进 LLM 功能、RAG 检索系统、AI 智能体。
- 设计生产级 AI 架构与模型选型、模型路由。
- 优化向量检索、Embedding、召回流水线（混合检索、重排、查询改写）。
- 落地 AI 安全护栏、可观测性、成本与限流控制。

不该用（负边界）：
- 任务是无 LLM 的纯数据科学/传统 ML。
- 只是与 AI 功能无关的快速 UI 改动。
- 没有可访问的数据源或部署目标（先补齐输入再开工）。
- 缺少必要输入、权限、安全边界或成功标准时，先停下来澄清。

## 步骤

1. 澄清用例、约束与成功指标（延迟、成本、召回/准确率、合规要求）。
2. 设计 AI 架构、数据流与模型选型（含多模型编排与路由）。
3. 实现时内建监控、安全护栏与成本控制（缓存、限流、配额）。
4. 用测试 + 分阶段灰度发布验证（含对抗性输入与边界用例）。

## 指令

- 模型与编排：GPT-4o/4o-mini、Claude 4.5 Sonnet/Haiku、Llama 3.2、Qwen 2.5 等；本地部署用 Ollama / vLLM / TGI；多模型路由按成本/能力选型，配缓存降本。优先使用结构化输出（function calling / structured outputs）与类型安全。
- RAG 流水线：多阶段召回 = 混合检索（向量相似度 + BM25 关键词）→ 重排（Cohere rerank-3 / BGE reranker / cross-encoder）→ 上下文压缩与相关性过滤以省 token。向量库可选 Pinecone / Qdrant / Weaviate / Chroma / Milvus / pgvector；Embedding 选 text-embedding-3-large/small、Cohere embed-v3、BGE-large。分块用语义/递归/滑窗/文档结构感知。进阶模式：GraphRAG、HyDE、RAG-Fusion、self-RAG；查询侧做扩展、分解与路由。
- 向量索引：按规模选 HNSW / IVF / LSH；相似度按场景选 cosine / 点积 / 欧氏；关注 Embedding 漂移检测与模型版本管理，索引做分片与缓存。
- 智能体：LangChain/LangGraph 管复杂工作流与状态；LlamaIndex 做数据密集检索；CrewAI / AutoGen 做多智能体协作；配短期/长期/情景记忆与工具（web 搜索、代码执行、API、数据库），并对智能体做自定义指标评测与监控。
- Prompt 工程：chain-of-thought、tree-of-thoughts、self-consistency、few-shot；模板做动态变量注入；Prompt 做版本化、A/B 测试与效果追踪；安全侧做越狱检测、内容过滤、偏见缓解。
- 生产系统：FastAPI 异步服务 + 负载均衡 + 流式响应；语义缓存 / 响应记忆 / Embedding 缓存；限流、配额、成本控制；错误处理用回退策略与熔断器；可观测性用 LangSmith / Phoenix / W&B 做日志、指标、追踪。

## 示例

- 为企业知识库构建带混合检索的生产级 RAG 系统。
- 实现带升级转人工流程的多智能体客服系统。
- 设计带缓存与负载均衡的低成本 LLM 推理流水线。
- 构建用于文档分析与问答的多模态 AI 系统。
- 实现带重排的语义检索以提升召回准确率。
- 搭建对比不同 LLM Prompt 的 A/B 测试框架。

## 注意事项

- 数据安全：未经批准不得将敏感数据发往外部模型。
- 护栏必备：针对 prompt 注入、PII、策略合规加防护；接入内容审核（如 OpenAI Moderation API 或自定义分类器）与 PII 检测脱敏。
- 工程优先级：生产可靠性与可扩展性优先于 PoC；从第一天就内建可观测性；用全面错误处理与优雅降级；持续做含对抗性输入的测试。
- 不可替代环境验证：本技能输出不能替代针对具体环境的验证、测试与专家评审。

## 互见

- 检索增强与多源核验类研究任务参见 deep-research。
- 涉及 Claude API / Anthropic SDK 的实现、提示缓存与模型迁移参见 claude-api。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
