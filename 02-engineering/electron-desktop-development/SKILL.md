---
name: electron-desktop-development
title: Electron 桌面应用开发
description: 当用 Electron 构建/加固/打包跨平台桌面应用时使用；做安全的多进程架构（contextIsolation/sandbox + preload 白名单 IPC）、electron-builder 打包签名与 electron-updater 自动更新，产出可上线的工程骨架与配置；不适用于纯 Web 应用、Tauri、Chrome 扩展、移动端。触发词：Electron、preload、IPC、electron-builder、自动更新、代码签名
domain: 研发/frontend
triggers: [Electron, Electron 桌面应用, contextIsolation, preload 脚本, contextBridge, IPC 通信, ipcMain, ipcRenderer, electron-builder, electron-forge, electron-updater, 自动更新, 代码签名, notarize 公证, BrowserWindow, 主进程 渲染进程, 桌面应用打包, 白屏问题, 原生模块崩溃, 系统托盘, asar]
tags: [Electron, 桌面应用, 跨平台, IPC, 安全加固, preload, contextIsolation, 打包分发, 代码签名, 自动更新, electron-builder, TypeScript, 多进程架构, 研发, misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [electron, electron-builder, electron-forge, electron-vite, electron-updater, electron-store, electron-log, @electron/rebuild, Vite, Playwright, Vitest]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用场景：
- 从零搭建 Electron 桌面应用，或重构其多进程架构。
- 对 Electron 应用做安全加固（contextIsolation、sandbox、CSP、关闭 nodeIntegration）。
- 设计 main / renderer / preload 之间的 IPC 通信。
- 用 electron-builder 或 electron-forge 打包分发，配置代码签名。
- 用 electron-updater 实现自动更新。
- 排查主进程问题、渲染进程崩溃、白屏、原生模块崩溃。
- 多窗口生命周期与跨进程状态同步；集成菜单、托盘、通知、文件对话框等原生能力。

不该用（负边界）：
- 纯 Web 应用、无桌面分发需求 → 用 React/Next.js 相关技能。
- Tauri（Rust 桌面方案）→ 用 Tauri 相关技能。
- Chrome 浏览器扩展 → 用 Chrome 扩展开发技能。
- 纯后端/服务端逻辑 → 用 Node.js 后端技能。
- 移动端 App → 用 React Native / Flutter 技能。

## 步骤

1. 梳理项目结构，划清进程边界（main / preload / renderer / shared）。`shared/` 只放类型、常量、枚举，绝不放跨进程导入的可执行代码。
2. 强制安全默认值：`contextIsolation: true`、`nodeIntegration: false`、`sandbox: true`、`webSecurity: true`。
3. 在 preload 中用 `contextBridge` 暴露 API，并对 IPC 通道做显式白名单。
4. 用合适工具链实现、测试、构建（electron-vite + Vite HMR；Playwright 做 E2E）。
5. 上线前逐项核对「生产安全清单」。

## 指令

推荐目录结构（关键）：
```
src/
  main/      main.ts / ipc-handlers.ts / menu.ts / tray.ts / updater.ts
  preload/   preload.ts   # main ↔ renderer 桥
  renderer/  index.html / App.tsx / components / styles
  shared/    constants.ts(通道名) / types.ts(共享类型)
resources/   icon.png(1024x1024) / entitlements.mac.plist
```

进程模型（隔离设计）：
| 进程 | 职责 | Node 访问 | DOM 访问 |
|------|------|----------|---------|
| Main | 生命周期、窗口、原生 API、IPC 枢纽 | 完整 | 无 |
| Renderer | UI 渲染与交互 | 默认无 | 有 |
| Preload | main↔renderer 安全桥 | 受限(经 contextBridge) | 页面加载前 |
| Utility | CPU 密集/后台任务 | 完整 | 无 |

IPC 三种模式：
| 模式 | 方法 | 场景 |
|------|------|------|
| 单向即发即忘 | `ipcRenderer.send()` → `ipcMain.on()` | 日志、埋点、非关键通知 |
| 请求/响应 | `ipcRenderer.invoke()` → `ipcMain.handle()` | 文件操作、对话框、数据查询 |
| 推送到渲染端 | `webContents.send()` → `ipcRenderer.on()` | 进度、下载状态、自动更新 |

> 生产环境永远不要用 `ipcRenderer.sendSync()`，它会阻塞渲染进程事件循环、冻结 UI。

代码签名（构建前设置环境变量）：
```bash
# macOS（需 Apple Developer 证书）
export CSC_LINK="path/to/Developer_ID_Application.p12"
export CSC_KEY_PASSWORD="your-password"
# Windows（需 EV 或标准代码签名证书）
export WIN_CSC_LINK="path/to/code-signing.pfx"
export WIN_CSC_KEY_PASSWORD="your-password"
npx electron-builder --mac --win --publish never
```

原生模块装好后重建 ABI：`npx @electron/rebuild`

## 示例

带安全默认值的 BrowserWindow（强制）：
```typescript
const win = new BrowserWindow({
  width: 1200, height: 800,
  webPreferences: {
    contextIsolation: true,   // 永远不要改
    nodeIntegration: false,
    sandbox: true,
    preload: path.join(__dirname, '../preload/preload.js'),
    webSecurity: true,
    allowRunningInsecureContent: false,
  },
});
// CSP 头
win.webContents.session.webRequest.onHeadersReceived((details, cb) => {
  cb({ responseHeaders: { ...details.responseHeaders,
    'Content-Security-Policy': ["default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;"] } });
});
```

preload 白名单桥：
```typescript
import { contextBridge, ipcRenderer } from 'electron';
const ALLOWED_SEND = ['file:save', 'file:open', 'app:get-version'] as const;
const ALLOWED_RECV = ['file:saved', 'update:available', 'update:progress'] as const;

contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (ch, ...a) => ALLOWED_SEND.includes(ch)
    ? ipcRenderer.invoke(ch, ...a)
    : Promise.reject(new Error(`Channel "${ch}" not allowed`)),
  on: (ch, cb) => {
    if (!ALLOWED_RECV.includes(ch)) return () => {};
    const l = (_e, ...a) => cb(...a);
    ipcRenderer.on(ch, l);
    return () => ipcRenderer.removeListener(ch, l);
  },
});
```

主进程 handler（务必校验输入）：
```typescript
ipcMain.handle('file:save', async (_e, filePath: string, content: string) => {
  if (typeof filePath !== 'string' || typeof content !== 'string')
    throw new Error('Invalid arguments');   // 渲染端数据一律视为不可信
  await writeFile(filePath, content, 'utf-8');
  return { success: true };
});
```

拦截导航劫持与新窗口：
```typescript
win.webContents.on('will-navigate', (e, url) => {
  if (new URL(url).origin !== 'http://localhost:5173') e.preventDefault();
});
win.webContents.setWindowOpenHandler(({ url }) => {
  const u = new URL(url);
  const allow = new Set(['example.com']);
  if (u.protocol === 'https:' && allow.has(u.hostname))
    require('electron').shell.openExternal(u.toString());
  return { action: 'deny' };  // 拦截所有新建 Electron 窗口
});
```

electron-builder.yml（要点）：
```yaml
appId: com.mycompany.myapp
productName: My App
asar: true
compression: maximum
files: ["out/**/*", "renderer/**/*", "package.json"]  # 只打编译产物
mac: { hardenedRuntime: true, entitlements: resources/entitlements.mac.plist,
       target: [{ target: dmg, arch: [x64, arm64] }] }
win: { target: [{ target: nsis, arch: [x64, arm64] }] }
linux: { target: [{ target: AppImage }, { target: deb }] }
publish: { provider: github, owner: your-org, repo: your-repo }
```

自动更新（electron-updater）：
```typescript
autoUpdater.autoDownload = false;          // 让用户决定
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.on('update-available', i => win.webContents.send('update:available', { version: i.version }));
autoUpdater.on('download-progress', p => win.webContents.send('update:progress', { percent: Math.round(p.percent) }));
autoUpdater.on('update-downloaded', () => win.webContents.send('update:downloaded'));
setInterval(() => autoUpdater.checkForUpdates(), 4 * 60 * 60 * 1000);
ipcMain.handle('update:download', () => autoUpdater.downloadUpdate());
ipcMain.handle('update:install', () => autoUpdater.quitAndInstall());
```

Playwright 启动 Electron 做 E2E：
```typescript
import { test, expect, _electron as electron } from '@playwright/test';
test('launches main window', async () => {
  const app = await electron.launch({ args: ['.'] });
  const win = await app.firstWindow();
  await win.waitForLoadState('domcontentloaded');
  expect(await win.title()).toBe('My App');
  await app.close();
});
```

## 注意事项

生产安全清单（上线前逐项核对）：
- 强制项：`contextIsolation:true`、`nodeIntegration:false`、`sandbox:true`、`webSecurity:true`、`allowRunningInsecureContent:false`。
- IPC：preload 用 contextBridge + 通道白名单；主进程校验所有 IPC 输入；不向渲染端暴露原始 `ipcRenderer`；不用 `sendSync()`。
- 内容：所有窗口设置 CSP；不对不可信数据用 `eval()` / `new Function()` / `innerHTML`。
- 导航：拦截 `will-navigate` 与 `setWindowOpenHandler`；`shell.openExternal()` 前必须校验/白名单 URL。
- 打包：开启 ASAR；不打包任何密钥/凭据；Win 与 macOS 都配置代码签名；自动更新走 HTTPS 并校验签名。
- 数据：用户数据存 `app.getPath('userData')`，绝不写进应用安装目录。

常见问题速诊：
- 启动白屏：`loadFile`/`loadURL` 路径错、构建产物缺失、CSP 拦截脚本；查 DevTools 控制台，开发态先确保 Vite/webpack dev server 已启动。
- IPC 收不到消息：通道名不一致、preload 未加载、未在白名单；核对三端通道名与 `webPreferences.preload` 路径。
- 原生模块崩溃（`MODULE_NOT_FOUND` / `invalid ELF header`）：ABI 不匹配，运行 `npx @electron/rebuild`。
- 自动更新无效：缺 `publish` 配置、macOS 未签名/未公证、GitHub Release 缺 `latest-mac.yml` 等资产。
- 包体过大（>200MB）：dev 依赖被打入、未 tree-shaking；收紧 `files` 模式、用打包器、`compression: maximum`。

框架固有局限：
- Electron 内置 Chromium + Node.js，最小体积约 150MB；对安装体积极敏感的场景考虑 Tauri。
- Linux 自动更新支持有限，需经 Snap/Flatpak 或自建机制分发。
- macOS 对外分发需 Apple Developer 账号（99 美元/年）并强制公证（notarization）。
- 永远不要用已废弃且不安全的 `remote` 模块。

## 互见

- Chrome 扩展开发：构建浏览器扩展而非桌面应用时（共享多进程模型概念）。
- React 相关技能：渲染层用 React 时。
- TypeScript 进阶：配置多目标构建的高级 TS 时。
- Node.js 后端模式：主进程需要复杂后端逻辑时。
- Docker / GitHub Actions：搭建跨平台 Electron 构建 CI/CD 时。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
