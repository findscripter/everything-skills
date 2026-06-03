---
name: odoo-sales-crm-expert
title: Odoo 销售与 CRM
description: 当配置或优化 Odoo CRM 销售管线与报价时使用；做管线阶段设计、报价模板（含可选产品）、分层价格表、销售团队与线索自动分配、预测看板配置；不适用于 Odoo 二开建模、财税本地化合规、脱离 Odoo 的通用销售方法论；触发词：odoo crm、销售管线、pipeline、报价模板、quotation template、价格表、pricelist、线索评分、lead scoring、销售预测
domain: 领域/erp
triggers: [odoo crm, 销售管线, pipeline, stage 阶段, 报价模板, quotation template, 价格表, pricelist, 线索评分, lead scoring, 销售预测, forecast, 销售团队, 丢单原因, lost reasons]
tags: [odoo, crm, sales, erp, pipeline, quotation, pricelist, forecasting]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Odoo, Odoo CRM, Odoo Sales, Sale Management module]
requires: []
related: [odoo-localization-compliance, sales-forecast-builder, salesforce-automation]
combines_with: [sales-forecast-builder, sales-enablement]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

用于在 Odoo 里把销售与 CRM 流程「配出来、跑起来、能预测」的场景：

- 为自家销售流程设计 CRM 管线阶段（B2B/B2C），并让赢单/丢单口径统一。
- 制作含可选产品/加购项的报价模板，标准化报价、缩短出价时间。
- 配置客户分层价格表（VIP、批发、出口等），用规则替代手改单价。
- 按地域/销售员自动分配线索，开启销售团队营收目标驱动预测看板。

**不该用边界**：

- Odoo 模块二次开发、字段/模型建模 → 不在本技能内。
- 国家财税/电子发票合规配置 → 用 `odoo-localization-compliance`。
- 脱离 Odoo 的通用销售话术/方法论 → 用 `sales-enablement` 等。
- 缺关键输入（Odoo 版本、是否装 Sale Management、销售层级、币种）时，先追问再动手，不要凭空配置。

## 步骤

1. **理清前置**：Odoo 版本（v16+ 有预测式线索评分）、是否启用 Sales Settings 里的「Sales Management」「Pricelists」。
2. **建管线阶段**：CRM → Configuration → Stages，按真实流程定义阶段并设置 `probability`；终态用 `is_won` 标赢单，丢单走「Mark as Lost」。
3. **配丢单原因**：CRM → Configuration → Lost Reasons，积累丢单数据集供复盘。
4. **建报价模板**：Sales → Configuration → Quotation Templates，区分必选行与 Optional 行，按需开在线签署/在线付款。
5. **配价格表**：Sales Settings 勾选 Pricelists，再建带规则的价格表，分配到客户档案而非手改单价。
6. **线索分配与团队**：开启 Sales Teams 并设营收目标；按地域/销售员配自动分配规则（地域路由需自定义规则或企业版 Leads 模块）。
7. **喂预测数据**：每条商机都填 Expected Revenue 与 Closing Date，看板预测才有意义。

## 指令

阶段 → 概率映射（典型 B2B 管线，建阶段时填入 probability）：

| 阶段 | probability | 说明 |
|---|---|---|
| New Lead | 10% | 新线索 |
| Qualified | 25% | 已确认需求/预算 |
| Proposal Sent | 50% | 已发方案 |
| Negotiation | 75% | 谈判中 |
| Won | `is_won: YES` | 终态赢单 |
| Lost | 走「Mark as Lost」 | 终态丢单，记 Lost Reason |

关键开关：

- **Rotting Days**（CRM Settings）：标红长期不动的商机。
- **Predictive Lead Scoring**（v16+，AI）：按历史数据自动更新 probability；想手工按阶段控概率就在 Settings 关掉它。

## 示例

**示例 1：报价模板（SaaS 年度订阅）**

```
菜单：Sales → Configuration → Quotation Templates → New
（依赖 "Sales Management" 模块，在 Sales Settings 启用）

Template Name: SaaS Annual Subscription
Valid for: 30 days

行（Lines）：
  1. Platform License   | Qty 1 | $1,200/yr | 必选
  2. Onboarding Package | Qty 1 | $500      | Optional 可选
  3. Premium Support    | Qty 1 | $300/yr   | Optional 可选
  4. Extra User License | Qty 0 | $120/user | Optional 可选

签署与付款：
  ☑ 确认订单前需在线签署（Online Signature）
  ☑ 在线付款（定金）— 50% 预付
Notes: "Prices valid until expiration date. Subject to Schedule A terms."
```

**示例 2：VIP 客户分层价格表（85 折）**

```
菜单：Sales → Configuration → Settings → ☑ 启用 Pricelists
菜单：Sales → Configuration → Pricelists → New

Name: VIP Customer — 15% Off
Currency: USD
Discount Policy: 在报价单上展示公开价与折扣

规则（Rules）：
  Apply To: All Products
  Compute Price: Discount
  Discount: 15%
  Min. Quantity: 1

分配给客户：
  客户档案 → Sales & Purchase 标签 → Pricelist → VIP Customer
```

## 注意事项

- **不要**直接从线索跳到开票而跳过 CRM 商机——会破坏管线分析。
- **不要**在报价行手改单价当临时方案——用价格表规则。
- v16+ 的 **Predictive Lead Scoring** 要喂历史数据才准，别无脑忽略它。
- **每条商机**都设 Expected Revenue + Closing Date，否则营收预测看板没数据。
- 限制：佣金规则、地域线索路由、邮件序列/培育（cadence）均非 Odoo CRM 原生——分别需自定义/三方模块、企业版 Leads、或 Email Marketing / Marketing Automation 模块。
- 报价模板的「可选产品」能力依赖 **Sale Management** 模块，基础 `sale` 模块没有。
- 输出不能替代针对具体环境的验证与测试；关键输入缺失时先追问。

## 互见

- related：`odoo-localization-compliance` —— 同一 Odoo 栈的财税/电子发票合规配置。
- related：`salesforce-automation` —— 另一主流 CRM 平台的等价自动化场景。
- combines_with：`sales-forecast-builder` —— 把 Odoo 管线/商机数据接入更精细的销售预测建模。
- combines_with：`sales-enablement` —— 报价模板/话术等销售赋能内容与 Odoo 流程配套落地。

---
本条采编自 sickn33/antigravity-awesome-skills（MIT）。
