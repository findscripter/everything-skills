---
name: progressive-web-app
title: 渐进式 Web 应用 PWA
description: 当需要让 Web 应用可离线、可安装、像原生应用时使用；产出 manifest.json、Service Worker（含 install/activate/fetch 与缓存策略）、offline.html 与安装提示逻辑；不适用于纯静态站点、需要后台原生能力或仅做常规性能优化。触发词：PWA、Service Worker、离线、添加到主屏幕、Workbox、可安装
domain: 研发/frontend
triggers: [PWA, 渐进式Web应用, Service Worker, 离线可用, 添加到主屏幕, Web应用清单, manifest.json, Workbox, 缓存策略, 可安装, Web推送, 后台同步]
tags: [pwa, web-dev, service-worker, frontend, offline, caching]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [gemini, cursor, claude]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

满足以下任一场景时使用本技能：

- 要让 Web 应用在弱网或离线下仍可用。
- 移动优先项目，希望用户能「添加到主屏幕」安装应用。
- 用户询问缓存策略、Service Worker，或想提升 Web 应用性能与韧性。
- 提到 Workbox、Web 应用清单、后台同步、Web 推送通知。
- 即使没说「PWA」，问「我的网站能像 App 一样安装吗」「怎么让站点离线可用」也适用。

**不该用边界：**
- 纯静态展示页、无离线/安装诉求时，不必引入 SW 的复杂度。
- 需要真正的后台原生能力（如常驻后台、深度系统集成）时，PWA 能力有限，应评估原生/混合方案。
- 仅做常规性能优化（压缩、CDN、懒加载）而无离线需求时，不必上 Service Worker。
- 缺少 HTTPS 部署条件或必要图标资源、成功标准不明时，先停下确认再动手。

三大支柱：**HTTPS**（生产环境注册 SW 的前提，localhost 开发例外）、**Web 应用清单 manifest.json**（决定可安装性与主屏外观）、**Service Worker sw.js**（拦截请求、管理缓存、提供离线能力）。

## 步骤

**交付清单（最少必须包含）：**

- `index.html` — 链接清单、注册 Service Worker。
- `manifest.json` — 完整应用元数据与图标集。
- `sw.js` — 含 install / activate / fetch 处理器的 Service Worker。
- `app.js` — 应用主逻辑，含 SW 注册与安装提示处理。
- `offline.html` — 离线导航失败时的回退页（**必需**，缺失会导致安装失败）。

### 步骤 1：Web 应用清单 manifest.json

定义安装后的外观，须在 `<head>` 中用 `<link rel="manifest">` 链接。

```json
{
  "name": "My Awesome PWA",
  "short_name": "MyPWA",
  "description": "A fast, offline-capable Progressive Web App.",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#ffffff",
  "theme_color": "#0055ff",
  "icons": [
    { "src": "/assets/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/assets/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

关键字段：`display` 取 `standalone`（隐藏浏览器 UI）/ `minimal-ui` / `browser`；图标 `purpose: "maskable"` 启用 Android 自适应图标（内容保持在中心 80% 安全区）；`screenshots` 可选，但桌面端 Chrome 增强安装弹窗需要它。

### 步骤 2：HTML 外壳 index.html

除 `<link rel="manifest">` 与 `<meta name="theme-color">` 外，iOS Safari 不完全使用清单，需补充 apple 系列 meta：

```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#0055ff">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="MyPWA">
<link rel="apple-touch-icon" href="/assets/icons/icon-192x192.png">
```

页面可放一个默认隐藏的安装按钮 `<button id="install-btn" hidden>Install App</button>`，并在底部 `<script src="/app.js"></script>`。

### 步骤 3：注册 SW 与安装提示 app.js

```javascript
// Service Worker 注册
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('[App] SW registered, scope:', reg.scope);
    } catch (err) { console.error('[App] SW registration failed:', err); }
  });
}

// 安装提示（添加到主屏幕）
let deferredPrompt;
const installBtn = document.getElementById('install-btn');
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();            // 阻止移动端自动迷你信息栏
  deferredPrompt = e;
  if (installBtn) installBtn.hidden = false;
});
if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[App] Install outcome:', outcome);
    deferredPrompt = null;
    installBtn.hidden = true;
  });
}
window.addEventListener('appinstalled', () => console.log('[App] PWA installed'));
```

### 步骤 4：Service Worker sw.js

**缓存版本（关键：每次部署必须递增）**

```javascript
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const APP_SHELL = ['/', '/index.html', '/styles.css', '/app.js',
  '/assets/icons/icon-192x192.png', '/offline.html'];
```

**install — 预缓存 App Shell**，结尾 `self.skipWaiting()` 立即激活：

```javascript
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((c) => c.addAll(APP_SHELL)));
  self.skipWaiting();
});
```

**activate — 清理旧缓存**，结尾 `self.clients.claim()` 立即接管所有页面：

```javascript
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(
      names.filter((n) => n !== STATIC_CACHE && n !== DYNAMIC_CACHE)
           .map((n) => caches.delete(n))
    ))
  );
  self.clients.claim();
});
```

**fetch — 按资源类型选缓存策略**（仅处理本源 GET）：

```javascript
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== location.origin) return;

  // A 缓存优先：静态资源（快、容忍陈旧）
  if (url.pathname.match(/\.(css|js|png|jpg|svg|woff2)$/)) {
    event.respondWith(cacheFirst(request)); return;
  }
  // B 网络优先：HTML 页面（求新，失败回退缓存）
  if (request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request)); return;
  }
  // C 陈旧时重验证：API 数据（先快后新）
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(staleWhileRevalidate(request)); return;
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    (await caches.open(STATIC_CACHE)).put(request, res.clone());
    return res;
  } catch { return new Response('Asset unavailable offline', { status: 503 }); }
}
async function networkFirst(request) {
  try {
    const res = await fetch(request);
    (await caches.open(DYNAMIC_CACHE)).put(request, res.clone());
    return res;
  } catch { return (await caches.match(request)) || caches.match('/offline.html'); }
}
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((res) => { cache.put(request, res.clone()); return res; });
  return cached || fetchPromise;
}
```

## 指令

- 严格按交付清单产出 5 个文件，缺一不可——尤其 `offline.html` 缺失会让安装失败。
- 三策略与资源类型对应：静态资源用缓存优先、HTML 用网络优先并回退 `/offline.html`、API 用陈旧时重验证。
- 每次部署递增 `CACHE_VERSION`，否则用户拿不到新文件；推荐用构建工具（Vite / Webpack）自动注入版本号。
- 生产环境优先考虑 Workbox 而非手写策略，它自动处理边缘情况、缓存过期与版本管理。
- 上线前用 Chrome DevTools → Lighthouse 跑 PWA 审计，并在 iOS Safari（手动安装）与 Android Chrome（安装提示）双端实测。

## 示例

**生产捷径：用 Workbox 替代手写策略**（CDN 仅为演示，生产用 npm + 打包器）：

```javascript
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');
const { registerRoute } = workbox.routing;
const { CacheFirst, NetworkFirst, StaleWhileRevalidate } = workbox.strategies;
const { precacheAndRoute } = workbox.precaching;

precacheAndRoute(self.__WB_MANIFEST || []); // 由构建插件注入
registerRoute(({ request }) => request.destination === 'image', new CacheFirst());
registerRoute(({ request }) => request.mode === 'navigate', new NetworkFirst());
registerRoute(({ request }) => request.destination === 'script', new StaleWhileRevalidate());
```

**上线前自检清单：**

- 站点经 HTTPS 提供。
- `manifest.json` 含 `name`、`short_name`、`start_url`、`display`、`icons`（192 + 512）。
- 图标含 `purpose: "any maskable"`。
- DevTools → Application → Service Workers 中 `sw.js` 无错注册。
- DevTools 网络置为 Offline 时 App Shell 仍从缓存加载。
- 离线导航失败时正确缓存并返回 `offline.html`。
- Lighthouse PWA 审计通过。
- iOS Safari 与 Android Chrome 双端实测。

## 注意事项

- **iOS / Safari 怪癖**：支持清单与 SW，但**不支持 `beforeinstallprompt`**，用户须手动经「分享 → 添加到主屏幕」安装；务必使用 `apple-mobile-web-app-*` meta 标签；受智能跟踪防护影响，约 7 天无活动后 Safari 可能清除 SW 缓存。
- **HTTPS 要求**：SW 仅在 `https://` 源注册，`http://localhost` 是唯一开发例外；需要本地自定义域名的 HTTPS 时用 `mkcert` 或 `ngrok`。
- **部署缓存击穿**：部署新资源时务必递增 `CACHE_VERSION`，确保 activate 清旧缓存、用户拿到新文件。
- **跨源不透明响应**：访问外部源（CDN 字体、第三方 API）返回「opaque」响应，无法检查，且失败时仍是 `200` 状态——缓存需谨慎；跨源资源优先用 `staleWhileRevalidate`，或交给 Workbox 安全处理。
- 本技能输出不能替代针对具体环境的验证、测试与专家审查；若必要输入、权限、安全边界或成功标准缺失，应停下并请求澄清。

## 互见

- Workbox 官方文档：https://developer.chrome.com/docs/workbox
- 相关领域：前端工程化、缓存与离线策略、Web 性能优化、移动端适配。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
