---
name: jira-expert
title: Jira 项目与工作流专家
description: 当需要在 Atlassian Jira 中建项目、配工作流、写 JQL、做仪表盘/报表、配自动化与自定义字段时使用；产出可执行的 MCP 命令、JQL 语句和配置步骤；不适用于飞书/Trello 等非 Jira 工具，也不做组织级权限/许可/账号开通（应升级给 Atlassian 管理员）。触发词：Jira、JQL、Sprint/冲刺、工作流
domain: 协作/pm
triggers: [Jira, JQL, Sprint, 冲刺, 工作流, 看板, Scrum, 燃尽图, 速度图, 自定义字段, 仪表盘, automation 自动化, issue 工单, backlog 待办]
tags: [协作, 项目管理, jira, atlassian, jql, 工作流, 敏捷, scrum, 看板, 报表]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Jira MCP Server, JQL]
requires: []
related: [agile-product-owner, confluence-space-architect, atlassian-admin, enterprise-project-manager]
combines_with: [agile-product-owner, confluence-space-architect, atlassian-template-builder]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

当你在 Atlassian Jira 里做以下任意一类技术/运维操作时使用本技能：

- 新建并配置项目（Scrum / Kanban / Bug 跟踪），设置工作流、自定义字段、看板与待办视图。
- 编写或调优 JQL 高级查询（逾期、陈旧、跨项目 Epic 跟踪、速度统计、团队容量）。
- 设计工作流状态机（状态、转换、条件、校验器、后置函数）与方案关联。
- 搭建仪表盘 / 报表 gadget、配置自动化规则、做批量改单。

**不该用本技能的边界：**
- 非 Jira 工具（飞书任务、Trello、Asana、Linear 等）→ 用对应工具技能。
- 组织级动作：新建项目权限方案、跨组织工作流方案、用户开通/注销、许可与账单、系统级配置 → 升级给 **Atlassian 管理员**，本技能不直接执行。
- 团队层的冲刺看板节奏、待办优先级排序等敏捷实践协作 → 交给 Scrum Master；组合级报表交给 Senior PM。

## 步骤 / 指令

主要工具为 **Jira MCP Server**。常用命令（即抄即用）：

**建项目**
```
mcp jira create_project --name "My Project" --key "MYPROJ" --type scrum --lead "user@example.com"
```

**跑 JQL 查询**
```
mcp jira search_issues --jql "project = MYPROJ AND status != Done AND dueDate < now()" --maxResults 50
```

**更新工单字段**
```
mcp jira update_issue --issue "MYPROJ-42" --field "status" --value "In Progress"
```

**创建冲刺**
```
mcp jira create_sprint --board 10 --name "Sprint 5" --startDate "2024-06-01" --endDate "2024-06-14"
```

**创建共享过滤器**
```
mcp jira create_filter --name "Open Blockers" --jql "priority = Blocker AND status != Done" --shareWith "project-team"
```

**1. 建项目流程**
1. 确定项目类型（Scrum / Kanban / Bug 跟踪）。
2. 用合适模板创建项目。
3. 配置：名称、Key、描述、项目负责人与默认经办人、通知方案、权限方案。
4. 设置工单类型与工作流。
5. 按需配置自定义字段。
6. 创建初始看板 / 待办视图。
7. **交接**：移交 Scrum Master 做团队上手。

**2. 工作流设计流程**
1. 梳理流程状态（To Do → In Progress → Done）。
2. 定义转换及其条件（conditions）。
3. 添加校验器（validators）、后置函数（post-functions）、条件。
4. 配置工作流方案。
5. **务必先验证**：先部署到测试项目，确认所有转换、条件、后置函数行为符合预期，再关联到生产项目。
6. 关联工作流到项目。
7. 用样例工单测试。

**3. JQL 构建**
- 基本结构：`字段 运算符 值`。
- 运算符：`=, !=`（等/不等）、`~, !~`（含/不含）、`>, <, >=, <=`、`in, not in`、`is empty / is not empty`、`was / was in / was not`、`changed`。
- 常用函数：
  - 日期：`startOfDay()`、`endOfDay()`、`startOfWeek()`、`startOfMonth()`、`startOfYear()`（及对应 `endOf...()`）。
  - 冲刺：`openSprints()`、`closedSprints()`、`futureSprints()`。
  - 用户：`currentUser()`、`membersOf("group")`。
  - 高级：`issueHistory()`、`linkedIssues()`、`issuesWithFixVersions()`。

**4. 仪表盘**
1. 新建仪表盘（个人或共享）。
2. 添加 gadget：Filter Results（基于 JQL）、Sprint Burndown、Velocity Chart、Created vs Resolved、Pie Chart（状态分布）。
3. 排版以便阅读，配置自动刷新，按团队共享。

**5. 自动化规则**
1. 定义触发器（工单创建 / 字段变更 / 定时）。
2. 加条件（可选）。
3. 定义动作：更新字段、发通知、创建子任务、流转工单、发评论。
4. 用样例数据测试后启用并监控。

**6. 批量操作（高风险）**
1. 用 JQL 锁定目标工单。
2. 选批量操作类型、要更新的字段。
3. **执行前预览所有变更**，确认 JQL 只命中目标工单——批量改单极难回滚；先小批量验证再放量。
4. 执行并确认，监控后台任务。

## 示例

**实用 JQL 片段：**
```jql
# 逾期工单
dueDate < now() AND status != Done

# 冲刺内已完成（燃尽用）
sprint = 23 AND status changed TO "Done" DURING (startOfSprint(), endOfSprint())

# 陈旧工单（30天未更新且未完成）
updated < -30d AND status != Done

# 跨项目 Epic 跟踪
"Epic Link" = PROJ-123 ORDER BY rank

# 速度计算（已关闭冲刺 + 已解决）
sprint in closedSprints() AND resolution = Done

# 团队容量（指定人 + 进行中冲刺）
assignee in (user1, user2) AND sprint in openSprints()
```

**报表模板：**

| 报表 | JQL |
|---|---|
| 冲刺报表 | `project = PROJ AND sprint = 23` |
| 团队速度 | `assignee in (team) AND sprint in closedSprints() AND resolution = Done` |
| 缺陷趋势 | `type = Bug AND created >= -30d` |
| 阻塞分析 | `priority = Blocker AND status != Done` |

## 注意事项

**性能**
- 避免 JQL 前导通配（大文本字段上的 `~` 开销很大）。
- 把复杂查询存为命名过滤器，不要反复临时跑 JQL。
- 限制仪表盘 gadget 数量以降低加载时间。
- 已完成项目优先归档而非删除，保留历史。

**数据质量与治理**
- 用字段校验规则强制必填字段，按项目类型统一工单 Key 命名。
- 定期清理陈旧 / 孤立工单。
- 变更前对权限/工作流方案做版本留档；组织级方案更新需走变更评审。
- 用户角色变更后运行权限审计。

**自定义字段**：仅当标准字段无法承载数据、需捕获流程专属信息或支撑高级报表时再建；建后要配置字段上下文（适用项目/工单类型）并加到对应屏幕。

**工单链接**：用 Epic 链接做特性归组，用 Blocks / Is blocked by 表达依赖，并在评论中记录链接原因。

## 互见

- **Confluence 专家**（`project-management/confluence-expert/`）：文档协作与 Jira 工作流互补。
- **Atlassian 管理员**（`project-management/atlassian-admin/`）：Jira 项目的权限与用户管理、组织级配置。

---
*采编自 [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills)（MIT 许可）。*
