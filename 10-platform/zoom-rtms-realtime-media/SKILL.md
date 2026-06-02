---
name: zoom-rtms-realtime-media
title: Zoom RTMS 实时音视频/转写处理
description: 当用 Zoom RTMS 在后端实时摄取会议/网研/Video SDK/Contact Center Voice 的音频、视频、转写、聊天、屏幕共享流并做 AI 分析时使用；做两段式 WebSocket（信令+媒体）接入、webhook 触发、HMAC-SHA256 签名、媒体位掩码订阅与心跳保活，产出 @zoom/rtms SDK 或手写协议的可运行后端；不适用于前端 UI（用 Zoom App SDK）、需机器人入会的录制或非 Zoom 平台。触发词：rtms、zoom 实时媒体、live transcript、meeting transcription、websocket media、raw audio、streaming video
domain: 平台/integration
triggers: [rtms, zoom rtms, zoom 实时媒体, real-time media, live transcript, meeting transcription, websocket media, raw audio, raw video, streaming video, contact center voice media, single individual video stream]
tags: [zoom, rtms, websocket, real-time-media, transcription, integration, video-sdk, contact-center]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [nodejs, @zoom/rtms, python, ws, crypto, websocket]
requires: []
related: [zoom-meeting-bot-builder, zoom-ai-scribe-transcription, zoom-webhooks-setup, zoom-integration-planner]
combines_with: [zoom-mcp-connectors]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
＃ Zoom RTMS 实时音视频/转写处理

## 何时使用

- 需要在**后端**实时摄取 Zoom 会议、网研（Webinar）、Video SDK 会话或 Zoom Contact Center Voice 的媒体/数据平面：音频、视频、屏幕共享、转写、聊天。
- 想做实时转写、会议 AI 助手、录制、语音/视觉分析、合规归档，且**不愿让机器人入会**抓媒体——RTMS 直接从 Zoom 基础设施取流。
- 处理是**事件触发**的：后端先等 RTMS start webhook，再开始处理流。

不该用：
- 不是前端 UI SDK。需要客户端内 UI/控件请用 Zoom App SDK，再经 WebSocket/SSE/gRPC 把后端处理结果推给前端。
- 需要机器人作为参会者入会的场景（RTMS 的卖点正是免机器人）。
- 非 Zoom 平台、纯离线音视频转写（用本地 whisper 等即可）。

官方文档 https://developers.zoom.us/docs/rtms/ ｜ JS SDK https://zoom.github.io/rtms/js/ ｜ Py SDK https://zoom.github.io/rtms/py/ ｜ 示例 https://github.com/zoom/rtms-samples

## 步骤

1. **选产品与事件**：会议=`meeting.rtms_started/stopped`（payload 用 `meeting_uuid`）；网研=`webinar.rtms_started`（payload **仍是 `meeting_uuid`**，非 webinar_uuid）；Video SDK=`session.rtms_started`（payload 用 `session_id`，且需 Video SDK App 的 SDK Key/Secret 而非 OAuth）；Contact Center Voice 用其专属 RTMS/ZCC Voice 事件族（同一传输模型，payload 产品特定）。
2. **建 App 配权限**：marketplace.zoom.us → Develop → General App（用户托管）或 Video SDK App → 开启 Event Subscription，搜 "rtms" 加事件；Scopes 搜 "rtms" 加 `meeting:read:meeting_audio/video/transcript/chat`（网研换 `webinar:read:*`）。
3. **选实现路径**：SDK（`@zoom/rtms`，推荐，封装 WebSocket 复杂度、自动重连）或手写 WebSocket（全协议控制/非 JS 语言，需自己实现两段式协议与重连）。
4. **接 webhook**：收到 start 事件后**立刻回 200**，再异步连 RTMS。
5. **两段式 WebSocket**：信令 socket（鉴权、控制、心跳）+ 媒体 socket（实际音视频/转写数据）。手写时先生成签名做握手，订阅媒体类型位掩码。
6. **保活与收尾**：响应心跳；需要主动关流时发 `STREAM_CLOSE_REQ` 等 `STREAM_CLOSE_RESP`；自己负责重连。

## 指令

**媒体类型位掩码**（按位 OR 组合）：Audio=1、Video=2、Screen Share=4（**与视频分开！**）、Transcript=8、Chat=16、All=32。例：Audio+Transcript = `1|8` = `9`。

**签名格式**：`HMAC-SHA256(clientSecret, "clientId,idValue,streamId")`，`idValue` = 会议/网研用 `meeting_uuid`、Video SDK 用 `session_id`；信令与媒体握手都要用。

**2026 年 3 月协议变更（务必掌握）**：
- 新增 Contact Center Voice 音频/转写支持。
- 转写握手支持 `src_language` + `enable_lid`，**默认开启语言识别（LID）**；要固定语言转写须设 `enable_lid: false`。
- 单路个人视频订阅：`data_opt` 设为 `VIDEO_SINGLE_INDIVIDUAL_STREAM` 时一次只推一名参会者摄像头，新的 `VIDEO_SUBSCRIPTION_REQ` 覆盖上一次选择。
- 优雅关闭：后端可发 `STREAM_CLOSE_REQ`、等 `STREAM_CLOSE_RESP`。
- 媒体 socket 保活超时由 35s 提升到 **65s**；信令仍约 60s。

**SDK 环境变量**：
```bash
ZM_RTMS_CLIENT=your_client_id      # 必填，OAuth Client ID
ZM_RTMS_SECRET=your_client_secret  # 必填，OAuth Client Secret
ZM_RTMS_PORT=8080                  # 可选，默认 8080
ZM_RTMS_PATH=/webhook              # 可选，默认 /
ZM_RTMS_LOG_LEVEL=info             # error|warn|info|debug|trace
```
**手写实现环境变量**：`ZOOM_CLIENT_ID` / `ZOOM_CLIENT_SECRET` / `ZOOM_SECRET_TOKEN`（webhook 校验）。

## 示例

**SDK 路径（推荐）**：
```javascript
import rtms from "@zoom/rtms";
const RTMS_EVENTS = ["meeting.rtms_started", "webinar.rtms_started", "session.rtms_started"];

rtms.onWebhookEvent(({ event, payload }) => {
  if (!RTMS_EVENTS.includes(event)) return;
  const client = new rtms.Client();
  client.onAudioData((data, ts, meta) => {
    console.log(`Audio from ${meta.userName}: ${data.length} bytes`);
  });
  client.onTranscriptData((data, ts, meta) => {
    console.log(`${meta.userName}: ${data.toString('utf8')}`);
  });
  client.onJoinConfirm((reason) => console.log(`Joined: ${reason}`));
  // SDK 自动处理 WebSocket，透明接受 meeting_uuid 与 session_id
  client.join(payload);
});
```

**手写 WebSocket 路径（全协议控制）**：
```javascript
const WebSocket = require('ws');
const crypto = require('crypto');
const RTMS_EVENTS = ['meeting.rtms_started', 'webinar.rtms_started', 'session.rtms_started'];

function generateSignature(clientId, idValue, streamId, clientSecret) {
  const message = `${clientId},${idValue},${streamId}`;
  return crypto.createHmac('sha256', clientSecret).update(message).digest('hex');
}

app.post('/webhook', (req, res) => {
  res.status(200).send();                 // 关键：立刻回 200
  const { event, payload } = req.body;
  if (RTMS_EVENTS.includes(event)) connectToRTMS(payload);
});

function connectToRTMS(payload) {
  const { server_urls, rtms_stream_id } = payload;
  const idValue = payload.meeting_uuid || payload.session_id;  // VideoSDK 用 session_id
  const signature = generateSignature(CLIENT_ID, idValue, rtms_stream_id, CLIENT_SECRET);
  const ws = new WebSocket(server_urls);
  ws.on('open', () => ws.send(JSON.stringify({
    msg_type: 1,                // 握手请求
    protocol_version: 1,
    meeting_uuid: idValue,
    rtms_stream_id, signature,
    media_type: 9               // AUDIO(1) | TRANSCRIPT(8)
  })));
  // ... 处理响应、连媒体 WebSocket、响应心跳
}
```

## 注意事项

- **每个流只允许 1 个连接**：新连接会踢掉旧连接，必须自己跟踪活跃会话，防重复 join。
- **webhook 必须先回 200 再处理**：响应延迟会触发 Zoom 重试，造成重复连接。
- **心跳强制**：收到 `msg_type 12` 必须回 `msg_type 13`（信令与媒体同此模式），否则连接被关。
- **重连是你的责任**：RTMS 不自动重连；媒体保活容忍约 65s、信令约 60s。
- **屏幕共享与视频是分开的**：不同 msg_type（16 vs 15）、不同 flag（4 vs 2），须单独订阅。
- **转写语言漂移**：需固定语言时用 `src_language` + `enable_lid: false`，否则默认自动切换语言。
- **网研只确认 panelist 流可用**，与会者（attendee）流未必可单独取。
- 前置：JS SDK 需 Node.js 20.3.0+（建议 24 LTS），Py SDK 需 Python 3.10+；需先在 Zoom Developer Forum 申请 RTMS 访问权限。
- 常见错误：连接失败/重复连接多为 webhook 响应时机或单连接限制；无音视频数据先核对 media_type 位掩码配置。

## 互见

- combines_with：`claude-api` —— 实时转写流接 Claude 做会议摘要、实时问答与智能助手。
- related：`whatsapp-cloud-api`、`twilio-communications` —— 同属带 webhook 校验的实时消息/媒体集成。
- related：`youtube-transcript-ingest` —— 另一类转写摄取场景（离线视频 vs 实时会议）。

---
本条采编自 anthropics/knowledge-work-plugins（Apache-2.0）。
