---
name: zoom-phone-integration
title: Zoom Phone 集成（呼叫/事件/API）
description: 当为 Web 应用或 CRM 接入 Zoom Phone、做嵌入式软电话/点击拨号/通话记录自动化时使用；做一套覆盖 OAuth、Phone REST API、Webhook 事件、Smart Embed postMessage 与 URI 唤起（zoomphonecall:// / zoomphonesms://）的集成方案，含 v1→v2→v3 迁移映射与签名/来源校验；不适用于 Zoom 视频会议（Meeting）、Zoom Contact Center 坐席路由或非 Zoom 电话渠道。触发词：Zoom Phone、软电话、点击拨号、通话记录、call history、Smart Embed、phone webhook、call handling、zoomphonecall
domain: 平台/integration
triggers: [Zoom Phone, 软电话 / smart embed, 点击拨号 click-to-call, 通话记录 call history, zoom phone api, zoom phone webhook, phone.* 事件, call handling 呼叫处理, zoomphonecall:// / zoomphonesms://, CRM 电话集成 CTI, call_history_uuid / call_element_id 迁移, 短信 SMS log event]
tags: [平台集成, 通信, Zoom Phone, 软电话CTI, Webhook, Smart Embed, postMessage, OAuth, CRM集成, API迁移]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Zoom Phone REST API, Zoom Marketplace OAuth (User / Server-to-Server), Smart Embed iframe + postMessage, URI schemes (zoomphonecall:// / zoomphonesms://), Zoom Webhook (Event Subscriptions)]
requires: []
related: [zoom-webhooks-setup, zoom-oauth-setup, zoom-meeting-app-builder, zoom-contact-center-app]
combines_with: [zoom-oauth-setup, zoom-webhooks-setup, zoom-product-surface-selector]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## 何时使用

当你要把 Zoom Phone 的呼叫能力接进自己的 Web 应用 / CRM / 工单系统时使用，按需求选「集成面」：

- **嵌入式软电话面板**（在网页里拨号、接听、记录）→ Smart Embed（iframe + postMessage）。
- **通话记录 / 分析 / 自动化**（拉取通话历史、监控实时状态、自动写日志）→ Phone REST API + Webhook 事件。
- **外部 UI 点击拨号 / 发短信**（从联系人表一键呼出）→ URI 唤起 `zoomphonecall://`、`zoomphonesms://`（或 `tel:` / `callto:`）。
- **管理类自动化**（批量配置用户 / 自动总机 / 呼叫队列的呼叫处理规则）→ Call Handling API。

**不该用的边界：**

- 需要 Zoom **视频会议 / Meeting** 能力（创建会议、入会、录制）→ 找 Zoom Meeting 类技能，本条只管电话。
- 需要 **Zoom Contact Center**（坐席排队、IVR 流、客服路由）→ 用 Contact Center 类技能；电话与联络中心混合旅程时本条与其链式配合。
- 非 Zoom 的电话 / 短信渠道（Twilio、运营商直连等）。
- 纯 OAuth 令牌生命周期、纯 Webhook 验签框架本身 → 交给鉴权 / Webhook 类技能，本条只用其结论。

官方文档：https://developers.zoom.us/docs/phone/ ；CRM 参考样例：https://github.com/zoom/CRM-Sample

## 步骤

通用生命周期（七步）：

1. **账号前置**：开通 Zoom Phone 许可、管理员配置、（如需短信）SMS 资格。
2. **建 OAuth 应用与作用域**：在 Marketplace 建 General OAuth（用户态）或 Server-to-Server OAuth（账号态）应用，按最小权限申请 scope。改 scope 后必须重新授权。
3. **选集成面**：Smart Embed / REST+Webhook / URI 唤起，三选一或组合。
4. **捕获实时事件**：用 Smart Embed 事件和/或 `phone.*` Webhook。
5. **持久化通话标识并关联记录**：统一存 `call_id`、`call_history_uuid`、`call_element_id` 三个字段。
6. **迁移安全的数据映射**：按 v1 → v2 → v3 做字段适配，处理改名字段。
7. **安全加固**：postMessage 来源校验、Webhook 签名校验、最小权限 scope，密钥只留服务端。

## 指令

**环境变量（标准 `.env` 键）：**

```
ZOOM_CLIENT_ID            # OAuth 应用身份（Marketplace > App Credentials）
ZOOM_CLIENT_SECRET        # OAuth 令牌交换，仅服务端
ZOOM_REDIRECT_URI         # 用户态 OAuth 回调（须在 Marketplace 白名单）
ZOOM_ACCOUNT_ID           # 可选，Server-to-Server 账号级集成
ZOOM_WEBHOOK_SECRET       # 推荐，Webhook 签名验证（亦名 WEBHOOK_SECRET_TOKEN）
ZOOM_PHONE_SMART_EMBED_ORIGIN=https://applications.zoom.us   # postMessage 允许来源
```

Smart Embed 的「认可域名」在 Marketplace 应用设置里配，不在 `.env`。

**Smart Embed 事件契约（iframe ↔ 宿主 postMessage）：**

- 宿主下发命令：`zp-init-config`、`zp-make-call`、`zp-input-sms`、`zp-contact-search-response`、`zp-contact-match-response`。
- iframe 上抛事件：`zp-call-ringing-event` / `zp-call-connected-event` / `zp-call-ended-event` / `zp-call-log-completed-event` / `zp-call-recording-completed-event` / `zp-call-voicemail-received-event` / `zp-ai-call-summary-event` / `zp-sms-log-event` / `zp-save-log-event` / `zp-contact-search-event` / `zp-contact-match-event` / `zp-notes-save-event`。
- 字段可靠性：`callId` 出现在生命周期早期，`callLogId` 出现在完成类事件，`event.id` 用于去重 / 幂等。

**REST 通话历史 / 呼叫处理端点：**

```
# 通话历史（v3 命名，新功能一律用这套）
GET  /phone/call_history
GET  /phone/call_history/{call_history_uuid}
GET  /phone/call_element/{call_element_id}

# 呼叫处理设置（目标：用户 / 自动总机 / 呼叫队列）
GET   /phone/extension/{extensionId}/call_handling/settings
POST  /phone/extension/{extensionId}/call_handling/settings/{settingType}
PATCH /phone/extension/{extensionId}/call_handling/settings/{settingType}
```

常见子设置：`custom_hours`、`holiday`、`call_handling`、`call_forwarding`（用户态）。

**弃用时间线与迁移映射（务必提前适配）：**

- 旧 Call Logs API（v1）全面弃用：**2026 年 4 月**；旧 Call Log Webhook（v1）：**2026 年 5 月**；`call_log` / `call_path` 数组字段弃用：**2026 年 11 月**。
- API 映射：`/phone/call_logs` → `/phone/call_history`；`/phone/call_logs/{callLogId}` → `/phone/call_history/{call_history_uuid}`；`/phone/call_history_detail/{callHistoryId}` → `/phone/call_element/{call_element_id}`。
- Webhook 映射：`phone.call_log_deleted` → `phone.call_history_deleted` → `phone.call_element_deleted`；`phone.{callee,caller}_call_log_completed` → `…_call_history_completed` → `…_call_element_completed`。

## 示例

**Smart Embed 宿主侧：监听事件 + 强制校验来源（安全必做）：**

```js
window.addEventListener('message', (event) => {
  // 必做：拒绝任何非 applications.zoom.us 的消息
  if (event.origin !== 'https://applications.zoom.us') return;

  const msg = event.data || {};
  if (seen.has(msg.event?.id)) return;        // 用 event.id 幂等去重
  seen.add(msg.event?.id);

  switch (msg.type) {
    case 'zp-call-ringing-event':   onRinging(msg.callId); break;
    case 'zp-call-ended-event':     onEnded(msg.callId); break;
    case 'zp-call-log-completed-event': persistCallLog(msg.callLogId); break;
    case 'zp-contact-search-event':
      // 反向回包：把匹配到的联系人塞回去
      iframe.contentWindow.postMessage(
        { type: 'zp-contact-search-response', data: lookup(msg.query) },
        'https://applications.zoom.us');
      break;
    default:
      logUnknownEvent(msg);   // 未知类型记结构化日志，不要硬失败
  }
});

// 发起呼叫
iframe.contentWindow.postMessage(
  { type: 'zp-make-call', phoneNumber: '+14155550123' },
  'https://applications.zoom.us');
```

**外部 UI 点击拨号 / 发短信（URI 唤起 Zoom 客户端）：**

```html
<a href="zoomphonecall://+14155550123">呼叫</a>
<a href="zoomphonesms://+14155550123">发短信</a>
```

**呼叫处理（改营业时间，先读后改 + 回滚）：**

```
1. GET  …/call_handling/settings           # 取当前快照，存一份用于回滚
2. PATCH …/call_handling/settings/custom_hours   # 只发该子设置的小补丁
3. 外部号码必须 E.164 格式，发请求前服务端校验
```

## 注意事项

- **postMessage 来源校验（CRITICAL）**：每条消息先断言 `event.origin === 'https://applications.zoom.us'`，否则任意页面都能伪造拨号 / 通话事件。下发命令时第二参也固定填该 origin，不要用 `'*'`。
- **Webhook 签名校验（CRITICAL）**：所有 `phone.*` 回调必须用 `ZOOM_WEBHOOK_SECRET` 验签后再处理，否则可被伪造投递。
- **解析器要宽容**：对 Smart Embed 事件与 Webhook 保留宽松解析，新增可选字段（如 `enableAutoLog` 类标志）不应导致崩溃；未知事件类型记结构化日志而非硬失败。
- **迁移安全**：现在就把存储字段标准化为 `call_id` / `call_history_uuid` / `call_element_id`，在过渡窗口内给新旧字段名加适配器；新表 / 新功能一律用 v3 命名。别让代码绑死即将弃用的 v1 Call Logs（2026-04 起停用）。
- **呼叫处理漂移**：枚举 / action 值会演进，路由字段名在文档不同章节与旧实现间有差异；上线前用服务端校验器拦掉非法 call-handling 负载，外部号码强制 E.164。
- **密钥安全**：`ZOOM_CLIENT_SECRET` 等只留服务端，绝不进客户端 JS / 仓库 / 日志；改 scope 后必须重新授权应用。

## 互见

- requires：`webhook-signature-validation` 类 —— `phone.*` 事件投递的验签底座（本条只用结论）。
- related：`twilio-communications` —— 另一通信渠道集成；`zoom-meeting` / `zoom-contact-center` 类 —— 同生态视频会议与联络中心。
- combines_with：OAuth 令牌生命周期类技能 —— 解决 Marketplace 应用授权与刷新；CRM / 工单类技能 —— 把通话事件落地为业务记录。

---

采编自 anthropics/knowledge-work-plugins（Apache-2.0），上游为 Zoom 官方 zoom-plugin。本条目为适配重写而非逐字翻译；端点、字段名与弃用时间请以 Zoom 官方文档为准并按自身环境验证。
