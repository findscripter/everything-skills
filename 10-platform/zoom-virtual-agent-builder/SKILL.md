---
name: zoom-virtual-agent-builder
title: Zoom 虚拟客服坐席集成
description: 当把 Zoom Virtual Agent（虚拟客服坐席）嵌入网站、Android WebView 或 iOS WKWebView，做活动/入口聊天嵌入、原生桥接、转人工与知识库同步时使用；做一套含「就绪门控（zoomCampaignSdk:ready / waitForReady）、Campaign 优先嵌入、native 桥接 exitHandler/commonHandler/support_handoff、外链策略、KB 自定义 API 同步」的可落地集成；不适用于 Contact Center 客户端面板、纯后端 OAuth/REST 自动化或非 Zoom 客服平台；触发词：zoom virtual agent、zva、虚拟客服、zoomCampaignSdk、zcc-sdk、campaign embed、entry id、support_handoff、知识库同步、webview 客服。
domain: 平台/integration
triggers: [zoom virtual agent, zva, 虚拟客服坐席, zoomCampaignSdk, zcc-sdk, campaign embed, entry id, waitForReady, support_handoff, knowledge base sync, 知识库同步, webview 客服嵌入]
tags: [zoom, virtual-agent, zva, chatbot, webview, android, ios, knowledge-base, campaign-sdk, integration]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [zcc-sdk.js (Campaign SDK), JavaScript, Android WebView (Kotlin), iOS WKWebView (Swift), Zoom S2S OAuth, Zoom KB REST API]
requires: []
related: [zoom-contact-center-app, zoom-phone-integration, zoom-meeting-app-builder, zoom-product-surface-selector]
combines_with: [zoom-integration-planner, ai-customer-support]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## 何时使用

适用：
- 把 Zoom Virtual Agent（虚拟客服坐席）的对话机器人嵌入网站，用 Campaign 或 Entry ID 启动聊天，并传入客户上下文。
- 在 Android WebView / iOS WKWebView 中包一层原生壳，需要原生关闭、转人工（support_handoff）、外链跳转等桥接。
- 用自定义 API 把外部系统的知识库同步进 ZVA（KB sync）。
- 处理对话生命周期（就绪、engagement 开始/结束）与 UI 状态。

不该用：
- 要在 Zoom 客户端内做 Contact Center 应用面板 —— 转 contact-center 相关技能。
- 纯后端知识库 CRUD / 自动化脚本，不涉及前端嵌入 —— 用 OAuth + REST API 技能。
- 非 Zoom 的客服/机器人平台 —— 本条命令、事件名、桥接约定均不通用。

## 步骤 / 指令

标准生命周期（Web 与移动端通用）：
1. 在 Virtual Agent 管理后台配置并发布 Campaign 或 Entry，拿到 ID。
2. 在页面/WebView 注入 SDK 脚本，提供运行时配置（`apikey`、`env`、用户上下文）。
3. **就绪门控**：等 `zoomCampaignSdk:ready` 事件或 `waitForReady()` 完成后，再注册事件、调任何 API。切勿在初始化前调 `show/hide/open/close`。
4. 注册事件监听：`open`、`close`、`show`、`hide`、`engagement_started`、`engagement_ended`。
5. 移动端在就绪时注入 `window.zoomCampaignSdk.native`，挂 `exitHandler`、`commonHandler`、`support_handoff` 回调。
6. 结束会话调 `endChat()`，并在页面/视图销毁时移除监听。

嵌入选型：优先 Campaign 嵌入（用户摩擦最小）；仅当需要 Campaign 配置无法覆盖的预聊天数据采集时，才用 Entry ID。

外链策略（统一约定）：用 DOM 锚点 `target="_blank"` 或 `window.open()`；移动端在 WebView 代理里拦截决定「应用内 vs 系统浏览器」。**已废弃** `openURL` 命令路径，跨版本行为不稳定，勿用。

知识库同步：用 Server-to-Server OAuth 拿短时 token，调 KB REST API，针对 `ZVA_KB_ID` 做自定义 API 写入。

## 示例

Web · Campaign 优先（推荐）：
```html
<script data-apikey="YOUR_API_KEY" src="https://us01ccistatic.zoom.us/us01cci/web-sdk/zcc-sdk.js"></script>
<script>
window.addEventListener('zoomCampaignSdk:ready', () => {
  window.zoomCampaignSdk.show();
  window.zoomCampaignSdk.on('engagement_started', () => console.log('engagement started'));
});
</script>
```

Web · 运行时刷新用户上下文：
```javascript
window.zoomCampaignSdkConfig = { env: 'us01', apikey: 'YOUR_API_KEY', firstName: 'Ada', email: 'ada@example.com' };
window.addEventListener('zoomCampaignSdk:ready', async () => {
  if (window.zoomCampaignSdk.waitForReady) await window.zoomCampaignSdk.waitForReady();
  window.zoomCampaignSdk.updateUserContext();
});
```
方法面：`close()`、`endChat()`、`hide()`、`show()`、`ChangeCampaign(id, channel?)`、`updateUserContext()`、`waitForInit()`、`waitForReady()`。

Android · 注入原生桥接（Kotlin）：
```kotlin
val js = """
    javascript: window.addEventListener('zoomCampaignSdk:ready', () => {
        if (window.zoomCampaignSdk) {
            window.zoomCampaignSdk.native = {
                exitHandler:   { handle: function()  { AndroidExit.handleExit(); } },
                commonHandler: { handle: function(e) { AndroidCommon.handleCommon(JSON.stringify(e)); } }
            };
        }
    });
""".trimIndent()
webView.loadUrl(js)
// 转人工：监听 support_handoff -> AndroidHandoff.handleHandoff(JSON.stringify(e.detail))
// 外链：shouldOverrideUrlLoading 决定应用内/系统浏览器；多窗口回调处理 target="_blank"
```

iOS · 注入桥接（Swift）：
```swift
let script = """
window.addEventListener('zoomCampaignSdk:ready', () => {
  if (window.zoomCampaignSdk) {
    window.zoomCampaignSdk.native = {
      exitHandler:   { handle: function()  { window.webkit.messageHandlers.zoomLiveSDKMessageHandler.postMessage('close_web_vc'); } },
      commonHandler: { handle: function(e) { window.webkit.messageHandlers.commonMessageHandler.postMessage(JSON.stringify(e)); } }
    };
  }
});
"""
// 转人工：support_handoff -> messageHandlers.support_handoff.postMessage(JSON.stringify(e.detail))
// 外链：WKNavigationActionPolicyAllow 走应用内；UIApplication.openURL 走系统浏览器；可选 SFSafariViewController
```

环境变量（要点）：`ZVA_API_KEY`、`ZVA_ENV`（`us01`/`eu01`）、`ZVA_CAMPAIGN_ID`、`ZVA_ENTRY_ID`；KB 自动化：`ZOOM_ACCOUNT_ID`、`ZOOM_CLIENT_ID`、`ZOOM_CLIENT_SECRET`、`ZOOM_ACCESS_TOKEN`、`ZVA_KB_ID`。

## 注意事项

- **就绪门控是头号坑**：`window.zoomCampaignSdk` 未定义多半是没等 `ready`；逻辑只在 `zoomCampaignSdk:ready` 后注册，能用 `waitForReady()` 就用。
- **命名漂移**：官方文档现用 "Virtual Agent"，但示例仓库仍残留旧称 `virtual-assistant`、`liveSDK`、`ZMLiveSDKWebviewController`，搜索/映射代码时按当前文档语义走、把旧符号当别名映射。
- **CSP / 脚本宿主**：先确认 CSP 放行 Zoom SDK 脚本、websocket、media、wasm，且无代理拦掉 `zcc-sdk.js`；WebView 需开启 JavaScript。先排查这些再调业务逻辑。
- **脚本标签 `defer` 可能打乱执行顺序**（某些三方链路），按页面生命周期改用 `async` 或去掉 `defer`。
- **Campaign 配了却不显示**：确认 Campaign 投放范围在移动 WebView 下包含移动端；校验 style/config API 网络响应。
- **登录/子域失败**：核对 Virtual Agent 偏好设置里的子域名白名单与环境。
- 把桥接的命令/事件常量集中定义，隔离重命名风险；仅在确需向后兼容处保留旧 key 回退。
- `ZOOM_ACCESS_TOKEN` 为短时令牌，勿硬编码；凭据来源：Zoom Marketplace（OAuth 应用）、AI Management（Campaign/Entry、KB ID）。

## 互见

- related：`twilio-communications`、`whatsapp-cloud-api`、`slack-bolt-bot-builder` —— 同属对话/客服渠道集成
- combines_with：OAuth 应用搭建与 REST 自动化技能 —— 用于知识库 CRUD / 后端编排；Contact Center 相关技能 —— 用于 Zoom 客户端内面板

---
采编自 anthropics/knowledge-work-plugins（Apache-2.0）。
