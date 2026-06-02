---
name: twilio-communications
title: Twilio 短信与语音通信集成
description: 当需要用 Twilio 构建短信、语音、WhatsApp 或手机验证（2FA）功能时使用；产出可直接落地的 Python 发送/接收、Verify 验证、TwiML IVR 与 Webhook 校验代码，覆盖 E.164 校验、退订合规、限流重试与签名验证；不适用于 AI 语音对话生成、邮件群发或非 Twilio 渠道。触发词：Twilio、发短信、语音呼叫、IVR、WhatsApp、手机验证 2FA、TwiML、X-Twilio-Signature
domain: 平台/integration
triggers: [Twilio, 发短信 / send SMS, 短信通知, 语音呼叫 / voice call, 手机号验证 / 2FA, WhatsApp Business API, TwiML / IVR 语音菜单, Twilio Verify OTP, X-Twilio-Signature 校验, 短信退订 STOP / 21610, A2P 10DLC 运营商过滤, 限流重试 30429]
tags: [平台集成, 通信, 短信SMS, 语音IVR, WhatsApp, 2FA验证, Webhook, Twilio, Python, 限流重试]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Python twilio SDK, twilio.rest.Client, twilio.twiml.voice_response (VoiceResponse/Gather), twilio.request_validator.RequestValidator, Twilio Verify v2, Flask Webhook, Twilio Console (Trust Hub / Content Template Builder)]
requires: []
related: [whatsapp-cloud-api, agentmail-email-infra, slack-bolt-bot-builder, imessage-claude-bridge]
combines_with: [whatsapp-cloud-api, auth-implementation-patterns, transactional-email-template-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当你要在应用里集成 Twilio 通信能力时使用，典型场景：

- 发送短信通知 / 事务性短信（订单、物流、提醒、告警）。
- 手机号验证与 2FA / OTP、密码重置、高价值交易确认（用 Twilio Verify，不要自建 OTP）。
- 语音呼叫与 IVR 语音菜单（用 TwiML 编排「按 1 找销售…」、留言转写）。
- WhatsApp Business 双向消息（含 24 小时会话窗口与模板消息）。
- 接收 Twilio 回调（投递状态、入站消息、通话事件、录音转写）。

**不该用的边界：**

- 需要 AI 语音对话 / 智能体应答 → Twilio 只提供电话线路，对话逻辑交给语音智能体类技能。
- 需要完整账号体系 / 会话与权限 → Verify 只是其中一环，找鉴权类技能。
- 邮件群发、站内信、推送等非 Twilio 渠道。
- 仅做工作流编排触发（由自动化技能调用本技能发短信/打电话）。

## 步骤

通用前置：凭据走环境变量，号码用 E.164 格式（`+` 加国家码，如 `+14155551234`）。

1. **配置凭据**：`TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` 注入环境变量，生产优先用可吊销的 **API Key**（`TWILIO_API_KEY_SID` + `TWILIO_API_KEY_SECRET` + `TWILIO_ACCOUNT_SID`）替代 Auth Token。绝不硬编码、绝不放进客户端 JS。
2. **发短信**：`Client(...).messages.create(to, from_, body, status_callback)`，发前校验 E.164、估算分段（每 160 字符 1 段，超出会拆分并加价），捕获 `TwilioRestException` 并按错误码分支处理。
3. **2FA / 验证**：在 Console 建一个 Verify Service，拿到 `TWILIO_VERIFY_SID`；`services(sid).verifications.create(to, channel)` 发码，`verification_checks.create(to, code)` 校验（`status == "approved"` 即通过）。验证码全权交给 Twilio，**不要入库**。
4. **语音 / IVR**：Twilio 对你的 Webhook 发 HTTP 请求 → 你返回 TwiML（XML）→ Twilio 执行。用 `VoiceResponse` + `Gather`（收键 `num_digits` / `timeout` / `action`）搭菜单，`<Dial>` 转接、`<Record>` 留言。无状态，状态靠 URL 参数 / 会话维护。出站呼叫用 `client.calls.create(to, from_, url=...)`。
5. **接收 Webhook**：所有入站端点必须先用 `RequestValidator(auth_token).validate(url, params, signature)` 校验 `X-Twilio-Signature`，校验失败返回 403；处理要快、尽快返回 `("", 200)`。
6. **WhatsApp**：号码加 `whatsapp:` 前缀。24 小时会话窗口内可自由文本（≤1024 字符），窗口外只能发预审模板（`content_sid` + `content_variables`）。按用户维护会话过期时间。
7. **限流与重试**：短信默认 80 MPS、API 100 rps；仅对限流码（`20429` 语音 / `30429` 消息）做指数退避 + jitter 重试，其他错误直接抛。瞬时不可达（`30003/30008/30009`）可隔较长间隔重试，永久失败不重试。

## 指令

核心调用速查：

```python
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

client = Client(os.environ["TWILIO_ACCOUNT_SID"], os.environ["TWILIO_AUTH_TOKEN"])

# 发短信
msg = client.messages.create(to="+14155551234", from_=FROM, body="文本",
                             status_callback="https://app/webhooks/status")

# Verify 2FA：发码 / 校验
client.verify.v2.services(SID).verifications.create(to="+1...", channel="sms")
chk = client.verify.v2.services(SID).verification_checks.create(to="+1...", code="123456")
ok = chk.status == "approved"

# Webhook 签名校验（必做）
from twilio.request_validator import RequestValidator
RequestValidator(os.environ["TWILIO_AUTH_TOKEN"]).validate(
    request.url, request.form.to_dict(), request.headers.get("X-Twilio-Signature", ""))
```

E.164 校验正则：`^\+[1-9]\d{1,14}$`。

关键错误码（按码分支处理，别只看 message）：

- **21610** 用户已退订（回过 STOP），须本人回 START 才能再发，受 TCPA/CTIA 法律约束，不可绕过。
- **21614 / 21211** To / From 号码格式非法。
- **30003** 手机暂时不可达（关机/飞行/无信号），通常瞬时，可重试或降级到邮件。
- **30005 / 30006** 未知目标 / 永久不可达（座机或无效号），不要重试。
- **30429 / 20429** 消息 / 语音限流，做指数退避。
- **60203** Verify 发码次数超限（同号 10 分钟内 5 次）。**60205** Service 未找到（查 VERIFY_SID）。
- **63016** WhatsApp 超出 24 小时窗口，改发模板。**63018** 模板未审批。

## 示例

**带校验与错误处理的发短信骨架：**

```python
def send_sms(to, body):
    if not re.match(r'^\+[1-9]\d{1,14}$', to):
        return {"success": False, "error": "号码须为 E.164 格式 (+14155551234)"}
    try:
        m = client.messages.create(to=to, from_=FROM, body=body)
        return {"success": True, "message_sid": m.sid, "status": m.status}
    except TwilioRestException as e:
        codes = {21610: "用户已退订，须回 START 重新订阅",
                 30003: "手机不可达（关机/飞行模式）",
                 30429: "触发限流，请指数退避重试"}
        return {"success": False, "error_code": e.code, "error": codes.get(e.code, e.msg)}
```

**入站短信处理退订/订阅关键词（合规必做）：**

```python
body = request.form.get("Body", "").strip().upper()
if body in ["STOP", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"]:
    mark_user_opted_out(from_number); return "", 200
if body in ["START", "SUBSCRIBE", "YES", "UNSTOP"]:
    mark_user_opted_in(from_number); return "", 200
```

**限流退避重试装饰器（仅重试 20429/30429，带 jitter 防惊群）：**

```python
delay = min(base_delay * (2 ** attempt) + random.uniform(0, 1), max_delay)
time.sleep(delay)
```

## 注意事项

- **凭据安全（CRITICAL）**：泄露 Account SID + Auth Token = Twilio 账号被完全接管（盗发消息、买号、读录音）。常见泄露点：硬编码进源码并推到 GitHub、客户端 JS、Docker 镜像、日志。优先用可吊销的 API Key；一旦泄露立即在 Console 轮换并排查账单。
- **Webhook 签名（CRITICAL）**：不校验 `X-Twilio-Signature` 等于谁知道 URL 谁就能伪造回调（假投递、伪造入站消息、欺诈验证）。代理/ngrok 下注意用 Twilio 实际请求的完整 URL（可能要从 `X-Forwarded-Proto/Host` 重建），生产用稳定 URL。
- **退订合规（HIGH）**：必须落库 opt-out 状态、发前检查；营销短信带「Reply STOP to unsubscribe」。这是法律要求，21610 无法绕过。
- **运营商过滤（HIGH，美国）**：消息显示 sent 却从不 delivered 多为运营商静默拦截。对策：注册 **A2P 10DLC**（Console > Messaging > Trust Hub，建 brand 与 campaign，审批需数天）；内容口语化、避免短链与「urgent/verify/click now」等垃圾词；监控投递率（< 95% 告警）。高量选 toll-free 或 short code。
- **Verify 反欺诈**：内置限流（同号 10 分钟 5 次）防 SMS pumping；建议再叠一层应用级限流并给用户清晰倒计时与语音/邮件备选通道。别自己存 OTP、别重复同一码。
- **WhatsApp 窗口**：按用户跟踪 24 小时会话；窗口外仅模板消息（Console > Content Template Builder 建模板，审批约 24–48 小时）。
- **反模式**：发前不校验 E.164、硬编码凭据/号码、忽略状态回调、不处理 21610、返回非 XML 给语音 Webhook、不处理 Gather 超时、超 1024 字符、无 jitter 的立即重试、对非限流错误也重试。

## 互见

- 需要 AI 语音对话应答 → 语音智能体 / voice-agents 类技能（Twilio 提供电话线路，对话由其负责）。
- 需要把短信告警接入 Slack 通知 → Slack 机器人类技能。
- 需要完整鉴权体系 → 鉴权 / auth 类技能（Verify 是其中一环）。
- 由自动化工作流触发发短信/打电话 → 工作流自动化类技能。
- 高量消息的 Webhook 扩容与投递率监控 → DevOps / 运维类技能。

---

采编自 sickn33/antigravity-awesome-skills（MIT）；上游原始内容致谢 vibeship-spawner-skills（Apache 2.0）。本条目为适配重写，凭据、号码与合规细节请按自身环境验证。
