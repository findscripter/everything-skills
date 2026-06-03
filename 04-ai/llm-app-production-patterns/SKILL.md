---
name: llm-app-production-patterns
title: LLM 应用生产级模式
description: 当需要在 RAG 检索策略、智能体架构（ReAct/函数调用/计划执行/多智能体）、Prompt 编排与生产可靠性模式之间选型并落地时使用；做按"架构决策矩阵"挑选模式并产出可运行实现骨架（混合检索、ReAct/工具调用循环、Prompt 链、缓存/限流/重试/回退、LLMOps 指标与评测）；不适用于无 LLM 的传统 ML、与 AI 无关的 UI 改动，或尚无数据源/部署目标时；触发词：RAG、ReAct、函数调用、计划执行、多智能体、Prompt 链、LLMOps、缓存限流回退
domain: 智能/agents
triggers: [选哪种智能体架构, ReAct 模式, 函数调用 Agent, 计划执行 Plan-and-Execute, 多智能体协作, RAG 检索策略选型, 混合检索, Prompt 链与版本化, LLMOps 指标与评测, 缓存限流重试回退, 架构决策矩阵]
tags: [智能, agents, llm, rag, react, function-calling, multi-agent, llmops, 可靠性]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Python, 向量数据库(Pinecone/Weaviate/Chroma/pgvector), OpenAI/Anthropic SDK, Redis, tenacity, OpenTelemetry]
requires: []
related: [production-llm-app-builder, autonomous-coding-agent-patterns, agent-workflow-pattern-designer, langchain-architecture]
combines_with: [rag-implementation-workflow, cost-aware-llm-pipeline]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
本条目是 **生产级 LLM 应用的模式目录 + 选型指南**：在多种 RAG 检索策略、智能体架构、Prompt 编排与生产可靠性模式之间，依据「架构决策矩阵」快速选型，并给出每种模式的最小可运行实现骨架。偏「选哪个模式、怎么落地」；若你要的是端到端架构与工程化总览，见互见 `production-llm-app-builder`。

## 何时使用

适用：
- 在 RAG 检索策略（语义/混合/多查询/上下文压缩）之间选型。
- 在智能体架构（ReAct / 函数调用 / 计划执行 / 多智能体）之间选型并搭骨架。
- 落地 Prompt 模板、版本化/A-B、Prompt 链等编排模式。
- 加生产护栏：缓存、限流、重试、回退，以及 LLMOps 指标与评测。

不该用（负边界）：
- 任务是无 LLM 的传统 ML / 纯数据科学。
- 只是与 AI 无关的 UI 改动。
- 还没有可访问的数据源或部署目标（先补齐输入再开工）。
- 缺必要输入、权限、安全边界或成功标准时，先停下来澄清，不要硬套模式。

## 步骤 / 指令

**第 1 步：用决策矩阵选模式**（复杂度/成本递增）：

| 模式 | 何时用 | 复杂度 | 成本 |
|---|---|---|---|
| 简单 RAG | FAQ、文档检索 | 低 | 低 |
| 混合 RAG | 语义+关键词混合查询 | 中 | 中 |
| ReAct 智能体 | 多步推理任务 | 中 | 中 |
| 函数调用 | 结构化工具调用 | 低 | 低 |
| 计划-执行 | 复杂、可分解的长任务 | 高 | 高 |
| 多智能体 | 研究型/角色分工任务 | 很高 | 很高 |

**第 2 步：按选中的模式落地。**

- **RAG 检索**：默认 `语义检索`；查询既含语义又含精确关键词时上 `混合检索`（向量 + BM25，用 RRF 倒数排名融合，`alpha` 控比例：1.0 纯语义 / 0.0 纯关键词 / 0.5 均衡）；召回不足上 `多查询`（LLM 生成 3 个查询变体后去重）；token 紧张上 `上下文压缩`（先召回再抽取相关片段）。分块默认 `chunk_size=512` tokens、`chunk_overlap=50`、`separators=["\n\n","\n",". "," "]`。向量库选型：原型用 Chroma，已有 Postgres 用 pgvector，规模化用 Pinecone/Weaviate。Embedding：通用 `text-embedding-3-small`(1536) / 复杂查询 `text-embedding-3-large`(3072) / 自托管 `bge-large`(1024)。生成阶段强约束「仅依据给定上下文作答，信息不足时明说」并回带引用。

- **智能体架构**：
  - `ReAct`：Thought→Action→Observation 循环，设 `max_iterations`（默认 10）防失控；适合需要边推理边取信息的多步任务。
  - `函数调用`：把工具定义成带 JSON Schema 的函数，`tool_choice="auto"`，循环执行 tool_calls 并回填 `role:"tool"` 消息直到无工具调用；结构化、可靠、成本低，能用就优先用。
  - `计划-执行`：先 `create_plan` 出步骤列表，逐步执行，必要时 `replan`，最后 `synthesize`；适合可分解的复杂长任务。
  - `多智能体`：coordinator 拆分 → 角色 Agent（researcher/analyst/writer/critic）协作 → critic 评审 → 不达标带反馈迭代；仅在研究型任务用，成本最高。

- **Prompt 编排**：模板做变量校验（缺变量即抛错）+ few-shot 注入；Prompt 入 registry 做 `version` 化、按 `hash(user_id) % len(variants)` 分桶 A/B、`record_outcome` 追踪效果；多步用 Prompt 链（前一步输出作下一步输入，如 research→analyze→summarize）。

- **生产可靠性护栏**（缺一不可上线）：
  - 缓存：以 `sha256(model:prompt:kwargs)` 为 key，**仅缓存 `temperature==0` 的确定性输出**，设 TTL。
  - 限流：滑动窗口按 RPM 控速，超限则 sleep 到窗口释放。
  - 重试：指数退避 `wait_exponential(min=4,max=60)` + `stop_after_attempt(5)`；**只重试 RateLimit 和 5xx，不重试 4xx 客户端错误**。
  - 回退：primary→fallbacks 多模型链（如 gpt-4-turbo → gpt-3.5-turbo → claude-3-sonnet），全失败再抛 `AllModelsFailedError`。

- **LLMOps 可观测**：跟踪性能(`latency_p50/p99`、`tokens_per_second`)、质量(`user_satisfaction`、`task_completion`、`hallucination_rate`)、成本(`cost_per_request`、`cache_hit_rate`)、可靠性(`error_rate`、`timeout_rate`、`retry_rate`)；日志截断 prompt 存储、用 OpenTelemetry span 打 `prompt.length`/`tokens.total`；评测维度 = 相关性/连贯性/可溯源性/准确率/安全性，在测试集上跑 benchmark 汇总。

**第 3 步：验证。** 用测试集 + 对抗性输入跑评测，分阶段灰度，再放量。

## 示例

ReAct 循环骨架（关键约束：`max_iterations` 防失控）：

```python
class ReActAgent:
    def __init__(self, tools, llm):
        self.tools = {t.name: t for t in tools}
        self.llm = llm
        self.max_iterations = 10

    def run(self, question: str) -> str:
        prompt = REACT_PROMPT.format(
            tools_description=self._format_tools(), question=question)
        for _ in range(self.max_iterations):
            response = self.llm.generate(prompt)
            if "Final Answer:" in response:
                return self._extract_final_answer(response)
            action = self._parse_action(response)
            observation = self._execute_tool(action)
            prompt += f"\nObservation: {observation}\n"
        return "Max iterations reached"
```

混合检索（语义 + BM25，RRF 融合）：

```python
def hybrid_search(query: str, top_k: int = 5, alpha: float = 0.5):
    # alpha=1.0 纯语义 / 0.0 纯关键词(BM25) / 0.5 均衡
    semantic_results = vector_db.similarity_search(query)
    keyword_results = bm25_search(query)
    return rrf_merge(semantic_results, keyword_results, alpha)
```

缓存 + 重试护栏（核心约束已标注）：

```python
def _cache_key(self, prompt, model, **kwargs):
    content = f"{model}:{prompt}:{json.dumps(kwargs, sort_keys=True)}"
    return hashlib.sha256(content.encode()).hexdigest()

# 仅缓存确定性输出
if kwargs.get("temperature", 1.0) == 0:
    self.redis.setex(key, self.ttl, response)

@retry(wait=wait_exponential(multiplier=1, min=4, max=60),
       stop=stop_after_attempt(5))
def call_llm_with_retry(prompt: str) -> str:
    try:
        return llm.generate(prompt)
    except RateLimitError:
        raise                       # 重试限流
    except APIError as e:
        if e.status_code >= 500:
            raise                   # 重试 5xx
        raise                       # 不重试 4xx
```

## 注意事项

- **能用函数调用就别上 ReAct/多智能体**：复杂度和成本随矩阵向下陡增，先用最低复杂度模式跑通。
- **缓存只对确定性输出生效**：`temperature>0` 的输出缓存会返回错误的复用结果，务必只缓存 `temperature==0`。
- **重试要区分错误类型**：4xx 客户端错误重试无意义且浪费配额，只重试 RateLimit 与 5xx。
- **RAG 生成必须强约束 + 回带引用**：提示词限定「仅依据上下文作答，信息不足时明说」，并返回 `sources`，降低幻觉。
- **从第一天就内建可观测性与护栏**：缓存/限流/重试/回退/评测属于上线前置项，不是事后补丁。
- 本技能输出不能替代针对具体环境的验证、测试与专家评审；缺输入/权限/安全边界时先澄清。

## 互见

- related：`production-llm-app-builder` —— 同源的端到端生产级 LLM/RAG 架构与工程化总览（本条聚焦「选模式 + 模式骨架」，那条聚焦全链路落地）。
- related：`rag-pipeline-builder`、`hybrid-search-retrieval` —— RAG 检索流水线与混合检索的专项深化。
- related：`multi-agent-system-designer`、`agent-workflow-pattern-designer`、`agent-tool-builder` —— 多智能体/工作流/工具设计的专项。
- combines_with：`langfuse-llm-observability` —— 给本条的 LLMOps 指标接入可观测平台。
- combines_with：`cost-aware-llm-pipeline`、`llm-model-router` —— 把缓存/回退/路由做成成本可控的推理链路。
- combines_with：`llm-prompt-optimizer` —— 深化本条的 Prompt 模板/版本化/A-B 编排。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
