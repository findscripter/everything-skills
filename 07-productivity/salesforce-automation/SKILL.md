---
name: salesforce-automation
title: Salesforce 自动化
description: 当需要通过 Rube MCP（Composio）自动化 Salesforce CRM 时使用；做潜在客户/联系人/客户/商机/任务的增删查改与 SOQL 查询，产出调用序列与 SOQL 语句；不适用于无 Rube MCP 连接或本地 SQL 数据库；触发词：salesforce、SOQL、CRM 自动化、lead 潜在客户、opportunity 商机、Rube MCP、Composio
domain: 协作/automation
triggers: [salesforce, SOQL, CRM 自动化, lead 潜在客户, opportunity 商机, Rube MCP, Composio]
tags: [salesforce, crm, soql, rube-mcp, composio, automation]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Rube MCP, Composio, RUBE_SEARCH_TOOLS, RUBE_MANAGE_CONNECTIONS, SOQL]
requires: []
related: [deal-pipeline-tracker, zapier-make-automation, sales-prospecting, customer-health-scorer]
combines_with: [deal-pipeline-tracker, zapier-make-automation, cro-revenue-advisor]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 需要在 Salesforce CRM 中创建/搜索/更新潜在客户（Lead）、联系人（Contact）、客户（Account）、商机（Opportunity）、任务（Task）。
- 需要用自定义 SOQL 查询 Salesforce 数据。
- 前提：客户端已接入 Rube MCP，且 `salesforce` 工具包连接状态为 ACTIVE。

不该用的情况：
- 没有 Rube MCP 连接、或不是 Salesforce 环境（本地关系型数据库请用 sql-query-builder）。
- 缺少必填输入、权限或成功判定标准时，先停下来澄清，不要凭空操作生产数据。

## 步骤

1. 确认 Rube MCP 可用：检查 `RUBE_SEARCH_TOOLS` 是否响应。
2. 调用 `RUBE_MANAGE_CONNECTIONS`，toolkit 传 `salesforce`。
3. 若连接非 ACTIVE，按返回的授权链接完成 Salesforce OAuth。
4. 确认状态为 ACTIVE 后再执行任何业务流程。
5. 执行具体操作前，**先调用 `RUBE_SEARCH_TOOLS` 获取当前工具的最新 schema**（参数名/字段可能变化）。

## 指令

接入：把 `https://rube.app/mcp` 加为 MCP server 即可，无需 API Key。

按场景选工具序列（均带 `SALESFORCE_` 前缀）：

- 潜在客户：`SEARCH_LEADS` / `LIST_LEADS` / `CREATE_LEAD` / `UPDATE_LEAD` / `ADD_LEAD_TO_CAMPAIGN` / `APPLY_LEAD_ASSIGNMENT_RULES`。创建必填 `LastName`、`Company`；常用 `Email`、`Phone`、`Title`。
- 联系人与客户：`SEARCH_CONTACTS` / `LIST_CONTACTS` / `CREATE_CONTACT` / `SEARCH_ACCOUNTS` / `CREATE_ACCOUNT` / `ASSOCIATE_CONTACT_TO_ACCOUNT`。Contact 至少需 `LastName`；关联需同时给出有效 `contact_id` 与 `account_id`。
- 商机：`SEARCH_OPPORTUNITIES` / `LIST_OPPORTUNITIES` / `GET_OPPORTUNITY` / `CREATE_OPPORTUNITY` / `RETRIEVE_OPPORTUNITIES_DATA`。创建必填 `Name`、`StageName`、`CloseDate`；`StageName` 必须与 Salesforce 中配置完全一致。
- 任务：`SEARCH_TASKS` / `UPDATE_TASK` / `COMPLETE_TASK`。`Status` 必须匹配选项列表（picklist）值。
- SOQL：`RUN_SOQL_QUERY` 或 `QUERY`，参数 `query`。
- 辅助：`GET_USER_INFO`、`GET_ALL_CUSTOM_OBJECTS`（发现自定义对象）、`CREATE_A_RECORD`（通用建记录，传 `object_type` + fields）、`MASS_TRANSFER_OWNERSHIP`（批量转移归属）。

## 示例

基础查询：
```
SELECT Id, Name, Email FROM Contact WHERE LastName = 'Smith'
```

带关联关系：
```
SELECT Id, Name, Account.Name FROM Contact WHERE Account.Industry = 'Technology'
```

日期过滤（用 Salesforce 日期字面量）：
```
SELECT Id, Name FROM Lead WHERE CreatedDate = TODAY
SELECT Id, Name FROM Opportunity WHERE CloseDate = NEXT_MONTH
```

分页：大结果集返回分页 token，用 `SALESFORCE_QUERY` 配合 `nextRecordsUrl` 翻页；检查响应中的 `done`，为 false 则继续翻页。

## 注意事项

- **字段用 API 名而非显示标签**：例如 `Account.Name` 而不是 “Account Name”；自定义字段以 `__c` 结尾，可用 `GET_ALL_CUSTOM_OBJECTS` 发现。
- **SOQL ≠ SQL**：语法基于 Salesforce 对象与字段 API 名，不能直接套用标准 SQL。
- **ID 格式**：Salesforce ID 为 15 位（大小写敏感）或 18 位（大小写不敏感），多数操作两种均可。
- 风险等级：critical。涉及写操作（创建/更新/批量转移归属）务必先在沙箱或小范围验证，再对生产数据执行。
- 不要把输出当作环境特定校验、测试或专家评审的替代。

## 互见

- sql-query-builder：本地/标准 SQL 查询构建（与 SOQL 区分使用）。

---
本条采编自 sickn33/antigravity-awesome-skills（MIT）。
