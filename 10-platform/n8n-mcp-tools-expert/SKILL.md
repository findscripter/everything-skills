---
name: n8n-mcp-tools-expert
title: n8n-mcp 工具专家
description: 当用 n8n-mcp MCP 工具集搜节点、校验配置、套模板或增删改工作流时使用；做工具选型、参数格式与迭代流程指引，产出可落地的搜索→校验→建流→激活闭环；不适用于在 n8n UI 手工拖拽或不走 MCP 的场景；触发词：n8n-mcp、search_nodes、validate_node、n8n_update_partial_workflow、nodeType
domain: 平台/mcp
triggers: [n8n-mcp, n8n MCP 工具, search_nodes, get_node, validate_node, validate_workflow, n8n_create_workflow, n8n_update_partial_workflow, n8n_deploy_template, search_templates, nodeType 格式, nodes-base 前缀, 校验 profile, 智能参数 branch case, auto-sanitization]
tags: [n8n, mcp, 工作流自动化, 节点校验, 工具选型, 模板部署, 平台]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [search_nodes, get_node, validate_node, validate_workflow, n8n_create_workflow, n8n_update_partial_workflow, n8n_validate_workflow, n8n_deploy_template, search_templates, get_template, tools_documentation, ai_agents_guide, n8n_health_check]
requires: []
related: [n8n-workflow-patterns, mcp-builder, zapier-make-automation, agent-workflow-builder]
combines_with: [multi-agent-orchestrator, salesforce-automation]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
通过 n8n-mcp MCP 服务的一组工具来发现节点、校验配置、套用模板并迭代构建工作流。本条聚焦"用哪个工具、参数怎么填、流程怎么走"。

## 何时使用
- 正在用 `n8n-mcp` 工具集发现节点、校验配置或管理工作流。
- 需要在多个 MCP 工具间选型，或搞清某工具的参数格式与调用套路。
- 想通过 n8n MCP（而非纯 n8n UI 手工拖拽）创建或编辑工作流。

不该用的边界：
- 任务只在 n8n UI 内手工操作、不经过 MCP 工具时。
- 需要 n8n 表达式语法、Code 节点编码、具体节点的逐操作字段含义等细节时——交给互见中的专项技能。
- 当作环境实测的替代品：本条只给方法，部署前仍须在目标实例校验/测试。
- 缺少必要输入、权限或成功判据时，先停下来澄清，别硬猜。

## 步骤（标准闭环）
1. `search_nodes({query})` 按关键词找节点。
2. `get_node({nodeType})` 看操作与属性（默认 `detail:"standard"`，覆盖约 95% 场景）。
3. `validate_node({nodeType, config, profile:"runtime"})` 校验配置，按错误改、再校验，直到干净。
4. `n8n_create_workflow({name, nodes, connections})` 建流。
5. `n8n_validate_workflow({id})` 校验整流。
6. `n8n_update_partial_workflow({id, intent, operations})` **迭代**编辑（最常用，边均约 56s，别想一次成型）。
7. `n8n_update_partial_workflow({operations:[{type:"activateWorkflow"}]})` 通过 API 激活上线。

## 指令（关键约束）

**nodeType 两套前缀——选错就报 "Node not found"：**
- 搜索/校验类工具用**短前缀**：`nodes-base.slack`、`nodes-langchain.agent`。适用 `search_nodes`、`get_node`、`validate_node`、`validate_workflow`。
- 工作流类工具用**全前缀**：`n8n-nodes-base.slack`、`@n8n/n8n-nodes-langchain.agent`。适用 `n8n_create_workflow`、`n8n_update_partial_workflow`。
- `search_nodes` 同时返回两种：`nodeType`（搜/校验用）与 `workflowNodeType`（建流用），直接取对应字段即可。

**校验 profile 必须显式指定**（否则误报或漏报）：
- `minimal` 极宽松（仅必填）｜`runtime` 标准、推荐（值+类型，部署前用）｜`ai-friendly` 为 AI 配置降误报｜`strict` 最严（生产）。

**自动消毒（auto-sanitization）**：任何一次工作流更新都会对**所有节点**触发。
- 会自动修：二元运算符（equals/contains）去掉 `singleValue`；一元运算符（isEmpty/isNotEmpty）补 `singleValue:true`；IF/Switch 补缺失元数据。
- 不能修：断开的连线、分支数不匹配、自相矛盾的损坏状态——这些得自己处理。

**智能参数**：多输出节点连线别手算 `sourceIndex`，用语义参数 `branch:"true"/"false"`（IF）、`case:0`（Switch）。

**intent 参数**：每次 `n8n_update_partial_workflow` 都带 `intent` 描述意图，工具响应更有用。

## 示例

节点发现：
```javascript
search_nodes({query: "slack", mode: "OR", limit: 20})
// → nodes-base.slack, nodes-base.slackTrigger
get_node({nodeType: "nodes-base.slack", includeExamples: true})
get_node({nodeType: "nodes-base.slack", mode: "docs"})  // 可读文档
get_node({nodeType: "nodes-base.httpRequest", mode: "search_properties", propertyQuery: "auth"})
```

校验循环：
```javascript
validate_node({
  nodeType: "nodes-base.slack",
  config: {resource: "channel", operation: "create"},
  profile: "runtime"
})
// result.errors → "Missing required field: name" → 补 config.name → 再校验
```

带智能参数的连线：
```javascript
n8n_update_partial_workflow({
  id: "abc",
  intent: "Connect IF true branch to handler",
  operations: [
    {type: "addConnection", source: "IF", target: "True Handler", branch: "true"},
    {type: "addConnection", source: "Switch", target: "Handler A", case: 0}
  ]
})
```

模板：搜索→部署：
```javascript
search_templates({query: "webhook slack", limit: 20})
search_templates({searchMode: "by_nodes", nodeTypes: ["n8n-nodes-base.httpRequest", "n8n-nodes-base.slack"]})
get_template({templateId: 2947, mode: "structure"})  // 或 mode:"full"
n8n_deploy_template({templateId: 2947, name: "My Weather to Slack", autoFix: true, autoUpgradeVersions: true})
```

自助与体检：
```javascript
tools_documentation({topic: "search_nodes", depth: "full"})
ai_agents_guide()                       // AI 工作流架构/连接/最佳实践
n8n_health_check({mode: "diagnostic"})  // 状态、环境变量、API 连通性
```

## 注意事项
- 工具可用性：`search_nodes`/`get_node`/`validate_node`/`validate_workflow`/`search_templates`/`get_template`/`tools_documentation`/`ai_agents_guide` 无需 n8n API 即可用。`n8n_create_workflow`/`n8n_update_partial_workflow`/按 ID 的 `n8n_validate_workflow`/`n8n_list_workflows`/`n8n_get_workflow`/`n8n_test_workflow`/`n8n_executions`/`n8n_deploy_template`/`n8n_workflow_versions`/`n8n_autofix_workflow` 需要 `N8N_API_URL`+`N8N_API_KEY`。API 不可用时，退而用模板与"仅校验"流程。
- 别默认 `detail:"full"`（3–8K tokens，浪费）；只在调试复杂配置、需要完整嵌套 schema 时用。多数情况 `standard` 足够；要可读说明用 `mode:"docs"`，找单个属性用 `mode:"search_properties"`。
- 别把全前缀 `n8n-nodes-base.*` 喂给搜索/校验工具；别忘了节点前缀（`nodes-base.*`）。
- 工作流是**迭代**构建的，不是一次成型；每次重大改动后都校验；建完别忘激活。
- 性能参考：`search_nodes` <20ms｜`get_node`(standard) <10ms｜`validate_node` <100ms｜`validate_workflow`/`n8n_create_workflow` 100–500ms｜`n8n_update_partial_workflow` 50–200ms。

## 互见
- n8n 表达式语法：在工作流字段里写表达式。
- n8n 工作流模式：来自模板的架构范式。
- n8n 校验专家：解读校验错误。
- n8n 节点配置：逐操作的字段要求。
- n8n Code（JavaScript / Python）：在 Code 节点写脚本。
- 源附带的详细指南：SEARCH_GUIDE.md（节点发现）、VALIDATION_GUIDE.md（配置校验）、WORKFLOW_GUIDE.md（工作流管理，含 17 种 operation、8 种 AI 连接类型）。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
