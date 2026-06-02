---
name: whatsapp-cloud-api
title: WhatsApp Cloud API 集成
description: 当需要用 Meta 官方 WhatsApp Business Cloud API 收发消息、对接 webhook 或搭建自动客服时使用；做发文本/模板/交互消息、HMAC-SHA256 校验 webhook、24 小时会话窗口与合规管控，产出 Node.js/Python 可运行集成代码；不适用于个人 WhatsApp、已下线的 On-Premises API 或非 Meta 渠道。触发词：whatsapp、whatsapp business、whatsapp cloud api、api whatsapp、whatsapp 模板、whatsapp 机器人、chatbot whatsapp、whatsapp webhook、whatsapp 消息群发
domain: 平台/integration
triggers: [whatsapp, whatsapp business, whatsapp cloud api, api whatsapp, whatsapp 模板, whatsapp 机器人, chatbot whatsapp, whatsapp webhook, whatsapp 消息群发]
tags: [whatsapp, messaging, meta, webhooks, integration, chatbot]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [nodejs, typescript, express, python, httpx, axios, flask, graph-api, ngrok, claude-api]
requires: []
related: [twilio-communications, slack-bolt-bot-builder, discord-bot-architect, agentmail-email-infra]
combines_with: [twilio-communications, ai-customer-support, rest-api-endpoint-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 需要通过 Meta 官方 WhatsApp Business Cloud API 发送/接收消息、对接 webhook、搭建自动客服或群发模板时。
- 适配 Node.js/TypeScript（Express）或 Python（Flask/httpx）两种栈。
- API 版本：Graph API v21.0；Base URL：`https://graph.facebook.com/v21.0/{phone-number-id}/messages`；认证：Bearer Token（生产用永久 System User Token）。

不该用：
- 个人 WhatsApp 账号、非商业用途。
- 已于 2025 年 10 月下线的 On-Premises API（Cloud API 是唯一受支持选项）。
- 仅需简单单条通知、用更轻量专用工具即可完成时。

## 步骤

1. 准备前置：Meta Business Suite 账号、Meta for Developers 应用并添加 WhatsApp 产品、已验证号码、永久 System User Token。
2. 配置环境变量（见下）。
3. 24 小时窗口内可发任意类型消息（免费）；窗口外仅能发已审批的模板消息（按类别计费）。
4. 配置 webhook：先过 GET 验证，再用 HMAC-SHA256 校验每条 POST。
5. 发消息后用测试脚本验证投递与状态回执。

## 指令

环境变量：
```env
WHATSAPP_TOKEN=访问令牌
PHONE_NUMBER_ID=电话号码ID
WABA_ID=WhatsApp商业账号ID
APP_SECRET=应用密钥
VERIFY_TOKEN=自定义webhook校验令牌
```

决策路径：需要从零搭建则先看 setup-guide；否则按「语言（Node/Python）→ 目标（发消息 / 收消息 / 自动化 / Flows·Commerce / 模板管理 / 合规）」分流。

## 示例

发送文本（Node.js/TS）：
```typescript
import axios from 'axios';
const GRAPH_API = 'https://graph.facebook.com/v21.0';
async function sendText(to: string, message: string) {
  const r = await axios.post(
    `${GRAPH_API}/${process.env.PHONE_NUMBER_ID}/messages`,
    { messaging_product: 'whatsapp', to, type: 'text', text: { body: message } },
    { headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` } }
  );
  return r.data; // { messaging_product, contacts, messages: [{ id }] }
}
```

发送文本（Python，httpx）：
```python
import httpx, os
GRAPH_API = "https://graph.facebook.com/v21.0"
async def send_text(to: str, message: str) -> dict:
    async with httpx.AsyncClient() as client:
        r = await client.post(
            f"{GRAPH_API}/{os.environ['PHONE_NUMBER_ID']}/messages",
            json={"messaging_product": "whatsapp", "to": to,
                  "type": "text", "text": {"body": message}},
            headers={"Authorization": f"Bearer {os.environ['WHATSAPP_TOKEN']}"})
        return r.json()
```

模板消息（窗口外唯一可主动发起的形式，须先审批）：
```json
{
  "messaging_product": "whatsapp",
  "to": "5511999999999",
  "type": "template",
  "template": {
    "name": "hello_world",
    "language": { "code": "pt_BR" },
    "components": [
      { "type": "body", "parameters": [ { "type": "text", "text": "João" } ] }
    ]
  }
}
```

Webhook GET 验证（Express）：
```typescript
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) res.status(200).send(challenge);
  else res.sendStatus(403);
});
```

Webhook POST 签名校验（HMAC-SHA256，恒定时间比较）：
```typescript
import crypto from 'crypto';
function validateSignature(rawBody: Buffer, signature: string): boolean {
  const expected = crypto.createHmac('sha256', process.env.APP_SECRET!)
    .update(rawBody).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(`sha256=${expected}`), Buffer.from(signature));
}
```

交互按钮（Node.js，最多 3 个按钮）：
```typescript
interactive: { type: 'button', body: { text: body },
  action: { buttons: buttons.map(b => ({ type: 'reply', reply: { id: b.id, title: b.title } })) } }
```

## 注意事项

- 签名校验必须用 `crypto.timingSafeEqual`（Node）或 `hmac.compare_digest`（Python）防时序攻击，绝不用普通字符串相等比较。每条 webhook 都带 `X-Hub-Signature-256` 头，处理前先校验。
- Webhook 端点需 HTTPS + 有效 SSL，须在 5 秒内返回 HTTP 200；本地开发用 ngrok。
- 消息类型限制：文本 4096 字符、模板 body 1600 字符、图片 5MB、文档 100MB、视频/音频 16MB、按钮最多 3 个、列表最多 10 项。
- 合规清单：发送前取得明确 opt-in；实现 opt-out（关键词 SAIR/STOP）；记录带时间戳的同意；遵守 LGPD/GDPR；模板需先审批。
- 质量分（绿/黄/红）影响发送上限：红色需立即降量。2026 起发送限额按 Business Portfolio 计；完成商业验证后可直达 100K 会话/24h。
- 常见错误：401 令牌失效→重新生成 System User Token；400→对照示例核验 JSON；模板被拒→修改后重提；速率超限（80 msg/s）→加重试队列。
- 可结合 Claude API 做智能回复：webhook 收消息 → 带上下文调用 Claude → 经 WhatsApp 回复，并保留转人工通道。

## 互见

- claude-api：将 WhatsApp 消息接入 Claude，实现智能自动应答与会话上下文管理。

---
本条采编自 sickn33/antigravity-awesome-skills（MIT）。
