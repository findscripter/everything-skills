---
name: agent-tool-design-patterns
title: 智能体工具设计：可被 Agent 高效调用的工具
description: 当为 Agent 系统设计/重构工具集、排查工具误用或优化既有工具时使用；产出无歧义的工具描述、整合后的工具清单与可恢复的错误信息；不适用于给人类开发者写的普通 API 文档、与 Agent 无关的接口设计；触发词：工具设计、tool design、MCP、工具整合、错误信息
domain: 智能/agents
triggers: [为 Agent 系统新建工具, 排查工具调用失败或误用, 优化既有工具集提升 Agent 表现, 从零设计工具 API, 评估第三方工具能否给 Agent 用, 统一代码库里的工具命名约定, 工具描述写得太模糊导致 Agent 乱调, MCP 工具找不到 / tool not found]
tags: [工具设计, agent, mcp, tool-design, api, 上下文工程, 错误处理, 命名约定]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Edit, Write]
requires: []
related: [agent-tool-design, agent-tool-builder, agent-readiness-aeo-check, mcp-builder]
combines_with: [langgraph-agent-framework, multi-agent-system-designer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

工具是 Agent 与世界交互的主要通道，是确定性系统与非确定性 Agent 之间的「契约」。与面向开发者的传统 API 不同，工具 API 是写给语言模型看的——模型要从自然语言意图里推断该调哪个工具、填什么参数。描述写得差，再多 prompt 工程也救不回来。

**该用：**
- 为 Agent 系统新建工具，或从零设计工具 API
- 排查工具相关的失败 / 误用
- 优化既有工具集以提升 Agent 表现
- 评估第三方工具能否接入 Agent
- 在代码库里统一工具命名 / 返回字段约定

**不该用（负边界）：**
- 给人类开发者写的普通 SDK / REST 文档——人能读契约、会主动纠错，约束没这么强
- 与 Agent 调用无关的纯后端接口设计
- 底层数据脏乱、文档缺失时，别急着做「架构精简」（见下）

## 步骤

1. **梳理工作流**：列出 Agent 真正要完成的独立工作流，而非现有函数。
2. **整合工具**：把同一工作流的相关动作合并成单个综合工具（见整合原则）。
3. **写好描述**：每个工具回答四问——做什么 / 何时用 / 收什么入参 / 返回什么。
4. **定默认值与返回格式**：默认值贴合常见场景；提供 concise / detailed 两档输出控制 token。
5. **设计可恢复错误**：错误信息要告诉 Agent「错在哪、怎么改」。
6. **统一约定**：动词-名词命名，跨工具复用同名参数与返回字段。
7. **控制规模**：多数应用 10-20 个工具，超出就用命名空间分组。
8. **用真实 Agent 请求测试**，并按观察到的失败模式迭代。

## 指令

**整合原则（核心）**：如果一个人类工程师都说不清某场景下该用哪个工具，就别指望 Agent 能做对。优先用单个综合工具覆盖整条工作流，而非让 Agent 串联多个窄工具。
- 反例：`list_users` + `list_events` + `create_event`
- 正例：`schedule_event`（内部查可用时段并完成排期）
- **但不要硬整合**：行为根本不同、用在不同上下文、可能被独立调用的工具，应保持分离。

**架构精简（整合的极致）**：把大量专用工具换成一个通用原语。典型是「文件系统 Agent 模式」——只给一个命令执行工具，让 Agent 用 `grep` `cat` `find` `ls` 自由探索。
- 适用：数据层文档完善且结构一致；模型推理能力够；你的专用工具是在「束缚」而非「赋能」模型。
- 失败：底层数据脏乱 / 缺文档；领域需模型不具备的专业知识；有安全约束必须限制 Agent 能做什么。
- 反模式：为「保护」模型而预过滤上下文、收窄选项、层层包验证逻辑。随着模型变强，这些护栏会变成负债。每加一个工具都问：它在**赋能新能力**，还是在**束缚**模型本可自行处理的推理？为未来的模型留余地。

**MCP 命名要求**：始终用全限定名 `ServerName:tool_name`，否则多服务器场景会报 "tool not found"。
```python
# 正确：全限定名
"Use the BigQuery:bigquery_schema tool to retrieve table schemas."
# 错误：未限定，多服务器时可能失败
"Use the bigquery_schema tool..."
```

**用 Agent 优化工具**：把工具规格 + 观察到的失败喂给模型，让它诊断并改进描述，形成反馈闭环。生产实测可降低约 40% 任务完成时间。
```python
def optimize_tool_description(tool_spec, failure_examples):
    """让 Agent 分析工具失败并改进描述。
    1. Agent 在多样任务上尝试调用该工具
    2. 收集失败模式与摩擦点
    3. Agent 分析失败、提出改进
    4. 用同一批任务测试改进后的描述
    """
    prompt = f"""分析以下工具规格与观察到的失败。
    Tool: {tool_spec}
    Failures observed:
    {failure_examples}
    指出：1) Agent 为何失败 2) 描述缺了什么信息 3) 哪些歧义导致误用
    给出改进后的工具描述。"""
    return get_agent_response(prompt)
```

## 示例

**好工具**——名字、入参格式、返回、错误一应俱全：
```python
def get_customer(customer_id: str, format: str = "concise"):
    """
    按 ID 获取客户信息。
    何时用：
    - 用户询问某客户的具体信息
    - 需要客户上下文来做决策 / 核验身份
    Args:
        customer_id: 格式 "CUST-######"（如 "CUST-000001"）
        format: "concise" 仅关键字段，"detailed" 完整记录
    Returns:
        含所请求字段的客户对象
    Errors:
        NOT_FOUND: 客户 ID 不存在
        INVALID_FORMAT: ID 必须匹配 CUST-###### 模式
    """
```

**坏工具**——典型反模式集合：
```python
def search(query):
    """Search the database."""
    pass
```
问题：名字含糊（搜什么）；缺参数说明（哪个库、query 什么格式）；无返回描述；无使用上下文；无错误处理。结果：Agent 不知何时该用、填不对格式、读不懂结果、错了也无法恢复。

## 注意事项

- **要避免的反模式**：含糊描述（「helps with…」）、神秘参数名（`x` / `val` / `param1`）、缺错误处理、命名不一致（一会 `id` 一会 `identifier` 一会 `customer_id`）。
- **描述即 prompt**：工具描述会进上下文并共同塑造 Agent 行为，它不是文档，是 prompt 工程。
- **默认值**应反映常见用法，减少 Agent 负担、避免漏参出错。
- **返回格式**显著影响上下文占用：concise 仅返回必要字段用于确认，detailed 返回完整对象用于决策；并在描述里说明何时用哪档。
- **错误信息面向两类读者**：开发者调试 + Agent 恢复。对可重试错误给重试指引，对入参错误给正确格式，对缺数据给所需内容。
- **工具数量**：研究表明描述重叠会让模型混淆，工具不是越多越好；多数应用 10-20 个，超出用命名空间分组，或用「伞形工具」路由到子工具。
- **评测维度**：无歧义、完整、可恢复、高效、一致——用代表性请求测出实际调用再评判。

## 互见

- 上下文工程 / context-fundamentals：工具如何与上下文交互
- 多 Agent 模式 / multi-agent-patterns：按 Agent 配置专用工具
- 评测 / evaluation：工具有效性的测试方法
- 外部：MCP（Model Context Protocol）文档、各框架工具约定

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
