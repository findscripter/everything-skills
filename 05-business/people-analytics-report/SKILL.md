---
name: people-analytics-report
title: 人力报表（编制/流失/组织健康度）
description: 当需要为管理层拉编制快照/分析团队流失趋势/准备多元化代表性指标/评估管理幅度与离职风险时使用；从 HR 数据(CSV 或 HRIS)做人力分析，产出含执行摘要+关键指标表+建议+口径说明的报表；不适用于真实抓取 HRIS 数据、个人发薪/HRIS 写操作、绩效打分与合规裁定；触发词：人力报表、编制快照、流失分析、多元化、组织健康度、管理幅度、离职风险、headcount、attrition
domain: 商业/finance
triggers: [人力报表, 编制快照, headcount, 流失分析, attrition, 离职率, 多元化, diversity, 组织健康度, org health, 管理幅度, span of control, 离职风险, flight risk, people analytics]
tags: [people-analytics, hr, headcount, attrition, diversity, org-health, reporting, business]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [headcount-org-planner, compensation-analysis, org-health-diagnostic, recruiting-pipeline-tracker]
combines_with: [headcount-org-planner, kpi-dashboard-design]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
ര# 人力报表（编制/流失/组织健康度）

## 何时使用

- 为管理层拉一份**编制（headcount）快照**：按团队/地点/职级/司龄看当前组织全貌。
- 分析**流失（attrition）**：主动/被动离职率、遗憾流失、按团队的离职趋势。
- 准备**多元化（diversity）**代表性指标：按职级/团队/招聘漏斗看构成与晋升率、薪酬公平性。
- 评估**组织健康度（org health）**：管理幅度、管理层级、团队规模、离职风险（flight risk）。

不该用的边界：
- 不负责真实抓取 HRIS/权威人事数据；无连接器时只能用用户上传的 CSV 或粘贴数据，所有外部数字标 [需核查]。
- 不做个人发薪、HRIS 写操作、绩效打分、晋升/调薪审批，不替代法律/HR 对裁员、合规、歧视的专业裁定。
- 人事数据高度敏感：仅在本次会话内分析，不外传、不留存；多元化字段做聚合处理，小样本不出可识别个人的明细。

## 步骤 / 指令

先问清要回答什么问题，再选报表类型与口径。

```
1. 明确问题：要回答的具体业务问题是什么？（如「哪些团队 12 个月流失偏高？」）
2. 选报表类型并锁定口径：
   编制 headcount   → 维度：team / location / level / tenure（司龄）
   流失 attrition   → 分主动(voluntary)/被动(involuntary)/遗憾(regrettable)，按团队 + 趋势
   多元化 diversity → 按 level / team / function 的代表性，招聘漏斗，晋升率，薪酬公平
   组织健康 org health → 管理幅度、层级数、团队规模、离职风险
3. 取数：用户上传 CSV / 粘贴 / 有 HRIS 连接器则拉活数据。缺关键字段先补齐。
4. 用恰当统计口径分析，给出趋势、风险、机会，附 context 与 caveat。
5. 基于数据给具体可执行建议，而非泛泛而谈。
```

需要的数据字段（CSV，按报表类型取用）：

```
Employee ID / 部门·团队 / Title·Level / Location
Start date / End date(已离职填) / Manager
Compensation(相关时) / Demographics(仅多元化报表，且经授权)
```

关键指标速记：

```
留存  : 总流失率(主动+被动) · 遗憾流失率 · 平均司龄 · 离职风险信号
        年化流失率 ≈ 期内离职数 / 期内平均在职人数
多元化: 各 level/team/function 代表性 · 招聘漏斗各环节构成 · 分组晋升率 · 薪酬公平
组织  : 管理幅度 = 直接下属数 · 管理层级数 · 团队规模分布 · 离职风险评分
生产力: 人均营收 · 管理幅度效率 · 新人达产时间(time to productivity)
```

## 示例

输出骨架（Markdown）：

```markdown
## 人力报表：[类型] — [日期]

### 执行摘要
[2-3 条关键结论]

### 关键指标
| 指标 | 数值 | 趋势 |
|------|------|------|
| [指标] | [值] | [上升/下降/持平] |

### 详细分析
[针对该报表类型的图表、表格与叙述]

### 建议
- [基于数据的建议]
- [行动项]

### 口径说明
[数值如何计算、有哪些 caveat 与数据局限]
```

连接器可用时：
- **HRIS** 已连接 → 直接拉活的员工数据（编制、司龄、部门、职级），无需上传 CSV。
- **chat** 已连接 → 可将报表摘要分享到相关频道。

## 注意事项

- 先定问题再取数：报表类型和维度由要回答的业务问题决定，不要无目的堆指标。
- 口径要写清：流失率分子分母、是否含被动离职、统计窗口（滚动 12 个月 vs 自然年）务必在「口径说明」标明，否则数字不可比。
- 外部/估算数字一律标 [需核查] 交 `fact-checking`，本技能不自行背书。
- 多元化与离职风险敏感：聚合披露、小样本不出明细；离职风险是参考信号而非个人画像，不得用于歧视性决策。
- 保密：人事数据只在本次会话内分析，不落盘、不外发。
- 单一职责：只做分析与报表生成，不抓权威数据、不发薪、不做绩效/合规裁定。

## 互见

- related：`compensation-analysis` —— 薪酬公平与留存风险分析在多元化/流失报表中互为输入。
- related：`performance-review-builder` —— 遗憾流失、离职风险常需结合绩效数据判读。
- related：`cfo-financial-advisor` —— 人均营收、人力成本与编制规划从 CFO 视角校准。
- related：`interview-plan-builder` —— 招聘漏斗与多元化口径的设计可互参。
- combines_with：`data-storyteller` —— 把指标与趋势讲成给管理层的清晰数据故事。
- combines_with：`board-deck-builder` —— 将组织健康度/编制结论封装进董事会材料。

---
本条采编自 anthropics/knowledge-work-plugins（Apache-2.0 许可）。
