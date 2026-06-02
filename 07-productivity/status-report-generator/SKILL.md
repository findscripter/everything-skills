---
name: status-report-generator
title: 项目状态报告生成
description: 当为领导/干系人撰写周报、月报或季度更新，需把项目活动汇成红黄绿健康度叙事并暴露风险与待决策时使用；产出含执行摘要、KPI 指标表、进展/风险/待决策表与下期优先级的精炼状态报告；不适用于排程、纯纪要摘要或深度风险矩阵分析。触发词：状态报告、项目周报、月报、领导汇报、健康度、红黄绿、风险与待决策、status report、KPI、stakeholder update
domain: 协作/knowledge
triggers: [状态报告, 项目周报, 月报, 季度汇报, 领导汇报, 项目健康度, 红黄绿, 风险与待决策, status report, weekly update, KPI, stakeholder update, executive summary]
tags: [status-report, reporting, leadership, project-management, kpi, risk, collaboration, pm]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [markdown]
requires: []
related: [stakeholder-update-writer, activity-digest-generator, enterprise-project-manager, oncall-handoff-writer]
combines_with: [stakeholder-update-writer, deal-pipeline-tracker]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## 何时使用

当需要为领导层或干系人产出一份打磨过的项目/团队**状态报告**时使用。典型请求：「写本周项目周报」「给老板一份月度更新」「把 Jira/项目看板的活动汇成可读的汇报」「这个项目现在是绿/黄/红？」「哪些风险和决策需要上报」。周报/月报/季报均适用，输入既可以是用户口述的进展，也可以是项目追踪器、群聊、日历里的活动。

**不该用的边界：**
- 只需安排会议、排期、发提醒 → 用 `scheduling` 类技能，本技能聚焦「向上汇报的叙事产物」。
- 只需逐字整理会议纪要/待办 → 用纪要类技能；状态报告是跨多源的健康度综述，不是单场会的记录。
- 需要正式的风险矩阵、严重度量化模型或概率-影响打分 → 本技能只做风险的「暴露与缓解一句话」，深度风险评估应另用专门方法。
- 需要 OKR 对齐、战略级联或组织诊断 → 见互见，本技能停在「项目/团队周期级」。

## 步骤

1. **定范围**：确认周期（weekly / monthly / quarterly）与对象（哪个项目或团队）。缺省按 `[周期] [项目/团队]` 询问或推断。
2. **收集输入**：汇总用户提供的进展、指标、阻塞项；若接入了项目追踪器/群聊/日历，按下方「连接器」自动拉取。
3. **判健康度**：给出整体状态 🟢 On Track / 🟡 At Risk / 🔴 Off Track，并对每条 KPI 单独标色。判据要诚实——掩盖问题会侵蚀信任。
4. **填模板**：按下方骨架组织内容，数据不足的小节直接省略，不要硬凑空表。
5. **打磨头条**：执行摘要 3-4 句，前 3 行要让忙碌的领导一眼读懂「在轨什么、要关注什么、关键赢面」。
6. **交付/分发**：输出 Markdown；若接入群聊，主动询问是否发到指定频道。

## 指令

**KPI 表**：每行给 指标 / 目标 / 实际 / 趋势(↑↓→) / 状态色，趋势用箭头或 up/down/flat。
**进展(In Progress)**：列 事项 / 负责人 / 状态 / 预计完成 / 备注。
**风险与问题**：每条给 风险或问题 / 影响 / 缓解措施 / 责任人——尽早暴露，别等出事。
**待决策(Decisions Needed)**：每条给 决策 / 背景(为何重要) / 截止 / **推荐方案**。让领导拍板更容易：每个待决策都附上下文 + 你的建议。
**下期优先级**：3 条以内，按重要度排序。

## 示例

报告骨架（数据不足的小节省略）：

```markdown
## 状态报告：[项目/团队] — [周期]
**作者：** [姓名] | **日期：** [日期]

### 执行摘要
[3-4 句综述——什么在轨、什么需关注、关键赢面]

### 整体状态：🟢 On Track / 🟡 At Risk / 🔴 Off Track

### 关键指标
| 指标 | 目标 | 实际 | 趋势 | 状态 |
|------|------|------|------|------|
| [KPI] | [目标] | [实际] | ↑/↓/→ | 🟢/🟡/🔴 |

### 本期成果
- [赢面 1]
- [赢面 2]

### 进行中
| 事项 | 负责人 | 状态 | 预计完成 | 备注 |
|------|--------|------|----------|------|

### 风险与问题
| 风险/问题 | 影响 | 缓解措施 | 责任人 |
|-----------|------|----------|--------|

### 待决策
| 决策 | 背景 | 截止 | 推荐方案 |
|------|------|------|----------|

### 下期优先级
1. [优先级 1]
2. [优先级 2]
3. [优先级 3]
```

**连接器（接入时自动增强）：**
- 项目追踪器(Jira/看板)：自动拉取项目状态、已完成项、即将到来的里程碑；识别高风险项与逾期任务。
- 群聊(Slack/Teams)：扫描近期团队讨论中的决策与阻塞补进报告；完成后可代发到频道。
- 日历：引用本周期内的关键会议与会上决策。

## 注意事项

- **头条优先**：领导只读前 3 行，把它写成可独立成立的结论，别让人翻到表格才知道好坏。
- **对风险诚实**：黄/红不丢人，瞒报才致命；早暴露建立信任，惊吓侵蚀信任。
- **让决策可执行**：每个「待决策」必须带背景 + 推荐方案，否则会被无限期搁置。
- **省略空小节**：没有待决策/没有风险时直接删表，别用占位符撑版面。
- **状态色要可辩护**：🟡/🔴 要给得出理由（哪条 KPI、哪个里程碑导致），否则颜色失去意义。
- **趋势优于绝对值**：单点数字配上「相比上期↑/↓」才有信息量。

## 互见

- related：`enterprise-project-manager` —— 项目层面的计划/追踪，状态报告是其对外汇报出口
- related：`oncall-handoff-writer` —— 同属「结构化向上/横向交接」文档族
- related：`coo-operations-advisor` —— 运营健康度判读的方法支撑
- combines_with：`meeting-transcript-analyzer` —— 从会议转录中萃取决策与阻塞，喂给本报告的「风险/待决策」小节
- combines_with：`strategic-alignment-cascader` —— 把周期级状态对齐到上层战略/OKR
- combines_with：`chief-of-staff-orchestrator` —— 多团队状态汇总成一份高层简报

---

本条采编自 anthropics/knowledge-work-plugins（Apache-2.0）。
