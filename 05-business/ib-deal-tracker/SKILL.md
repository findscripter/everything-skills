---
name: ib-deal-tracker
title: 投行交易进度跟踪
description: 当同时管理多笔在跑投行交易（sell-side/buy-side/融资/重组）、需跟踪里程碑与截止日、维护交易管线视图或准备每周交易复盘时使用；产出交易台账（管线总览＋每笔里程碑跟踪表＋行动项主清单＋每周复盘纪要，Excel/Markdown）并自动暴露临近截止日与逾期项；不适用于估值建模、尽调清单设计或法律文书起草（转交对应技能）。触发词：交易跟踪、交易状态、进展更新、交易管线、每周交易复盘、deal pipeline
domain: 商业/finance
triggers: [交易跟踪, deal tracker, 交易状态, deal status, 进展更新, process update, where are we on, 交易管线, deal pipeline, 每周交易复盘, weekly deal review, 里程碑跟踪, 逾期项, 行动项清单, 交易阶段]
tags: [商业, finance, 投行, 交易跟踪, deal-pipeline, 里程碑, 行动项, 周复盘, M&A, sell-side]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Excel, Markdown]
requires: []
related: [deal-pipeline-tracker, pe-portfolio-monitoring, research-catalyst-calendar, ma-playbook]
combines_with: [ic-investment-memo, ma-process-letter, pe-dd-checklist]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

当你手上同时跑着多笔投行交易，需要把「每笔到哪一步、下一个截止日是哪天、谁该交什么」拢成一份可每周维护的台账时使用。典型场景：

- 管理一本 book of business（多笔 sell-side/buy-side/融资/重组并行）。
- 跟踪流程里程碑（engagement → CIM → IOI → 尽调 → final bids → signing → close）。
- 准备每周团队交易复盘（weekly deal review），需要逐笔状态＋管线汇总。
- 想自动暴露「临近 2 周的截止日」和「已逾期的里程碑/行动项」。

不该用的边界：

- 不做估值建模、DCF、可比交易测算 —— 交财务建模类技能；本技能只登记关键日期与状态。
- 不设计分领域尽调清单或并购红旗判断 —— 用 `ma-playbook`。
- 不起草 CIM/teaser/SPA 等法律或营销文书 —— 本技能只跟踪它们的完成状态。
- 单笔交易的折扣/条款评审不在此 —— 那是 `deal-desk-reviewer`。

判据一句话：**台账若一周不更新，就比没有更糟（stale trackers are worse than no tracker）。**

## 步骤

1. **建档（Deal Setup）** —— 每笔交易登记：代号 Project [Name]、客户、交易类型（sell-side/buy-side/融资/重组）、角色（lead/co-advisor/fairness opinion）、规模（预期 EV）、阶段、团队（MD/VP/Associate/Analyst）、关键日期（engagement、CIM 分发、IOI 截止、management meetings、final bid 截止、target close）。
2. **里程碑跟踪（Milestone Tracking）** —— 每笔维护一张里程碑表，逐行记 Target/Actual 日期与状态，状态取 **On Track / At Risk / Delayed / Complete**。
3. **行动项（Action Items）** —— 跨全部交易维护一张行动项主清单，每条必须带 Owner 和 Due Date（无主、无期限的行动项不会被完成）。
4. **每周复盘（Weekly Deal Review）** —— 逐笔生成状态摘要 + 管线汇总，供团队周会使用。
5. **输出（Output）** —— 汇成 Excel 工作簿（管线总览页 + 每笔里程碑跟踪页 + 行动项主清单 + 周复盘摘要），可选导出 Markdown 供邮件/Slack 分发。

## 指令

里程碑跟踪表（每笔一张；状态：On Track / At Risk / Delayed / Complete）：

| Milestone | Target Date | Actual Date | Status | Notes |
|-----------|------------|-------------|--------|-------|
| Engagement letter signed | | | | |
| CIM / teaser drafted | | | | |
| Buyer list approved | | | | |
| Teaser distributed | | | | |
| NDA execution | | | | |
| CIM distributed | | | | |
| IOI deadline | | | | |
| IOIs received / reviewed | | | | |
| Shortlist selected | | | | |
| Management meetings | | | | |
| Data room opened | | | | |
| Final bid deadline | | | | |
| Bids received / reviewed | | | | |
| Exclusivity granted | | | | |
| Confirmatory diligence | | | | |
| Purchase agreement signed | | | | |
| Regulatory approval | | | | |
| Close | | | | |

行动项主清单（跨所有交易；Priority 取 P0/P1/P2，Status 取 Open/Done/Blocked）：

| Action | Deal | Owner | Due Date | Priority | Status |
|--------|------|-------|----------|----------|--------|
| | | | | P0/P1/P2 | Open/Done/Blocked |

每周复盘的固定结构：

- **逐笔（每笔 active deal）**：① 一句话状态更新 ② 本周关键进展 ③ 未来 2 周临近里程碑 ④ 阻塞/风险 ⑤ 下周行动项。
- **管线汇总（Pipeline summary）**：按阶段统计 active deals 数 / 风险交易（错过里程碑、流程停滞）/ 管线中的新 mandate 与 pitch / 本季度预期 closing。

派生信号（每次更新自动重算）：临近截止日 = Target Date 在未来 14 天内且未 Complete；逾期项 = Target/Due Date < 今天且状态非 Complete/Done。

## 示例

某 sell-side 交易 Project Atlas 的一周更新：

1. 状态一句话：「已收 5 份 IOI，本周二进入 shortlist 评审。」
2. 本周进展：data room opened（Actual = 周一）；2 场 management meetings 排定下周。
3. 未来 2 周里程碑：Shortlist selected（Target 周五，On Track）、Final bid deadline（Target +12 天，At Risk —— 等卖方确认）。
4. 阻塞/风险：卖方法务延迟反馈 NDA 模板 → 标 At Risk，挂行动项「Owner=VP Lin，Due=周三，P0」。
5. 管线汇总：本笔计入 IOI 阶段；连同另 3 笔，本季度预期 2 笔 close。

管线总览页每笔一行，展示阶段、规模、成交概率（likelihood），可直接用于收入预测。

## 注意事项

- 至少每周更新一次；陈旧台账比没有台账更糟。
- 主动标记正在滑期的里程碑 —— 早预警避免临门翻车（early warning prevents surprises）。
- 行动项必须有 Owner 和 Due Date，否则等于没记。
- 管线视图要带阶段、规模、成交概率，才对收入预测有用。
- 持续记录买方/投资人反馈 —— 反馈中的模式会反过来调整打法。
- 已 close / 已死的交易单独归档，保持 active 视图干净。
- 本技能只跟踪状态与日期，不替代估值、尽调与法律文书工作。

## 互见

- related：`ma-playbook` —— 提供并购尽调清单、估值方法与 100 天整合，本技能跟踪其里程碑落点。
- related：`deal-desk-reviewer` —— 单笔交易的折扣/条款签字前评审，与跨笔进度跟踪互补。
- related：`equity-earnings-update-report`、`cfo-financial-advisor` —— 财务侧产出与战略财务建议。
- combines_with：`board-deck-builder`、`board-meeting-prep` —— 把管线总览与周复盘汇成董事会/团队会材料。
- combines_with：`month-end-close-manager` —— 把已 close 交易的关键日期对接到财务结账节奏。

---

采编自 anthropics/financial-services（Apache-2.0 许可）。
