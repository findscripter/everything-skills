---
name: billing-automation-systems
title: 订阅计费与催收自动化系统
description: 当为 SaaS/订阅产品搭建周期性计费、发票、催收（dunning）、按比例分摊与税费体系时使用；做计费引擎设计与落地，产出订阅生命周期状态机、发票生成、失败支付重试/催收流程与多地区税务计算方案；不适用于一次性开票、手动收款或无权改动定价与计费流的场景；触发词：订阅计费、催收 dunning、proration 分摊
domain: 商业/finance
triggers: [订阅计费, 周期性计费 recurring billing, 发票自动生成 invoice, 催收 dunning 失败支付重试, 升降级按比例分摊 proration, 席位按比例计费 seat, 用量计费 usage-based, 增值税 VAT GST 销售税计算, 续费与计费周期, SaaS billing engine]
tags: [商业, misc, billing, subscription, dunning, proration, tax, saas, payments]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Stripe API, reportlab, VIES VAT 校验]
requires: []
related: [churn-prevention, pricing-strategy, paywall-upgrade-cro, stripe-integration]
combines_with: [churn-prevention, stripe-integration, pricing-strategy]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用场景：

- 搭建 SaaS 订阅计费（月/季/年/周/自定义周期）。
- 自动生成并投递发票，处理续费与取消。
- 处理失败支付的恢复（催收 dunning）：重试计划、客户通知、宽限期、账号限制。
- 计算计划升降级、席位增减、计费频率变更时的按比例分摊（proration）。
- 计算销售税、VAT、GST，并满足各地区合规。
- 处理按用量计费（usage-based）。

不该用（负边界）：

- 只需一次性开票或手动收款。
- 任务与计费/订阅无关。
- 你无权改动定价、套餐或计费流程。

## 步骤

1. 定义套餐、定价、计费间隔与分摊规则。
2. 梳理订阅生命周期状态与续费/取消行为：`trial → active → past_due → canceled`，以及 `paused → resumed`。
3. 实现开票、收款、重试与催收工作流。
4. 按地区建模税费与合规要求。
5. 用沙箱支付验证，并对账（reconcile）账本输出。
6. 需详细模板时，参考源仓库的 `resources/implementation-playbook.md`。

## 指令

- 计费周期处理：到期才出账；`process_billing_cycle` 中 `datetime.now() < current_period_end` 则跳过；出账后生成发票、`charge_customer`，成功则 `mark_paid` + `advance_billing_period` + 发送发票，失败则 `mark_past_due` 并启动催收。
- 收款金额转分：`amount=int(amount * 100)`（Stripe 以最小货币单位计），捕获 `stripe.error.CardError` 返回失败结果。
- 催收重试计划（示例三档）：

```python
self.retry_schedule = [
    {'days': 3,  'email_template': 'payment_failed_first'},
    {'days': 7,  'email_template': 'payment_failed_reminder'},
    {'days': 14, 'email_template': 'payment_failed_final'},
]
```

重试成功 → 发票 `mark_paid`、订阅恢复 `ACTIVE`、发 `payment_recovered`；耗尽重试 → `subscription.cancel(at_period_end=False)` 并通知。

- 分摊计算（按当前周期天数线性）：

```python
total_days = (period_end - period_start).days
days_remaining = (period_end - change_date).days
unused_amount   = (old_plan.amount / total_days) * days_remaining
new_plan_amount = (new_plan.amount / total_days) * days_remaining
net_proration   = new_plan_amount - unused_amount
```

席位减少不退款：`prorated_charge = max(0, prorated_amount)`。

- 税务按地区税率表查表（如 `US_CA=0.0725`、`GB=0.20`、`DE=0.19`、`AU=0.10`）；按客户国家/州确定管辖区，US 用 `US_{state}`、欧盟用国家码、AU 为 GST；EU VAT 号用 VIES API 校验。

## 示例

```python
from billing import BillingEngine, Subscription

billing = BillingEngine()
subscription = billing.create_subscription(
    customer_id="cus_123",
    plan_id="plan_pro_monthly",
    billing_cycle_anchor=datetime.now(),
    trial_days=14,
)
billing.process_billing_cycle(subscription.id)
```

发票流转：`draft → open（finalize 后 total = subtotal + tax）→ paid`；可经 `to_pdf()`（reportlab）或 `to_html()` 输出。用量计费支持 tiered/per_unit/volume 三种定价模型。

## 注意事项

- 安全红线：测试环境绝不向真实客户收费；上线前核验税务处理与合规义务。
- 最佳实践：尽量全自动化、清晰通知客户、重试逻辑兼顾恢复率与体验、分摊计算公平、按管辖区算对税、为所有计费事件留审计日志、优雅处理边界情况。
- 常见坑：分摊未计入部分周期；发票漏加税；催收过于激进、过快取消；失败不通知客户；硬编码计费周期、不支持自定义计费日。
- 把输出当作起点而非环境特定验证的替代；缺少必要输入、权限、安全边界或成功标准时，停下来澄清。

## 互见

- 源仓库参考：`references/billing-cycles.md`、`dunning-management.md`、`proration.md`、`tax-calculation.md`、`invoice-lifecycle.md`；资产 `assets/billing-state-machine.yaml`、`invoice-template.html`、`dunning-policy.yaml`。

---

采编自 sickn33/antigravity-awesome-skills（MIT），适配重写而非逐字翻译。
