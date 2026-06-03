---
name: n8n-workflow-patterns
title: n8n 工作流架构模式
description: 当需要在动手搭建前为 n8n 工作流选定整体架构、判断该用哪种数据流形态时使用；产出 5 大核心模式选型+构建检查清单+数据流形态+常见坑速查，给出可执行的搭建路径；不适用于单节点逐字段调参或具体节点配置查证（改用 n8n-node-configuration）、表达式书写（改用 n8n-expression-syntax）、结构校验排错（改用 n8n-validation-expert）。触发词：n8n、工作流模式、webhook、定时任务、AI Agent 工作流
domain: 平台/integration
triggers: [n8n, 工作流模式, workflow pattern, webhook 处理, 定时任务, 数据库同步, AI Agent 工作流, 数据流设计]
tags: [n8n, 工作流, 自动化, 集成, 架构模式]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [n8n, n8n-mcp]
requires: []
related: [n8n-mcp-tools-expert, zapier-make-automation, agent-workflow-pattern-designer, business-process-mapper]
combines_with: [salesforce-automation, mcp-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
＃ n8n 工作流架构模式

## 何时使用

- 动手搭 n8n 工作流**之前**，需要先选定整体架构、决定数据怎么流，而不是已经卡在某个节点上。
- 任务属于这几类之一：webhook 处理、HTTP/API 集成、数据库读写同步、AI Agent 编排、定时任务。
- 想要的是高层结构与选型判断，而不是逐节点排错。

**不该用的边界**：
- 要写表达式（`{{...}}`、访问 webhook 数据、引用前序节点）→ 用 `n8n-expression-syntax`。
- 要查某个节点具体支持哪些 operation / 怎么填参数 → 用 `n8n-node-configuration`。
- 工作流已搭好要校验结构、修报错 → 用 `n8n-validation-expert`。
- 要检索/创建节点、部署模板 → 用 `n8n-mcp-tools-expert`。

## 步骤 / 指令

按「**选模式 → 选节点 → 搭 → 校验 → 部署**」推进，单次别求一步到位（迭代搭，平均每次编辑间隔约 56s）。

1. **选模式**：从 5 大核心模式里挑一个（见下「选型」）。能用简单模式解决就别上复杂模式，别在没有清晰边界时混用多种模式。
2. **列节点**：用 `search_nodes` 找齐触发器、数据源、转换、输出、错误处理所需节点。
3. **理数据流**：明确 输入 → 转换 → 输出，并选定数据流形态（线性/分支/并行/循环/错误处理）。
4. **搭建**：按检查清单加触发器 → 数据源 → 配置凭据（用 Credentials 区，别把密钥写进参数）→ 转换（Set/Code/IF）→ 输出 → 错误处理。
5. **校验**：`validate_node` 逐节点 + `validate_workflow` 整体，用样例数据测，覆盖空数据/异常分支。
6. **部署**：复核执行顺序/超时/错误处理设置 → 用 `activateWorkflow` 激活 → 盯首批执行 → 记录用途与数据流。

### 5 大核心模式与选型

| 模式 | 结构 | 何时选 |
|---|---|---|
| **Webhook 处理**（最常见） | Webhook → 校验 → 转换 → 响应/通知 | 接收外部系统数据、Slack 命令、表单、GitHub webhook，需即时响应 |
| **HTTP/API 集成** | 触发 → HTTP Request → 转换 → 动作 → 错误处理 | 拉取外部 API、对接第三方、搭数据管道 |
| **数据库操作** | 定时 → 查询 → 转换 → 写入 → 校验 | 库间同步、定时查询、ETL |
| **AI Agent 工作流** | 触发 → AI Agent（模型 + 工具 + 记忆）→ 输出 | 对话式 AI、需工具调用、多步推理 |
| **定时任务** | 定时 → 拉取 → 处理 → 投递 → 记录 | 周期报表、定期拉数、维护任务 |

### 数据流形态

- **线性** `触发→转换→动作→结束`：单路径简单流程。
- **分支** `触发→IF→[真/假路径]`：按条件走不同动作。
- **并行** `触发→[分支1/分支2]→Merge`：互不依赖、可同时跑的操作。
- **循环** `触发→Split in Batches→处理→回流直到完`：分块处理大数据集。
- **错误处理** `主流程→[成功路径] / [Error Trigger→错误处理]`：独立错误处理子流。

### 通用构件

- **触发器**：Webhook（即时）/ Schedule（周期 cron）/ Manual（测试）/ Polling（轮询）。
- **数据源**：HTTP Request、数据库节点（Postgres/MySQL/MongoDB）、服务节点、Code。
- **转换**：Set（字段映射，最常用）、Code（复杂逻辑）、IF/Switch（条件路由）、Merge（合流）。
- **输出**：HTTP Request、数据库写入、通讯（Email/Slack/Discord）、存储。
- **错误处理**：Error Trigger、IF 判错、Stop and Error、节点级 Continue On Fail。

## 示例

**Webhook → Slack**
```
1. Webhook (path: "form-submit", POST)
2. Set (映射表单字段)
3. Slack (发到 #notifications)
```

**定时报表**
```
1. Schedule (每天 9:00)
2. HTTP Request (拉分析数据)
3. Code (聚合)
4. Email (发格式化报表)
5. Error Trigger → Slack (失败告警)
```

**数据库同步**
```
1. Schedule (每 15 分钟)
2. Postgres (查新记录)
3. IF (有无新记录)
4. MySQL (插入)
5. Postgres (更新同步时间戳)
```

**AI 助手**
```
1. Webhook (收聊天消息)
2. AI Agent
   ├─ OpenAI Chat Model (ai_languageModel)
   ├─ HTTP Request Tool (ai_tool)
   ├─ Database Tool (ai_tool)
   └─ Window Buffer Memory (ai_memory)
3. Webhook Response (回 AI 答复)
```

**API 集成（分批 + 循环）**
```
1. Manual Trigger (测试用)
2. HTTP Request (GET /api/users)
3. Split In Batches (每批 100)
4. Set (转换用户数据)
5. Postgres (upsert)
6. Loop (回到 3 直到完)
```

## 注意事项

常见坑（速查）：

1. **Webhook 取不到数据**：payload 嵌在 `$json.body` 下。
   ```javascript
   ❌ {{$json.email}}
   ✅ {{$json.body.email}}
   ```
2. **多输入项只想要一条**：用 "Execute Once" 模式，或 `{{$json[0].field}}` 取首项。
3. **认证 401/403**：凭据填 Credentials 区而非参数，激活前先测凭据。
4. **节点执行顺序异常**：查 工作流设置 → Execution Order，用 v1（基于连接，推荐），别用 v0（自上而下，遗留）。
5. **表达式被当字面文本**：表达式要包 `{{}}`，细节见 `n8n-expression-syntax`。

其它约束：所有工作流都加错误处理；激活前必测、必校验；用描述性节点名并在 notes 字段记录复杂流程；别硬编码凭据，别忽略空数据场景。

> 本技能给的是架构选型与流程骨架，不替代针对你具体环境的校验、测试与专家复核。缺关键输入/权限/成功判据时，先停下来确认。

## 互见

- related：`n8n-expression-syntax` —— 转换节点里写表达式、正确访问 webhook 数据。
- related：`n8n-node-configuration` —— 模式选定后查具体节点 operation 与参数。
- combines_with：`n8n-mcp-tools-expert` —— 检索/创建节点、部署模板、AI Agent 指引。
- combines_with：`n8n-validation-expert` —— 部署前校验工作流结构、修错。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
