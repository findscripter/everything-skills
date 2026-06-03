---
name: pe-value-creation-plan
title: 投后价值创造计划（EBITDA 桥与 100 天计划）
description: 当 PE 完成收购后规划投后执行、编制运营合伙人材料或搭建董事会级价值创造路线图时使用；做出映射到 EBITDA 桥的收入/成本/运营杠杆清单、100 天计划、KPI 看板与责任矩阵等可决策产物；不适用于尽调建模、估值或常规财务做账。触发词：价值创造计划、100 天计划、EBITDA 桥、投后运营计划
domain: 商业/finance
triggers: [价值创造计划, value creation plan, 100 天计划, 100-day plan, 投后执行, post-close plan, EBITDA 桥, EBITDA bridge, 运营计划 operating plan, 价值创造杠杆, value creation levers, 运营合伙人材料, KPI 看板, 投后改善, add-on 并购]
tags: [商业, finance, 私募股权, pe, 投后管理, ebitda桥, 100天计划, 价值创造, 运营合伙人, kpi]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [电子表格/Excel, 演示文稿/PPT, Word/Markdown 编辑器]
requires: []
related: [pe-portfolio-monitoring, pe-dd-checklist, ma-playbook, headcount-org-planner]
combines_with: [pe-portfolio-monitoring, pe-dd-checklist, board-deck-builder]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

PE 收购交割后，需要把"如何让这家公司在持有期内增值"落成一份可执行、可问责、董事会可批的计划时用本技能。典型场景：投后执行规划、运营合伙人/Portfolio Ops 材料、董事会价值创造路线图、首个 100 天的优先级排序。

不该用：
- 交易前尽调建模、估值或 LBO 回报测算（属投资决策阶段，非投后执行）。
- 常规财务做账、记账或月度财务分析师事务。
- 单纯做一份董事会汇报 deck（叙事/页面设计请用 `board-deck-builder`，本技能产出其中的"价值创造"内容）。

## 步骤

### 1. 基线评估（Baseline）
摸清起点：当前收入 / EBITDA / 利润率；组织架构与能力；各职能关键运营指标；管理团队的强项与缺口；尽调阶段已识别的速赢（quick wins）。

### 2. 价值创造杠杆（Levers）
把所有杠杆映射到持有期的 EBITDA 桥。三类杠杆：

- **收入增长**：有机增长（提价、放量、市场扩张）；交叉/向上销售；进入新市场（地域、垂直、渠道）；销售效能（增员、提转化、缩周期）；add-on 并购（补强收购增收增能力）。
- **利润率扩张**：定价优化（提价、结构调整、捆绑）；COGS 削减（采购降本、供应商整合、自动化）；OpEx 优化（管理费用、共享服务、离岸外包）；技术投入（自动化、系统集成、数据分析）；规模杠杆（收入增长摊薄固定成本）。
- **战略 / 估值倍数扩张**：平台化（add-on / tuck-in）；收入经常性化（项目制 → 订阅/经常性）；市场定位（品类领导、品牌）；管理层升级（关键招聘、专业化）；ESG / 治理（董事会组建、报告改善）。

每条杠杆都要写清：当前态 → 目标态、收入/EBITDA 影响（$）、见效时间线、所需投入、信心等级（高/中/低）。

### 3. 搭建 EBITDA 桥
做出从当前到目标 EBITDA 的逐年 walk（按杠杆分行、Y1–Y5 分列）：

```
| 杠杆               | Y1 | Y2 | Y3 | Y4 | Y5 |
|--------------------|----|----|----|----|----|
| 基线 EBITDA        |    |    |    |    |    |
| 有机收入增长       |    |    |    |    |    |
| 定价               |    |    |    |    |    |
| Add-on 并购        |    |    |    |    |    |
| COGS 节降          |    |    |    |    |    |
| OpEx 优化          |    |    |    |    |    |
| 技术投入           |    |    |    |    |    |
| **Pro Forma EBITDA** |  |    |    |    |    |
| **利润率**         |    |    |    |    |    |
```

### 4. 100 天计划
- **第 1–30 天（稳定与评估）**：管理层对齐与挽留（签雇佣协议、定薪酬）；速赢（提价、明显成本、低垂果实）；按职能做详细运营评估；客户沟通方案；搭建报告与 KPI 看板。
- **第 31–60 天（规划与启动）**：定稿战略并向组织传达；启动 Top 3–5 价值创造举措；启动 add-on 并购管线；补关键岗位；建立报告节奏（周快报 / 月度复盘 / 季度董事会）。
- **第 61–100 天（执行与度量）**：速赢举措首批结果；首次董事会（带运营指标）；逐杠杆进展报告；据早期反馈调整计划。

### 5. KPI 看板
定义跟踪价值创造的指标，明确口径、目标、责任人、报告频率：

```
| KPI         | 当前 | Y1 目标 | 责任人 | 报告频率 |
|-------------|------|---------|--------|----------|
| 收入        |      |         | CEO    | 月       |
| EBITDA      |      |         | CFO    | 月       |
| EBITDA 利润率 |    |         | CFO    | 月       |
| 新客赢单    |      |         | CRO    | 周       |
| 净留存 NDR  |      |         | CRO    | 月       |
| 员工流失率  |      |         | CHRO   | 月       |
| 现金转化    |      |         | CFO    | 月       |
```

### 6. 产出物
- Word / PPT：执行摘要（1 页）+ EBITDA 桥图 + 各杠杆明细（每杠杆 1 页）+ 100 天时间线 + KPI 看板 + 责任矩阵（谁负责什么）。
- Excel 模型：支撑 EBITDA 桥的可回溯测算底稿。

## 指令

给 Agent 的执行约束：
- 先要齐基线数据（收入/EBITDA/利润率/职能指标），数据缺失就标注假设并向用户确认，不要凭空填数。
- 每条杠杆必须带"信心等级 + 投入 + 时间线"，不可只给收入数字。
- EBITDA 桥与 KPI 看板每个数都要能从 Excel 底稿追溯；输出时保留逐年列。
- 责任矩阵到人（C-level 角色），KPI 必须有 owner 和报告频率。

## 示例

用户："我们刚交割一家 SaaS 工程服务公司，帮我出投后价值创造计划。"

Agent 产出骨架：
1. 基线：收入 $80M / EBITDA $12M（15% 利润率）；项目制为主、经常性收入占比低。
2. 三大杠杆 → 定价优化（信心高，Y1 +$2M）、项目制转订阅（信心中，Y2–Y3 +$3M）、2 起 add-on（信心中，Y2 +$4M EBITDA）。
3. EBITDA 桥：Y1 $14M → Y3 $24M，利润率 15% → 21%。
4. 100 天：第 1–30 天锁管理层 + 提价速赢；第 31–60 天启动订阅化与并购管线；第 61–100 天首次董事会带 KPI。
5. KPI 看板 + 责任矩阵 + Excel 底稿。

## 注意事项

- 时间要现实：多数 PE 价值创造需 12–24 个月才在财务上体现。
- 速赢对势能与可信度重要，但别为砍成本过度牺牲增长。
- 管理层买入是关键——计划应"共创"而非"强加"。
- 跟踪到举措级 P&L 影响，不只看顶层 EBITDA——你得知道什么在起效。
- Add-on 并购常是最大单一杠杆——第 1 天就启动管线。
- 始终用运营合伙人或行业专家压力测试假设。

## 互见

- related：`board-deck-builder` —— 价值创造内容进董事会 deck 的叙事与排版
- related：`board-meeting-prep` —— 首次/季度董事会的材料与议程准备
- related：`financial-statements-generator` —— 基线财务与 pro forma 报表生成
- combines_with：`board-deck-builder` —— 本计划 + deck 化 = 完整董事会价值创造材料
- 同源姊妹技能（PE 板块，采编自 anthropics/financial-services）：尽调摘要、投资备忘录、EBITDA 桥估值等，可按需协同。

---

采编自 anthropics/financial-services（Apache-2.0），适配重写为中文技能大典条目，非逐字翻译。
