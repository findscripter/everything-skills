---
name: langchain-architecture
title: LangChain 架构设计
description: 当用 LangChain 构建带工具、记忆、检索的 LLM 应用与 Agent 时使用；做架构选型与可运行骨架（Agent/Chain/Memory/RAG/回调）并给生产清单；不适用于非 LangChain 的纯 Prompt 调用或与该框架无关的任务；触发词：LangChain、Agent、Chain、记忆、RAG、检索、回调
domain: 智能/agents
triggers: [LangChain, Agent 工具调用, Chain 链式编排, 对话记忆 Memory, RAG 检索问答, 向量库检索, 回调监控 callbacks, 多步 LLM 工作流]
tags: [智能体, agents, langchain, rag, 记忆, 工具调用, llm 工程]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Python, LangChain, OpenAI, Chroma, pytest]
requires: []
related: [langgraph-agent-framework, pydantic-ai-agents, vercel-ai-sdk, llm-app-production-patterns]
combines_with: [rag-implementation-workflow, agent-memory-architecture]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：

- 构建能自主选择工具的 Agent（ReAct、OpenAI Functions、Structured Chat、Conversational、Self-Ask）。
- 编排多步 LLM 工作流（LLMChain / SequentialChain / RouterChain / MapReduce）。
- 管理跨轮对话的上下文与状态（多种 Memory）。
- 把 LLM 接入外部数据/API，做 RAG 文档检索问答。
- 沉淀模块化、可复用的 LLM 应用组件，并推向生产。

不该用（负边界）：

- 任务与 LangChain 框架无关，或只是单次纯 Prompt 调用，无需链/Agent/记忆。
- 需要的是其他领域/工具栈（直接用厂商 SDK、向量库原生 API 等）。
- 缺少必要输入、权限、安全边界或成功标准时，先停下来澄清，不要硬套。

## 步骤

1. 明确目标、约束与必需输入：是问答(RAG)、自主 Agent、还是固定多步流水线？据此选骨架。
2. 选 LLM 与温度（确定性任务用 `temperature=0`）。
3. 选 Memory 类型（见下方对照），按对话长度与是否需实体/语义检索决定。
4. 定义工具：给每个 `@tool` 写清晰 docstring，工具描述质量直接决定 Agent 选对工具的概率。
5. 组装 Agent / Chain，`verbose=True` 便于调试。
6. 挂回调做日志、token 统计、延迟与错误监控。
7. 写测试（工具选择、记忆持久化），按生产清单逐项验证后上线。

## 指令

- 澄清目标、约束与必需输入，再动手。
- 套用对应最佳实践并验证产物（不要把输出当作免测试的成品）。
- 给出可执行步骤与验证方法。
- 缺输入/权限/安全边界/成功标准时停下提问。

Memory 选型对照：

- 短对话(<10 轮)：`ConversationBufferMemory`（存全部）。
- 长对话：`ConversationSummaryMemory(llm=llm)`（摘要旧消息）。
- 滑动窗口：`ConversationBufferWindowMemory(k=5)`（留最近 N 条）。
- 实体跟踪：`ConversationEntityMemory(llm=llm)`。
- 语义检索历史：`VectorStoreRetrieverMemory(retriever=retriever)`。

## 示例

快速起步（带工具+记忆的 Conversational Agent）：

```python
from langchain.agents import AgentType, initialize_agent, load_tools
from langchain.llms import OpenAI
from langchain.memory import ConversationBufferMemory

llm = OpenAI(temperature=0)
tools = load_tools(["serpapi", "llm-math"], llm=llm)
memory = ConversationBufferMemory(memory_key="chat_history")

agent = initialize_agent(
    tools, llm,
    agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
    memory=memory, verbose=True,
)
result = agent.run("What's the weather in SF? Then calculate 25 * 4")
```

RAG 检索问答骨架：

```python
from langchain.chains import RetrievalQA
from langchain.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings

documents = TextLoader('documents.txt').load()
texts = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200).split_documents(documents)
vectorstore = Chroma.from_documents(texts, OpenAIEmbeddings())

qa_chain = RetrievalQA.from_chain_type(
    llm=llm, chain_type="stuff",
    retriever=vectorstore.as_retriever(),
    return_source_documents=True,
)
result = qa_chain({"query": "What is the main topic?"})
```

自定义工具 Agent（docstring 即工具说明）：

```python
from langchain.agents import initialize_agent, AgentType
from langchain.tools import tool

@tool
def search_database(query: str) -> str:
    """Search internal database for information."""
    return f"Results for: {query}"

@tool
def send_email(recipient: str, content: str) -> str:
    """Send an email to specified recipient."""
    return f"Email sent to {recipient}"

agent = initialize_agent(
    [search_database, send_email], llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True,
)
```

多步 SequentialChain（抽取→分析→汇总，靠 output_key 串联）：

```python
from langchain.chains import LLMChain, SequentialChain
from langchain.prompts import PromptTemplate

extract_chain = LLMChain(llm=llm, output_key="entities",
    prompt=PromptTemplate(input_variables=["text"],
        template="Extract key entities from: {text}\n\nEntities:"))
analyze_chain = LLMChain(llm=llm, output_key="analysis",
    prompt=PromptTemplate(input_variables=["entities"],
        template="Analyze these entities: {entities}\n\nAnalysis:"))
summary_chain = LLMChain(llm=llm, output_key="summary",
    prompt=PromptTemplate(input_variables=["entities", "analysis"],
        template="Summarize:\nEntities: {entities}\nAnalysis: {analysis}\n\nSummary:"))

overall_chain = SequentialChain(
    chains=[extract_chain, analyze_chain, summary_chain],
    input_variables=["text"],
    output_variables=["entities", "analysis", "summary"], verbose=True)
```

自定义回调（监控/调试）：

```python
from langchain.callbacks.base import BaseCallbackHandler

class CustomCallbackHandler(BaseCallbackHandler):
    def on_llm_start(self, serialized, prompts, **kwargs): ...
    def on_llm_end(self, response, **kwargs): ...
    def on_llm_error(self, error, **kwargs): ...
    def on_agent_action(self, action, **kwargs): ...

agent.run("query", callbacks=[CustomCallbackHandler()])
```

测试要点（工具选择 + 记忆持久化）：

```python
def test_memory_persistence():
    memory = ConversationBufferMemory()
    memory.save_context({"input": "Hi"}, {"output": "Hello!"})
    assert "Hi" in memory.load_memory_variables({})['history']
```

## 注意事项

常见坑：

1. 记忆溢出：未控制对话历史长度，及时切换 Summary/Window 记忆。
2. 工具选择错误：工具描述含糊会误导 Agent，docstring 要精准。
3. 超出上下文窗口：注意 token 上限，配合分块与摘要。
4. 缺错误处理：未捕获 Agent 失败，需加 try/except 与回退策略。
5. 检索低效：未优化向量库查询（chunk 大小/重叠、检索 top-k）。

性能优化：开启缓存 `langchain.llm_cache = InMemoryCache()`；批量文档用 `ThreadPoolExecutor` 并行切分；交互式场景用 `StreamingStdOutCallbackHandler` 流式输出。

生产清单（上线前逐项核对）：错误处理、请求/响应日志、token 与成本监控、Agent 执行超时、限流、输入校验、边界用例测试、可观测性(回调)、回退策略、Prompt 与配置纳入版本控制。

提醒：仅在任务确实匹配本技能范围时使用；产物不能替代环境内的实测、验证与专家评审。

## 互见

源仓库附带更深资料可参考（如存在）：agents（Agent 架构深潜）、memory（记忆模式）、chains（链组合策略）、document-processing（文档加载与索引）、callbacks（监控与可观测性），以及 agent-template.py / memory-config.yaml / chain-example.py 模板。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
