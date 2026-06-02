---
name: chrome-extension-mv3
title: Chrome MV3 扩展开发
description: 当从零构建或从 MV2 迁移 Chrome 扩展、需实现 Service Worker / 内容脚本 / 弹窗与跨上下文消息通信时使用；产出符合 Manifest V3 的扩展骨架、消息通信代码与最小权限配置；不适用于 Safari App Extension、不走 WebExtensions API 的 Firefox 开发或与扩展 API 无关的普通 Web 开发；触发词：Chrome 扩展、Manifest V3、Service Worker
domain: 研发/frontend
triggers: [写一个 Chrome 扩展, Manifest V3 怎么配, 扩展从 MV2 迁移到 MV3, Service Worker 后台脚本, content script 和后台通信, chrome.runtime.sendMessage, 扩展弹窗 popup 开发, side panel 侧边栏, declarativeNetRequest 拦截请求, 扩展 service worker 失活]
tags: [chrome-extension, manifest-v3, service-worker, content-script, message-passing, 前端, 浏览器扩展]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Edit, Bash]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 从零设计、构建新的 Chrome 扩展。
- 将扩展从 Manifest V2 迁移到 Manifest V3。
- 实现 Service Worker（后台）、内容脚本（content script）、弹窗（popup）/选项页（options）。
- 调试跨上下文通信（消息传递 message passing）。
- 使用扩展专属 API：storage、permissions、alarms、side panel、declarativeNetRequest 等。

不该用（负边界）：
- 任务针对 Safari App Extensions（另用 Safari 扩展相关技能）。
- 面向 Firefox 且不走 WebExtensions API 的开发。
- 与扩展 API 无交互的普通 Web 开发。

## 步骤

1. 确定上下文边界：先分清三类执行环境——Service Worker（后台、无 DOM）、内容脚本（可访问页面 DOM）、UI 上下文（popup / options / side panel）。三者内存隔离，只能靠消息通信。
2. 写 `manifest.json`：固定 `"manifest_version": 3`，用 `background.service_worker` 而非 background page，声明 `action`、`content_scripts`、`permissions`。
3. 实现消息通信：内容脚本与后台之间用 `chrome.runtime.sendMessage` / `chrome.tabs.sendMessage`，异步响应时监听器内 `return true` 保持通道开启。
4. 收敛权限：遵循最小权限原则，能放进 `optional_permissions` 的就不要放进 `permissions`。
5. 持久化数据：用 `chrome.storage.local` / `chrome.storage.sync`，不要用 `localStorage`。
6. 网络拦截/改写：用声明式的 `declarativeNetRequest`，不要用已被 MV3 废弃的阻塞式 `webRequest`。
7. 加载调试：Chrome 打开 `chrome://extensions`，开启「开发者模式」，「加载已解压的扩展程序」指向项目目录；改完后回该页点刷新。

## 指令

- **仅用 Manifest V3**：始终优先 Service Worker，不用 Background Page。
- **上下文分离**：明确区分后台 / 内容脚本 / UI 各自能力与限制。
- **消息传递**：统一用 `chrome.runtime.sendMessage` 和 `chrome.tabs.sendMessage`，处理好响应回调。
- **最小权限**：尽量用 `optional_permissions`。
- **存储**：用 `chrome.storage`，不用 `localStorage`。
- **声明式 API**：网络过滤/修改用 `declarativeNetRequest`。
- 初始化逻辑放在 `chrome.runtime.onInstalled` 中。
- 内容脚本中处理外部输入前先校验。
- 禁用 `innerHTML` 与 `eval()`，改用 `textContent` 和安全的 DOM API。
- 不要在 Service Worker 中阻塞主线程，须保持其可响应。

## 示例

示例 1：最小可用的 Manifest V3 骨架

```json
{
  "manifest_version": 3,
  "name": "My Extension",
  "version": "1.0.0",
  "action": {
    "default_popup": "popup.html"
  },
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["https://*.example.com/*"],
      "js": ["content.js"]
    }
  ],
  "permissions": ["storage", "activeTab"]
}
```

示例 2：后台 Service Worker 接收消息并异步回复

```javascript
// background.js (Service Worker)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GREET_AGENT") {
    console.log("收到内容脚本消息:", message.data);
    sendResponse({ status: "ACK", reply: "Hello from Background" });
  }
  return true; // 保持消息通道开启以支持异步响应
});
```

## 注意事项

- **Service Worker 会失活**：后台 Service Worker 是临时的（ephemeral），随时可能被回收。定时任务请用 `chrome.alarms`，不要用 `setTimeout` / `setInterval`（可能被杀掉）。
- 安全：杜绝 `innerHTML` / `eval()`，外部输入先校验后使用。
- 性能：Service Worker 内避免长时间同步阻塞，保证其响应能力。
- 本技能输出不能替代针对具体环境的验证、测试与专家评审；若所需输入、权限、安全边界或验收标准缺失，应停下来澄清后再继续。

## 互见

- Safari App Extension 开发（不在本技能范围）。
- 扩展上架 / Chrome Web Store 发布流程。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
