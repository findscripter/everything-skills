---
name: client-performance-report
title: 客户业绩报告生成
description: 当需要为客户/家庭账户生成面向客户的季度或年度业绩报告时使用；做组合收益、配置分解与市场点评的多页报告（含家庭/分账户业绩表、持仓明细、活动汇总、规划备注、PDF/Word/Excel 产出）；不适用于内部投研、择时选股或未经合规审批就对外分发新模板；触发词：客户报告、client report、业绩报告、performance report、季度报告、quarterly report、客户对账单、client statement
domain: 领域/fintech
triggers: [客户报告, client report, 业绩报告, performance report, 季度报告, quarterly report, 客户对账单, client statement, 生成报告]
tags: [fintech, client-reporting, performance-report, wealth-management, portfolio, compliance]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [excel, spreadsheet, pdf, docx]
requires: []
related: [fixed-income-portfolio-review, client-review-prep, portfolio-risk-metrics, investment-proposal-builder]
combines_with: [portfolio-rebalancer, tax-loss-harvesting, investment-thesis-tracker]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

当需要为客户（个人或家庭账户）生成一份**面向客户、可对外分发**的业绩报告，用于季度、年度或自定义区间的定期沟通时使用。典型触发：「客户报告 / client report」「业绩报告 / performance report」「为〈客户〉出季度报告 / quarterly report for [client]」「客户对账单 / client statement」「批量生成报告 / generate reports」。

不该用的边界：
- 不做内部投研、择时、选股——本技能只汇总和呈现既有持仓与业绩，不预测涨跌。
- 不替代合规审批——新模板首次对外分发前必须先过合规复核（见注意事项）。
- 基准选择不可「挑好看的」——只用 IPS（投资政策声明）中约定的基准。
- 未确认费率口径前不出数——业绩默认按**净费后（net of fees）**计算，除非客户/合规要求列示费前（gross）。

## 步骤

1. **确定报告参数**：客户姓名与家庭账户；报告区间（季度 / YTD / 年度 / 自定义）；纳入账户（全部或指定账户）；基准（S&P 500、60/40 混合、或匹配 IPS 的自定义基准）；机构品牌（Logo、配色、免责声明）。
2. **业绩汇总**：填家庭账户汇总表（组合 vs 基准 vs 超额）与分账户表（见指令）。
3. **配置概览**：当前资产配置，配饼图或柱状图，列各资产类别占比、金额、基准占比。
4. **持仓明细**：逐只列证券、资产类别、份额、价格、市值、占比、区间收益。详略匹配客户偏好。
5. **市场点评**：按客户专业度撰写简短点评——本季市场发生了什么（2-3 句）、如何影响组合、展望与持仓逻辑（2-3 句）。零售客户不用术语，专业投资者可更技术化。
6. **活动汇总**：区间内成交、缴款与提取、收到的股息与利息、收取的费用、再平衡活动。
7. **规划备注**：财务目标进度（退休、教育金等）、计划变更或建议、待办事项、下次复核日期。
8. **输出**：带品牌的 PDF 报告（8-12 页）；可定制的 Word 文档；可选的 Excel 数据附录。

## 指令

**家庭账户汇总表：**

| | QTD | YTD | 1 年 | 3 年化 | 5 年化 | 成立至今化 |
|---|---|---|---|---|---|---|
| 组合 Portfolio | | | | | | |
| 基准 Benchmark | | | | | | |
| 超额 +/- | | | | | | |

**分账户表：**

| 账户 | 类型 | 市值 | QTD | YTD | 基准 |
|---|---|---|---|---|---|
| 联名应税 Joint Taxable | 经纪 Brokerage | | | | |
| 个人 IRA | 传统 Traditional | | | | |
| Roth | Roth IRA | | | | |
| 529 教育金 | Education | | | | |
| **合计 Total** | | | | | |

**配置概览表：**

| 资产类别 | 占组合% | 金额 | 基准% |
|---|---|---|---|
| | | | |

**持仓明细表：**

| 证券 | 资产类别 | 份额 | 价格 | 市值 | 占组合% | QTD 收益 |
|---|---|---|---|---|---|---|

**报告结构（PDF 装订顺序）：**
1. 封面（客户名、区间、机构 Logo）
2. 执行摘要（1 页）
3. 业绩汇总（1-2 页）
4. 配置概览含图表（1 页）
5. 持仓明细（1-2 页）
6. 市场点评（1 页）
7. 活动汇总（1 页）
8. 规划备注（1 页）
9. 披露与免责声明（1 页）

## 示例

输入：为「张氏家庭」出 Q2 季度报告，纳入联名应税 + 个人 IRA + 529 共 3 个账户，基准用 IPS 约定的 60/40 混合，业绩净费后，零售客户口径。

处理：先汇总家庭组合 QTD/YTD/1 年/3 年化等收益并对比 60/40 基准算超额；分账户填表；当前配置出饼图并对照基准占比；列主要持仓与区间收益；市场点评用通俗语言写本季波动、对组合影响与持仓逻辑各 2-3 句；汇总本季成交、缴款、股息与费用；规划备注写退休/教育金目标进度与下次复核日期。

输出：8-12 页带机构品牌 PDF（按上方 9 段结构）+ 可编辑 Word + Excel 数据附录；最后一页附标准免责声明（过往业绩不代表未来、风险因素）。

## 注意事项

- 业绩须按**净费后**计算，除非客户或合规明确要求费前口径。
- 始终附适当的披露与免责声明（过往业绩、风险因素）。
- 跨客户保持一致——使用标准化模板，不要一客一格。
- 详略匹配客户——有人要看每一只持仓，有人只要一页摘要。
- 基准选择以 IPS 为准，绝不挑「最好看」的基准。
- 新模板首次对外分发前，先过合规审批。

## 互见

- portfolio-rebalancer：再平衡产生的调仓可作为本报告「活动汇总 / 再平衡活动」的输入。
- portfolio-risk-metrics：风险指标可补充进业绩与配置章节。
- tax-loss-harvesting：税损收割活动并入「活动汇总」与税务相关披露。
- advisor-fit-analyzer：客户画像与专业度判断，辅助决定市场点评的详略与口吻。

---

本条采编自 anthropics/financial-services（Apache-2.0）。
