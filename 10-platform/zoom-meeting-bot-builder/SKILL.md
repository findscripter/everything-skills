---
name: zoom-meeting-bot-builder
title: Zoom 会议机器人 / 实时媒体工作流
description: 当要编程方式让机器人入会、采集会议实时媒体（音视频/转写/聊天/共享）、或搭建录制与 AI 会议助手等实时工作流时使用；做一份选型与落地骨架，划清 RTMS（无 bot 后端拉媒体，两段式 WebSocket）/ Meeting SDK（入会嵌入 UI）/ REST+Webhook 三条路径，给出签名生成、媒体位掩码、心跳与重连等关键约束；不适用于会后批量转写、纯 join_url 链接分享、或非实时资源管理；触发词：zoom bot、入会机器人、实时媒体、rtms、会议转写、raw audio、meeting sdk、live transcript、会议录制、ai 会议助手。
domain: 平台/integration
triggers: [zoom bot, 入会机器人, 实时媒体, rtms, 会议转写, raw audio, meeting sdk, live transcript, 会议录制, ai 会议助手, meeting bot, websocket media, 实时音视频流, screen share 抓取]
tags: [zoom, rtms, meeting-sdk, bot, realtime-media, websocket, transcription, webhook, integration, av]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Node.js, @zoom/rtms, @zoom/meetingsdk, WebSocket, ws, jsrsasign, Python]
requires: []
related: [zoom-rtms-realtime-media, zoom-meeting-app-builder, zoom-virtual-agent-builder, zoom-product-surface-selector]
combines_with: [zoom-oauth-setup, zoom-webhooks-setup, zoom-ai-scribe-transcription]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## 何时使用

适用：

- 要让自动化「机器人」入会、旁观、转写、总结或对会中实时数据作出反应（live media / live transcript）。
- 要从 Zoom 会议、Webinar、Video SDK session、或 Contact Center Voice 拿实时音频/视频/转写/聊天/屏幕共享，做转写、录制、AI 会议助手、合规归档。
- 要把 Meeting SDK 入会、RTMS 媒体拉流、REST 资源管理、Webhook 异步事件这几块**编排**成一个完整后端。

不该用：

- 会后**批量**转写已结束录制 —— 那是批处理工作流，与实时媒体管线是两回事（最常见的认知错误）。
- 只需分享浏览器 `join_url` 链接、或纯做会议/资源的 REST 管理 —— 不需要 Meeting SDK join，也不需要 RTMS。
- 单纯做「会议纪要分析」这类离线文本处理 —— 见互见 `meeting-transcript-analyzer`。

铁律：先定清 join 权限与 auth 模型，再设计机器人；别把批量转写当实时媒体；别忘了会后的存储与重试。

## 步骤

1. 澄清意图：机器人到底要 join（露脸入会）/ observe / transcribe / summarize / act 哪几件事？这决定走哪条路径。
2. 选路径（关键决策）：
   - 只要**媒体/数据平面**（音视频/转写/聊天/共享），且**不需要在会里露一个参会者** → 用 **RTMS**。它直接从 Zoom 基础设施拉流，无需 bot 入会。
   - 需要把完整 Zoom 会议 UI 嵌进自己 App、或必须以参会者身份「入会」（含 Linux 无头 bot 抓 raw media）→ 用 **Meeting SDK**。
   - 需要建会/改会/查资源 → 加 **REST API**；需要异步事件触发 → 加 **Webhook**。
3. 核心实现走 RTMS + Meeting SDK；REST 与 Webhook 按需补。
4. 提前把环境与生命周期约束讲清：单连接独占、Webhook 必须立刻回 200、心跳必答、重连自理、签名生成、会后存储与重试。

### RTMS 两段式连接（最常被忽视）

RTMS 是**后端媒体摄取服务**，事件驱动：后端等 `*.rtms_started` webhook 才开始处理。一条流用**两个独立 WebSocket**：

- 信令 WebSocket：握手、控制、心跳、start/stop。
- 媒体 WebSocket：真正的音视频/转写数据。

产品与事件对照：

| 产品 | Webhook 事件 | 载荷 ID | App 类型 |
|---|---|---|---|
| Meetings | `meeting.rtms_started/stopped` | `meeting_uuid` | General App |
| Webinars | `webinar.rtms_started/stopped` | `meeting_uuid`（同上，**不是** webinar_uuid） | General App |
| Video SDK | `session.rtms_started/stopped` | `session_id` | Video SDK App |
| Contact Center Voice | 产品专属 RTMS/ZCC 事件 | 产品专属 stream/session id | 已审批集成 |

### 媒体类型位掩码（按位 OR 组合）

`Audio=1, Video=2, ScreenShare=4, Transcript=8, Chat=16, All=32`。例：音频+转写 = `1 | 8 = 9`。注意**屏幕共享独立于视频**（不同 flag 4 vs 2、不同 msg_type 16 vs 15），须单独订阅。

## 指令

RTMS SDK 路径（推荐，`@zoom/rtms`，Node 20.3+ / Python 3.10+）：

```javascript
import rtms from "@zoom/rtms";
const RTMS_EVENTS = ["meeting.rtms_started", "webinar.rtms_started", "session.rtms_started"];

rtms.onWebhookEvent(({ event, payload }) => {
  if (!RTMS_EVENTS.includes(event)) return;
  const client = new rtms.Client();
  client.onAudioData((data, ts, meta) => { /* meta.userName, data 为 PCM */ });
  client.onTranscriptData((data, ts, meta) => console.log(meta.userName, data.toString('utf8')));
  client.onJoinConfirm((reason) => console.log("joined", reason));
  client.join(payload);   // SDK 自动处理两个 WS；meeting_uuid / session_id 透明兼容
});
```

RTMS 手动 WebSocket 路径（需全协议控制或非 JS 语言）—— 签名与立刻回 200：

```javascript
// 签名：HMAC-SHA256(clientSecret, "clientId,idValue,streamId")
//      idValue = 会议/Webinar 用 meeting_uuid；Video SDK 用 session_id
function generateSignature(clientId, idValue, streamId, clientSecret) {
  return crypto.createHmac('sha256', clientSecret)
    .update(`${clientId},${idValue},${streamId}`).digest('hex');
}
app.post('/webhook', (req, res) => {
  res.status(200).send();            // CRITICAL：先回 200 再处理，否则 Zoom 重试 → 重复连接
  const { event, payload } = req.body;
  if (RTMS_EVENTS.includes(event)) connectToRTMS(payload);
});
// 信令握手帧：msg_type:1, protocol_version:1, meeting_uuid:idValue,
//   rtms_stream_id, signature, media_type: 9   // = AUDIO|TRANSCRIPT
```

RTMS 环境变量（SDK 模式）：

```bash
ZM_RTMS_CLIENT=...      # OAuth Client ID
ZM_RTMS_SECRET=...      # OAuth Client Secret
ZM_RTMS_PORT=8080       # 默认 8080
ZM_RTMS_PATH=/webhook   # 默认 /
# 手动模式还需 ZOOM_SECRET_TOKEN（webhook 校验）
```

Meeting SDK 路径（要露脸入会 / 嵌入 UI）—— 签名**必须服务端生成**，绝不在前端暴露 SDK Secret：

```javascript
// server.js（Node）：用 SDK Secret 签发 JWT
const KJUR = require('jsrsasign');
const iat = Math.floor(Date.now()/1000) - 30, exp = iat + 60*60*2;
const payload = { sdkKey: process.env.ZOOM_SDK_KEY,
  mn: String(meetingNumber).replace(/\D/g,''), role: parseInt(role,10), iat, exp, tokenExp: exp };
const signature = KJUR.jws.JWS.sign('HS256',
  JSON.stringify({alg:'HS256',typ:'JWT'}), JSON.stringify(payload), process.env.ZOOM_SDK_SECRET);
```

```javascript
// 前端 Client View（CDN 提供 ZoomMtg）
ZoomMtg.preLoadWasm(); ZoomMtg.prepareWebSDK();
ZoomMtg.init({ leaveUrl: location.href, patchJsMedia: true,
  disableCORP: !window.crossOriginIsolated, success() {
    ZoomMtg.join({ sdkKey, signature, meetingNumber, userName,
      passWord: '' /* camelCase 大写 W */ });
  }});
```

CDN 与 npm 是**两套不同 API**：CDN `zoom-meeting-{ver}.min.js` → 全局 `ZoomMtg`（Client View 全页、回调式）；npm `@zoom/meetingsdk` → `ZoomMtgEmbedded`（Component View 可嵌 div、Promise 式）。Linux 无头 bot 抓 raw media 见官方 `meetingsdk-headless-linux-sample`。

## 示例

「实时转写 + AI 会议助手」最小架构（RTMS 后端 + 前端展示）：

1. marketplace 建 General App（User-Managed）→ 开启 Event Subscription → 加事件 `meeting.rtms_started/stopped` → 加 scope `meeting:read:meeting_audio` / `meeting:read:meeting_transcript`（要视频/聊天再加对应 scope）。
2. 后端用上面 SDK 路径接 webhook，`onTranscriptData` 把文本送进 LLM 做摘要/待办。
3. 固定语言转写：握手传 `src_language` + `enable_lid: false`（默认 LID 开启，会自动切语言）。
4. 后端把处理结果经 WebSocket/SSE 推给前端 dashboard 或 Zoom App SDK 面板。

参考实现：`zoom/rtms-samples`、`zoom/rtms-meeting-assistant-starter-kit`（含摘要）、`zoom/videosdk-rtms-transcribe-audio`（Whisper）。

## 注意事项

- 一条流仅允许 **1 个连接**：新连接会踢掉旧连接，务必跟踪活跃 session，防重复 join。
- Webhook **立刻回 200**（CRITICAL）：任何处理前先 `res.status(200).send()`，否则 Zoom 重试 → 重复连接。
- 心跳强制：信令收到 `msg_type 12` 必须以 `msg_type 13` 应答，否则连接被关；媒体侧同理。
- 重连是你的活：RTMS 不自动重连。2026-03 起媒体 keep-alive 容忍升到 **65 秒**（原 35），信令约 60 秒。
- 优雅关闭显式化：后端要主动停流，发 `STREAM_CLOSE_REQ` 等 `STREAM_CLOSE_RESP`。
- 单参与者视频流：`VIDEO_SINGLE_INDIVIDUAL_STREAM` 一次只能订一个人；新的 `VIDEO_SUBSCRIPTION_REQ` 覆盖上一次选择。Webinar 仅 panelist 流确认可用，attendee 流可能非独立。
- Secret 安全：Meeting SDK Secret / RTMS Client Secret 一律服务端，绝不进前端代码或日志。
- 凭据别搞混：Video SDK 用 SDK Key/Secret，不是 OAuth Client ID/Secret；Webinar 仍用 `meeting_uuid`。
- 别忘会后：补上会后存储、落库与重试逻辑，否则断流即丢数据。
- 前端 CSS：Meeting SDK Client View 接管全页，别用全局 `* { margin:0 }` 重置（会破坏 Zoom UI），样式要 scope 到自己容器。

## 互见

- requires：`auth-implementation-patterns` —— RTMS HMAC 签名、Meeting SDK JWT、OAuth scope 等认证模型是入会与拉流的前置。
- related：`twilio-communications` —— 另一类实时音视频/语音通信平台集成，可对照 webhook + 媒体流模式。
- related：`audio-to-markdown-transcriber` —— 拿到实时/会后音频后做转写落盘的离线侧。
- combines_with：`production-llm-app-builder` —— 把实时转写接入 LLM，做摘要、待办、问答式 AI 会议助手。
- combines_with：`meeting-transcript-analyzer` —— 对采集到的转写做结构化纪要与分析。
- combines_with：`rest-api-endpoint-builder` —— 搭建 webhook 接收端与会议资源管理 REST 接口。
- combines_with：`mcp-builder` —— 把会议机器人能力封成 MCP 工具供 Agent 调用。

—— 本条采编自 anthropics/knowledge-work-plugins（Apache-2.0），融合其 zoom-plugin 的 build-zoom-bot / meeting-sdk / rtms 三个技能要点。
