---
name: investment-thesis-tracker
title: 投资逻辑跟踪维护
description: 当为持仓或观察名单维护投资逻辑（thesis）、录入新数据点判断逻辑是否仍成立、定期复盘持仓理由时使用；产出含逻辑陈述/支柱/风险/催化剂的结构化记录、可证伪的逻辑记分卡、催化剂日历与当前信念等级，及晨会/投委会用的简明 markdown 或 Word 摘要；不适用于首次覆盖建模 initiation、财报点评、或纯数据整理无投资逻辑判断；触发词：更新逻辑、thesis check、逻辑还成立吗、加数据点、复盘持仓
domain: 商业/finance
triggers: [更新逻辑, 投资逻辑, thesis check, 逻辑还成立吗, thesis intact, 加数据点, 复盘持仓, 持仓理由, 投资逻辑跟踪, 逻辑记分卡, 催化剂日历, 信念等级, update thesis, review positions]
tags: [finance, equity-research, investment-thesis, portfolio, catalysts, conviction, 卖方研究, 持仓管理]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [markdown, docx]
requires: []
related: [stock-idea-generation, research-catalyst-calendar, initiating-coverage-report, morning-meeting-note]
combines_with: [equity-earnings-update-report, earnings-preview-model]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

为**持仓或观察名单**里的个股建立、维护、复盘投资逻辑（thesis），并随新信息持续更新。典型场景：

- 「更新 [公司] 的投资逻辑」——录入财报、管理层变动、竞品动作等新数据点。
- 「我的逻辑还成立吗 / thesis check」——核对逻辑是否被证伪。
- 「加一个数据点到 [公司]」「复盘我的持仓」。

核心理念：**逻辑必须可证伪**——如果没有任何事实能推翻它，那它就不是逻辑，只是信仰。

**不该用的边界：**

- 首次覆盖深度报告 / 建模（initiation）→ 用对应技能。
- 季度财报点评（beat/miss、上调下调预测）→ 用 `equity-earnings-update-report`。
- 纯数据整理、记账对账，无「逻辑是否成立」的判断 → 非本技能职责。

## 步骤

**Step 1 定义或加载逻辑**

新建逻辑时记录七要素：

- **公司**：名称 + ticker。
- **方向**：Long 还是 Short。
- **逻辑陈述**：1-2 句核心论点（例：「Long ACME —— 定价权带来毛利扩张 + 业务组合向软件迁移的经营杠杆」）。
- **关键支柱（Key pillars）**：3-5 条支撑论据。
- **关键风险（Key risks）**：3-5 条会**推翻**逻辑的风险。
- **催化剂（Catalysts）**：能证实/证伪逻辑的临近事件（财报、产品发布、监管裁决）。
- **目标价 / 估值**：逻辑兑现时它值多少。
- **止损触发**：什么情况下退出。

更新已有逻辑时：向用户索要新数据点或新进展。

**Step 2 更新日志（Update Log）**

每条新数据点都记五项：

- **日期**：何时发生。
- **数据点**：变了什么（财报超预期、管理层离职、竞品动作……）。
- **逻辑影响**：强化 / 削弱 / 中性化了**哪条具体支柱**。
- **行动**：不变 / 加仓 / 减仓 / 退出。
- **更新后信念**：高 / 中 / 低。

**Step 3 逻辑记分卡（Scorecard）** —— 维护一张滚动表，逐支柱跟踪。

**Step 4 催化剂日历** —— 跟踪临近催化剂及其预期影响。

**Step 5 输出** —— 生成适配晨会讨论 / 持仓复盘 / 风控委员会场景的逻辑摘要。格式：简明 markdown 或 Word 文档，含记分卡 + 近期更新 + 当前信念等级。

## 指令

**逻辑记分卡（Step 3 表模板）：**

| Pillar 支柱 | Original Expectation 原始预期 | Current Status 当前状态 | Trend 趋势 |
|---|---|---|---|
| Revenue growth >20% | On track | Q3 was 22% | Stable |
| Margin expansion | Behind | Margins flat YoY | Concerning |
| New product launch | Pending | Delayed to Q2 | Watch |

**催化剂日历（Step 4 表模板）：**

| Date | Event | Expected Impact | Notes |
|---|---|---|---|
| | | | |

**硬约束（贯穿全程）：**

- 逻辑必须**可证伪**——写不出「什么能推翻它」就重写。
- **像对待利好证据一样严格地跟踪利空（disconfirming）证据**——只记强化项是确认偏误。
- 即使没有戏剧性事件，也**至少每季度复盘一次**。
- 用户管理多个持仓时，主动提议做**全组合逻辑复盘**。
- 逻辑数据以**结构化格式**存储，便于跨会话引用。

## 示例

更新日志单条记录：

```
日期：2026-05-12
数据点：Q1 营收 22% 增长，但毛利率 YoY 持平（此前预期扩张 200bps）
逻辑影响：削弱「毛利扩张」支柱；「营收增长 >20%」支柱仍强化
行动：减仓 1/3
更新后信念：高 → 中
```

逻辑摘要（晨会口径，先结论）：

> **ACME（Long，信念：中）** —— 营收增长支柱稳健（Q3 22%，目标 >20%），但毛利扩张支柱亮黄灯（YoY 持平 vs. 预期 +200bps），已减仓至 2/3。下一催化剂：Q2 新品发布（已延期，watch）。止损触发：毛利率连续两季同比下滑。

## 注意事项

- **逻辑不可证伪即无效**：建立时就要写清「哪些事实会推翻它」。
- **利空与利好同等严格**：刻意搜集 disconfirming evidence，对抗确认偏误。
- 设**定量的决策触发器**（如「跑道/止损触发」），现在就定好，别等危机临头再拍脑袋。
- 定期复盘是纪律而非可选项：默认季度复盘，重大事件随时触发。
- 多持仓优先做全组合复盘，避免逐个孤立判断而漏掉组合层风险。

## 互见

- related：`equity-earnings-update-report` —— 财报点评的 beat/miss 与预测修正，是更新本逻辑日志最常见的数据来源。
- related：`variance-flux-commentary` —— 同为「为什么变」的归因写法，可复用到逻辑影响判断。
- related：`competitive-analysis` / `competitive-intel-tracker` —— 竞品动作是逻辑支柱/风险的高频数据点。
- combines_with：`board-deck-builder` / `board-meeting-prep` —— 把逻辑记分卡与信念变化压缩成投委会/风控委员会决策页。
- combines_with：`data-storyteller` —— 把逻辑演变讲成有说服力的图文叙事。

---
采编自 anthropics/financial-services（Apache-2.0）。
