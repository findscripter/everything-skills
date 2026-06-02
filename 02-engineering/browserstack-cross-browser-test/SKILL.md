---
name: browserstack-cross-browser-test
title: BrowserStack 跨浏览器测试
description: 当需要把 Playwright 测试跑在 BrowserStack 云端真实浏览器/设备矩阵做跨浏览器、跨设备兼容性验证时使用；做配置 playwright.config 云端 projects、运行多浏览器测试、拉取构建/会话结果与视频日志；不适用于纯本地单浏览器测试或无 BrowserStack 账号场景；触发词：browserstack、跨浏览器、cloud testing、browser matrix、test on safari、firefox、浏览器兼容性
domain: 研发/testing
triggers: [browserstack, 跨浏览器, cross-browser, cloud testing, 云端测试, browser matrix, 浏览器矩阵, test on safari, test on firefox, 在 safari 上测试, 浏览器兼容性, browser compatibility, webkit 测试, cross-device]
tags: [testing, browserstack, playwright, 跨浏览器, 云测试, 兼容性, E2E, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [BrowserStack MCP, Playwright, npx playwright test, browserstack-local]
requires: []
related: [playwright-e2e-testing, webapp-testing, android-ui-verification, javascript-testing-patterns]
combines_with: [ci-cd-pipeline-builder, accessibility-wcag-audit, test-coverage-gap-finder]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

- 需要在 BrowserStack 云端真实浏览器/设备网格运行 Playwright 测试，验证 Chrome、Firefox、WebKit/Safari 等跨浏览器、跨操作系统兼容性。
- 触发场景：用户提到 browserstack、跨浏览器、cloud testing、浏览器矩阵、test on safari/firefox、浏览器兼容性。
- 需要拉取云端构建结果、按浏览器汇总通过/失败、获取视频与日志链接。

不该用边界：
- 只在本地单浏览器跑测试、无需云端矩阵时，直接用本地 Playwright，不必引入本技能。
- 未配置 BrowserStack 账号/凭据时，先引导用户获取凭据，不要硬跑。
- 本技能聚焦 Playwright on BrowserStack；非 Playwright 框架的接入不在范围内。

## 步骤

前置条件——必须设置环境变量，否则停止并引导用户到 browserstack.com/accounts/settings 获取：
- `BROWSERSTACK_USERNAME` — 用户名
- `BROWSERSTACK_ACCESS_KEY` — 访问密钥

1. 配置（setup）：检查现有 `playwright.config.ts`，按 `process.env.BROWSERSTACK_USERNAME` 是否存在切换云端 / 本地 projects，加入 BrowserStack 的 `connectOptions.wsEndpoint`（见示例）；并加 npm 脚本 `"test:e2e:cloud": "npx playwright test --project='chrome@*' --project='firefox@*' --project='webkit@*'"`。
2. 运行（run）：先校验凭据，再带 BrowserStack project 运行测试，监控执行，按浏览器分别报告结果。
3. 取结果（results）：调用 `browserstack_get_builds`，取最新构建的 sessions，逐个汇总状态、浏览器/OS、耗时、视频 URL、日志 URL，格式化为汇总表。
4. 查浏览器（browsers）：调用 `browserstack_get_browsers`，过滤出 Playwright 兼容的浏览器/OS 组合并展示。
5. 本地隧道（local）：测试 localhost 或防火墙后的 staging 时，`npm install -D browserstack-local`，在配置中加入本地隧道。

## 指令

| MCP 工具 | 用途 |
|---|---|
| `browserstack_get_plan` | 查账户额度上限 |
| `browserstack_get_browsers` | 列出可用浏览器 |
| `browserstack_get_builds` | 列出最近构建 |
| `browserstack_get_sessions` | 取某构建内的会话 |
| `browserstack_get_session` | 取会话详情（视频、日志） |
| `browserstack_update_session` | 标记通过/失败 |
| `browserstack_get_logs` | 取文本/网络日志 |

## 示例

在 `playwright.config.ts` 中按是否存在凭据切换云端 projects（关键约束：WebKit 用 `playwright-webkit`、Firefox 用 `playwright-firefox`，wsEndpoint 走 `wss://cdp.browserstack.com/playwright`）：

```typescript
import { defineConfig } from '@playwright/test';

const isBS = !!process.env.BROWSERSTACK_USERNAME;

export default defineConfig({
  // ... existing config
  projects: isBS ? [
    {
      name: "chromelatestwindows-11",
      use: {
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            'browser': 'chrome',
            'browser_version': 'latest',
            'os': 'Windows',
            'os_version': '11',
            'browserstack.username': process.env.BROWSERSTACK_USERNAME,
            'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY,
          }))}`,
        },
      },
    },
    // firefox: 'browser': 'playwright-firefox'
    // webkit:  'browser': 'playwright-webkit', os: 'OS X', os_version: 'Ventura'
  ] : [
    // ... local projects fallback
  ],
});
```

运行云端测试：

```bash
BROWSERSTACK_USERNAME=$BROWSERSTACK_USERNAME \
BROWSERSTACK_ACCESS_KEY=$BROWSERSTACK_ACCESS_KEY \
npx playwright test --project='chrome@*' --project='firefox@*'
```

## 注意事项

- 凭据缺失即停：先引导获取再继续，避免空跑报错。
- 浏览器名映射有坑：Firefox=`playwright-firefox`、WebKit=`playwright-webkit`，写错会连不上网格。
- 产物应包含：跨浏览器结果表、逐浏览器通过/失败、BrowserStack 控制台视频/截图链接，并高亮浏览器特有失败。
- 本地/staging 站点需 `browserstack-local` 隧道，否则云端节点访问不到。
- 运行前可用 `browserstack_get_plan` 核对并发额度，避免超限排队。

## 互见

- Playwright 本地测试与配置（playwright-pro）
- E2E 测试结果汇总与报告

---
采编自 alirezarezvani/claude-skills（MIT）。
