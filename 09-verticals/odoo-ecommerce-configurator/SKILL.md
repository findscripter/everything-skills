---
name: odoo-ecommerce-configurator
title: Odoo 电商与网站配置
description: 当用 Odoo 搭建/优化在线商店时使用；产出产品发布、支付/物流、SEO 与下单到履约配置的菜单路径与字段清单；不适用于多网站、B2B 专属价、订阅计费等企业版高级场景；触发词：Odoo 电商、支付商、配送方式、弃购挽回
domain: 领域/erp
triggers: [Odoo 电商, Odoo eCommerce, Odoo 网站建站, 在线商店配置, 支付商配置, Stripe 支付商, 配送方式 运费, 弃购挽回, 产品发布上架, 电商 SEO]
tags: [odoo, 电商, erp, 支付, 物流配送, seo, 订单履约]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Odoo Website, Odoo eCommerce, Stripe, Odoo Inventory, Marketing Automation]
requires: []
related: [odoo-sales-crm-expert, odoo-shopify-integration, odoo-inventory-optimizer, odoo-module-developer]
combines_with: [odoo-accounting-setup, odoo-localization-compliance]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 首次搭建 Odoo 电商商店，需要把产品上架并打通下单到仓库履约的流程。
- 接入支付商（Stripe、PayPal、Adyen）并配置 Webhook 实时同步支付状态。
- 配置物流配送方式与运费规则（固定运费、满额包邮，或对接 UPS/FedEx/DHL）。
- 用 Odoo Website 工具优化产品页 SEO 与转化。

不该用的边界（属于企业版或专门模块，本条目不覆盖）：
- 多网站（multi-website）：不同店面各自的价格表与多语言，需 Enterprise。
- B2B 电商：要求登录、按客户定制目录与价格，配置步骤更复杂，此处不展开。
- 承运商实时算费（UPS/FedEx live rate）需对应连接器模块（如 `delivery_ups`）与承运商 API Key。
- 订阅计费：Odoo 电商原生不支持，需 Enterprise 的 Subscriptions 模块。

## 步骤

1. 产品上架：在产品表单填齐名称、内部参考（SKU）、销售价、网站描述，再切换「Published」发布。
2. 接支付商：在 Test 模式下填入密钥并配 Webhook，验证通过后切到 Enabled。
3. 配物流：新建配送方式，设定运费与满额包邮、可用国家/地区，并发布到网站结账页。
4. 优化：配置页面标题与 Meta 描述（≤160 字符），设置弃购挽回邮件序列。

指令（关键菜单路径）：
- 产品：`Website → eCommerce → Products → 选中产品`
- 支付商：`Website → Configuration → Payment Providers`（或 `Accounting → Configuration → Payment Providers`）
- 配送方式：`Inventory → Configuration → Delivery Methods → New`
- 弃购挽回：`Marketing → Marketing Automation → New Campaign`（需启用 Email Marketing 应用）

## 示例

### 示例 1：发布产品到网站
```text
菜单：Website → eCommerce → Products → 选中产品
关键字段：
  Name:               Ergonomic Mesh Office Chair  (含关键词)
  Internal Reference: CHAIR-MESH-001               (库存必填，即 SKU)
  Sales Price:        $299.00
  Website Description (website 标签页): 150–300 字独特内容
发布：切换产品表单右上角「Published」开关
SEO (website 标签页 → SEO 区):
  Page Title:       Ergonomic Mesh Chair | Office Chairs | YourStore
  Meta Description: ...  (≤160 字符)
Website 标签页：Can be Sold: YES
```

### 示例 2：配置 Stripe 支付商
```text
菜单：Website → Configuration → Payment Providers → Stripe → Configure
State: Test  (验证通过前用 Test，再切 Enabled)
凭据 (来自 Stripe Dashboard → Developers → API Keys):
  Publishable Key: pk_live_XXXXXXXX
  Secret Key:      sk_live_XXXXXXXX  (安全存储，禁止暴露到客户端)
Payment Journal: Bank (USD)
Capture Mode:    Automatic (确认订单即扣款) 或 Manual (仅授权，履约时再扣)
Webhook (在 Stripe Dashboard → Webhooks 添加):
  URL: https://yourstore.com/payment/stripe/webhook
  Events: payment_intent.succeeded, payment_intent.payment_failed
```

### 示例 3：固定运费 + 满额包邮
```text
菜单：Inventory → Configuration → Delivery Methods → New
Name: Standard Shipping (3–5 business days)
Provider: Fixed Price
Delivery Product: [Shipping] Standard  (用于开票)
Pricing:  Price: $9.99   ☑ Free if order amount is above: $75.00
Availability: Countries: United States; States: All states
☑ Published  (结账页对客户可见)
```

### 示例 4：弃购挽回
```text
菜单：Marketing → Marketing Automation → New Campaign  (Odoo 16/17)
Trigger: Odoo record updated
Model: eCommerce Cart (sale.order, state = 'draft')
Filter: 1 小时未更新且未确认
Actions:
  1. 等待 1 小时
  2. 发送邮件：「You left something behind!」(挽回模板)
  3. 等待 24 小时
  4. 发送邮件：「Last chance — items selling fast」
注：部分托管套餐需启用 Email Marketing 应用。
```

## 注意事项

- 用「产品变体」（颜色、尺寸）代替重复产品，目录更干净且共享库存追踪。
- 通过托管商启用 HTTPS（SSL），并在 `Website → Settings → Security` 设置 HSTS。
- 务必配置 Stripe Webhook，否则失败支付可能不会被正确同步。
- 不要在生产环境把支付商留在 Test 模式，否则不会产生真实扣款。
- 不要发布没有内部参考（SKU）的产品，会破坏库存追踪与订单履约。
- Test 与生产环境不要复用同一组 Stripe 密钥，上线前务必切换为 live 密钥。

## 互见

- 库存与履约：参见仓储/Inventory 相关条目（订单到仓库的拣货发货）。
- 会计与开票：支付商的 Payment Journal、Delivery Product 开票，参见会计/Accounting 相关条目。
- 邮件营销：弃购挽回依赖 Email Marketing / Marketing Automation 应用。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
