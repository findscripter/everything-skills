---
name: atlassian-template-builder
title: Jira/Confluence 模板制作
description: 当需要为团队批量制作、改版、治理 Jira/Confluence 标准化模板（会议纪要、PRD、Bug 报告、Epic 等）并经 Atlassian MCP 发布时使用；做的是设计含宏与占位符的可复用模板/蓝图并验证发布产出标准化页面；不适用于单篇内容写作、非 Atlassian 平台或纯 Markdown 文档。触发词：Atlassian 模板、Confluence 模板、Jira 模板、blueprint 蓝图、storage format、会议纪要模板、PRD 模板、Bug 报告模板
domain: 协作/knowledge
triggers: [Atlassian 模板, Confluence 模板, Jira 模板, blueprint 蓝图, storage format, 会议纪要模板, PRD 模板, Bug 报告模板]
tags: [atlassian, confluence, jira, template, blueprint, mcp, collaboration, knowledge]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Atlassian Confluence MCP, Atlassian Jira MCP, Confluence storage format (wiki markup), Atlassian Document Format (ADF)]
requires: []
related: [confluence-space-architect, jira-expert, atlassian-admin, adr-writer]
combines_with: [confluence-space-architect, jira-expert, atlassian-admin]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

- 需要为团队/组织批量制作可复用的 Confluence 或 Jira 模板（会议纪要、项目章程、Sprint 回顾、PRD、决策记录、用户故事、Bug 报告、Epic 等）。
- 需要给已有模板改版（加宏、调结构）并保证旧内容不破、可迁移可回滚。
- 需要构建多页蓝图（blueprint）并经 Atlassian MCP 发布到指定 space/project。

不该用边界：
- 只写一篇普通文档/单条工单内容，不涉及可复用模板沉淀。
- 目标平台不是 Atlassian（如飞书、Notion、纯本地 Markdown）。
- 仅做格式转换而无模板结构/宏治理诉求。

## 步骤

模板创建：1) 调研需求 → 2) 复盘现有内容范式 → 3) 设计结构与占位符 → 4) 用宏与排版实现 → 5) 在预览中用样例数据验证渲染 → 6) 写使用说明 → 7) 经 MCP 发布到目标 space/project → 8) 拉回页面校验发布成功，出错则回滚 → 9) 培训用户 → 10) 跟踪采用率并迭代。

模板改版：评估变更影响 → 新建版本并保留旧版 → 修改 → 预览验证不破坏既有用法 → 提供迁移路径 → 通知用户 → 协助迁移 → 过渡后归档旧版（仅下架、不删除）。

蓝图开发：定义范围 → 设计多页结构 → 为每节建页模板 → 配置建页规则 → 加动态内容（Jira 查询、用户数据）→ 用样例 space 端到端跑通 → 部署前确认所有宏引用可解析 → 移交 Atlassian Admin 做全局部署。

## 指令

宏使用原则：
- 动态内容用宏自动更新：`{date}`、`@用户`、`{jira}` 查询。
- 视觉层级用 `{panel}` `{info}` `{note}` 区分。
- 长模板用 `{expand}` 做可折叠区块。
- 用 `{jira}` 嵌入图表/表格拉取实时数据。

通用模板标准小节：含元数据的头部 panel（负责人/日期/状态）→ 带内联占位符说明的内容区 → `{tasks}` 行动项块 → 相关链接与引用；Jira 模板另含清晰摘要行、复选框形式的验收/成功标准、关联工单与依赖块、（故事）完成定义 DoD。

MCP 操作（参数名须与 Atlassian MCP 服务端一致，发布前替换尖括号占位符）：
- 创建页面模板：`confluence_create_page`（`space_key` / `title` / `body` storage 格式 / `labels` / 可选 `parent_id`）。
- 更新模板：`confluence_update_page`（`page_id` / `version`=当前版本+1 / `body` / `version_comment`）。
- Jira 工单描述模板：`jira_update_field_configuration`（`project_key` / `field_id`=description / `default_value` 为 Markdown 或 ADF JSON）。
- 批量发布：对每个目标 space 重复 `confluence_create_page`，每次创建后用 `confluence_get_page` 拉回，断言 status==200 且 body 非空再继续下一个。

发布后校验：拉回页面确认无宏报错 → `{jira}` 嵌入能解析目标项目 → `{tasks}` 在发布视图可交互 → 任一不通过则用 `confluence_update_page`（version=当前+1，body=上一版本）回滚。

## 示例

会议纪要模板（Confluence storage 格式，可直接套用）：

```
{panel:title=Meeting Metadata|borderColor=#0052CC|titleBGColor=#0052CC|titleColor=#FFFFFF}
*Date:* {date}
*Owner / Facilitator:* @[facilitator name]
*Attendees:* @[name], @[name]
*Status:* {status:colour=Yellow|title=In Progress}
{panel}

h2. Agenda
# [Agenda item 1]
# [Agenda item 2]

h2. Discussion & Decisions
{panel:title=Key Decisions|borderColor=#36B37E|titleBGColor=#36B37E|titleColor=#FFFFFF}
* *Decision 1:* [What was decided and why]
{panel}

{info:title=Notes}
[Detailed discussion notes here]
{info}

h2. Action Items
{tasks}
* [ ] [Action item] — Owner: @[name] — Due: {date}
{tasks}

h2. Next Steps & Related Links
* Next meeting: {date}
* Related Jira issues: {jira:key=PROJ-123}
```

其余模板类型：项目章程（`{panel}`/`{status}`/`{timeline}`）、Sprint 回顾（`{expand}`/`{tasks}`）、PRD（`{jira}`/`{warning}`）、决策记录（决策矩阵 + `{tasks}`）；Jira 侧用户故事用 As a/I want/So that + Given/When/Then 验收标准，Bug 报告含环境/复现步骤/期望 vs 实际/严重级/临时绕过，Epic 含愿景/目标/成功指标/故事拆分/依赖/时间线。

## 注意事项

- 每次部署前的质量门：每节有示例内容、已在预览用样例数据验证、变更日志写了 version_comment、反馈机制就位（开评论或挂问卷）。
- 版本治理：头部记录版本号与版本说明；过期模板先挂 `{warning}` 横幅再归档；归档=下架而非删除。
- 发布顺序：批量发布逐个校验通过再推进下一个 space，避免半成品扩散。
- 季度评审：结合采用率指标再决定是否弃用某模板；维护与每个模板关联的使用指南。
- 移交：全局部署交给 Atlassian Admin；工单字段类需求对接 Jira Expert，space/蓝图类对接 Confluence Expert。

## 互见

无强相关已有技能。

---

本条采编自 alirezarezvani/claude-skills（MIT）。
