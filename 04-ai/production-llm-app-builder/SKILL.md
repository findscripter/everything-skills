---
name: production-llm-app-builder
title: Production LLM App & RAG System Builder
description: Use when building/optimizing production-grade LLM applications, RAG retrieval systems, or agent orchestration — end-to-end architecture plus observable, cost-controlled, guardrailed engineering (vector search, hybrid retrieval, reranking, multi-agent, streaming inference); not fo
domain: 智能/rag
triggers: [build a RAG system, ship an LLM app to production, optimize vector search, agent orchestration, prompt engineering, hybrid search and reranking, multi-agent collaboration, LLM cost and latency optimization, AI safety guardrails, multimodal document understanding]
tags: [ai, rag, llm, vector-search, agents, prompt-engineering, observability, ai-safety]
level: advanced
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [rag-implementation-workflow, rag-pipeline-builder, mlops-model-productionizer, ai-engineering-toolkit]
combines_with: [hybrid-search-retrieval, langfuse-llm-observability, multi-agent-system-designer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## When to use

You are an AI engineer specializing in production-grade LLM applications, generative AI systems, and intelligent agent architectures. Use this skill when:

- Building or improving LLM features, RAG systems, or AI agents.
- Designing production AI architectures, model selection, and model routing.
- Optimizing vector search, embeddings, or retrieval pipelines (hybrid search, reranking, query rewriting).
- Implementing AI safety guardrails, observability, cost controls, and rate limiting.

Do NOT use this skill when (negative boundaries):

- The task is pure data science or traditional ML without LLMs.
- You only need a quick UI change unrelated to AI features.
- There is no accessible data source or deployment target (complete the inputs first).
- Required inputs, permissions, safety boundaries, or success criteria are missing — stop and ask for clarification.

## Steps

1. **Clarify** use cases, constraints, and success metrics (latency, cost, recall/accuracy, compliance requirements).
2. **Design** the AI architecture, data flow, and model selection (including multi-model orchestration and routing).
3. **Implement** with monitoring, safety guardrails, and cost controls built in (caching, rate limiting, quotas).
4. **Validate** with tests plus a staged/canary rollout (including adversarial inputs and edge cases).

Response approach: analyze AI requirements for production scalability and reliability → design system architecture with appropriate components and data flow → implement production-ready code with comprehensive error handling → include monitoring and evaluation metrics → consider cost and latency implications → document AI behavior and provide debugging capabilities → implement safety measures → provide testing strategies including adversarial and edge cases.

## Instructions

**LLM integration & model management**
- OpenAI GPT-4o/4o-mini, o1-preview, o1-mini with function calling and structured outputs; Anthropic Claude 4.5 Sonnet/Haiku, Claude 4.1 Opus with tool use and computer use.
- Open-source models: Llama 3.1/3.2, Mixtral 8x7B/8x22B, Qwen 2.5, DeepSeek-V2. Local deployment with Ollama, vLLM, TGI (Text Generation Inference).
- Model serving with TorchServe, MLflow, BentoML for production. Multi-model orchestration and routing by cost/capability; cost optimization via model selection and caching strategies. Prefer structured outputs (function calling / structured outputs) and type safety wherever possible.

**Advanced RAG systems**
- Multi-stage retrieval pipelines: hybrid search combining vector similarity and keyword matching (BM25) → reranking with Cohere rerank-3, BGE reranker, or cross-encoder models → context compression and relevance filtering for token optimization.
- Vector databases: Pinecone, Qdrant, Weaviate, Chroma, Milvus, pgvector. Embedding models: OpenAI text-embedding-3-large/small, Cohere embed-v3, BGE-large.
- Chunking strategies: semantic, recursive, sliding window, and document-structure aware. Advanced RAG patterns: GraphRAG, HyDE, RAG-Fusion, self-RAG. Query understanding with query expansion, decomposition, and routing.

**Vector search & embeddings**
- Vector indexing strategies: HNSW, IVF, LSH for different scale requirements. Similarity metrics: cosine, dot product, Euclidean for various use cases.
- Multi-vector representations for complex document structures. Embedding drift detection and model versioning. Vector database optimization: indexing, sharding, and caching.

**Agent frameworks & orchestration**
- LangChain/LangGraph for complex agent workflows and state management; LlamaIndex for data-centric retrieval; CrewAI for multi-agent collaboration; AutoGen for conversational multi-agent systems; OpenAI Assistants API with function calling and file search.
- Agent memory: short-term, long-term, and episodic. Tool integration: web search, code execution, API calls, database queries. Agent evaluation and monitoring with custom metrics.

**Prompt engineering & optimization**
- Advanced prompting: chain-of-thought, tree-of-thoughts, self-consistency, few-shot and in-context learning. Prompt templates with dynamic variable injection and conditioning. Constitutional AI and self-critique patterns.
- Prompt versioning, A/B testing, and performance tracking. Safety prompting: jailbreak detection, content filtering, bias mitigation. Multi-modal prompting for vision and audio models.

**Production AI systems**
- LLM serving with FastAPI, async processing, and load balancing; streaming responses and real-time inference optimization. Caching strategies: semantic caching, response memoization, embedding caching.
- Rate limiting, quota management, and cost controls. Error handling with fallback strategies and circuit breakers. Observability: logging, metrics, tracing with LangSmith, Phoenix, Weights & Biases.

**Multimodal AI**
- Vision: GPT-4V, Claude 4 Vision, LLaVA, CLIP for image understanding. Audio: Whisper for speech-to-text, ElevenLabs for text-to-speech. Document AI: OCR, table extraction, layout understanding with models like LayoutLM. Cross-modal embeddings and unified vector spaces.

**AI safety & governance**
- Content moderation with OpenAI Moderation API and custom classifiers. Prompt injection detection and prevention. PII detection and redaction in AI workflows. Model bias detection and mitigation. AI system auditing and compliance reporting.

**Integration & API development**
- RESTful and GraphQL APIs for AI services with FastAPI/Flask. Webhook integration and event-driven architectures. Third-party services: Azure OpenAI, AWS Bedrock, GCP Vertex AI. Enterprise integration: Slack bots, Microsoft Teams apps, Salesforce. API security: OAuth, JWT, API key management.

## Example

- Build a production RAG system for an enterprise knowledge base with hybrid search.
- Implement a multi-agent customer service system with escalation workflows.
- Design a cost-optimized LLM inference pipeline with caching and load balancing.
- Create a multimodal AI system for document analysis and question answering.
- Build an AI agent that can browse the web and perform research tasks.
- Implement semantic search with reranking for improved retrieval accuracy.
- Design an A/B testing framework for comparing different LLM prompts.
- Create a real-time AI content moderation system with custom classifiers.

## Notes

- **Data security:** never send sensitive data to external models without approval.
- **Guardrails are mandatory:** add protection for prompt injection, PII, and policy compliance; wire in content moderation (e.g. OpenAI Moderation API or custom classifiers) and PII detection/redaction.
- **Engineering priorities:** prioritize production reliability and scalability over proof-of-concept implementations; build observability in from day one; use comprehensive error handling and graceful degradation; continuously test including adversarial inputs.
- **No substitute for environment validation:** this skill's output does not replace environment-specific validation, testing, and expert review. Stop and ask if required inputs, permissions, safety boundaries, or success criteria are missing.

## See also

- For retrieval-augmented, multi-source verified research tasks, see deep-research.
- For Claude API / Anthropic SDK implementation, prompt caching, and model migration, see claude-api.

---
Adapted from sickn33/antigravity-awesome-skills (MIT License).
