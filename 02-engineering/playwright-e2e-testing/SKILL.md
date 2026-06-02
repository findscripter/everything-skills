---
name: playwright-e2e-testing
title: Playwright 端到端测试
description: 当需要为 Web 应用搭建或扩展端到端（E2E）自动化测试时使用；用 Playwright 完成安装配置、编写测试脚本、视觉回归、跨浏览器与移动端模拟、并接入 CI/CD，产出可运行的测试套件与流水线；不适用于单元/接口测试、纯手工探索测试或非浏览器场景；触发词：Playwright、E2E、端到端测试、跨浏览器、视觉回归、浏览器自动化、CI 测试
domain: 研发/testing
triggers: [Playwright, E2E 测试, 端到端测试, 跨浏览器测试, 视觉回归, 浏览器自动化, playwright test, CI 中跑前端测试, page object, trace 追踪]
tags: [测试, E2E, Playwright, 浏览器自动化, 视觉回归, CI/CD, 前端, QA]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [@playwright/test, playwright CLI, Node.js / npm, GitHub Actions, Chromium / Firefox / WebKit]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当你要为 Web 应用建立或扩展浏览器端到端（E2E）自动化测试时使用，典型场景：

- 从零搭建 Playwright 测试框架，配置测试目录与浏览器
- 为关键业务流（登录、下单、表单提交）编写自动化脚本与断言
- 做视觉回归（截图基线比对）
- 在 Chromium / Firefox / WebKit 及移动端模拟下做跨浏览器测试
- 把 E2E 测试接入 CI/CD，并行执行、产出报告与失败追踪产物

**不该用的边界：**

- 纯单元测试或函数级逻辑 → 用 Vitest/Jest，不要用 Playwright
- 后端 HTTP 接口契约测试 → 用接口测试工具（虽 Playwright 也能发请求，但非首选）
- 一次性手工探索 / 无回归价值的临时点击 → 不值得固化为脚本
- 缺少可访问的目标 URL、测试账号、成功判定标准时：先停下来问清楚，别盲目生成脚本

## 步骤

1. **环境搭建**：安装 Playwright，初始化配置，建立 `tests/` 目录，安装浏览器内核。
2. **测试设计**：梳理关键流程，规划测试数据与 fixtures，按页面建立 Page Object，避免选择器散落。
3. **编写实现**：写测试脚本与断言，用自动等待（web-first assertions）代替硬编码 sleep，处理动态内容与异常。
4. **浏览器能力**：按需开启 headless、截图、录像、trace 追踪、移动端模拟。
5. **视觉回归**：生成基线图，加 `toHaveScreenshot` 断言，设置容差阈值，审查差异。
6. **跨浏览器**：在 config 的 `projects` 中配置多内核与移动设备，对比结果。
7. **接入 CI/CD**：编写流水线，分片并行，上传 report/trace 产物，配置失败通知。

## 指令

```bash
# 1. 初始化（自动生成 config、示例用例、CI 模板）
npm init playwright@latest

# 2. 仅安装浏览器内核（已有项目）
npx playwright install --with-deps

# 3. 运行 / 调试
npx playwright test                 # 全量
npx playwright test --project=chromium
npx playwright test --ui            # UI 模式交互调试
npx playwright test --debug         # Inspector 单步
npx playwright codegen <url>        # 录制生成脚本

# 4. 报告与追踪
npx playwright show-report
npx playwright show-trace trace.zip

# 5. 视觉回归基线（首次或刻意更新）
npx playwright test --update-snapshots
```

## 示例

**playwright.config.ts —— 跨浏览器 + 失败追踪：**

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',     // 仅重试时收集 trace，降低开销
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
    { name: 'mobile',   use: { ...devices['Pixel 5'] } },
  ],
});
```

**测试脚本 —— 自动等待 + 视觉回归：**

```ts
import { test, expect } from '@playwright/test';

test('登录后跳转到仪表盘', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('用户名').fill('demo');
  await page.getByLabel('密码').fill('secret');
  await page.getByRole('button', { name: '登录' }).click();

  // web-first 断言，自动重试等待，无需手写 sleep
  await expect(page.getByRole('heading', { name: '仪表盘' })).toBeVisible();
  await expect(page).toHaveScreenshot('dashboard.png', { maxDiffPixelRatio: 0.01 });
});
```

**CI/CD（GitHub Actions）：**

```yaml
name: e2e
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

## 注意事项

- **选择器优先级**：优先用 `getByRole` / `getByLabel` / `getByText` 等面向用户的定位器，少用脆弱的 CSS/XPath。
- **不要硬等待**：禁用 `waitForTimeout(固定毫秒)`，依赖 web-first 断言的自动重试，否则测试既慢又 flaky。
- **视觉回归基线**：基线截图应在 CI 同款环境（同 OS/字体/渲染）生成，本地与 CI 渲染差异会导致大量假阳性；用 `maxDiffPixelRatio` 设容差。
- **trace 是排障利器**：CI 失败时务必上传 trace.zip，用 `show-trace` 回看每一步 DOM/网络/截图。
- **隔离与数据**：每个测试自带独立状态，借助 fixtures 准备/清理数据，避免用例间互相污染。
- **质量门禁**：合并前确认——用例全绿、关键流覆盖充分、视觉测试稳定、跨浏览器通过、CI 集成正常。
- 输出不能替代针对具体环境的人工验证与专家评审；输入、权限、成功标准缺失时先澄清再动手。

## 互见

- 测试与 QA 整体工作流（单元 / 接口 / E2E 分层）
- 前端开发与 Web 性能优化技能
- CI/CD 自动化与 GitHub Actions 模板

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可证），已按「技能大典」规范适配重写并补充可执行命令与代码示例。
