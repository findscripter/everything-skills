---
name: zoom-meeting-app-builder
title: Zoom 会议嵌入应用开发（Meeting SDK）
description: 当要在 Web/移动/桌面应用内嵌入或加入真实 Zoom 会议时使用；做 Meeting SDK 选型、签名鉴权与 join 生命周期落地，产出可运行的入会代码与服务端签名接口；不适用于自建视频会话（用 Video SDK）或仅生成 REST join_url 链接。触发词：嵌入 Zoom 会议、Meeting SDK、程序化入会、SDK 签名、Component/Client View、入会失败
domain: 平台/integration
triggers: [嵌入 Zoom 会议, 在网页/App 里加入会议, Meeting SDK, 程序化入会, SDK 签名生成, Component View / Client View, 入会失败/4003, 等候室 hide meeting info, Meeting SDK 还是 Video SDK]
tags: [zoom, meeting-sdk, video, integration, web, mobile, jwt, rtc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Web Meeting SDK (ZoomMtg / ZoomMtgEmbedded), Node.js (jsrsasign), iOS/Android/macOS/Electron Native SDK, Zoom Marketplace (SDK Key/Secret)]
requires: []
related: [zoom-meeting-bot-builder, zoom-product-surface-selector, zoom-oauth-setup, zoom-rtms-realtime-media]
combines_with: [zoom-integration-planner, zoom-webhooks-setup]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## 何时使用

- **该用**：要把**真实的 Zoom 会议**嵌入或加入到自己的应用 UI 中——Web 内嵌、移动端/桌面原生集成、会议生命周期（入会/挂断/事件）落地、需要在 Meeting SDK 与 Video SDK 之间做选型时。
- **不该用（负边界）**：
  - 要**自建**视频会话、完全自定义 UI、非 Zoom 的纯音视频 → 用 **Video SDK**，不是 Meeting SDK。
  - 只想生成一个浏览器可点的 `join_url` 链接、或做会议资源的增删查（创建/查询/报表）→ 走 **REST API**，那不是 Meeting SDK 入会路径。
  - 仅需 Webhook/RTMS 事件或机器人录制 → 见互见的 build-zoom-bot。

> 硬路由守则：用户说"在 App UI 里嵌入/加入会议"，就走 Meeting SDK。不要擅自切到 REST `join_url` 链接流，除非用户明确要会议资源管理或浏览器跳转链接。**Meeting SDK 入会必须用 SDK 签名 + SDK join 调用；REST `join_url` 不是 Meeting SDK 的入会载荷。**

## 步骤

1. **确认意图**：要的是 Zoom 会议（Meeting SDK），还是自定义视频会话（Video SDK）？先分流。
2. **定平台与视图**：Web（Component View 可嵌入 div / Client View 全屏）、iOS/Android/macOS/Electron/Linux 原生。Web 还要选 CDN 还是 npm（见下方 API 差异）。
3. **备凭据**：在 Zoom Marketplace 创建 Meeting SDK 应用，拿 **SDK Key/Secret**，放服务端环境变量。
4. **服务端签发签名**：用 SDK Secret 生成 JWT 签名（绝不下发到前端）。
5. **前端 init + join**：按所选视图初始化并入会，挂上连接/用户/错误事件。
6. **按需扩展**：仅当用例确需时，再叠加 REST API（创建会议/报表）或 Webhooks/RTMS。

## 指令

**约束（务必遵守）：**
- 签名**只在服务端生成**，SDK Secret 永不进浏览器/客户端代码。
- `meetingNumber`（payload 里的 `mn`）**只能是纯数字**。
- `role`：`0`=以观众身份加入，`1`=以主持人身份开始；签名 role 与实际动作必须一致，否则"签名无效/4003"。host start 流程通常还需 ZAK。
- `iat/exp/tokenExp` 取值合理并考虑服务器时钟偏移（本地能跑、生产挂掉常因 secret/时钟不同）。
- Web Client View 的密码字段是 `passWord`（大写 W）；Component View 是 `password`。拼错会表现为"像是鉴权失败"。

**CDN vs npm —— 不同的 API，别混：**

| 分发方式 | 全局对象 | 视图 | API 风格 |
|---|---|---|---|
| CDN（`zoom-meeting-{ver}.min.js`） | `ZoomMtg` | Client View（全屏） | 回调 |
| npm（`@zoom/meetingsdk`） | `ZoomMtgEmbedded` | Component View（可嵌入） | Promise |

## 示例

**1) 服务端签发签名（Node.js）：**

```javascript
const KJUR = require('jsrsasign');

app.post('/api/signature', (req, res) => {
  const { meetingNumber, role } = req.body;
  const iat = Math.floor(Date.now() / 1000) - 30;
  const exp = iat + 60 * 60 * 2;
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sdkKey: process.env.ZOOM_SDK_KEY,
    mn: String(meetingNumber).replace(/\D/g, ''), // 纯数字
    role: parseInt(role, 10),                      // 0=加入 1=主持
    iat, exp, tokenExp: exp,
  };
  const signature = KJUR.jws.JWS.sign(
    'HS256', JSON.stringify(header), JSON.stringify(payload),
    process.env.ZOOM_SDK_SECRET
  );
  res.json({ signature, sdkKey: process.env.ZOOM_SDK_KEY });
});
```

**2) Web Component View（npm，可嵌入 div）：**

```javascript
import ZoomMtgEmbedded from '@zoom/meetingsdk/embedded';

const client = ZoomMtgEmbedded.createClient();
await client.init({
  zoomAppRoot: document.getElementById('meetingSDKElement'),
  language: 'en-US',
});
await client.join({
  sdkKey: SDK_KEY,
  signature,              // 服务端取回
  meetingNumber: '123456789',
  password: 'password',   // Component View 用小写
  userName: 'John Doe',
});

// 事件
client.on('connection-change', ({ state }) => {
  if (state === 'Closed') handleMeetingEnd(); // Connected/Reconnecting/Closed
});
client.leaveMeeting();  // 参会者退出
client.endMeeting();    // 主持人结束（仅 host）
```

**3) Web Client View（CDN，全屏）：**

```javascript
ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();
ZoomMtg.init({
  leaveUrl: window.location.href,
  patchJsMedia: true,
  disableCORP: !window.crossOriginIsolated,
  success: () => ZoomMtg.join({
    sdkKey: SDK_KEY, signature,
    meetingNumber: 'MEETING_NUMBER',
    userName: 'User Name',
    passWord: '',          // 注意大写 W
    success: (r) => console.log('Joined'),
    error: (e) => console.error(e),
  }),
});
```

## 注意事项

- **后端是生产必需**：纯前端 demo 可跑，但上线必须有服务端签名接口。
- **CSS 冲突**：全局 `* { margin: 0 }` 会破坏 Zoom UI；样式要 scope 到自己的容器。
- **Client View 接管整页**：入会后给 `body` 加 `meeting-active` 类隐藏自家 UI；工具栏被裁切可对 `#zmmtg-root` 做 `transform: scale(0.95)` 并设 `z-index: 9999`（SPA 防止被应用外壳遮挡）。
- **常见入会失败根因**：签名密钥错、`mn` 非纯数字、`exp/tokenExp` 过期、role 与动作不匹配、生产时钟偏移。host "start" 流程的 4003 多为缺主持人要件（常需 ZAK）。
- **别把 token 搞混**：REST OAuth token、Marketplace JWT app token 都**不是** Meeting SDK 签名，发现混用要停下澄清。
- **原生平台**：iOS/Android/macOS/Electron 用各自原生 SDK，提前确认平台特有约束（别拖到最后才发现）。

## 互见

- **官方文档**：https://developers.zoom.us/docs/meeting-sdk/ ；Web 示例 https://github.com/zoom/meetingsdk-web-sample ；签名接口示例 https://github.com/zoom/meetingsdk-auth-endpoint-sample
- **Video SDK**：需要自建视频会话/自定义 UI 时改用它（与本技能互斥）。
- **REST API**：会议创建、资源管理、报表。
- **Webhooks / RTMS / build-zoom-bot**：会议事件订阅、实时媒体流、机器人入会录制。

---

*采编自 [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) 的 `zoom-plugin/skills/build-zoom-meeting-app`（及 `meeting-sdk` 参考），Apache-2.0 许可。已按本仓库 SCHEMA 适配重写，非逐字翻译。*
