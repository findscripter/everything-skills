---
name: zoom-contact-center-app
title: Zoom Contact Center 应用开发
description: 当为 Zoom Contact Center 开发坐席侧应用、网页嵌入（聊天/视频/活动）或 Android/iOS 原生 SDK 集成，且需处理互动上下文、状态切换、活动与预约回呼、跨版本漂移时使用；做一套覆盖初始化→构建渠道项→注册监听→启动→状态管理→释放的生命周期实现与排障方案；不适用于 Contact Center 的呼叫控制/队列 REST API（改用 REST 类）或非 Zoom 的客服平台。触发词：Zoom Contact Center、ZCC、engagement context、engagement status、campaign SDK、scheduled callback、getEngagementContext、onEngagementStatusChange
domain: 平台/integration
triggers: [Zoom Contact Center, ZCC, contact center sdk, engagement context / 互动上下文, engagement status / 互动状态, campaign SDK / 活动, scheduled callback / 预约回呼, getEngagementContext, onEngagementStatusChange, Zoom Apps SDK 侧边栏应用, web channel embed / 网页嵌入, Smart Embed CRM softphone]
tags: [平台集成, zoom, contact center, 客服中心, web sdk, 移动sdk, android, ios, engagement, softphone]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Zoom Contact Center Web SDK, Zoom Apps SDK (zoomSdk), Contact Center Android SDK, Contact Center iOS SDK, postMessage (Smart Embed), Zoom Contact Center REST API]
requires: []
related: [zoom-virtual-agent-builder, zoom-meeting-app-builder, zoom-product-surface-selector, zoom-phone-integration]
combines_with: [zoom-product-surface-selector, zoom-oauth-setup, zoom-virtual-agent-builder]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
# Zoom Contact Center 应用开发

为 Zoom Contact Center（ZCC）构建集成的统一参考，覆盖三种落地面：客户端内坐席应用、网页嵌入、原生移动 SDK。

官方文档：
- https://developers.zoom.us/docs/contact-center/
- Web SDK 参考：https://developers.zoom.us/docs/contact-center/web/sdk-reference/
- Android：https://marketplacefront.zoom.us/sdk/contact/android/index.html
- iOS：https://marketplacefront.zoom.us/sdk/contact/ios/index.html

## 何时使用

当你要在 Zoom Contact Center 上做集成开发时使用，先按落地面分流：

- **客户端内坐席应用**（在 Zoom 客户端的 Contact Center 侧边栏跑 App）→ 走 Zoom Apps SDK 路径，本技能 + Zoom Apps SDK / 鉴权类技能。典型：按 `engagementId` 存坐席笔记、CRM softphone（Smart Embed，用 postMessage 事件契约）。
- **网页嵌入**（在网站里嵌聊天/视频/活动小部件）→ 用 Web Channel SDK，从网页标签启动 chat/video/campaign。
- **原生移动**（集成 Android/iOS SDK 二进制）→ 用对应平台 SDK，典型：客户侧聊天/视频/预约回呼 App、掉线视频互动的重连。
- **需要呼叫控制 / 队列等服务端能力** → 链到 Contact Center REST API 类技能（本技能只管 SDK 端）。

**不该用的边界：**

- 只需 REST 侧的呼叫控制、队列、坐席状态管理 → 用 REST API 类技能，本技能不覆盖服务端编排。
- 非 Zoom 的客服 / 联络中心平台（Genesys、Twilio Flex 等）—— 命令与对象模型不通用。
- 普通 Zoom 会议 / Zoom Meeting SDK 集成（与 Contact Center 是不同产品线）。
- 网页通用浏览器自动化抓取（用浏览器自动化类技能）。

## 步骤

三端共用的**互动生命周期**（记住这条主线，端差异只在具体 API 名）：

1. **尽早初始化平台上下文**。客户端内用 `zoomSdk.config(...)` 拿到运行上下文；移动端先 `init`；网页端加载 Web SDK。
2. **构建渠道项（channel item）**：聊天/视频/ZVA 用 `entryId`；**预约回呼与活动（campaign）流用 `apiKey`**。别混用。
3. **获取服务/客户端实例**（service / client instance）。
4. **在用户交互前注册监听/委托**（listeners / delegates）——尤其是 `onEngagementStatusChange`，晚注册会漏掉早期状态事件。
5. **启动流程**：移动端 `fetchUI`（聊天）或 `startVideo`（视频）；网页端走 Web SDK 的 open/show 路径。
6. **处理互动状态变化与上下文切换**：状态机覆盖 `start` / `hold` / `resume` / `end`；坐席在多个互动间切换时，用 `getEngagementContext` 重新定位当前 `engagementId`，把笔记/草稿按 `engagementId` 隔离存储，保证切换后能还原。
7. **结束并释放资源**：`endChat` / `endVideo` → `logout` / `logoff` → uninitialize / release。漏释放会导致重连失败与句柄泄漏。

## 指令

分流硬规则（先判落地面，再选 API）：

```
在 Zoom 客户端内的 Contact Center App  → Zoom Apps SDK 路径（in-client 身份）
网站嵌 chat/video/campaign 小部件       → Web Channel SDK
集成 Android / iOS 原生 SDK             → 对应平台 SDK
需要呼叫控制 / 队列 / 坐席状态 REST     → Contact Center REST API（链式调用）
```

渠道项与标识符对照：

```
chat / video / ZVA  → 用 entryId
scheduled callback  → 用 apiKey
campaign            → 用 apiKey（活动驱动的渠道选择：chat / ZVA / video / scheduled callback）
```

互动状态机（监听 `onEngagementStatusChange`，按 `engagementId` 维度处理）：

```
start ──► (active) ──hold──► held ──resume──► (active) ──end──► ended
                     ▲                          │
                     └────── 坐席上下文切换 ─────┘   切换时用 getEngagementContext 重定位
```

## 示例

**坐席侧边栏应用：按 engagementId 隔离笔记并跨上下文切换存活（伪代码，Zoom Apps SDK 路径）：**

```js
const notes = new Map(); // engagementId -> 笔记草稿

// 交互前注册监听
sdk.onEngagementStatusChange((e) => {
  if (e.status === "start" || e.status === "resume") {
    loadNotesFor(e.engagementId);          // 还原该互动的笔记
  } else if (e.status === "hold" || e.status === "end") {
    persistNotes(notes.get(e.engagementId)); // 落库，防切换丢失
  }
});

// 坐席切到另一通互动时，主动重定位当前上下文
async function onPanelFocus() {
  const ctx = await sdk.getEngagementContext();
  loadNotesFor(ctx.engagementId);
}
```

**高频场景清单（按需展开为具体端实现）：**

- 坐席侧边栏应用，按 `engagementId` 存笔记并在上下文切换中存活。
- 浏览器聊天/视频活动，由网页标签启动。
- 原生移动客户 App：聊天 / 视频 / 预约回呼。
- 活动驱动的渠道选择（chat / ZVA / video / scheduled callback）。
- 移动端掉线视频互动的重连流程。
- Smart Embed CRM softphone，用 postMessage 事件契约对接 CRM。

## 注意事项

- **监听器注册时机（CRITICAL）**：必须在任何用户交互/启动流程之前注册 `onEngagementStatusChange` 等监听，否则会漏掉 `start` 等早期事件，导致状态机错位。
- **标识符别混用**：聊天/视频/ZVA 用 `entryId`，预约回呼与活动用 `apiKey`，传错类型通常表现为「拿不到服务实例」或静默失败。
- **资源释放**：每次互动结束都要 `end → logout/logoff → uninitialize/release` 完整走完；漏释放是移动端重连失败、句柄/内存泄漏的主因。
- **版本漂移（HIGH）**：ZCC SDK 跨版本会有方法签名/事件名变更（version drift）。升级 SDK 后先核对官方版本兼容性说明与变更日志，再校验示例代码与环境变量是否仍有效；排查「方法不存在/回调不触发」时优先怀疑版本不匹配。
- **环境变量**：`.env` 键名按官方规范配置（各值来源见官方环境变量文档），凭据走环境变量、勿硬编码进前端。
- **跨技能边界**：呼叫控制/队列等服务端能力不在 SDK 内，需链到 Contact Center REST API；坐席应用的客户端身份与鉴权交给 Zoom Apps SDK / OAuth 类能力。

## 互见

- 呼叫控制 / 队列 / 坐席状态等服务端能力 → Contact Center REST API 类技能（本技能只覆盖 SDK 端，二者链式配合）。
- 客户端内应用的身份与鉴权 → Zoom Apps SDK / OAuth 类能力（in-client 身份）。
- 网页语音/聊天渠道叠加协同浏览 → Cobrowse SDK 类能力。
- related：`whatsapp-cloud-api`、`slack-bolt-bot-builder` —— 同属客服/消息渠道集成，可横向参照事件回调与会话模型。
- combines_with：`rest-api-endpoint-builder` —— 搭建对接 ZCC 回调/CRM 的后端端点；`auth-implementation-patterns` —— 落地 OAuth/凭据管理；`browser-automation-builder` —— 端到端验证网页嵌入小部件。

---

采编自 anthropics/knowledge-work-plugins（Apache-2.0）。本条目为适配重写而非逐字翻译，具体 SDK 方法名、`entryId/apiKey` 用法与环境变量请以对应平台官方文档及实际 SDK 版本为准。
