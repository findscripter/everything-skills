---
name: confluence-space-architect
title: Confluence 知识库空间架构
description: 当需要在 Atlassian Confluence 中搭建或重构空间、设计页面层级与权限、制作含宏的模板、嵌入 Jira 报表、做知识库审计或定立文档治理规范时使用；产出空间结构、模板、权限方案与治理清单；不适用于 Jira 工单本身的增删改、非 Confluence 的 wiki（如飞书 wiki/Notion）。触发词：confluence、知识库、wiki 空间、页面层级、空间权限、页面模板、confluence 宏、CQL、jira 宏、文档治理
domain: 协作/knowledge
triggers: [confluence, 知识库, wiki 空间, 页面层级, 空间权限, 页面模板, confluence 宏, cql, jira 宏, 文档治理]
tags: [confluence, atlassian, knowledge-base, documentation, wiki, macros, templates, permissions, governance, cql]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Confluence MCP Server, create_space, create_page, update_page, search (CQL), get_children, add_label, Confluence Macros]
requires: []
related: [atlassian-template-builder, atlassian-admin, jira-expert, codebase-onboarding-doc]
combines_with: [atlassian-template-builder, atlassian-admin, jira-expert]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

当用户需要在 Atlassian Confluence 中完成以下工作时使用：

- 新建或重构空间（Space），规划页面层级与导航；
- 配置空间权限方案（查看/编辑/创建/删除/管理）；
- 制作可复用的页面模板（会议纪要、项目概览、决策记录、复盘等），并嵌入宏；
- 在页面中嵌入 Jira 工单列表或图表、按标签聚合内容；
- 做知识库审计、定立命名规范、评审周期与归档策略等文档治理规范。

不该用于：操作 Jira 工单本身（建单/改状态用 Jira 相关技能）；非 Confluence 的知识库（飞书 wiki、Notion、语雀等，结构与宏语法不通用）；纯文档写作而不涉及空间/模板/权限架构。

## 步骤

1. 定空间：先判定空间类型（团队 / 项目 / 知识库 / 个人），据此选权限方案与首页形态。
2. 建空间：用清晰的 `key` + `name` + `description` 创建，设置带概览的首页。
3. 配权限：按方案授予 View/Edit/Create/Delete 与 Admin；**验收**——用非管理员测试账号访问，确认权限层级正确。
4. 搭层级：建立 parent-child 页面树，导航深度不超过 3 层，命名一致，会议纪要带日期戳。
5. 做模板：抽取可复用内容模式 → 建页加占位符与填写说明 → 用宏排版 → 存为模板 → 共享到空间或设全局；**验收**——先从模板建测试页确认占位渲染正常再共享。
6. 接 Jira：需要时用 `{jira}` / `{jirachart}` 宏嵌入工单与图表（与 Jira 技能协作）。
7. 立治理：定义内容分类法、评审周期、归档策略与质量清单，并监控采用度。

## 指令

通过 Confluence MCP Server 调用核心操作：

```
// 新建空间
create_space({ key: "TEAM", name: "Engineering Team", description: "Engineering team knowledge base" })

// 在父页面下建子页（body 用 storage-format HTML）
create_page({ spaceKey: "TEAM", title: "Sprint 42 Notes", parentId: "123456", body: "<p>Meeting notes</p>" })

// 更新页面（version 必须递增，否则冲突）
update_page({ pageId: "789012", version: 4, body: "<p>Updated content</p>" })

// 删除页面
delete_page({ pageId: "789012" })

// CQL 检索
search({ cql: 'space = "TEAM" AND label = "meeting-notes" ORDER BY lastModified DESC' })

// 查子页以巡检层级
get_children({ pageId: "123456" })

// 打标签
add_label({ pageId: "789012", label: "archived" })
```

常用宏速查：

- 提示块：`{info}…{info}`、`{note}`、`{warning}`、`{tip}`
- 折叠：`{expand:title=Click to expand}…{expand}`
- 目录：`{toc:maxLevel=3}`
- 摘录复用：`{excerpt}…{excerpt}` + `{excerpt-include:Page Name}`
- Jira 工单：`{jira:JQL=project = PROJ AND status = "In Progress"}`
- Jira 图表：`{jirachart:type=pie|jql=project = PROJ|statType=statuses}`
- 标签聚合：`{contentbylabel:label=meeting-notes|maxResults=20}`
- 状态徽标：`{status:colour=Green|title=Approved}`
- 任务清单：`{tasks}- [ ] Task 1\n- [x] Task 2{tasks}`
- 日期：`{date:format=dd MMM yyyy}`
- 两栏布局：`{section}{column:width=50%}…{column}{column:width=50%}…{column}{section}`
- 面板/代码：`{panel:title=…|borderColor=#ccc}…{panel}`、`{code:javascript}…{code}`

## 示例

推荐的空间页面树（≤3 层）：

```
Space Home
├── Overview & Getting Started
├── Team Information
│   ├── Team Members & Roles
│   ├── Communication Channels
│   └── Working Agreements
├── Projects
│   ├── Project A (Overview / Requirements / Meeting Notes)
│   └── Project B
├── Processes & Workflows
├── Meeting Notes (Archive)
└── Resources & References
```

常用模板及关键小节：

| 模板 | 用途 | 关键小节 |
|------|------|----------|
| 会议纪要 | Sprint/团队会议 | 议程、讨论、决议、行动项（tasks 宏）|
| 项目概览 | 立项与状态 | Quick Facts 面板、目标、干系人表、里程碑（jira 宏）、风险 |
| 决策记录 | 架构/策略决策 | 背景、备选方案、决策、影响、下一步 |
| 冲刺复盘 | 敏捷仪式 | 做得好（info）、待改进（warning）、行动项（tasks）、指标 |

权限方案示例：团队空间——团队成员 View/Edit/Create，团队负责人 Admin，其他人无权限。

## 注意事项

- `update_page` 的 `version` 必须比当前版本大，否则乐观锁冲突；先读取再 +1。
- `body` 默认是 storage-format（HTML），不是纯文本/Markdown；模板里的占位符需在共享前实测渲染。
- 导航深度控制在 3 层内；命名规范、标签、所有者三者缺一会拉低可检索性。
- 治理基线：关键文档每月评审、标准文档每季度、归档文档每年；过期内容打 `archived` + 日期标签，保留 2 年后删除并留审计痕迹。
- 需升级到 Atlassian Admin 的场景：组织级模板、跨空间权限、Blueprint 配置、全局自动化、空间导入导出——这些超出本技能范围。
- 健康巡检指标：长期未更新页、无所有者页、重复内容、坏链、空空间、孤立页。

## 互见

- Jira 相关技能：本技能用 `{jira}`/`{jirachart}` 嵌入工单与图表，但建单、改状态、JQL 调试归 Jira 技能。
- 模板/Blueprint 配置：跨空间或全局模板需配合 Atlassian Admin。

本条采编自 alirezarezvani/claude-skills（MIT）。
