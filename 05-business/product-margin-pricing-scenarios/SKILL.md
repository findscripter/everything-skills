---
name: product-margin-pricing-scenarios
title: 产品毛利与定价情景测算
description: 当小企业主在调价前需要看清各产品毛利和涨/降价后果时使用；做毛利率明细表+三档定价情景（持平/涨价/降价）数据视图+涨价沟通话术稿，只呈现数据不给定价建议；不适用于直接改系统里的价格、做SaaS套餐分层策略（→pricing-strategy）、或在无成本数据时硬编毛利。触发词：毛利、毛利率、定价、调价、涨价、降价、price check、margin、pricing scenario
domain: 商业/finance
triggers: [毛利, 毛利率, 定价, 调价, 涨价, 降价, 盈亏平衡, price check, margin, pricing scenario, QuickBooks, PayPal]
tags: [finance, smb, pricing, margin, scenario-analysis, quickbooks, break-even]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [QuickBooks, PayPal, Read, WebFetch, Bash]
requires: []
related: [pricing-strategy, unit-economics-analyzer, smb-quarterly-business-review, cfo-financial-advisor]
combines_with: [smb-cash-flow-forecast, smb-business-pulse]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
免责声明：本技能只做数据测算与情景呈现，不构成定价或财务建议。最终定价决策归企业主，对外报价前请由具备资质的财务人员复核。

## 何时使用

- 小企业主调价前，想一次看清「每个产品现在赚不赚钱」+「涨价/降价后大致什么后果」，需要一张毛利明细表和三档情景数据视图来辅助决策。
- 已接入 QuickBooks（收入+成本）、可选 PayPal（交叉校验），要把财务全貌摆在桌面上再决定收多少钱。
- 触发词：毛利、毛利率、定价、调价、涨价、降价、price check、margin、pricing scenario。

不该用的边界：

- **绝不直接推荐某个具体价格**，也**绝不回写**任何系统的价格 —— 本技能只产出数据视图，定价权在企业主。
- 做 SaaS/订阅产品的价值度量、Good-Better-Best 套餐分层、支付意愿研究 → 用 `pricing-strategy`，那是策略层，本技能是单店毛利+情景的数据层。
- 取不到 COGS/成本数据时不要硬凑毛利 —— 标注成本数据缺口，禁止臆造。
- 需要 CFO 视角的战略解读、融资模型 → 见互见，超出本技能。

## 步骤 / 指令

参数：`PRODUCT_NAME`（可选）—— 指定单个产品/服务分析；省略则分析全部在售产品。

```
第 1 步 — 当前毛利基线
  1. 从 QuickBooks 拉近 90 天按产品/服务的收入。
  2. 从 QuickBooks 拉每个产品的 COGS / 直接成本（若已分类）。
  3. 从 PayPal 拉同产品毛销售额做交叉校验。
  4. 算每个产品当前毛利率：(收入 − COGS) ÷ 收入。
  5. 任何毛利率 < 20% 的产品标为风险。

第 2 步 — 三档定价情景（只出数据表，不给建议）
  情景 A 持平：现价 × 现量算收入，现 COGS 算毛利。
  情景 B 涨价（+10%~+20%，由企业主指定）：
     - 分别假设掉量 0% / 5% / 10% 下的新收入
     - 算出「维持当前利润所需的盈亏平衡销量」
  情景 C 降价（−10%，以量补价）：
     - 分别假设增量 10% / 20% / 30% 下的新收入
     - 算出「追平当前利润所需的销量」
  每个情景呈现为数据表，不是建议。

第 3 步 — 涨价沟通话术稿（仅涨价情景需要）
  给企业主一份大白话简报，用于向客户说明涨价：
     - 一段解释变化的话
     - 三种口径的关键信息（直接型 / 价值型 / 共情型）
     - 建议时机与渠道（邮件 / 发票附言 / 当面）
```

毛利明细表格式（保留源约束）：

```
Product          | Revenue  | COGS     | Gross Margin | Margin %
{product}        | ${amt}   | ${amt}   | ${amt}       | {X}%
```

连接器失败处理：
- QuickBooks 不可达 → **停止**，毛利分析必须依赖 QB 的收入与成本数据。
- PayPal 缺失 → 仅用 QB 跑，并注明「PayPal 未接入 —— 跳过对 PayPal 销售额的交叉校验」。

审批闸门（硬约束）：
- **绝不推荐具体价格**，只给数据视图，定价决策归企业主。
- **COGS 数据不全要标红**（很多 QB 设置不按产品记 COGS），明确指出缺口。
- **绝不更新** QB / PayPal / 任何接入系统里的价格。

## 示例

某产品现价 $50、月销 200 件、COGS $30/件（毛利率 40%）。

毛利基线：

```
Product   | Revenue | COGS   | Gross Margin | Margin %
咖啡豆     | $10,000 | $6,000 | $4,000       | 40%
```

情景 B 涨价 +10%（新价 $55，COGS 不变 $30）：

| 掉量假设 | 销量 | 收入 | 毛利 | 备注 |
|---|---|---|---|---|
| 0% | 200 | $11,000 | $5,000 | 利润↑$1,000 |
| 5% | 190 | $10,450 | $4,750 | 仍高于现利润 |
| 10% | 180 | $9,900 | $4,500 | 仍高于现利润 |

盈亏平衡：维持 $4,000 当前利润，新价下只需卖 160 件（即可承受掉量 20%）。

委托提示词（给 Agent 调用）：
> 接入 QuickBooks（必需）和 PayPal（可选），拉近 90 天按产品的收入与 COGS，算每产品毛利率并对 <20% 标风险。然后对每个产品建三档情景：持平、涨价(+10%~+20%，掉量0/5/10%)、降价(−10%，增量10/20/30%)，各算盈亏平衡销量，全部以数据表呈现，**绝不推荐具体价格、绝不回写系统**。COGS 缺失就标缺口不要编。涨价情景附三种口径的客户沟通话术。结尾问「你想深入看哪个情景？」

## 注意事项

- 三组数务必同口径（同期、同币种、同 scope），否则毛利与情景失真。
- COGS 经常缺失或不按产品记 —— 缺就明确标注，不杜撰，否则毛利率全错。
- 盈亏平衡的分母（现利润、现价）为零或接近零时，改用绝对额表述并标注。
- 三个情景只是「数据推演」，不替企业主做决策；不出审计、合规或预测结论。
- 全程只读不写：任何系统里的价格、库存、客户记录都不得修改。
- 结尾固定问句：「你想深入看哪个情景？」（Which scenario would you like to explore further?）

## 互见

- requires：无
- related：`pricing-strategy`（SaaS/订阅的套餐分层与价值度量策略，本技能聚焦单店毛利+情景数据）；`cfo-financial-advisor`（把毛利与情景结果上升到 CFO 战略解读与下一步动作）；`startup-financial-modeler`（情景测算的假设可回流校准财务模型）；`variance-flux-commentary`（实际毛利偏离时写文字波动说明）
- combines_with：`cfo-financial-advisor`（数据视图 + 战略解读组合成完整定价决策包）；`pricing-strategy`（小店毛利数据为套餐/价值定价策略提供地板与现状基线）

---
本条采编自 anthropics/knowledge-work-plugins（Apache-2.0）。
