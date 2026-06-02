---
name: vscode-extension-development
title: VS Code 扩展开发与发布
description: 当需要从零开发 VS Code 扩展、添加命令/快捷键/配置、构建 TreeView 或 Webview UI、打包成 VSIX 或发布到 Marketplace，以及排查激活与打包问题时使用；做出可调试、可打包、可上架的扩展工程与发布产物；不适用于 JetBrains/Neovim 等非 VS Code 插件、Web 前端通用开发。触发词：VS Code 扩展、vsce、yo code、Webview、Marketplace 发布
domain: 研发/devops
triggers: [VS Code 扩展, vscode extension, yo code, vsce package, vsce publish, Webview, TreeView, 扩展激活失败, 发布到 Marketplace, VSIX 打包, activationEvents]
tags: [vscode, extension, ide, typescript, marketplace, 研发, devops]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [claude, cursor, copilot, codex, gemini]
requires: []
related: [browser-extension-builder, chrome-extension-mv3, electron-desktop-development, typescript-advanced-types]
combines_with: [codetour-walkthrough-builder, developer-experience-optimizer, web-artifacts-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 从零创建一个新的 VS Code 扩展工程。
- 给扩展添加命令（command）、快捷键（keybinding）或设置项（configuration）。
- 在扩展中构建 TreeView 或 Webview UI。
- 把扩展打包为 VSIX 并发布到 VS Code Marketplace。
- 排查扩展激活失败、命令找不到、Webview 不渲染、打包体积过大等问题。

不该用（负边界）：
- 开发 JetBrains、Neovim、Sublime 等非 VS Code 编辑器插件。
- 纯 Web 前端 / Node 后端通用开发，与扩展宿主无关。
- 需要环境内真实验证时，本技能不替代实际测试与专家评审；输入、权限或验收标准缺失时应先停下来澄清。

适用于 VS Code 1.74+ 的 API 约定（如 `activationEvents` 自动推导）。

## 步骤

1. 脚手架：用官方 Yeoman 生成器初始化工程，按提示选 TypeScript。
2. 开发：在 `src/extension.ts` 写 `activate`/`deactivate`，在 `package.json` 的 `contributes` 中声明命令、视图、配置。
3. 调试：`npm run watch` 后按 F5 启动 Extension Development Host（扩展开发宿主）实时验证。
4. 打包：`npx @vscode/vsce package` 产出 `.vsix`，用 `.vscodeignore` 控制体积。
5. 发布：`vsce publish` 上架 Marketplace（需先在 Azure DevOps 创建 Personal Access Token 并 `vsce login <publisher>`）。

## 指令

```bash
# 1. 安装脚手架并生成工程
npm install -g yo generator-code
yo code

# 2. 编译与监听
npm run compile           # 一次性构建
npm run watch             # 监听模式（配合 F5 启动调试宿主）

# 3. 打包为 VSIX
npx @vscode/vsce package  # 生成 .vsix

# 4. 发布到 Marketplace
npx @vscode/vsce login <publisher>
npx @vscode/vsce publish
```

工程结构参考：

```
my-extension/
├── package.json          # 扩展清单（manifest），声明 contributes
├── src/extension.ts      # 入口，导出 activate / deactivate
├── out/                  # 编译产物 JS
├── images/icon.png       # Marketplace 用 128x128 PNG 图标
└── .vscodeignore         # 控制打进 VSIX 的文件，瘦身关键
```

## 示例

需求：新增一个 `myext.hello` 命令，点击弹出提示。

1. `package.json` 中声明（命令 ID 必须与代码完全一致）：

```json
{
  "contributes": {
    "commands": [
      { "command": "myext.hello", "title": "Hello World" }
    ]
  }
}
```

2. `src/extension.ts` 中注册：

```ts
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const d = vscode.commands.registerCommand('myext.hello', () => {
    vscode.window.showInformationMessage('Hello World');
  });
  context.subscriptions.push(d);
}
export function deactivate() {}
```

3. 按 F5 在开发宿主里命令面板执行 “Hello World” 验证，再 `vsce package`。

Webview 场景：设置 Content Security Policy（CSP），脚本/样式来源使用 webview 的 `cspSource`，宿主与页面通过 `postMessage` 双向通信。

## 注意事项

- 发布前统一 package name、设置项 key、命令 ID、视图 ID 命名，避免前后端对不上。
- 用 `.vscodeignore` 把包体控制在 5MB 以内（排除 `node_modules`、源码、测试等）。
- VS Code 1.74 起，contributes 中声明的命令/视图会自动推导 `activationEvents`，通常无需手写。
- 打包前务必先用 Extension Development Host（F5）实测，再生成 VSIX。
- 常见坑：
  - 扩展不加载 → 检查 `activationEvents`（1.74+ 对已声明命令/视图自动推导）。
  - 命令找不到 → 核对 `package.json` 与代码中的命令 ID 是否完全一致。
  - Webview 不显示 → 检查 CSP，使用 webview 的 `cspSource`。
- 测试可用 `@vscode/test-electron` 搭建集成测试环境。

## 互见

- 测试驱动开发：先写测试再实现扩展功能。
- 调试策略：系统化排查扩展激活与运行问题。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
