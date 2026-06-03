---
name: digital-product-monetization
title: 数字产品变现策略
description: 当为 SaaS/数字产品搭建变现体系、集成 Stripe 订阅与付费流、设计套餐与试用、防流失或测算单位经济时使用；做出 Stripe 接入（Checkout/Customer Portal/Webhook）、三档套餐与定价、anti-churn 序列、LTV/CAC 计算与 MRR 看板等可执行产物；不适用于纯定价分层策略（见 pricing-strategy）、应用内升级付费墙文案（见 paywall-upgrade-cro）或取消挽留细流程（见 churn-prevention）。触发词：变现、monetization、Stripe、订阅、subscription、付费墙、freemium、免费试用、trial、升级流程、upgrade、webhook、churn、流失、LTV、CAC、单位经济、unit economics、MRR、SaaS 商业模型
domain: 商业/growth
triggers: [变现, monetization, Stripe, 订阅, subscription, 付费墙, freemium, 免费试用, trial, 升级流程, upgrade, webhook, churn, 流失, LTV, CAC, 单位经济, unit economics, MRR, SaaS 商业模型]
tags: [monetization, stripe, saas, subscription, pricing, churn, unit-economics, growth]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Stripe, Python, FastAPI]
requires: []
related: [pricing-strategy, billing-automation-systems, paywall-upgrade-cro, churn-prevention]
combines_with: [stripe-integration, unit-economics-analyzer, micro-saas-launcher]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# 数字产品变现策略

> Price is what you pay. Value is what you get.（Warren Buffett）好的变现按交付价值的比例捕获收入。

## 何时使用

当你要给数字产品/SaaS 搭建或优化**端到端变现链路**时使用，覆盖：

- 集成 Stripe：创建 Customer/Subscription、Checkout Session、Customer Portal、支付 Webhook。
- 设计套餐与定价：Free/Pro/Business 三档、价值定价、试用策略。
- 防流失与增收：churn 信号识别、anti-churn 序列、用量触发的 upsell。
- 算账：LTV/CAC、ARPU、Payback、MRR 看板与 SaaS 基准对照。

不该用的边界：

- 只做**定价分层与涨价策略**（价值度量、Good-Better-Best、支付意愿研究）→ 用 `pricing-strategy`。
- 只写**应用内升级弹窗/付费墙**的文案与触发逻辑 → 用 `paywall-upgrade-cro`。
- 只做**取消挽留流程**（退订问卷、动态报价、dunning 细节）→ 用 `churn-prevention`。
- 非订阅/非数字产品的一般咨询。

## 步骤

1. 收集背景：产品交付的经济价值、目标人群、现有定价与转化/流失数据、支付服务商。
2. 定套餐结构（推荐 3 档：Free 引导激活、Pro 主推、Business 上探）。
3. 接 Stripe：建 Customer → 用 Checkout Session 收单（转化优于自建表单）→ 配 Customer Portal 做自助管理。
4. 配 Webhook 监听订阅/扣款事件，作为权益变更的唯一可信源（勿只信前端回调）。
5. 建 churn 信号监控 + anti-churn 序列；按用量在临界点触发 upsell。
6. 周期性算单位经济（LTV/CAC/Payback），对照基准判断「健康/需优化」，再 A/B 调价。

## 指令

### 变现黄金规则

用户付费当且仅当四条同时成立：① 解决真实问题（need）② 优于替代方案（differentiation）③ 价格被感知为公平（value）④ 收费时机自然（timing）。

经典错误：展示价值前就收费（杀死激活）；价格过低（暗示低质）；套餐过多（选择瘫痪）；试用不绑卡（转化低）；流失无预警（看不见即将取消）。

### Stripe 接入（关键代码）

环境配置：

```python
import stripe, os
stripe.api_key = os.environ["STRIPE_SECRET_KEY"]
STRIPE_WEBHOOK_SECRET = os.environ["STRIPE_WEBHOOK_SECRET"]
PLANS = {"free": None, "pro": os.environ["STRIPE_PRICE_PRO"], "business": os.environ["STRIPE_PRICE_BIZ"]}
```

Checkout Session（推荐，转化最高）：

```python
def create_checkout_session(customer_id, price_id, success_url, cancel_url, trial_days=14):
    session = stripe.checkout.Session.create(
        customer=customer_id, mode="subscription",
        line_items=[{"price": price_id, "quantity": 1}],
        subscription_data={"trial_period_days": trial_days},
        success_url=success_url + "?session_id={CHECKOUT_SESSION_ID}",
        cancel_url=cancel_url, allow_promotion_codes=True)
    return session.url
```

Customer Portal（自助升降级/改卡/取消）：

```python
def create_portal_session(customer_id, return_url):
    return stripe.billing_portal.Session.create(
        customer=customer_id, return_url=return_url).url
```

Webhook（验签 + 事件路由，权益变更以此为准）：

```python
event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
# ValueError → 400 Invalid payload; SignatureVerificationError → 400 Invalid signature
handlers = {
  "customer.subscription.created": handle_subscription_created,
  "customer.subscription.updated": handle_subscription_updated,
  "customer.subscription.deleted": handle_subscription_deleted,
  "invoice.payment_succeeded": handle_payment_succeeded,
  "invoice.payment_failed": handle_payment_failed,
  "customer.subscription.trial_will_end": handle_trial_ending,
}
```

### 定价与套餐（3 档是正解）

- 价值定价：估算交付的经济价值 → 捕获其中 10-30% → 支付意愿调研验证 → A/B 测 3 个价格点。
- 心理学：用 $29 而非 $30（左位数效应）；年付给明确折扣并标「省 $XX」（金额而非百分比）；视觉高亮你想卖的那档；先展示高价做锚定；中间档打「最受欢迎」徽章；激活期试用不绑卡、留存期绑卡。

| 维度 | Free | Pro | Business |
|---|---|---|---|
| 价格 | 免费 | $29/月 | $99/月 |
| 用量 | 受限 | 不限 | 不限 |
| 高级功能 | 否 | 是 | 是 + API |
| 多人/支持 | 否 | 邮件 | 多席位 + 优先 |

### 防流失与增收

高危信号：14 天未登录、用量两周内掉 >70%、打开取消未完成、工单未解决。中危：7 天未登录、用量掉 >40%、未完成 onboarding、从未用核心功能。

anti-churn 序列：Day 0 未用 7 天 → 「想念你，发生了什么？」；Day 3 无回应 → 成功案例；Day 7 → 限时报价（如 3 个月 8 折）；Day 14 试用将到期 → 应用内弹窗 + 紧急邮件；Day 30 已取消 → 离场邮件，3 个月后带新功能召回。取消必做 exit survey（太贵/用得不够/缺功能/有更好替代/技术问题/其他），「缺功能」导向 roadmap + 上线通知。

用量触发 upsell：达套餐上限的 ~90% 时推升级（如「已用 90% 额度，升级 Pro」，带 `utm=usage-limit`）。

### 单位经济（必算）

```python
arpu = mrr / customers
churn_rate = churned / customers
ltv = arpu / churn_rate
cac = cac_total / new_customers
ltv_cac = ltv / cac
payback_months = cac / arpu
# 判定：ltv_cac > 3 → 健康，否则 → 需优化
```

MRR 看板拆解：New（新签）/ Expansion（升级）/ Contraction（降级）/ Churned（流失）/ Net New；并看 ARR、Churn Rate、NRR（净收入留存，目标 >100%）。

SaaS 基准（B2C）：月流失 <2% 优秀 / 2-5% 良好；LTV/CAC >5x 优秀 / 3-5x 良好；Payback <6 月优秀；trial→付费转化 >15% 优秀 / 8-15% 良好；MoM 增长 >20% 优秀。

## 示例

自助 SaaS：产品每周帮用户省 2 小时 ≈ $200/月价值 → 定 Pro $29/月（捕获约 14%）。三档 Free/Pro $29/Business $99，Pro 标「最受欢迎」，年付 $249（省 $99）。Stripe 走 Checkout Session（14 天不绑卡试用，激活）+ Customer Portal 自助。算账：ARPU $35、月流失 3%、LTV ≈ $1167、CAC $300 → LTV/CAC ≈ 3.9x「健康」，Payback ≈ 8.6 月。用量达 90% 触发 upsell；7 天未登录进入 anti-churn 序列。

## 注意事项

- Webhook 是权益的唯一可信源：务必验签，按 `event["type"]` 路由，幂等处理（Stripe 会重投）。
- 密钥只走环境变量，永不入库到前端/版本库。
- 试用策略二选一要想清楚：不绑卡利激活、绑卡利留存——按转化漏斗目标取舍。
- 折扣别太狠（>50% 会训练用户为薅羊毛而取消），限时并展示具体省下的金额。
- LTV/CAC 与流失要按队列（渠道/套餐/在网时长）分析，单一总数会掩盖问题。
- 涉及对生产环境的支付改动，先在 Stripe 测试模式与 webhook 测试事件验证后再上线。

## 互见

- requires：无
- related：`pricing-strategy`（定价分层与涨价策略）、`paywall-upgrade-cro`（应用内升级付费墙）、`churn-prevention`（取消挽留与 dunning 细流程）、`cfo-financial-advisor`（财务建模与单位经济复核）
- combines_with：`billing-automation-systems`（Stripe 计费/发票自动化落地）、`churn-prevention`（把流失信号接入挽留流程）、`user-onboarding-optimizer`（提升激活以从源头降流失）、`lifecycle-email-sequence`（anti-churn 与 upsell 的邮件序列实现）

本条采编自 sickn33/antigravity-awesome-skills（MIT）。
