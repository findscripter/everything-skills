---
name: financial-statements-generator
title: 财务三表生成
description: 当做月度/季度/年度/YTD 损益表、月结需标记重大差异、实际对预算比对、或为管理层准备财务摘要时使用；做含本期 vs 上期 vs 上年同期 vs 预算的损益表加差异分析、关键指标与重大差异清单，并备资产负债表/现金流量表参考格式与 GAAP（ASC 220/210/230）列报口径；不适用于提供投资/会计意见、出审计结论或正式申报底稿，须经合格财务人员复核；触发词：财务三表、损益表、income statement、资产负债表、现金流量表、月结、variance analysis、P&L
domain: 商业/copy
triggers: [财务三表, 损益表, income statement, 资产负债表, 现金流量表, 月结, variance analysis, P&L, 财务报表, 实际对预算]
tags: [finance, accounting, financial-statements, gaap, month-end-close, variance]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [sql, python, pandas]
requires: []
related: [budget-variance-analysis, three-statement-model, month-end-close-manager, variance-flux-commentary]
combines_with: [budget-variance-analysis, board-deck-builder]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## 何时使用

- 编制月度 / 季度 / 年度 / 年初至今（YTD）损益表（P&L），需带对比期与差异分析。
- 月结关账后，需逐条标记重大差异（material variances）供调查。
- 实际数对预算 / 预测比对，或为管理层评审准备财务摘要。
- 需查 GAAP 列报要求（ASC 220/210/230）或期末调整 / 重分类口径时。
- 触发词：财务三表、损益表、income statement、资产负债表、现金流量表、月结、variance analysis、P&L。

不该用的边界：

- 本技能仅辅助报表工作流，**不提供财务 / 投资 / 会计意见**；任何报表用于对外报告或申报前须经合格财务人员复核。
- 不出审计结论、税务意见或正式申报底稿。
- 取不到科目背后业务数据时，不要臆造差异动因——标"动因待查"。
- 单期算账、不对比上期/预算 → 只是出报表，差异分析部分留空。

## 步骤 / 指令

输入：`period-type`（monthly / quarterly / annual / ytd）、`period`（如 `2024-12` / `2024-Q4` / `2024`）。

```
1. 取数（Gather Financial Data）
   - 接 ERP / 数据仓库：拉本期试算平衡表或损益数据、对比期数据
     （上期 / 上年同期 / 预算）、科目层级与分组用于列报。
   - 无数据源：提示用户粘贴试算表、上传表格，或提供
     本期收入/费用（按科目或类别）、对比期数、已知调整/重分类。

2. 生成损益表（多列对比格式，见示例）
   - 列：本期 | 上期 | 差异($) | 差异(%) | 预算 | 预算差异($)
   - 行：收入 → 收入成本 → 毛利(含毛利率) → 营业费用
     → 营业利润(含营业利润率) → 营业外收支 → 税前利润
     → 所得税 → 净利润(含净利率)。
   - 口径："in thousands"（千元）除非另注；单位与会计期间须一致。

3. 差异分析（Variance Analysis）
   - 金额差异 = 本期 − 上期（或本期 − 预算）
   - 百分比差异 = (本期 − 上期) / |上期| × 100
   - 利润率/比率类用基点(bp)表示变动，1 bp = 0.01%。
   - 重要性阈值（择一或组合触发，按公司标准）：
       固定金额（如 $50K/$100K）| 百分比（如 10%/15%）
       | 金额或百分比任一超标 | 按科目规模分档（见示例阈值表）。
   - 差异拆解（driver decomposition）：量/价/结构(mix)效应、
     新增或停用科目、一次性/非经常项、时间性差异、汇率(FX)影响。
   - 逐条：①量化($+%) ②判有利/不利 ③拆动因 ④写业务原因叙述
     ⑤判临时 or 趋势 ⑥列后续动作（深查/更新预测/改流程）。

4. 关键指标摘要：收入增速、毛利率、营业利润率、净利率、
   OpEx/收入占比、有效税率（各列本期/上期/变动 pp）。

5. 重大差异清单：科目 | 差异($) | 差异(%) | 方向 | 初步动因 | 动作。

6. 输出：格式化损益表 + 关键指标 + 重大差异清单（带调查标记）
   + 未解释差异的追问清单；可对单条差异下钻 →
   交 variance-flux-commentary 写 flux 说明。
```

资产负债表 / 现金流量表：本技能内置二者的**参考行项格式**与 GAAP 列报要点，供按需展开。资产负债表区分流动/非流动、应收净额、PP&E 净额、商誉不摊销减值测试（ASC 350）、租赁确认使用权资产与负债（ASC 842）；现金流量表常用间接法（净利润起调非现金项），披露已付利息与所得税，非现金投融资活动单独披露。

## 示例

损益表多列格式（节选，单位：千元）：

```
INCOME STATEMENT — Period: 2024-12 (in thousands)

                          Current   Prior    Var($)   Var(%)   Budget   BudVar($)
REVENUE
  Product revenue         $42,300  $38,900  $3,400    8.7%    $40,000   $2,300
  Service revenue         $11,200  $10,800    $400    3.7%    $11,500    ($300)
TOTAL REVENUE             $53,500  $49,700  $3,800    7.6%    $51,500   $2,000
COST OF REVENUE          ($16,000)($15,100)  $(900)   6.0%   ($15,800)  $(200)
GROSS PROFIT             $37,500  $34,600  $2,900    8.4%    $35,700   $1,800
  Gross Margin             70.1%    69.6%   (+50 bp)
OPERATING INCOME         $12,400  $10,900  $1,500   13.8%    $11,200   $1,200
NET INCOME (LOSS)         $9,100   $8,100   $1,000   12.3%     $8,400     $700
  Net Margin               17.0%    16.3%   (+70 bp)
```

分档重要性阈值（按需调整）：

| 科目规模 | 金额阈值 | 百分比阈值 |
|---|---|---|
| > $10M | $500K | 5% |
| $1M – $10M | $100K | 10% |
| < $1M | $50K | 15% |

委托提示词（给 Agent 调用时）：
> 按 `period-type` 与 `period` 取本期/上期/上年同期/预算（同一口径）。生成多列损益表，逐行算金额与百分比差异、利润率用 bp。对超重要性阈值的科目拆量/价/结构/一次性/时间性/汇率动因，写一句业务原因，判临时还是趋势；数据不足标"动因待查"，不要编。输出损益表 + 关键指标摘要 + 重大差异清单 + 追问清单。提醒报表须经合格财务人员复核。

## 注意事项

- **免责**：本技能辅助报表流程，不提供财务/投资/会计意见；正式报告或申报前须经合格财务人员复核。
- 对比口径必须一致：同一 scope、会计期间、币种/汇率；不一致先对齐再比，否则差异失真。
- 百分比注意分母为零或近零（如新开科目上期为 0），改用绝对额表述或标注。
- 差异动因讲"为什么变"而非复述数字；取不到底层数据就标"动因待查"，禁止臆造。
- GAAP 列报要点：费用按职能分类（COGS/R&D/S&M/G&A）为美国公司常见；营业与营业外分列；所得税单列；US GAAP 与 IFRS 均禁止"非常项目(extraordinary items)"；终止经营单列且按税后列示。
- 股权激励(SBC)计入各职能费用、附注披露总额；重组费用重大时单列或附注；非 GAAP 指标须明确标注并对 GAAP 调节。
- 期末调整勿漏：应计/预提、递延、折旧摊销、坏账准备、存货跌价、外币重估、税款计提、公允价值调整；重分类：长债一年内到期转流动、终止经营重分类、内部交易抵销。

## 互见

- related：`variance-flux-commentary`（对单条重大差异下钻、逐条写底层业务的 flux 波动说明，对应源中 `/flux`）；`cfo-financial-advisor`（把三表与差异结论上升到 CFO 级财务策略判断）；`board-deck-builder`（将损益表与关键指标摘要做成董事会汇报材料）；`data-storyteller`（把差异叙事转成面向非财务受众的图文故事）。
- combines_with：`variance-flux-commentary`（出表后逐科目补 flux 说明）、`cfo-financial-advisor`（报表 → 决策）、`board-deck-builder`（报表 → 汇报）。

---
本条采编自 anthropics/knowledge-work-plugins（Apache-2.0）。
