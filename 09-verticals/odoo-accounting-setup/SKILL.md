---
name: odoo-accounting-setup
title: Odoo 会计配置
description: 当从零搭建 Odoo 会计（科目表、日记账、税码、财政税位、付款条件、银行对账）时使用；做按菜单路径与精确字段值完成配置并给出验收清单；不适用于多币种汇兑损益、国家级电子发票合规（改用 odoo-localization-compliance）与薪酬会计；触发词：odoo 会计、科目表、日记账、税码、财政税位、付款条件、银行对账、Net 30、early payment discount、reconciliation model
domain: 领域/erp
triggers: [odoo 会计, 科目表, chart of accounts, 日记账, journal, 税码, 财政税位, fiscal position, 付款条件, payment terms, 银行对账, bank reconciliation, Net 30, early payment discount, reconciliation model, 锁定日期, lock dates]
tags: [odoo, accounting, erp, chart-of-accounts, tax, fiscal-position, payment-terms, bank-reconciliation]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Odoo, l10n modules]
requires: []
related: [odoo-localization-compliance, odoo-rpc-api, odoo-module-developer, odoo-xml-views-builder]
combines_with: [odoo-localization-compliance, month-end-close-manager]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

面向功能顾问 / 企业主，从零把 Odoo 会计配置正确：

- 新建一个 Odoo 实例、为公司首次落地会计。
- 配置多公司或多币种会计的基础结构。
- 排查税额计算、财政税位（fiscal position）映射错误。
- 创建分期/折扣类付款条件（如 Net 30、首付 50%、早付折扣）。
- 配置银行对账自动匹配规则（reconciliation model）。

**不该用边界**：本技能不深入 **多币种汇兑损益（FX revaluation）**；**国家级电子发票合规**（CFDI / FatturaPA / SAF-T）需本地化模块，改用 `odoo-localization-compliance`；**薪酬会计**（工资日记账、扣款科目）不在范围内。Odoo 社区版不含完整 **锁定日期** 功能，部分管控为企业版专属。涉及具体环境务必自行验证、测试并经税务/审计专业复核。

## 步骤

1. **先装本地化模块**：按国家安装 `l10n_*`（如 `l10n_us`、`l10n_mx`）——它会建立正确的科目表，不要手工从零搭。
2. **配置日记账**：销售、采购、银行、现金、杂项各一套；银行/现金日记账绑定对应银行账户。
3. **配置税码与财政税位**：用 fiscal position 自动切换 B2B/B2C、境内/出口税率，**绝不在单张发票上手改税**。
4. **创建付款条件**：v16+ 用内置 **Early Payment Discount** 字段建模早付折扣，不要再拆付款条件行。
5. **配置对账模型**：为银行手续费等重复条目建 reconciliation model 自动匹配，而非手工分录。
6. **月结后锁定**：Accounting → Actions → Lock Dates，防止追溯改账。

## 指令

关键菜单路径：

- 科目表：`Accounting → Configuration → Chart of Accounts`
- 日记账：`Accounting → Configuration → Journals`
- 税：`Accounting → Configuration → Taxes`
- 财政税位：`Accounting → Configuration → Fiscal Positions`
- 付款条件：`Accounting → Configuration → Payment Terms`
- 对账模型：`Accounting → Configuration → Reconciliation Models`
- 锁定日期：`Accounting → Actions → Lock Dates`

## 示例

**示例 1：付款条件 Net 30 + 2% 早付折扣（v16+）**

```text
菜单：Accounting → Configuration → Payment Terms → New

Name: Net 30 / 2% Early Pay Discount
Company: [你的公司]

Lines:
  Line 1:
    - Due Type: Percent
    - Value: 100%
    - Due: 30 days（全额 30 天内到期）

Early Payment Discount（v16+）:
  Discount %: 2
  Discount Days: 10
  Balance Sheet Accounts:
    - Gain: 4900 Early Payment Discounts Granted
    - Loss: 5900 Early Payment Discounts Received
```

> v16+ 用内置 **Early Payment Discount** 字段，客户在折扣窗口内付款时 Odoo 自动入账并生成正确分录，无需旧版拆行 workaround。

**示例 2：欧盟 B2B 内部交易财政税位**

```text
菜单：Accounting → Configuration → Fiscal Positions → New

Name: EU Intra-Community B2B
Auto-detection: ON
  - Country Group: Europe
  - VAT Required: YES（客户须有欧盟 VAT 号）

Tax Mapping:
  Tax on Sales (21% VAT) → 0% Intra-Community VAT
  Tax on Purchases       → 0% Reverse Charge

Account Mapping:
  （留空，除非本地化要求重映射科目）
```

**示例 3：银行手续费自动对账模型**

```text
菜单：Accounting → Configuration → Reconciliation Models → New

Name: Bank Fee Auto-Match
Type: Write-off
Matching Order: 1

Conditions:
  - Label Contains: "BANK FEE" OR "SERVICE CHARGE"
  - Amount Type: Amount is lower than: $50.00

Action:
  - Account: 6200 Bank Charges
  - Tax: None
  - Analytic: Administrative
```

## 注意事项

- ✅ 先装国家 **本地化模块** 再手工建科目；它负责正确的科目结构。
- ✅ 用 **财政税位** 自动切 B2B/B2C 税，不要逐张发票改税。
- ✅ 月结后 **锁定日期** 防追溯改账（企业版功能）。
- ✅ v16+ 用 **Early Payment Discount** 建模折扣，不拆付款条件行。
- ❌ 不要 **删除日记账分录**——用贷项通知单或内置冲销函数反冲。
- ❌ 不要在同一日记账里 **混记私人与公司交易**。
- ❌ 不要为修银行对账差异 **手建分录**——走对账模型工作流。
- 输出不替代针对具体环境的验证、测试与专业复核；国家/Odoo 版本/科目结构等关键输入缺失时先追问。

## 互见

- related：`gl-subledger-reconciler` —— 总账/子账对账核对的进阶工作流
- related：`odoo-localization-compliance` —— 国家级电子发票（CFDI/FatturaPA/SAF-T）与税务合规
- combines_with：`odoo-localization-compliance` —— 基础会计配好后叠加本地化合规层

---
本条采编自 sickn33/antigravity-awesome-skills（MIT）。
