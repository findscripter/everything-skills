---
name: agentmail-email-infra
title: AI 智能体邮件基础设施
description: 当 AI 智能体需要真实邮箱完成注册/验证码/事务通信时使用；通过 AgentMail REST API 开通账号、收发邮件、注册 Webhook、查询 karma 余额并产出可执行调用；不适用于自建/企业 SMTP/IMAP 或个人邮箱代收。触发词：AgentMail、智能体邮箱、theagentmail.net
domain: 平台/integration
triggers: [AgentMail, 智能体邮箱, agent email, theagentmail.net, 验证码邮箱, 邮件 webhook, karma 余额, 注册收信, 收验证码, 临时邮箱 API]
tags: [平台, integration, email, agent, webhook, REST-API, AgentMail, automation]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [curl, AgentMail REST API, @agentmail/sdk, Node.js crypto]
requires: []
related: [twilio-communications, whatsapp-cloud-api, transactional-email-template-builder, imessage-claude-bridge]
combines_with: [mcp-builder, agent-tool-builder, computer-use-agents]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- AI 智能体需要一个真实可收发的邮箱（`@theagentmail.net`），用于第三方服务注册、接收验证码/确认链接、或事务性邮件往来。
- 需要开通/查询/删除 AgentMail 账号、发信、读取收件箱、下载附件，或注册入站 Webhook 把邮件事件接入自动化流程。
- 需要监控 karma 余额与扣费，规避因余额耗尽导致的发信失败。

**不该用：**
- 接管企业自建 SMTP/IMAP、Gmail/Outlook 等个人邮箱的代收代发 —— 本技能只覆盖 AgentMail 托管域。
- 大规模营销群发或任何可能损害共享域名声誉的行为（karma 机制会惩罚此类操作）。
- 缺少 API Key、密钥权限或成功判定标准时，先停下来确认再调用。

## 步骤

1. **拿到凭证**：从 AgentMail 控制台获取 `am_...` 格式的 API Key，所有请求都带 `Authorization: Bearer am_...`。Base URL：`https://api.theagentmail.net`。
2. **查余额**：执行任何扣 karma 的操作前，先 `GET /v1/karma` 确认 `balance` 充足（余额为 0 时发信/建号返回 HTTP 402）。
3. **开通账号**（-10 karma）：`POST /v1/accounts`，记录返回的 `accountId`。
4. **执行业务**：按需发信（-1）、轮询收件箱、读取整封邮件正文、下载附件。
5. **接入实时事件**：如需即时收信，注册 Webhook，并在回调端校验签名 + 时间戳防重放。
6. **回收**：用完账号 `DELETE /v1/accounts/:id`，可退回 10 karma。

## 指令

核心 REST 端点（与 karma 影响）：

| 方法 | 路径 | 说明 | Karma |
|------|------|------|-------|
| POST | `/v1/accounts` | 创建邮箱账号 | -10 |
| GET | `/v1/accounts` | 列出所有账号 | |
| GET | `/v1/accounts/:id` | 账号详情 | |
| DELETE | `/v1/accounts/:id` | 删除账号 | +10 |
| POST | `/v1/accounts/:id/messages` | 发送邮件 | -1 |
| GET | `/v1/accounts/:id/messages` | 列出邮件 | |
| GET | `/v1/accounts/:id/messages/:msgId` | 读取整封邮件（含正文/附件） | |
| GET | `/v1/accounts/:id/messages/:msgId/attachments/:attId` | 取附件下载 URL | |
| POST | `/v1/accounts/:id/webhooks` | 注册 Webhook | |
| GET | `/v1/accounts/:id/webhooks` | 列出 Webhook | |
| DELETE | `/v1/accounts/:id/webhooks/:whId` | 删除 Webhook | |
| GET | `/v1/karma` | 查余额 + 事件流 | |

发信可选字段：`cc`、`bcc`（字符串数组）；`inReplyTo`、`references`（用于会话串联）；`attachments`（`{filename, contentType, content}`，`content` 为 base64）。

**karma 规则（关键约束）：**
- 仅来自受信任服务商（Gmail、Outlook、Yahoo、iCloud、ProtonMail、Fastmail、Hey 等）的入站邮件才奖励 karma（`email_received` +2）；未知/一次性域名不计。
- 对同一发件人，在你回复之前只奖励一次。对方连发 5 封而你未回复，只有第一封得分；回复后该发件人再来信才再次得分。
- `money_paid` +100，`account_deleted` +10（退还建号成本），`email_sent` -1，`account_created` -10。

## 示例

创建账号：

```bash
curl -X POST https://api.theagentmail.net/v1/accounts \
  -H "Authorization: Bearer am_..." \
  -H "Content-Type: application/json" \
  -d '{"address": "my-agent@theagentmail.net"}'
# => {"data": {"id": "...", "address": "my-agent@theagentmail.net", "displayName": null, "createdAt": 123}}
```

发信：

```bash
curl -X POST https://api.theagentmail.net/v1/accounts/{accountId}/messages \
  -H "Authorization: Bearer am_..." \
  -H "Content-Type: application/json" \
  -d '{
    "to": ["recipient@example.com"],
    "subject": "Hello from my agent",
    "text": "Plain text body",
    "html": "<p>Optional HTML body</p>"
  }'
```

读取收件箱与整封邮件：

```bash
curl https://api.theagentmail.net/v1/accounts/{accountId}/messages \
  -H "Authorization: Bearer am_..."
curl https://api.theagentmail.net/v1/accounts/{accountId}/messages/{messageId} \
  -H "Authorization: Bearer am_..."
```

注册 Webhook（实时入站）：

```bash
curl -X POST https://api.theagentmail.net/v1/accounts/{accountId}/webhooks \
  -H "Authorization: Bearer am_..." \
  -H "Content-Type: application/json" \
  -d '{"url": "https://my-agent.example.com/inbox"}'
```

Webhook 回调签名校验（HMAC-SHA256，拒收 5 分钟前的时间戳防重放）：

```typescript
import { createHmac } from "crypto";

const verifyWebhook = (body: string, signature: string, timestamp: string, secret: string) => {
  if (Date.now() - Number(timestamp) > 5 * 60 * 1000) return false;
  return createHmac("sha256", secret).update(body).digest("hex") === signature;
};
```

TypeScript SDK（`@agentmail/sdk`）典型流程：

```typescript
import { createClient, AgentMailError } from "@agentmail/sdk";

const mail = createClient({ apiKey: "am_..." });
const account = await mail.accounts.create({ address: "my-agent@theagentmail.net" });
await mail.messages.send(account.id, { to: ["human@example.com"], subject: "Hello", text: "Sent by an AI agent." });

const messages = await mail.messages.list(account.id);
const detail = await mail.messages.get(account.id, messages[0].id);
const att = await mail.attachments.getUrl(account.id, messageId, attachmentId); // att.url 为带签名下载链接
const karma = await mail.karma.getBalance(); // karma.balance
```

常见模式 —— 注册后轮询验证码邮件：

```typescript
for (let i = 0; i < 30; i++) {
  const messages = await mail.messages.list(account.id);
  const verification = messages.find(m =>
    m.subject.toLowerCase().includes("verify") ||
    m.subject.toLowerCase().includes("confirm"));
  if (verification) {
    const detail = await mail.messages.get(account.id, verification.id);
    // 从 detail.bodyText / detail.bodyHtml 解析验证链接或验证码
    break;
  }
  await new Promise(r => setTimeout(r, 2000));
}
```

发信后等待回复（按 `direction === "inbound"` 且时间戳晚于发信判定）：

```typescript
const sent = await mail.messages.send(account.id, { to: ["human@company.com"], subject: "Question about order #12345", text: "Can you check the status?" });
for (let i = 0; i < 60; i++) {
  const messages = await mail.messages.list(account.id);
  const reply = messages.find(m => m.direction === "inbound" && m.timestamp > sent.timestamp);
  if (reply) { const detail = await mail.messages.get(account.id, reply.id); break; }
  await new Promise(r => setTimeout(r, 5000));
}
```

## 注意事项

- **402 = karma 不足**：发信和建号在余额为 0 时返回 HTTP 402，务必先查 `/v1/karma`。错误码示例：`INSUFFICIENT_KARMA`、`NOT_FOUND`；HTTP 状态含 401/402/404 等，SDK 抛 `AgentMailError`（含 `.status`/`.code`/`.message`）。
- **Webhook 安全**：必须同时校验 `X-AgentMail-Signature`（请求体的 HMAC-SHA256 hex）与 `X-AgentMail-Timestamp`（毫秒时间戳），拒收超过 5 分钟的投递以防重放。
- **附件**：`GET .../attachments/:attId` 返回 `{"data": {"url": "..."}}`，是带签名的临时下载 URL，不直接返回二进制；发信附件 `content` 需 base64 编码。
- **轮询节奏**：验证码场景建议 2s 间隔、≤30 次；等待人工回复建议 5s 间隔、≤60 次，避免空转浪费配额。
- **核心类型**：`Message` 含 `direction: "inbound" | "outbound"` 与 `timestamp`；`MessageDetail` 额外有 `bodyText`/`bodyHtml`/`cc`/`bcc`/`inReplyTo`/`references`/`attachments`。
- 用完即弃：删号退还 karma，长期不用的账号应回收。

## 互见

- `lark-mail`：飞书托管邮箱的起草/收发/规则管理，企业内网场景的对照方案。
- 平台/integration 域下其他第三方 API 接入类技能（Webhook 签名校验、轮询等待模式可复用）。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
