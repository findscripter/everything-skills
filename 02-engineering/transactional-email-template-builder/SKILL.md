---
name: transactional-email-template-builder
title: 事务邮件模板系统构建
description: 当为新产品搭建事务邮件、迁移邮件服务商或重构遗留邮件模板时使用；用 React Email 组件 + 统一发送层产出含暗黑模式/i18n/防垃圾优化/UTM 追踪的生产级模板系统；不适用于纯营销群发活动、富交互 HTML 页面或站内信。触发词：事务邮件、邮件模板、React Email、Resend、邮件发送、邮件可达性
domain: 研发/backend
triggers: [事务邮件, 邮件模板, React Email, Resend, Postmark, SendGrid, AWS SES, MJML, 邮件预览, 邮件可达性, 暗黑模式邮件, 邮件 i18n, 防垃圾邮件, UTM 追踪, 欢迎邮件, 发票邮件, 邮件验证]
tags: [研发, backend, 邮件, transactional-email, React-Email, 通知基础设施, i18n, 可达性]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [React Email, Resend, Postmark, AWS SES, MJML, Node.js]
requires: []
related: []
combines_with: []
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

适用：
- 为新产品从零搭建事务邮件（欢迎、邮箱验证、密码重置、发票、通知、周报摘要）。
- 在邮件服务商之间迁移（Resend / Postmark / SendGrid / AWS SES），需要统一发送接口。
- 重构遗留模板：补可访问性、暗黑模式、i18n。
- 排查邮件可达性 / 进垃圾箱问题。

不该用（负边界）：
- 纯营销群发活动（应使用专用营销 ESP 与独立发送域/IP，避免拖累事务邮件可达性）。
- 需要富交互的 HTML 页面（邮件客户端会剥离脚本、grid/flex，仅适合表格布局）。
- 站内通知 / 推送 / 短信等非邮件通道。

## 步骤

1. 按结构落地目录：`components/`（layout、partials）、`templates/`（各类邮件）、`lib/`（send.ts 统一发送、providers/、tracking.ts）、`i18n/`（en.ts、de.ts…）、`preview/`。
2. 先写基础布局 `EmailLayout`：品牌头/脚、`<Preview>` 文案、暗黑模式 `@media (prefers-color-scheme: dark)`（覆盖内联样式必须加 `!important`）、退订与隐私链接。
3. 基于布局写具体模板（如 `WelcomeEmail`、`InvoiceEmail`），props 用 TypeScript 接口约束，CTA 用 `<Button>`，金额用 `Intl.NumberFormat` 格式化。
4. 实现统一发送函数 `sendEmail(to, payload)`：用判别联合类型映射模板与主题，`render()` 成 HTML，过 `addTrackingParams` 注入 UTM，再调服务商 SDK 发送并打 tags。
5. 接入 i18n：按 locale 选择翻译表（`locale === "de" ? de : en`），翻译值用函数支持插值。
6. 起本地预览服务热重载校验，发前对照防垃圾清单并用 Mail-Tester 自测（目标 9+/10）。

## 指令

```bash
npm run email:dev    # email dev --dir emails/templates --port 3001  → http://localhost:3001 实时预览
npm run email:build  # email export --dir emails/templates --outDir emails/out
```

`package.json` scripts：

```json
{
  "scripts": {
    "email:dev": "email dev --dir emails/templates --port 3001",
    "email:build": "email export --dir emails/templates --outDir emails/out"
  }
}
```

## 示例

统一发送层（`emails/lib/send.ts`，判别联合 + UTM + tags）：

```typescript
import { Resend } from "resend"
import { render } from "@react-email/render"
import { WelcomeEmail } from "../templates/welcome"
import { InvoiceEmail } from "../templates/invoice"
import { addTrackingParams } from "./tracking"

const resend = new Resend(process.env.RESEND_API_KEY)

type EmailPayload =
  | { type: "welcome"; props: Parameters<typeof WelcomeEmail>[0] }
  | { type: "invoice"; props: Parameters<typeof InvoiceEmail>[0] }

export async function sendEmail(to: string, payload: EmailPayload) {
  const templates = {
    welcome: { component: WelcomeEmail, subject: "Welcome to MyApp — confirm your email" },
    invoice: { component: InvoiceEmail, subject: "Invoice from MyApp" },
  }
  const template = templates[payload.type]
  const html = render(template.component(payload.props as any))
  const trackedHtml = addTrackingParams(html, { campaign: payload.type })

  return resend.emails.send({
    from: "MyApp <hello@yourapp.com>",
    to,
    subject: template.subject,
    html: trackedHtml,
    tags: [{ name: "email-type", value: payload.type }],
  })
}
```

UTM 追踪（`emails/lib/tracking.ts`，给所有链接追加参数）：

```typescript
export function addTrackingParams(html: string, params: { campaign: string; medium?: string; source?: string }): string {
  const utm = new URLSearchParams({
    utm_source: params.source ?? "email",
    utm_medium: params.medium ?? "transactional",
    utm_campaign: params.campaign,
  }).toString()
  return html.replace(/href="(https?:\/\/[^"]+)"/g, (m, url) => {
    const sep = url.includes("?") ? "&" : "?"
    return `href="${url}${sep}${utm}"`
  })
}
```

暗黑模式（写在布局 `<Head>` 内，必须 `!important` 覆盖内联样式）：

```css
@media (prefers-color-scheme: dark) {
  .email-body { background-color: #0f0f0f !important; }
  .email-container { background-color: #1a1a1a !important; }
  .email-text { color: #e5e5e5 !important; }
}
```

## 注意事项

防垃圾 / 可达性清单（发前逐项核对）：
- 发件域配置 SPF、DKIM、DMARC；From 用自有域名（非 gmail/hotmail）。
- 主题 < 50 字符，无全大写、无「FREE!!!」、避开 guarantee / no risk / limited time offer 等红旗词。
- 文本占比 ≥ 60%；HTML 之外务必带纯文本版本（各服务商均有 plain text 字段，必填）。
- 每封营销邮件含退订链接（CAN-SPAM / GDPR）；图片均带 alt；单一 CTA；不用短链。
- 发前用 Mail-Tester.com 自测，目标 9+/10。

常见坑：
- 内联样式必需 —— 多数客户端会剥离 `<head>` 样式，React Email 自动内联。
- 最大宽度 600px，更宽在 Gmail 移动端会破版。
- 不用 flexbox/grid，改用 react-email 的 `<Row>` / `<Column>`。
- 事务邮件与营销邮件用独立发送域/IP，保护可达性。

## 互见

- 邮件服务商官方文档：Resend / Postmark / SendGrid / AWS SES 的发送 SDK 与 webhook 事件。
- React Email 与 MJML（追求最大客户端兼容时改用 MJML 模板）。
- 通知基础设施类技能：多通道（站内信/推送/短信）编排可在上层与本技能组合。

---
采编自 alirezarezvani/claude-skills（MIT）。
