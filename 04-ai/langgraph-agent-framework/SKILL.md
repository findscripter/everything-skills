---
name: langgraph-agent-framework
title: LangGraph 智能体编排
description: 当用 LangGraph 构建有状态、多步骤或多智能体 AI 应用时使用；用 StateGraph 设计状态、节点、条件分支、循环、持久化与人审，产出可运行的 ReAct/路由/并行智能体图。不适用于纯单次 LLM 调用、无状态提示链或 TypeScript 主导项目。触发词：langgraph、stateful agent、agent graph、react agent、human-in-the-loop、checkpointer
domain: 智能/agents
triggers: [langgraph, langchain agent, stateful agent, agent graph, react agent, agent workflow, multi-step agent, 智能体编排, 状态图, checkpointer, human-in-the-loop, 条件分支]
tags: [langgraph, agent, 智能体, 状态图, 编排, 持久化, 人审, python, langchain]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [StateGraph, ToolNode, add_messages, SqliteSaver, PostgresSaver, Send, ChatOpenAI]
requires: []
related: [crewai-multi-agent, pydantic-ai-agents, multi-agent-system-designer, multi-agent-workflow-designer]
combines_with: [agent-tool-builder, agent-memory-systems, langfuse-llm-observability]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

需要把 AI 工作流变成**显式、可调试、可恢复**的图时使用 LangGraph。典型场景：

- 单智能体带工具调用（ReAct 模式：思考→调工具→再思考的循环）。
- 多步骤/多智能体共享状态，需要 reducer 控制状态如何合并。
- 按条件路由到不同分支（分类器→不同处理路径）。
- 多轮对话或长任务，需要 checkpointer 持久化与断点续跑。
- 敏感操作前插入人工审批（human-in-the-loop）。
- Map-Reduce 式并行（多主题并发研究后汇总）。

**不该用的边界**：
- 纯单次 LLM 调用、无状态提示链——直接用 LangChain/SDK 即可，引入图反而过度设计。
- TypeScript 为主的项目——LangGraph 主力是 Python（TS 版本仍较早期）。
- 团队不熟悉图/状态概念且任务简单时，调试成本不划算。

前置：Python 3.9+、`langgraph` 包、可用的 LLM API（OpenAI/Anthropic 等）、基本异步与图概念。

## 步骤

构建一个图的固定套路（七步）：

1. **定义状态**：用 `TypedDict`，给需要累加的字段加 `Annotated[type, reducer]`。
2. **定义工具/节点**：节点是函数 `state -> dict`，**只返回要更新的字段**（部分更新）。
3. **绑定工具到 LLM**：`llm.bind_tools(tools)`。
4. **定义路由函数**：返回下一个节点名或 `END`。
5. **建图加边**：`add_node` / `add_edge` / `add_conditional_edges`，循环用回边实现。
6. **编译**：`graph.compile()`；需要记忆/人审时传 `checkpointer=` 和 `interrupt_before=`。
7. **运行**：`app.invoke(input, config)`；带 `thread_id` 实现对话连续性。

关键约束：
- **reducer 决定状态如何合并**——`add_messages` 追加消息（不覆盖），`operator.add` 累加列表，自定义函数可合并字典；不加 reducer 则字段被覆盖。
- **循环必须有终止条件**：路由函数要能返回 `END`，否则无限循环。
- 生产环境务必配 checkpointer（SQLite 开发、PostgreSQL 生产）。

## 指令

- 设计状态先想清楚每个字段「累加还是覆盖」，据此选 reducer。
- 节点返回部分更新，不要返回整个 state。
- 工具执行用预置 `ToolNode(tools)`，不要手写循环。
- 人审用 `interrupt_before=["节点名"]`；恢复时先 `app.update_state(config, {...})` 再 `app.invoke(None, config)`。
- 并行用 `Send("节点名", 子状态)` 从条件边扇出，汇总节点用累加 reducer 收集结果。

## 示例

最小 ReAct 智能体（状态→工具→LLM→路由→建图→运行）：

```python
from typing import Annotated, TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool

class AgentState(TypedDict):
    messages: Annotated[list, add_messages]  # 追加而非覆盖

@tool
def calculator(expression: str) -> str:
    """计算数学表达式。"""
    return str(eval(expression))

tools = [calculator]
llm = ChatOpenAI(model="gpt-4o").bind_tools(tools)

def agent(state: AgentState) -> dict:
    return {"messages": [llm.invoke(state["messages"])]}

def should_continue(state: AgentState) -> str:
    return "tools" if state["messages"][-1].tool_calls else END

graph = StateGraph(AgentState)
graph.add_node("agent", agent)
graph.add_node("tools", ToolNode(tools))
graph.add_edge(START, "agent")
graph.add_conditional_edges("agent", should_continue, ["tools", END])
graph.add_edge("tools", "agent")  # 回边：工具结果交回 agent
app = graph.compile()

result = app.invoke({"messages": [("user", "25 * 4 等于多少？")]})
```

持久化 + 多轮记忆（带 `thread_id`）：

```python
from langgraph.checkpoint.sqlite import SqliteSaver
memory = SqliteSaver.from_conn_string("agent_state.db")  # 生产用 PostgresSaver
app = graph.compile(checkpointer=memory)

config = {"configurable": {"thread_id": "user-123"}}
app.invoke({"messages": [("user", "我叫 Alice")]}, config=config)
app.invoke({"messages": [("user", "我叫什么？")]}, config=config)  # 记得是 Alice

state = app.get_state(config)            # 取当前对话状态
for cp in app.get_state_history(config): # 遍历所有检查点
    print(cp.config, cp.values)
```

人审（执行前暂停审批）：

```python
app = graph.compile(checkpointer=memory, interrupt_before=["execute"])
config = {"configurable": {"thread_id": "approval-flow"}}
app.invoke({"messages": [("user", "发送报告")]}, config)  # 跑到 execute 前暂停

state = app.get_state(config)
print(state.values["pending_action"])     # 人工审阅待执行动作
app.update_state(config, {"approved": True})
app.invoke(None, config)                   # 批准后恢复执行
```

并行 Map-Reduce（用 `Send` 扇出）：

```python
from langgraph.constants import Send

def fanout_topics(state) -> list[Send]:
    return [Send("research", {"topic": t}) for t in state["topics"]]

graph.add_conditional_edges(START, fanout_topics, ["research"])
graph.add_edge("research", "summarize")  # 各分支汇入 summarize
```

## 注意事项

- **无限循环**：带回边的图（agent↔tools）必须有能返回 `END` 的路由条件。
- **状态覆盖陷阱**：忘记加 reducer 会让后写的更新覆盖前一个节点的结果；多智能体共享状态时尤其注意。
- **调试难**：图行为可能不直观，建议接 LangSmith/Langfuse 做可观测与追踪。
- **内存 vs 落盘**：`SqliteSaver.from_conn_string(":memory:")` 进程退出即丢；持久化要给文件路径或用 PostgreSQL。
- **恢复语义**：人审恢复时 `invoke(None, config)`，传 `None` 表示「不追加新输入、从断点继续」。
- 只在任务确实匹配上述场景时使用；输出需经环境内验证、测试与专家评审，缺关键输入/权限/安全边界时先停下来确认。

## 互见

- **crewai**：需要基于角色的多智能体协作时。
- **langfuse**：需要 LLM 可观测性/追踪时。
- **structured-output**：需要结构化 JSON 输出时。
- **agent-evaluation**：需要评测智能体性能时。
- 生产组合：LangGraph 设计图 → 结构化输出规范工具响应 → Langfuse 监控。

---

采编自 sickn33/antigravity-awesome-skills（MIT），原条目上游为 vibeship-spawner-skills（Apache 2.0）。
