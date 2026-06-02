---
name: browser-extension-builder
title: 跨浏览器扩展构建与发布
description: 当需要从零构建 Chrome/Firefox/跨浏览器扩展时使用；做 Manifest V3 架构搭建（弹窗/内容脚本/Service Worker/存储/变现）并产出可发布到 Chrome Web Store 的扩展工程；不适用于普通网页前端、油猴脚本或浏览器自动化测试；触发词：浏览器扩展、chrome extension、manifest v3
domain: 研发/frontend
triggers: [浏览器扩展, chrome extension, firefox addon, manifest v3, content script, 内容脚本, service worker, 扩展发布, Chrome Web Store]
tags: [browser-extension, chrome, manifest-v3, content-script, service-worker, frontend, publishing, misc]
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

需要构建用户每天真正会用的浏览器扩展时使用，覆盖 Chrome、Firefox 及跨浏览器场景。典型任务：搭建 MV3 工程骨架、写内容脚本改造页面、用 Service Worker 做后台逻辑、用 chrome.storage 持久化、设计变现与上架 Chrome Web Store。

核心约束意识：扩展不是普通网页，要时刻考虑权限最小化、安全性、商店审核政策。区分「玩具」和「工具」——能被安装并日常使用的才是工具。

不该用的边界：
- 普通网页 / Web 应用前端开发，不涉及浏览器 API 与 manifest —— 用通用前端技能。
- 单纯的油猴（Tampermonkey）用户脚本，无需打包成扩展。
- 浏览器自动化 / E2E 测试（Playwright、Puppeteer）—— 那是测试工具，不是扩展。
- 已知输入、权限边界、成功标准缺失时，先停下来澄清再动手。

## 步骤

1. 定义功能：明确扩展解决什么真实问题、需要哪些浏览器能力，反推所需权限。
2. 搭工程骨架：按下方目录结构创建文件，先写 manifest.json。
3. 写 manifest V3：声明 action（弹窗）、content_scripts、background.service_worker、options_page，权限按需最小化。
4. 实现内容脚本：在匹配页面上读取/改造 DOM，监听来自弹窗/后台的消息。
5. 实现后台 Service Worker：承担跨组件协调，作为弹窗 ↔ 内容脚本的中枢。
6. 接存储与状态：用 chrome.storage.local/sync 持久化设置，注意配额。
7. 规划变现（可选）：选收入模型，支付走自有后端 + 外部结账页，做功能门控（feature gating）。
8. 跑校验清单（见「注意事项」）后，打包上架 Chrome Web Store。

## 指令

通信拓扑（牢记这条主线）：

```
Popup ←→ Background (Service Worker) ←→ Content Script
              ↓
        chrome.storage
```

推荐目录结构：

```
extension/
├── manifest.json          # 扩展配置
├── popup/                 # popup.html / .css / .js  弹窗 UI
├── content/content.js     # 运行在网页上的内容脚本
├── background/service-worker.js  # 后台逻辑
├── options/               # options.html / .js  设置页
└── icons/                 # icon16.png / icon48.png / icon128.png
```

委派触发（遇到这些方向时考虑配合其他技能）：
- react|vue|svelte 弹窗框架 → 前端技能。
- 变现|支付|订阅 → micro-saas / 商业模式技能。
- AI|LLM|GPT 能力 → AI 封装产品技能。

## 示例

Manifest V3 模板：

```json
{
  "manifest_version": 3,
  "name": "My Extension",
  "version": "1.0.0",
  "description": "What it does",
  "permissions": ["storage", "activeTab"],
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": { "16": "icons/icon16.png", "48": "icons/icon48.png", "128": "icons/icon128.png" }
  },
  "content_scripts": [{ "matches": ["<all_urls>"], "js": ["content/content.js"] }],
  "background": { "service_worker": "background/service-worker.js" },
  "options_page": "options/options.html"
}
```

内容脚本：改造页面 + 监听消息（return true 保持异步通道开启）：

```javascript
document.addEventListener('DOMContentLoaded', () => {
  const el = document.querySelector('.target');
  if (el) el.style.backgroundColor = 'yellow';
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getData') {
    sendResponse({ data: document.querySelector('.data')?.textContent });
  }
  return true; // 异步响应必须返回 true
});
```

存储 + async/await 封装（回调式 API 包成 Promise）：

```javascript
async function getStorage(keys) {
  return new Promise((resolve) => chrome.storage.local.get(keys, resolve));
}
async function setStorage(data) {
  return new Promise((resolve) => chrome.storage.local.set(data, resolve));
}
// sync 存储可跨设备同步：chrome.storage.sync.set({ setting: true })
// 监听变化：chrome.storage.onChanged.addListener((changes, area) => { ... })
```

变现：功能门控 + 支付走自有后端（扩展不能直接对接 Stripe）：

```javascript
// 1. 弹窗里点 Upgrade → 打开你的网站带上 userId
chrome.tabs.create({ url: `https://your-site.com/upgrade?user=${userId}` });

// 2. 支付后同步状态
async function checkPremium() {
  const { userId } = await getStorage(['userId']);
  const { isPremium } = await (await fetch(`https://your-api.com/premium/${userId}`)).json();
  await setStorage({ isPremium });
  return isPremium;
}

// 3. 功能门控
async function usePremiumFeature() {
  const { isPremium } = await getStorage(['isPremium']);
  if (!isPremium) return showUpgradeModal();
  // 执行付费功能
}
```

## 注意事项

存储配额：local 上限 5MB；sync 总量 100KB、单项 8KB。

上架前校验清单（含严重级别与修复动作）：
- [HIGH] 仍用 Manifest V2 —— Chrome 新扩展强制要求 V3，迁移到 Service Worker。
- [HIGH] 权限过宽，易被商店拒审 —— 改用具体的 host_permissions 与 optional_permissions。
- [MEDIUM] 无错误处理 —— 每次 chrome API 调用后检查 chrome.runtime.lastError。
- [MEDIUM] 硬编码 URL —— 改用 chrome.storage 或 manifest 做配置。
- [LOW] 缺图标 —— 补齐 16/48/128 三种尺寸，影响商店展示。

商店支付：Chrome 已停用内置支付，必须自建支付系统并跳转外部结账页。

收入模型参考：Freemium（免费基础+付费功能）、一次性买断、订阅、捐赠（Tip jar）、联盟推广。

通用红线：本技能输出不能替代环境特定的验证、测试或专家评审；缺少必要输入/权限/安全边界/成功标准时先澄清。

## 互见

- 前端框架技能（React/Vue/Svelte 弹窗 UI）
- micro-saas / 商业模式技能（扩展变现与订阅）
- 个人工具构建技能（仅自用的轻量扩展）
- AI 封装产品技能（AI 驱动的浏览器助手）

---
采编自 sickn33/antigravity-awesome-skills（MIT），源条目原始出处 vibeship-spawner-skills。
