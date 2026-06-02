---
name: agent-tool-design
title: 面向 Agent 的工具设计
description: 当为 Agent 系统设计/重构工具、排查工具被误用或漏选、精简工具集时使用；做出无歧义的工具契约（描述-触发-参数-返回-错误）、按合并原则整合工具、必要时做架构精简，产出可被模型可靠调用的工具集；不适用于给人类调用的普通 API 设计、单纯写提示词或业务代码实现；触发词：工具设计、tool design、function calling、工具描述、MCP、合并原则、工具太多。
domain: 智能/agents
triggers: [工具设计, tool design, function calling, 工具描述, MCP 工具命名, 合并原则, 工具太多, agent 工具, 工具被误用, 架构精简]
tags: [agent, tool-design, function-calling, mcp, llm]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [agent-tool-builder, mcp-builder, autonomous-coding-agent-patterns, skill-optimizer]
combines_with: [multi-agent-system-designer, langgraph-agent-framework, agent-workflow-pattern-designer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

为 **Agent（语言模型）** 而非人类开发者设计工具时使用。工具是 Agent 与世界交互的主要接口，是确定性系统与非确定性 Agent 之间的**契约**：模型靠工具描述推断契约、推断参数、从自然语言生成调用。设计不当造成的失败，靠堆提示词修不好。

**该用**：新建 Agent 工具/函数调用；排查工具被漏选、错选、参数填错；优化已有工具集（合并/精简/统一命名）；从零设计工具 API；评估第三方/MCP 工具能否接入；跨代码库统一工具约定。

**不该用（边界）**：
- 设计**给人类调用**的普通 REST/SDK API（人类能读文档、理解契约，约束不同）。
- 只是**写提示词模板** → 用 `prompt-template-designer`；只是**实现业务逻辑代码** → 这是工程问题不是工具契约问题。
- 任务该用检索而非工具（取文档片段）→ 用 `rag-pipeline-builder`。

## 步骤 / 指令

```
1. 划分工作流，决定工具粒度（合并原则优先）
   - 列出 Agent 必须完成的「独立工作流」
   - 合并原则：若一个人类工程师都说不清某情境该调哪个工具，Agent 更不可能选对
     → 倾向「单个综合工具」覆盖整条工作流，而非多个窄工具让 Agent 自己串
     反例: list_users + list_events + create_event
     正例: schedule_event（内部找空闲并排期，一次调用完成）
   - 不该合并的情形: 行为根本不同 / 使用语境不同 / 会被独立调用的工具，保持分开
   - 经验规模: 多数应用 10~20 个工具；更多则用命名空间(namespace)分组

2. 评估是否做「架构精简」(把专用工具换成通用原语)
   - 适合: 数据层文档良好且结构一致 / 模型推理力足够 / 现有专用工具在「束缚」而非「赋能」模型 / 维护脚手架的时间多于改进结果
   - 不适合: 底层数据脏乱/无文档 / 领域需模型不具备的专门知识 / 有安全约束须限制能力 / 操作确实复杂需结构化工作流
   - 典型模式: 与其为数据探索/查 schema/校验各建专用工具，不如给一个命令执行工具，让 Agent 用 grep/cat/find/ls 等标准 Unix 原语自由组合
   - 反模式: 为「保护」模型而预过滤上下文、限制选项、层层包校验——这些护栏随模型变强会变成负债
   - 拷问每个工具: 它是在「赋能新能力」还是在「束缚模型本可自理的推理」？为「未来更强的模型」留最小架构

3. 写工具描述（描述即提示词，会被载入 Agent 上下文共同引导行为）
   每个描述回答 4 问:
   - What  做什么: 具体、可证伪；禁用「helps with / can be used for」这类空话
   - When  何时用: 直接触发(「用户问定价」)+ 间接信号(「需要当前市场价」)
   - Input 收什么: 每个参数的类型/约束/默认值，说明它控制什么
   - Return 返回什么: 输出结构 + 成功示例 + 错误情形

4. 设默认值 + 选响应格式
   - 默认值反映最常见用法，减少 Agent 必填项、防漏参出错
   - 提供 format 选项: concise(仅关键字段, 省 token) / detailed(完整对象, 决策需要时)
     并在描述里告诉 Agent 何时选哪种

5. 设计可恢复的错误信息（面向两类读者: 调试的人 + 自我恢复的 Agent）
   - 可重试错误 → 给重试指引
   - 入参错误   → 给正确格式
   - 缺数据     → 说明缺什么
   错误必须告诉 Agent「哪错了 + 怎么改」，而非一句通用报错

6. 统一 schema 与命名
   - 工具名用 动词-名词 (verb-noun)
   - 跨工具参数名一致、返回字段名一致 (别一处 id 一处 identifier 一处 customer_id)

7. 用测试集评估并迭代
   - 判据: 无歧义 / 完整 / 可恢复 / 高效 / 一致
   - 拿代表性的 Agent 请求跑，看生成的调用对不对；按观察到的失败模式迭代
```

**MCP 工具命名（硬约束）**：引用 MCP 工具一律用**全限定名** `ServerName:tool_name`，否则多服务器时会「tool not found」。

```python
# 正确
"Use the BigQuery:bigquery_schema tool to retrieve table schemas."
"Use the GitHub:create_issue tool to create issues."
# 错误（多服务器时可能失败）
"Use the bigquery_schema tool..."
```

**用 Agent 优化工具（反馈闭环）**：把工具规格 + 观察到的失败喂给模型，让它诊断并改进描述。生产实测可把任务完成时间降约 40%。

```python
def optimize_tool_description(tool_spec, failure_examples):
    """1. Agent 跨多任务试用工具  2. 收集失败模式与摩擦点
       3. Agent 分析失败、提改进  4. 用同任务回测新描述"""
    prompt = f"""分析以下工具规格与观察到的失败。
    Tool: {tool_spec}
    Failures observed: {failure_examples}
    识别: 1) 为何失败 2) 描述缺什么信息 3) 哪些歧义导致误用
    给出修复这些问题的改进版工具描述。"""
    return get_agent_response(prompt)
```

## 示例

**好工具**（描述回答 what/when/input/return/errors，参数带格式，错误可恢复）：

```python
def get_customer(customer_id: str, format: str = "concise"):
    """
    Retrieve customer information by ID.
    Use when:
    - User asks about specific customer details
    - Need customer context for decision-making
    - Verifying customer identity
    Args:
        customer_id: Format "CUST-######" (e.g., "CUST-000001")
        format: "concise" for key fields, "detailed" for complete record
    Returns: Customer object with requested fields
    Errors:
        NOT_FOUND: Customer ID not found
        INVALID_FORMAT: ID must match CUST-###### pattern
    """
```

**坏工具**（集多个反模式）：

```python
def search(query):
    """Search the database."""
    pass
```
问题：名字含糊（搜什么、为何搜）；缺参数（哪个库、query 何格式）；无返回说明；无使用语境（何时用它而非别的工具）；无错误处理。
失败模式：该用更专的工具时也调它；猜不出 query 格式；解读不了结果；失败无法恢复。

## 注意事项

- **描述即提示词**：所有工具描述共同占用上下文预算、共同引导选择。每多一个重叠工具 = 多一份描述 token + 多一处「该选哪个」的歧义。
- **合并 ≠ 万能**：行为根本不同、语境不同、会被独立调用的工具别硬绑。
- **别用工具去「束缚」模型**：预过滤/限制选项/层层校验这类护栏，随模型变强会变成负债；反复问「赋能还是束缚」。
- **架构精简有前提**：数据脏乱、领域需专门知识、有安全约束、操作确实复杂时，精简会失败，仍需结构化工作流。
- **命名一致性**是降低认知负荷的关键；MCP 引用必须全限定。
- **错误面向 Agent 恢复**，不是只给人看的 stack trace。
- 投资**文档质量**优先于工具复杂度；研究表明工具描述重叠会让模型混乱，「工具更多」不等于「结果更好」。

## 互见

- requires：`first-principles-thinking` —— 划分工作流、判定工具粒度前，先用它把「Agent 到底要完成哪些独立任务」拆清楚，否则会把错误的边界固化进工具集。
- related：`prompt-template-designer` —— 工具描述本质是提示工程，模板设计的「角色/约束/示例/格式」思路同样适用于写工具描述。
- combines_with：`rag-pipeline-builder` —— 当 Agent 需要外部知识时，检索管道与工具集协同：检索取上下文、工具执行动作。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
