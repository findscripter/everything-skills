---
name: crewai-multi-agent
title: CrewAI 角色化多智能体框架
description: 当需要用 Python 搭建角色分工、可协作的多智能体团队时使用；用 CrewAI 设计 Agent 人设（role/goal/backstory）、定义 Task、编排 Crew（顺序/层级流程）并产出可运行的多智能体管线；不适用于显式状态机图编排（用 LangGraph）、单 Agent 简单脚本或非 Python 场景；触发词：crewai、多智能体团队、角色化 Agent、crew、collaborative agents
domain: 智能/agents
triggers: [crewai, 多智能体团队, 角色化智能体, crew 编排, role goal backstory, 层级流程 manager, CrewAI Flow, 多 Agent 协作]
tags: [multi-agent, crewai, agent-orchestration, python, llm, 智能体团队, workflow]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Python 3.10+, crewai, crewai-tools, OpenAI/Anthropic/Ollama API]
requires: []
related: [langgraph-agent-framework, multi-agent-system-designer, multi-agent-workflow-designer, pydantic-ai-agents]
combines_with: [agent-tool-builder, agent-workflow-pattern-designer, llm-agent-benchmarking]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：

- 需要把一个复杂任务拆给多个有明确分工的 AI Agent（如研究员 + 分析师 + 写作者）协作完成。
- 关键词命中：crewai、多智能体团队、角色化 Agent、crew、collaborative agents、role-based agents。
- 需要顺序（sequential）或层级（hierarchical，经理 Agent 调度）流程，或带记忆、规划、事件驱动 Flow 的结构化工作流。

不该用（负边界）：

- 需要显式状态机/图状编排 → 用 LangGraph（CrewAI Flow 仅做轻量事件路由）。
- 单 Agent 一次性简单脚本：CrewAI 对简单场景偏冗长，直接调 LLM 即可。
- 非 Python 环境：CrewAI 仅支持 Python。
- 需要 LLM 可观测/追踪 → 配合 langfuse；需要严格结构化输出 → 配合 structured-output。

前置：Python 3.10+、安装 `crewai`、具备 LLM API（OpenAI/Anthropic/Ollama）、理解「委派」概念。

## 步骤

1. 设计 Agent 人设：每个 Agent 写清 `role`（身份）、`goal`（目标，可含 `{topic}` 占位）、`backstory`（背景，强化专长）。
2. 定义 Task：写 `description`（含步骤要求）、`expected_output`（明确产物格式）、绑定 `agent`，依赖前序结果用 `context` 引用。
3. 选流程：任务线性依赖用 `Process.sequential`；需要动态调度、合并结果用 `Process.hierarchical` 并指定 `manager_llm`。
4. 编排 Crew：传入 `agents`、`tasks`、`process`，按需开 `memory`、`planning`、`tools`。
5. 运行：`crew.kickoff(inputs={...})`，多阶段分支用 Flow。
6. 配置建议：优先用 YAML（`agents.yaml` / `tasks.yaml`）配置 + `@CrewBase` 类，便于维护。

## 指令

- 推荐 YAML 配置 + 装饰器：`@CrewBase` / `@agent` / `@task` / `@crew`，类里用 `Agent(config=self.agents_config['xxx'])`、`Task(config=self.tasks_config['xxx'])`。
- 启动：`result = ContentCrew().crew().kickoff(inputs={"topic": "AI Agents in 2025"})`。
- 层级流程必须给经理模型：`process=Process.hierarchical, manager_llm=ChatOpenAI(model="gpt-4o")`。
- 开启规划：`planning=True, planning_llm=ChatOpenAI(model="gpt-4o")`，运行后可 `print(crew.plan)`。
- 开启记忆：`memory=True`（含短期/长期/实体三类），可自定义 `long_term_memory` / `short_term_memory` 存储与 `embedder`。
- 自定义工具两法：① 继承 `BaseTool`（定义 `name` / `description` / `args_schema` + `_run`）；② `@tool("名称")` 装饰函数。工具经 `tools=[...]` 挂到 Agent。

## 示例

YAML + CrewBase 最小可运行骨架（顺序流程，写作 Crew）：

```yaml
# config/agents.yaml
researcher:
  role: "Senior Research Analyst"
  goal: "Find comprehensive, accurate information on {topic}"
  backstory: "You are an expert researcher known for thorough, accurate research."
  tools: [SerperDevTool, WebsiteSearchTool]
  verbose: true
writer:
  role: "Content Writer"
  goal: "Create engaging, well-structured content"
  backstory: "You transform research into compelling narratives."
  verbose: true
```

```yaml
# config/tasks.yaml
research_task:
  description: "Research the topic: {topic}. Focus on key facts, recent developments, expert and contrarian views. Cite sources."
  agent: researcher
  expected_output: "A report with executive summary, bulleted findings, sources cited."
writing_task:
  description: "Using the research, write an 800-1000 word article about {topic} with clear headers and an actionable conclusion."
  agent: writer
  expected_output: "A polished article ready for publication"
  context: [research_task]   # 复用研究任务输出
```

```python
# crew.py
from crewai import Agent, Task, Crew, Process
from crewai.project import CrewBase, agent, task, crew

@CrewBase
class ContentCrew:
    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'

    @agent
    def researcher(self) -> Agent: return Agent(config=self.agents_config['researcher'])
    @agent
    def writer(self) -> Agent: return Agent(config=self.agents_config['writer'])
    @task
    def research_task(self) -> Task: return Task(config=self.tasks_config['research_task'])
    @task
    def writing_task(self) -> Task: return Task(config=self.tasks_config['writing_task'])
    @crew
    def crew(self) -> Crew:
        return Crew(agents=self.agents, tasks=self.tasks,
                    process=Process.sequential, verbose=True)

# main.py
result = ContentCrew().crew().kickoff(inputs={"topic": "AI Agents in 2025"})
```

层级流程（经理 Agent 动态调度）：

```python
crew = Crew(
    agents=[researcher, analyst, writer],
    tasks=[research_task, analysis_task, writing_task],
    process=Process.hierarchical,
    manager_llm=ChatOpenAI(model="gpt-4o"),  # 经理由谁来分配/委派/合并
    verbose=True,
)
result = crew.kickoff()
```

Flow 事件驱动 + 路由（多阶段含质检分支）：

```python
from crewai.flow.flow import Flow, listen, start, router

class ContentFlow(Flow):
    @start()
    def gather(self):
        self.topic = self.inputs.get("topic", "AI"); return {"topic": self.topic}
    @listen(gather)
    def research(self, req):
        self.research = ResearchCrew().crew().kickoff(inputs=req).raw
    @router(research)
    def quality_check(self, _):
        return "revise" if self.needs_revision(self.research) else "publish"
    @listen("publish")
    def publish(self): return {"status": "published"}

flow = ContentFlow(); flow.kickoff(inputs={"topic": "AI Agents"})
```

## 注意事项

- 产物质量取决于 prompt：`goal` / `backstory` 越具体、`expected_output` 越明确，结果越稳定。
- 顺序流程下用 `context` 串联任务，否则下游 Agent 拿不到上游产物。
- 层级流程务必显式配 `manager_llm`，否则无法委派调度。
- 简单需求别上 CrewAI，避免过度工程化；Flow 是较新特性，用前确认版本能力。
- 该 skill 仅用于明确匹配上述场景的任务；输出不能替代环境内的实测、验证与专家评审；若缺少必要输入、权限、安全边界或成功标准，应先停下来澄清。

## 互见

- 显式状态机/图编排：LangGraph（`langgraph`）。
- LLM 可观测与追踪：`langfuse`（加回调监控 Agent 交互、评估输出）。
- 严格结构化输出：`structured-output`（约束研究/产物 JSON 格式）。
- 相关：`autonomous-agents`。

---

采编自 sickn33/antigravity-awesome-skills（MIT），上游原条目源自 vibeship-spawner-skills（Apache 2.0）。
