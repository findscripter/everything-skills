---
name: merger-accretion-dilution-model
title: 并购增厚/摊薄分析模型
description: 当为 M&A 交易评估对收购方每股收益（EPS）影响时使用；按七步构建并购模型并产出含假设/来源与运用/备考利润表/增厚摊薄汇总/敏感性/盈亏平衡的 Excel 工作簿与一页式交易后果摘要；不适用于 LBO/DCF 估值、单公司财务建模或法律尽调。触发词：并购增厚摊薄、accretion dilution、merger model、并购模型、备考 EPS、pro forma EPS、交易影响分析、merger consequences、协同效应敏感性。
domain: 领域/fintech
triggers: [并购增厚摊薄, accretion dilution, merger model, 并购模型, 备考 EPS, pro forma EPS, 交易影响分析, merger consequences, 协同效应敏感性]
tags: [fintech, m-and-a, valuation, financial-modeling, accretion-dilution, investment-banking, excel]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Excel]
requires: []
related: [lbo-model-builder, dcf-valuation-model, three-statement-model, pe-returns-sensitivity]
combines_with: [dcf-valuation-model, three-statement-model, ma-playbook]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

适用：评估潜在收购、为路演（pitch book）准备并购后果分析、就交易条款（出价溢价、现金/股票对价比例、债务融资）提供建议时，量化交易对收购方备考 EPS 的增厚（accretion）或摊薄（dilution）影响。

不该用：
- 单纯的杠杆收购（LBO）回报建模、DCF/可比公司估值 —— 本模型只算 EPS 影响，不输出内在价值。
- 单一公司的三表财务预测（无交易双方）。
- 法律/税务尽职调查、监管审批分析。

## 步骤

1. 收集输入。收购方：名称、现价、流通股数、LTM/NTM EPS（GAAP 与调整后）、P/E、税前债务成本、税率、账面现金与存量债务。标的：名称、现价、流通股数（若上市）、LTM/NTM EPS 或净利润、企业价值或股权价值。交易条款：每股出价（或对现价的溢价）、现金/股票对价比例、为现金部分新增的债务、预期协同（收入+成本）及分阶段达成时间表、交易及融资费用、预计交割日。
2. 收购价分析。计算每股出价、对现价溢价、股权价值、加承担净债务得企业价值，并反推隐含 EV/EBITDA 与 P/E。
3. 来源与运用（Sources & Uses）。来源：新增债务、自有现金、新发股权；运用：股权收购对价、再融资标的债务、交易费用、融资费用。两侧合计必须相等。
4. 备考 EPS（增厚/摊薄）。逐年（第 1-3 年）搭建桥接：收购方净利润 + 标的净利润 + 税后协同 - 动用现金的税后放弃利息收入 - 新债税后利息 - 税后无形资产摊销 = 备考净利润；除以备考股数得备考 EPS；与收购方独立 EPS 比较得增厚/(摊薄)%。
5. 敏感性分析。做两张二维表：(a) 增厚摊薄 vs 协同金额（如 0/25/50/75/100M）× 出价溢价（如 15%/20%/25%/30%）；(b) 增厚摊薄 vs 现金/股票对价比例（100%现金、75/25、50/50、25/75、100%股票），按年列示。
6. 盈亏平衡协同。求使第 1 年 EPS 中性（既不增厚也不摊薄）所需的最低协同金额。
7. 输出。Excel 工作簿（假设页 / 来源与运用 / 备考利润表 / 增厚摊薄汇总 / 敏感性表 / 盈亏平衡）+ 供路演册使用的一页式并购后果摘要。

## 指令

- 备考 EPS 桥接公式（每年）：
  `备考净利润 = 收购方净利润 + 标的净利润 + 税后协同 − 放弃的现金利息收入(税后) − 新债利息(税后) − 无形资产摊销(税后)`
  `备考 EPS = 备考净利润 ÷ 备考股数`
  `增厚/(摊薄)% = 备考EPS ÷ 收购方独立EPS − 1`
- 税后金额一律用收购方边际税率折算：`税后项 = 税前项 × (1 − 税率)`。
- 股票对价新增股数：`新增股数 = 现金外的对价金额 ÷ 收购方现价`（即用收购方当前股价定换股比例）。
- 来源合计 = 运用合计，作为模型自洽校验。

## 示例

收购方 P/E 20x、税率 25%，以 100% 现金 + 新债融资收购标的：
- 标的税后净利润贡献为正、协同税后贡献为正，但若新债税后利息 + 放弃的现金利息收入合计超过标的与协同贡献，则第 1 年表现为摊薄。
- 协同分阶段：第 1 年常仅为达产（run-rate）协同的 25-50%，故第 1 年易摊薄、第 2-3 年随协同释放转为增厚 —— 敏感性表能直观呈现该拐点。
- 盈亏平衡协同：反解使第 1 年备考 EPS = 独立 EPS 的协同金额，作为交易条款谈判的护栏。

## 注意事项

- 相关处同时列示 GAAP 与调整后（现金）EPS。
- 股票对价：用收购方现价定换股比例，并标注新发股份带来的摊薄。
- 务必做购买价分摊（PPA）：商誉与无形资产摊销影响 GAAP EPS。
- 协同分阶段是关键变量：第 1 年通常只有达产协同的 25-50%。
- 不要漏掉动用现金的放弃利息收入与新增债务的利息支出两项调整。
- 协同与利息调整所用税率应与收购方边际税率一致。

## 互见

（无）

---
本条采编自 anthropics/financial-services（Apache-2.0）。
