---
name: stripe-integration
title: Stripe 支付与订阅集成
description: 当为 Web 应用接入 Stripe 支付/订阅、调试 webhook 可靠性、迁移支付服务商或加用量计费时使用；做一套含 Checkout、订阅升降级按比例计费、幂等 webhook、客户门户与用量上报的生产级集成（Next.js/Express/Django）；不适用于线下收款、非 Stripe 渠道或纯前端样式问题；触发词：Stripe、订阅、subscription、支付、checkout、webhook、按比例计费、proration、用量计费、customer portal、试用、past_due。
domain: 平台/integration
triggers: [Stripe, 订阅, subscription, 支付, checkout, webhook, 按比例计费, proration, 用量计费, customer portal, 试用, past_due]
tags: [stripe, billing, subscription, payment, webhook, saas, proration, metered-billing, nextjs, integration]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Stripe Node SDK (stripe), Stripe CLI, Next.js App Router, Prisma/db, TypeScript]
requires: []
related: [billing-automation-systems, pricing-strategy, paywall-upgrade-cro, transactional-email-template-builder]
combines_with: [billing-automation-systems, rest-api-endpoint-builder, firebase-backend]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

适用：
- 给 Web 应用首次接入订阅计费，或叠加用量/坐席计费。
- 实现套餐升级/降级，并需要按比例计费（proration）与额度抵扣。
- 排查 webhook 投递失败、重复处理、状态不同步等可靠性问题。
- 从其他支付服务商迁移计费模型。

不该用：
- 线下/对公转账、纯人工对账场景。
- 非 Stripe 渠道（支付宝、微信、PayPal 等）——本条命令与字段不通用。
- 仅是定价页样式、按钮文案等纯前端问题。

核心原则：DB 是 Stripe 状态的「缓存」，唯一可信源是 Stripe API；所有关键写库都应在 webhook 中、并以重新拉取的对象为准。

## 步骤

1. 客户端初始化：用 `STRIPE_SECRET_KEY` 创建单例 `stripe`，固定 `apiVersion`；把各套餐的 Price ID 收敛到一张 `PLANS` 表（按 monthly/yearly）。
2. 建 Checkout 会话：先「取或建」Stripe Customer（在 `metadata.userId` 写入业务用户 ID 并回写库），再创建 `mode:"subscription"` 的 Checkout Session，按需给未试用过的用户加 `trial_period_days`。
3. 落地幂等 Webhook：先 `constructEvent` 验签 → 查 `stripeEvent` 幂等表 → 按事件类型分发 → 成功后才写入幂等表；处理失败返回 500 让 Stripe 重试。
4. 升降级：升级 `proration_behavior:"always_invoice"` 立即生效；降级 `proration_behavior:"none"` 周期末生效；确认前用 upcoming invoice 预览金额。
5. 用量计费：对 metered 价格项调用 `createUsageRecord` 上报增量。
6. 自助管理：用 `billingPortal.sessions.create` 跳转客户门户。
7. 本地测试：用 Stripe CLI 转发 webhook 并 `trigger` 触发事件，用测试卡号验证成功/失败路径。

## 指令

订阅状态机（建议库内 status 取值：`trialing | active | past_due | canceled | cancel_pending | paused | unpaid`）：

```
FREE_TRIAL ──paid──► ACTIVE ──cancel──► CANCEL_PENDING ──period_end──► CANCELED
     │                  │ downgrade                                  reactivate
     │                  ▼                                                │
     │             DOWNGRADING ──period_end──► ACTIVE(lower)             │
     └──trial_end 无支付──► PAST_DUE ──失败3次──► CANCELED；支付成功──► ACTIVE
```

客户端单例：

```typescript
// lib/stripe.ts
import Stripe from "stripe"
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
  typescript: true,
  appInfo: { name: "myapp", version: "1.0.0" },
})
export const PLANS = {
  starter: { monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID!, yearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID! },
  pro:     { monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,     yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID! },
} as const
```

升降级 + proration 预览：

```typescript
export async function changeSubscriptionPlan(subscriptionId: string, newPriceId: string, immediate = false) {
  const sub = await stripe.subscriptions.retrieve(subscriptionId)
  const item = sub.items.data[0]
  return stripe.subscriptions.update(subscriptionId, {
    items: [{ id: item.id, price: newPriceId }],
    proration_behavior: immediate ? "always_invoice" : "none", // 升级立即出账 / 降级周期末
    billing_cycle_anchor: "unchanged",
  })
}
export async function previewProration(subscriptionId: string, newPriceId: string) {
  const sub = await stripe.subscriptions.retrieve(subscriptionId)
  const invoice = await stripe.invoices.retrieveUpcoming({
    customer: sub.customer as string,
    subscription: subscriptionId,
    subscription_items: [{ id: sub.items.data[0].id, price: newPriceId }],
    subscription_proration_date: Math.floor(Date.now() / 1000),
  })
  return { amountDue: invoice.amount_due, lineItems: invoice.lines.data }
}
```

用量上报与客户门户：

```typescript
export async function reportUsage(subscriptionItemId: string, quantity: number) {
  await stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
    quantity, timestamp: Math.floor(Date.now() / 1000), action: "increment",
  })
}
// 客户门户
const portal = await stripe.billingPortal.sessions.create({
  customer: user.stripeCustomerId,
  return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
})
```

本地测试（Stripe CLI）：

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger checkout.session.completed
stripe trigger invoice.payment_failed
# 测试卡：成功 4242 4242 4242 4242；需 3DS 4000 0025 0000 3155；余额不足 4000 0000 0000 9995
```

## 示例

Checkout 会话（Next.js App Router；注意源码中 customers.create 的 `name` 后漏了逗号且用了占位值，下方已修正）：

```typescript
// app/api/billing/checkout/route.ts
export async function POST(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { priceId } = await req.json()

  let stripeCustomerId = user.stripeCustomerId
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,                    // 修正：源码此处漏逗号且写成占位字符串
      metadata: { userId: user.id },
    })
    stripeCustomerId = customer.id
    await db.user.update({ where: { id: user.id }, data: { stripeCustomerId } })
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: user.hasHadTrial ? undefined : 14,   // 只给没试用过的人 14 天
      metadata: { userId: user.id },
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: { userId: user.id },
  })
  return NextResponse.json({ url: session.url })
}
```

幂等 Webhook 骨架（验签 → 幂等 → 分发 → 标记）：

```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("stripe-signature")!
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }
  if (await hasProcessedEvent(event.id)) return NextResponse.json({ received: true, skipped: true })

  try {
    switch (event.type) {
      case "checkout.session.completed":      await handleCheckoutCompleted(event.data.object as any); break
      case "customer.subscription.created":
      case "customer.subscription.updated":   await handleSubscriptionUpdated(event.data.object as any); break
      case "customer.subscription.deleted":   await handleSubscriptionDeleted(event.data.object as any); break
      case "invoice.payment_succeeded":       await handleInvoicePaymentSucceeded(event.data.object as any); break
      case "invoice.payment_failed":          await handleInvoicePaymentFailed(event.data.object as any); break
    }
    await markEventProcessed(event.id, event.type)
    return NextResponse.json({ received: true })
  } catch (err) {
    // 返回 500 触发 Stripe 重试，且不写幂等表
    return NextResponse.json({ error: "Processing failed" }, { status: 500 })
  }
}
```

`payment_failed` 中按 `attempt_count` 做催款：达到 3 次发「最终催缴」邮件并置 `past_due`，否则发「重试」提醒。功能门控可用 `isSubscriptionActive`：`active`/`trialing` 直接放行，`past_due` 在 `stripeCurrentPeriodEnd` 之前给宽限期。

## 注意事项

- Webhook 投递顺序无保证：写库前务必用事件里的 ID 重新 `retrieve` 最新对象，不要只信 event payload。
- 重复处理：Stripe 在 500 时会重试，必须有幂等表（成功后才标记已处理）。
- 防试用滥用：转化后在库中置 `hasHadTrial: true`，下次不再发试用。
- proration 易出意外金额：升级前必用 upcoming invoice 预览并让用户确认。
- 客户门户需先在 Dashboard 的 Billing → Customer portal 里启用相应功能，否则跳转报错。
- Checkout 必须在 `metadata` 带 `userId`，否则无法把订阅关联回业务用户。
- 验签依赖原始请求体：用 `req.text()` 拿 raw body，勿先 JSON 解析。

## 互见

- code-reviewer：审查支付/幂等逻辑与密钥处理。
- dependency-auditor：核查 stripe SDK 版本与依赖安全。

—— 本条采编自 alirezarezvani/claude-skills（MIT 许可）。
