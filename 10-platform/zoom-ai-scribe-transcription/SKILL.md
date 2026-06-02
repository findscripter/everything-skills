---
name: zoom-ai-scribe-transcription
title: Zoom AI Scribe 转写处理
description: 当需要把上传或已存档的音视频文件转写成文本（含批量、Webhook 流水线）时使用 Zoom AI Services Scribe；产出 Build 平台 JWT 鉴权、快速模式同步转写、批量作业轮询/回调与 transcript JSON 落地的可执行方案；不适用于实时直播媒体低延迟转写（用 RTMS）、Zoom REST 录制清单或纯 HMAC 接收器加固。触发词：Zoom Scribe、转写音视频、批量转写、快速模式、Build 平台 JWT、转写 Webhook
domain: 平台/integration
triggers: [Zoom Scribe / AI Services Scribe, 转写音频/视频文件 / transcribe audio video, 批量转写 batch transcription, 快速模式 fast mode transcription, Build 平台 JWT / HS256, scribe 转写作业 jobs, 转写 Webhook 状态回调, 浏览器麦克风伪流式转写]
tags: [平台集成, Zoom, 语音转写, ASR, 批量作业, Webhook, JWT鉴权, 音视频处理]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Zoom AI Services Scribe API, Build 平台凭据 + HS256 JWT, POST /aiservices/scribe/transcribe, /aiservices/scribe/jobs, Webhook 接收器, Node.js]
requires: []
related: [zoom-rtms-realtime-media, zoom-meeting-bot-builder, audio-to-markdown-transcriber, youtube-transcript-ingest]
combines_with: [zoom-oauth-setup, zoom-webhooks-setup]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## 何时使用

当用户需要把**已上传或已存档的音视频文件转写成文本**时，用 Zoom AI Services Scribe。典型场景：

- 用户上传一段录音/录像后做按需转写。
- 批量转写存档（如 S3 上的通话录音库、大批量文件）。
- Webhook 驱动的 ETL：转写结果写入数据库 / 搜索索引。
- 把 Zoom 托管录制导出到自有存储后重新转写。
- 离线合规 / QA 工作流，需要时间戳、声道分离、说话人提示。

**不该用的边界：**

- 需要**实时直播媒体**、低延迟连续转写、服务端推流 → 改用 Zoom RTMS，不是本技能。Scribe 没有公开的实时流式 API。
- 只需要 **Zoom REST API 的 AI Services 路径清单** → 链 Zoom REST API 类技能。
- 只需要 **Webhook 签名校验 / 通用 HMAC 接收器加固**（与转写无关）→ 链 Webhook / 签名校验类技能。
- 非 Zoom 渠道的转写（YouTube 字幕、本地 whisper 等）→ 另寻对应技能。

## 步骤

核心流程：

1. **拿 Build 平台凭据，生成 HS256 JWT**。凭据走环境变量，绝不硬编码、绝不进客户端 JS。
2. **选模式**：单个短文件 → 快速模式（fast）；存档 / 大批量 → 批量模式（batch）。
3. **提交转写请求**。
4. **批量作业**：轮询作业 / 文件状态，或接收 Webhook 通知。
5. **落地与后处理** transcript JSON。

**模式选择判据：**

- 快速模式正式上限 `100 MB` / `2 小时`，同步返回。但即便文件在限额内，**托管浏览器流仍可能在上游返回前超时**。对较大或不可预测的媒体，即使未超限也优先批量模式。
- 托管 UI 下，快速模式建议包一层**异步请求 + 轮询**，不要让浏览器一直挂着等上游完整响应。

## 指令

**端点速查：**

| 模式 | 方法 | 路径 | 用途 |
|------|------|------|------|
| Fast | `POST` | `/aiservices/scribe/transcribe` | 单文件同步转写 |
| Batch | `POST` | `/aiservices/scribe/jobs` | 提交异步批量作业 |
| Batch | `GET` | `/aiservices/scribe/jobs` | 列出作业 |
| Batch | `GET` | `/aiservices/scribe/jobs/{jobId}` | 查作业摘要/状态 |
| Batch | `DELETE` | `/aiservices/scribe/jobs/{jobId}` | 取消排队/处理中作业 |
| Batch | `GET` | `/aiservices/scribe/jobs/{jobId}/files` | 查每个文件的结果 |

**托管快速模式的超时护栏（重要）：** 观测到约 17–59 MB 的 MP4 后端通常 26–37s 完成，但部分 ~59 MB 的浏览器请求前端报 `504` 而后端日志随后是 `200`。**把「前端 504 + 后端 200」当作浏览器/边缘超时竞态，而非转写失败**——别据此自动判失败或重复提交。

## 示例

**浏览器麦克风伪流式（fallback 演示，非生产首选）：** Scribe 无实时流 API，若要做「边说边出字」体验，用伪流式：

1. 麦克风按短分片采集（起步 `5 秒`，可接受 `5–10 秒`）。
2. 每片走异步快速模式包装器上传（在途请求 `2–3` 个）。
3. 轮询完成。
4. 按顺序拼接各片转写文本。

这只是增量更新的 UI 折中，**不能替代 RTMS**：它带来重复上传开销、分片边界漂移、浏览器编解码/容器差异、转写拼接复杂度。若用户真要实时直播摄取、低延迟连续媒体或服务端推流 → 路由到 RTMS。

**批量 Webhook 流水线骨架：** 提交 `POST /jobs` → 订阅作业/文件状态 Webhook → 收到完成事件后拉 `GET /jobs/{jobId}/files` → 把 transcript JSON（含时间戳/声道/说话人提示）写入库或搜索索引。

## 注意事项

- **凭据安全（CRITICAL）**：Build 平台凭据 + JWT 一旦泄露即被冒用，务必环境变量注入、服务端生成 JWT、不进前端与日志。
- **超时竞态**：托管快速模式遇 504 先核对后端是否 200，避免重复扣费/重复转写；不可预测的媒体直接走批量。
- **版本漂移**：端点与字段以官方文档为准，集成前用最新 `endpoints.json` 校验，自身环境实测分页/字段名。
- 官方文档：`developers.zoom.us/docs/ai-services/scribe/`；快速上手样例 `github.com/zoom/scribe-quickstart`。

## 互见

- related：`youtube-transcript-ingest` —— 另一类「媒体转文本」管线（YouTube 字幕摄取），可对照取舍。
- combines_with：`whatsapp-cloud-api`、`twilio-communications` —— 把转写完成/作业状态通过消息渠道通知用户。
- 实时直播媒体低延迟转写 → Zoom RTMS 类技能（本技能不覆盖）。
- Zoom REST 录制清单 / AI Services 路径 → Zoom REST API 类技能。
- Webhook 签名校验 / HMAC 接收器加固 → Webhook 安全类技能。

---

采编自 anthropics/knowledge-work-plugins（Apache-2.0）。本条目为适配重写而非逐字翻译，端点、限额与超时数据请按 Zoom 官方文档与自身环境验证。
