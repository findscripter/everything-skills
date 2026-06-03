---
name: sendblue-imessage-api
title: Sendblue 消息 API：代码收发 iMessage/SMS/RCS
description: 当在服务端代码里收发 iMessage/SMS/RCS（文本、媒体、群发、特效、Tapback、状态回调、入站 Webhook）时使用；做 Sendblue HTTP API 集成并产出可运行的请求/回调处理；不适用于一次性 shell 发送（改用 sendblue-cli）或不需完整 HTTP 集成的场景；触发词：Sendblue、iMessage、SMS、RCS、message_handle、status_callback、webhook
domain: 平台/integration
triggers: [Sendblue, iMessage 发送, 蓝色气泡, SMS API, RCS 消息, 发短信 API, 群发消息, iMessage 特效, send_style, Tapback 反应, status_callback, 入站 webhook, message_handle, evaluate-service, send-message 接口]
tags: [sendblue, imessage, sms, rcs, messaging, api, webhooks]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [claude, cursor, gemini]
requires: []
related: [imessage-claude-bridge, twilio-communications, whatsapp-cloud-api, agentphone-voice-sms-agents]
combines_with: [transactional-email-template-builder, agentmail-email-infra, slack-bolt-bot-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 在长期运行的服务（server / worker / function）里用应用代码发送 Sendblue 消息时。
- 需要通过 Webhook 接收入站消息时。
- 需要 CLI 不暴露的能力：发送特效（send styles）、反应（reactions）、群发、输入指示、状态回调、媒体上传，或超出基础 CRUD 的联系人 API。

不该用的边界：
- 只是 shell 上下文的一次性外发（脚本、cron、agent hook、「X 完成时 ping 我」）——改用 [[sendblue-cli]]。
- 不需要完整 HTTP 集成时，无需引入本技能。

风险提示：每一次外发、联系人/Webhook 变更、已读回执、反应、输入指示都是「改变状态」操作。先向用户预览收件人、发送线路、内容、回调/Webhook 变更，等明确确认后再发。

## 步骤

### 1. 鉴权

Base URL：`https://api.sendblue.com`。每个请求都需要两个请求头（外加 `Content-Type: application/json`）：

```
sb-api-key-id: <YOUR_API_KEY_ID>
sb-api-secret-key: <YOUR_API_SECRET>
Content-Type: application/json
```

两个值必须留在服务端，绝不能下发到浏览器或移动端。

### 2. 发送消息

```bash
curl -X POST https://api.sendblue.com/api/send-message \
  -H "sb-api-key-id: $KEY_ID" \
  -H "sb-api-secret-key: $SECRET" \
  -H 'Content-Type: application/json' \
  -d '{
    "number": "+15551234567",
    "from_number": "+1YOUR_SENDBLUE_NUMBER",
    "content": "Hello from the API!"
  }'
```

- 号码必须是 E.164 格式（如 `+15551234567`）。
- `from_number` 必须是你自己拥有的线路，用 `GET /api/lines` 列出。

### 3. 跟踪送达

同步响应里有：
- `message_handle`（Apple GUID）——**务必持久化**，反应、回复、关联状态回调都要用它。
- `status`：`REGISTERED`、`PENDING`、`QUEUED`、`ACCEPTED`、`SENT`、`DELIVERED`、`DECLINED`、`ERROR`。

只有 `DELIVERED` 才代表真正送达。优先用 `status_callback`，而不是轮询 `GET /api/status`。

### 4. 接收入站

在 Dashboard 或通过 `POST /api/account/webhooks` 配置 Webhook URL。Sendblue 会向你的端点 POST JSON。**尽快返回 2xx**——非 2xx 会触发重试和重复投递。

事件类型：`receive`、`outbound`、`typing_indicator`、`call_log`、`line_blocked`、`line_assigned`、`contact_created`。

## 指令

核心端点：

| Method | Path | 用途 |
|--------|------|------|
| POST | `/api/send-message` | 发送 1:1 消息（文本和/或媒体） |
| POST | `/api/send-group-message` | 群发给多个收件人 |
| POST | `/api/create-group` | 创建命名群线程 |
| POST | `/api/send-reaction` | 发送 Tapback（love/like/dislike/laugh/emphasize/question） |
| POST | `/api/send-typing-indicator` | 在对方线程显示「正在输入…」 |
| POST | `/api/mark-read` | 发送已读回执 |
| POST | `/api/upload-file` / `/api/upload-media-object` | 上传媒体（直传或从 URL） |
| GET | `/api/status` | 轮询消息送达状态 |
| GET | `/api/evaluate-service` | 检查某号码是否在 iMessage 上 |
| GET | `/api/v2/messages` / `/api/v2/messages/:id` | 读取消息历史 |
| GET/POST/PUT/DELETE | `/api/v2/contacts[...]` | 管理联系人 |
| GET | `/api/lines` | 列出你的 Sendblue 号码 |
| POST | `/api/account/webhooks` | 增删改查 Webhook 订阅 |

## 示例

### 示例 1：带媒体、特效与状态回调

```json
POST /api/send-message
{
  "number": "+15551234567",
  "from_number": "+1YOUR_SENDBLUE_NUMBER",
  "content": "Optional text",
  "media_url": "https://example.com/img.jpg",
  "send_style": "celebration",
  "status_callback": "https://yourapp.com/sendblue/status"
}
```

`content` 和/或 `media_url` 至少有一个。`send_style` 仅 iMessage 生效（SMS 上静默忽略），合法值：`celebration`、`shooting_star`、`fireworks`、`lasers`、`love`、`confetti`、`balloons`、`spotlight`、`echo`、`invisible`、`gentle`、`loud`、`slam`。文本最长 18,996 字符；媒体 iMessage 最大 100 MB、SMS 最大 5 MB。

### 示例 2：群发

```json
POST /api/send-group-message
{
  "numbers": ["+15551234567", "+15557654321"],
  "from_number": "+1YOUR_SENDBLUE_NUMBER",
  "content": "Hey team"
}
```

响应返回 `group_id`——持久化它，后续往同一线程追加消息，避免每次新建群。

### 示例 3：对消息发反应

```json
POST /api/send-reaction
{
  "from_number": "+1YOUR_SENDBLUE_NUMBER",
  "message_handle": "<上一次发送返回的 message_handle>",
  "reaction": "love"
}
```

反应仅 iMessage 可用，且需要原消息的 `message_handle`。合法值：`love`、`like`、`dislike`、`laugh`、`emphasize`、`question`。

### 示例 4：入站 Webhook 载荷（`receive`）

```json
{
  "accountEmail": "you@example.com",
  "content": "Reply text",
  "media_url": "https://...",
  "is_outbound": false,
  "number": "+15551234567",
  "from_number": "+1YOUR_SENDBLUE_NUMBER",
  "service": "iMessage",
  "group_id": "...",
  "date_sent": "2024-01-01T12:00:00Z"
}
```

状态回调载荷（`outbound`）镜像 send-message 响应，随消息从 `SENT` → `DELIVERED`（或 `ERROR`）更新。

## 注意事项

最佳实践：
- 每次发送都持久化 `message_handle`——反应、回复、关联状态回调都靠它。
- 用 `status_callback` 取代轮询，更省成本也更准。
- Webhook 快速返回 2xx，再异步处理；非 2xx 会导致重复投递（同一 `message_handle` 可能到达多次，端点需幂等）。
- 依赖 iMessage 专属特性前，先用 `/api/evaluate-service` 检查对方服务类型。
- 入站媒体 URL 约 30 天过期，收到时立即转存到自己的存储。

常见坑：
- **只接受 E.164**：`5551234567` 或 `(555) 123-4567` 会失败，必须 `+15551234567`。
- **`from_number` 必须是你的线路**：伪造或未开通的号码会报错。
- **`send_style` 在 SMS 上静默无效**（绿色气泡收件人）。
- **状态是异步的**：`/api/send-message` 返回 200 只代表「已接受」，不等于「已送达」。
- **每条线路有速率限制**：单号码爆发式群发会触发 Apple 反垃圾启发式判定——放慢节奏或拆分到多条线路。

安全：
- `sb-api-key-id` / `sb-api-secret-key` 是服务端凭据，不能出现在浏览器、移动端或 CI 日志里。
- Webhook 端点应走 HTTPS 且幂等。
- 消息内容会在对方锁屏预览中可见，不要嵌入密钥、令牌或完整 PII——改为附带需鉴权的链接。
- 凭据泄露时从 Dashboard 轮换 API 密钥，旧密钥对在轮换后立即失效。

## 互见

- [[sendblue-cli]]——shell 上下文外发的封装（脚本、cron、agent hook），不需要完整 HTTP 集成时用它。
- [[sendblue-notify]]——在 API/CLI 之上做「X 完成时给我发消息」通知的模式与文案规则。
- 完整参考：https://docs.sendblue.com/ ；官网：https://sendblue.com
- 本文未展开的进阶能力：轮播卡片（`/api/send-carousel`）、FaceTime/联系人卡片分享、高级 Webhook 过滤、超出基础 CRUD 的联系人 API——见文档站。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
