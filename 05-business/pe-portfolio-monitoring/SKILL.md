---
name: pe-portfolio-monitoring
title: 被投企业业绩跟踪监控
description: 当需对 PE/VC 被投企业的月度/季度财务包做业绩跟踪、对比预算/承销案、生成红黄绿预警与董事会摘要、检查债务契约合规时使用；做财务包摄取+KPI提取+预算差异打标(Green/Yellow/Red)+契约合规核查+董事会级摘要；不适用于估值建模、尽调投决、二级市场行情或无预算/契约基准时编造结论；触发词：被投企业业绩、portfolio company、月度财务、契约合规、组合更新、portfolio update
domain: 商业/finance
triggers: [被投企业业绩, 组合监控, portfolio company, portfolio monitoring, 月度财务包, 季度财务包, 契约合规, covenant check, 组合更新, portfolio update, 被投公司表现如何]
tags: [商业, finance, private-equity, portfolio-monitoring, kpi, covenant, variance, board-reporting]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [电子表格/Excel, PDF 阅读器, python, pandas]
requires: []
related: [pe-value-creation-plan, board-deck-builder, octagon-sec-debt-covenant, budget-variance-analysis]
combines_with: [board-deck-builder, variance-flux-commentary]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
# 被投企业业绩跟踪监控

> 免责声明：本技能辅助 PE/VC 投后业绩跟踪流程，不构成投资或财务建议。所有预警结论与契约判断在用于对上/对外（投委会、董事会、LP）报告前，须经具备资质的投资/财务人员复核。

## 何时使用

当你拿到一家被投企业（portfolio company）的定期财务包，需要对照计划做业绩跟踪、打预警、出董事会级摘要时使用：

- 复核被投企业月度/季度财务（Excel / PDF / CSV 财务包）。
- 准备投委会、董事会或 LP 汇报材料中的"组合公司表现"页。
- 监控债务契约（covenant）合规风险。
- 用户说"复核被投企业""这家公司表现如何""月度财务""契约合规检查""组合更新"。

**不该用的边界：**

- 不做估值建模 / 入股定价（→ 估值与 DCF 类技能）；本技能只跟踪"已发生业绩 vs 计划"。
- 不做投前尽调、投资决策或承销案搭建（→ `startup-financial-modeler` 等）。
- 不出二级市场行情、买卖评级或前瞻盈利预测结论。
- **缺少预算/计划基准或契约条款时不要硬出结论**——先向用户索取，缺数据处用显式占位符（如 `[待补充: FY 预算 EBITDA]`），绝不臆造。

## 步骤 / 指令

```
1. 摄取财务包（Ingest）
   - 接收用户的财务包：Excel 工作簿 / PDF / CSV。
   - 提取核心财务项：收入(Revenue)、EBITDA、现金余额(Cash)、
     有息负债(Debt outstanding)、资本开支(Capex)、营运资本(Working capital)。
   - 确认报告期，并对齐到上一期 与 预算/计划(budget/plan) 两个基准。

2. KPI 提取与差异分析（按公司所在行业适配指标）
   财务 KPI：
     - 收入 vs 预算（金额 与 %）
     - EBITDA 及 EBITDA 利润率 vs 预算
     - 现金余额 与 净负债(Net Debt)
     - 杠杆率 = 净负债 / LTM EBITDA
     - 利息保障倍数(Interest coverage ratio)
     - 资本开支 vs 预算
     - 自由现金流(Free cash flow)
   运营 KPI（向用户询问或从数据推断，勿臆设行业指标）：
     - 客户数 / 单客户收入
     - 员工人数 / 人均收入
     - 在手订单(Backlog) / 销售管线(Pipeline)
     - 流失率(Churn) / 留存率(Retention)

3. 打标与摘要（Flag & Summarize）—— 红黄绿阈值：
     Green  : 在计划 ±5% 以内
     Yellow : 低于计划 5%–15%        → 标记待讨论
     Red    : 低于计划 >15% 或 契约违约风险 → 立即关注
   输出一份精简摘要：
     1) 一段话执行摘要（"X 公司当前 领先/落后/符合 计划……"）
     2) KPI 表：实际 vs 预算 vs 上期
     3) 红/黄预警项 + 背景说明
     4) 契约合规状态（如适用）
     5) 给管理层的待澄清问题

4. 趋势分析（若提供多期数据）
     - 对关键指标（收入、EBITDA、现金）按时间作图。
     - 判断趋势：加速 / 减速 / 平稳。
     - 与承销案(underwriting case)对比。
```

委托提示词（给 Agent 调用）：

> 输入被投企业本期财务包及预算/计划（缺则先索取）。提取收入、EBITDA、现金、净负债、Capex、营运资本，算杠杆率与利息保障倍数；按行业补充运营 KPI（先问用户"这家公司最看重哪些指标"，勿臆设）。逐 KPI 算 vs 预算与 vs 上期的差异，按 ±5% / 5–15% / >15% 打 Green/Yellow/Red，并叠加契约违约风险判定 Red。输出：一段话执行摘要 + 实际/预算/上期 KPI 表 + 红黄预警含背景 + 契约合规状态 + 给管理层的问题。董事会级口径——精简、事实、无废话；缺数据用占位符不编。

## 示例

执行摘要范式（一段话）：

> Acme Co. FY24 Q2 整体落后计划。收入 $48.0M 较预算 $52.0M 低 7.7%（Yellow），EBITDA 利润率从计划的 22% 滑落至 18%（Red，差距 >15% 利润额）。净负债 $180M，杠杆率 4.2x LTM EBITDA，逼近契约红线 4.5x —— **契约缓冲收窄，需立即关注**。现金 $12M，按当前消耗约 9 个月跑道。

KPI 表范式（实际 / 预算 / 上期）：

| KPI | 本期实际 | 预算 | 上期 | vs 预算 | 标记 |
|---|---|---|---|---|---|
| 收入 | $48.0M | $52.0M | $46.5M | -7.7% | Yellow |
| EBITDA | $8.6M | $11.4M | $9.0M | -24.6% | Red |
| EBITDA 利润率 | 18% | 22% | 19% | -4pt | Red |
| 净负债 | $180M | $172M | $178M | +4.7% | Yellow |
| 杠杆率 (Net Debt/LTM EBITDA) | 4.2x | 3.8x | 4.0x | +0.4x | Red |

契约合规范式：

> 契约：杠杆率 ≤ 4.5x（本期 4.2x，缓冲仅 0.3x，趋紧）；利息保障倍数 ≥ 3.0x（本期 3.4x，合规）。若 EBITDA 趋势不改善，下一测试日有击穿杠杆契约风险。

## 注意事项

- **没有基准就不打标**：未提供预算/计划时，务必先向用户索取，再做差异分析；缺则标占位符，不臆造预算值。
- **不臆设行业 KPI**：不同被投企业关注的运营指标不同，先问"这家公司看什么"再补充，别套模板。
- **契约条款须确认**：契约红线（杠杆上限、利息保障下限等）未知时，向用户索取信贷协议条款；不要凭经验默认阈值。
- 三组数（实际/预算/上期）务必同口径——scope、期间、币种/汇率一致，否则差异失真；LTM EBITDA 注意是否含调整项(addbacks)。
- 杠杆率、利息保障倍数等用于契约的口径，须与信贷协议的定义一致（常含特定 addback / pro forma 调整），勿用通用口径替代。
- **产出董事会级口径**：精简、事实、无废话；红黄预警必须带背景说明，不能只给颜色。
- 本技能只解释"已发生业绩相对计划的构成与偏离"，不出估值、投决或前瞻预测结论。

## 互见

- related：`budget-variance-analysis`（把本技能标出的预算差异进一步做量×价/率×结构的量化动因拆解与瀑布桥接）；`equity-earnings-update-report`（二级股权/财报更新报告，与一级被投跟踪互为镜像）；`startup-financial-modeler`（被投企业的预算/承销案基准来自财务模型，业绩回流校准假设）。
- combines_with：`board-meeting-prep` / `board-deck-builder`（组合公司业绩页是投委会/董事会材料的核心，本技能产出其内容）；`cfo-financial-advisor`（以 CFO 视角解读差异动因并定下一步动作）；`data-storyteller`（把 KPI 表与趋势图转成给 LP/董事会的可视叙事）。

---

本条采编自 anthropics/financial-services（Apache-2.0）。
