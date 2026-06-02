---
name: zoom-webhooks-setup
title: Zoom Webhooks 事件订阅与校验
description: 当为应用接入 Zoom 事件回调、做 URL 校验/签名验证、排查重试与重复投递时使用；做一套含 endpoint.url_validation 应答、HMAC v0 签名校验、原始体取用、幂等去重与事件订阅管理的生产级 webhook 接收端（Express/Node）；不适用于 Zoom REST 主动调用、OAuth 鉴权本身或非 Zoom 渠道回调；触发词：zoom webhook、x-zm-signature、endpoint.url_validation、recording.completed、事件订阅
domain: 平台/integration
triggers: [zoom webhook, x-zm-signature, endpoint.url_validation, recording.completed, 事件订阅, webhook 签名校验, x-zm-request-timestamp]
tags: [zoom, webhook, integration, hmac, signature-verification, event-subscription, idempotency, express, nodejs]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Node.js crypto (HMAC-SHA256), Express.js, Zoom Marketplace Event Subscriptions, Webhook Subscriptions API (/webhooks/options), ngrok]
requires: []
related: [zoom-oauth-setup, zoom-integration-planner, zoom-mcp-connectors, zoom-product-surface-selector]
combines_with: [zoom-meeting-bot-builder, zoom-rtms-realtime-media, zoom-phone-integration]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
采编自 anthropics/knowledge-work-plugins 的 zoom-plugin/webhooks 技能，适配重写为中文可执行条目。

## 何时使用

适用：
- 给应用首次接入 Zoom 事件回调（HTTP webhook），需要通过 Marketplace 的端点 URL 校验并上线。
- 实现/修复签名验证（`x-zm-signature` + `x-zm-request-timestamp`），消除 401「Invalid signature」。
- 排查 Zoom 重试导致的重复事件、超时、状态不同步等投递可靠性问题。
- 通过门户或 API 管理事件订阅（meeting / recording / user / webinar 等）。

不该用：
- 你要主动调用 Zoom REST API（创建会议、拉录制等）——那是 REST 方向，不在本条覆盖。
- 单纯的 OAuth/鉴权配置问题——见同源 zoom-oauth 技能。
- 非 Zoom 渠道（其他 SaaS）的 webhook——签名算法与字段不通用。

核心约束（务必遵守）：
- 签名串固定格式 `v0:{timestamp}:{body}`，用 **Webhook Secret Token** 做 HMAC-SHA256，比对 `v0={hash}`。
- 必须用**原始请求体字节**计算 HMAC，不能用重新序列化的 JSON（whitespace / key 顺序会变，导致验签失败）。
- 端点必须是公网可达的 HTTPS。

## 步骤

1. 准备：Marketplace 应用开启 Event Subscriptions；拿到 Secret Token（即 `ZOOM_WEBHOOK_SECRET`）；准备一个 HTTPS 回调地址。
2. 捕获原始体：在 JSON 解析前把 raw body 留存（如 Express `json({ verify })` 写入 `req.rawBody`），供验签使用。
3. 处理 URL 校验：收到 `event === 'endpoint.url_validation'` 时，用 Secret 对 `payload.plainToken` 做 HMAC-SHA256，回 `{ plainToken, encryptedToken }`，否则门户无法启用端点。
4. 验签：对其余事件，用 `v0:{timestamp}:{rawBody}` 计算 HMAC，比对 `x-zm-signature`；不符返回 401。同时校验 `x-zm-request-timestamp`，拒绝过期时间戳（防重放）。
5. 快速应答 + 异步处理：先回 200 再排队处理，避免触发 Zoom 重试。
6. 幂等去重：按事件 ID/timestamp + 业务标识去重，保证 handler 可重复执行。
7. 配置订阅：门户 Feature → Event Subscriptions 勾选事件；或用 Webhook Subscriptions API（`/webhooks/options`）编程管理。
8. 本地联调：`ngrok http 3000` 暴露本地端口，在门户填回调地址，查 Webhooks → Logs 验证。

## 指令

环境变量（服务端密钥库保存，勿入库/前端）：

```
ZOOM_WEBHOOK_SECRET   = Marketplace -> Event Subscriptions -> Secret Token  (现行首选)
WEBHOOK_SECRET_TOKEN  = 同一密钥的别名命名
ZOOM_VERIFICATION_TOKEN = 仅旧版端点校验，新接入不要用
```

Express 接收端（捕获 raw body + URL 校验 + 验签）：

```javascript
const crypto = require('crypto');
const express = require('express');
const app = express();
const SECRET = process.env.ZOOM_WEBHOOK_SECRET;

// 关键：在解析前留存原始体，验签必须用它（不要用重新序列化的 JSON）
app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }));

app.post('/zoom/webhook', (req, res) => {
  const { event, payload } = req.body;

  // 1) 端点 URL 校验：未正确应答则门户无法启用
  if (event === 'endpoint.url_validation') {
    const hash = crypto.createHmac('sha256', SECRET)
      .update(payload.plainToken).digest('hex');
    return res.json({ plainToken: payload.plainToken, encryptedToken: hash });
  }

  // 2) 签名校验：串格式固定为 v0:{timestamp}:{body}
  const signature = req.headers['x-zm-signature'];
  const timestamp = req.headers['x-zm-request-timestamp'];
  const body = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);
  const message = `v0:${timestamp}:${body}`;
  const hash = crypto.createHmac('sha256', SECRET).update(message).digest('hex');
  if (signature !== `v0=${hash}`) return res.status(401).send('Invalid signature');

  // 3) 先应答再异步处理，避免触发重试
  res.status(200).send();
  enqueue(event, payload); // 自己实现：入队 + 幂等去重
});
```

事件订阅 API（编程管理；需要 OAuth token，scope：`webhook:read:admin` / `webhook:write:admin`）：

```bash
GET   /webhooks/options          # 查询当前订阅
POST  /webhooks/options          # 创建订阅（notification_endpoint_url + events[]）
PATCH /webhooks/options          # 更新订阅事件列表
```

```javascript
// 增量更新订阅事件
const axios = require('axios');
await axios.patch('https://api.zoom.us/v2/webhooks/options',
  { events: ['meeting.started', 'meeting.ended', 'recording.completed', 'user.created'] },
  { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } });
```

## 示例

常用事件（完整列表见 Zoom 文档）：

```
meeting.started / meeting.ended / meeting.participant_joined / meeting.participant_left
recording.started / recording.completed / recording.trashed
user.created / user.updated / user.deleted
webinar.started / webinar.ended / webinar.registration_created
```

本地联调一条龙：

```bash
ngrok http 3000
# 把 https://xxx.ngrok.io/zoom/webhook 填到 Marketplace 端点
# 门户保存时会触发 endpoint.url_validation，应答正确即可启用
# 之后在 App -> Webhooks -> Logs 查看投递与重试
```

事件分发骨架：

```javascript
switch (event) {
  case 'meeting.started':   track(payload.object.uuid); break;
  case 'meeting.ended':     settleAttendance(payload.object.uuid); break;
  case 'recording.completed': processRecording(payload.object); break; // 常接 REST 拉取下载链接
}
```

## 注意事项

- 验签必须用原始体字节：先 JSON 解析再 `JSON.stringify` 回去会改变 whitespace/key 顺序，导致 401。捕获 raw body 后再验。
- 别用错密钥：是 Webhook Secret Token，不是 OAuth Client Secret。
- 签名串前缀别漏：必须是 `v0:{timestamp}:{body}`，比对值是 `v0={hash}`。
- URL 校验必答：`endpoint.url_validation` 不正确应答（plainToken + encryptedToken），门户启用会失败。
- 重试与重复：Zoom 对失败投递（5xx/超时）会重试（约 3 次），handler 必须幂等——按事件 ID/时间戳去重；先 200 应答再异步处理。
- 防重放：校验 `x-zm-request-timestamp`，拒绝过期时间戳。
- 端点要求：公网可达 HTTPS。

## 互见

- requires：`zoom-oauth` —— 调用 `/webhooks/options` 及 REST 回拉需要 OAuth access token。
- related：`stripe-integration`、`slack-bolt-bot-builder` —— 同类「验签 + 幂等 + 事件订阅」的第三方 webhook 接入范式。
- combines_with：REST 拉取类技能 —— 收到 `recording.completed` 后回调 Zoom REST 获取下载地址，形成「事件触发 → 拉详情」链路。

—— 本条采编自 anthropics/knowledge-work-plugins（Apache-2.0 许可）。
